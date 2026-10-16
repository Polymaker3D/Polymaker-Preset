import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { localReferences, validatePreset } from './verify-site.mjs';

export async function smokeSite(baseUrl, expectedCommit, allPresets = false) {
  const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  async function get(filename) {
    const url = new URL(filename.split('/').map(encodeURIComponent).join('/'), base);
    url.searchParams.set('ci-smoke', expectedCommit || 'local');
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, `HTTP ${response.status}: ${url.pathname}`);
    return response.text();
  }
  const [html, rawIndex, rawBuild, css, app, i18n, analytics] = await Promise.all(
    ['index.html', 'index.json', 'build-info.json', 'style.css', 'app.js', 'i18n.js', 'analytics.js'].map(get));
  const index = JSON.parse(rawIndex);
  const build = JSON.parse(rawBuild);
  if (expectedCommit) assert.equal(build.commit, expectedCommit, 'Published commit does not match the tested commit');
  assert.equal(build.presetCount, index.presets.length);
  assert.ok(index.presets.length > 0);
  assert.ok(html.includes('<!-- SEO-CONTENT:START') && html.includes('<noscript>'));

  const samples = new Map();
  for (const preset of index.presets) {
    samples.set(preset.slicer.toLowerCase() + path.extname(preset.path).toLowerCase(), preset);
  }
  const presets = allPresets ? index.presets : [...samples.values()];
  const references = new Set(localReferences(html, css, [app, i18n, analytics].join('\n')));
  for (const preset of presets) references.add(preset.path);
  const queue = [...references];
  const results = new Map();
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const filename = queue.pop();
      results.set(filename, await get(filename));
    }
  }));
  for (const preset of presets) {
    validatePreset(results.get(preset.path), preset.path);
  }
  console.log(`HTTP smoke passed for ${build.commit}: ${presets.length} presets and ${references.size} local resources.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { 'all-presets': { type: 'boolean', default: false } },
  });
  assert.ok(positionals[0], 'Usage: npm run smoke:site -- URL [COMMIT] [--all-presets]');
  await smokeSite(positionals[0], positionals[1], values['all-presets']);
}
