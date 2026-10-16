import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const requiredFiles = [
  'index.html', 'index.json', 'app.js', 'i18n.js', 'analytics.js',
  'style.css', 'favicon.ico', 'CNAME', 'robots.txt', 'sitemap.xml',
  '.nojekyll', 'build-info.json',
];

async function walk(root, directory = root) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Site contains a symbolic link: ${filename}`);
    if (entry.isDirectory()) {
      files.push(...await walk(root, filename));
    } else {
      assert.ok(entry.isFile(), `Site contains a non-regular file: ${filename}`);
      files.push(path.relative(root, filename).split(path.sep).join('/'));
    }
  }
  return files;
}

export function localReferences(html, css, javascript) {
  const references = [
    ...Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g), (match) => match[1]),
    ...Array.from(css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g), (match) => match[1]),
    ...Array.from(javascript.matchAll(/(?:\.\/)?assets\/[^"'<>\\\r\n]+/g), (match) => match[0]),
  ];
  return [...new Set(references.filter((value) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value))
    .map((value) => decodeURIComponent(value.split(/[?#]/)[0]).replace(/^(?:\.\/|\/)/, '')))];
}

export function validatePreset(content, filename) {
  if (/\.json$/i.test(filename)) {
    const preset = JSON.parse(content);
    assert.ok(preset && typeof preset === 'object' && !Array.isArray(preset), `Invalid JSON preset: ${filename}`);
  } else {
    // Prusa exports both sectioned bundles and sectionless individual presets.
    assert.ok(/^[ \t]*(?:filament_type|temperature)[ \t]*=/m.test(content), `Invalid INI preset: ${filename}`);
  }
}

export async function verifySite(root) {
  root = path.resolve(root);
  const files = await walk(root);
  const allowed = new Set(requiredFiles);
  for (const filename of files) {
    assert.ok(allowed.has(filename) || /^google[a-z0-9]+\.html$/i.test(filename) ||
      /^(assets|preset)\/[^.]/.test(filename), `Unexpected public file: ${filename}`);
    assert.ok(!filename.split('/').some((part) => part.startsWith('.') && filename !== '.nojekyll'),
      `Hidden file in site: ${filename}`);
  }
  for (const filename of requiredFiles) {
    assert.ok(files.includes(filename), `Missing public file: ${filename}`);
  }
  assert.equal((await readFile(path.join(root, 'CNAME'), 'utf8')).trim(), 'presets.polymaker.com');

  const index = JSON.parse(await readFile(path.join(root, 'index.json'), 'utf8'));
  assert.ok(Array.isArray(index.presets) && index.presets.length > 0, 'Site must contain presets');
  const presetFiles = new Set(files.filter((filename) => /^preset\/.*\.(json|ini)$/i.test(filename)));
  const indexed = new Set();
  for (const preset of index.presets) {
    assert.ok(typeof preset.path === 'string' && preset.path.startsWith('preset/') &&
      !preset.path.includes('\\') && !preset.path.split('/').some((part) => part === '.' || part === '..'),
    `Unsafe preset path: ${preset.path}`);
    assert.ok(!indexed.has(preset.path), `Duplicate preset path: ${preset.path}`);
    assert.ok(presetFiles.has(preset.path), `Missing preset file: ${preset.path}`);
    indexed.add(preset.path);
    validatePreset(await readFile(path.join(root, preset.path), 'utf8'), preset.path);
  }
  assert.deepEqual(indexed, presetFiles, 'Published presets and index must match exactly');
  const build = JSON.parse(await readFile(path.join(root, 'build-info.json'), 'utf8'));
  assert.match(build.commit, /^[a-f0-9]{40}$/);
  assert.equal(build.presetCount, index.presets.length);

  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  const css = await readFile(path.join(root, 'style.css'), 'utf8');
  let javascript = '';
  for (const filename of ['app.js', 'i18n.js', 'analytics.js']) {
    const source = await readFile(path.join(root, filename), 'utf8');
    new vm.Script(source, { filename });
    javascript += source + '\n';
  }
  const schemas = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    (match) => JSON.parse(match[1]));
  const catalog = schemas.find((schema) => schema['@type'] === 'ItemList');
  assert.ok(catalog && catalog.numberOfItems > 0, 'Missing generated SEO catalog');
  assert.equal(catalog.numberOfItems, catalog.itemListElement.length);
  assert.ok(schemas.some((schema) => schema['@type'] === 'FAQPage'), 'Missing generated FAQ');
  assert.ok(html.includes('<noscript>'), 'Missing static SEO fallback');
  for (const reference of localReferences(html, css, javascript)) {
    const filename = path.resolve(root, reference);
    assert.ok(filename.startsWith(root + path.sep), `Unsafe local reference: ${reference}`);
    assert.ok((await stat(filename)).isFile(), `Missing local asset: ${reference}`);
  }
  console.log(`Verified site: ${files.length} files, ${indexed.size} presets, valid SEO and local assets.`);
  return { files, index, build };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await verifySite(process.argv[2] || '_site');
}
