import { it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSite } from './build-site.mjs';
import { verifySite, validatePreset } from './verify-site.mjs';
import { smokeSite } from './smoke-site.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'polymaker-site-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const files = {
    'index.html': `<!DOCTYPE html>
<html><head><title>Polymaker Filament Presets</title>
<link rel="stylesheet" href="style.css">
<!-- SEO-JSONLD:START -->
<!-- SEO-JSONLD:END -->
</head><body><img src="./assets/logo/logo%20name.png" alt="Logo">
<!-- SEO-CONTENT:START -->
<!-- SEO-CONTENT:END -->
<script src="app.js"></script><script src="i18n.js"></script><script src="analytics.js"></script>
</body></html>`,
    'index.json': JSON.stringify({ version: '1.0', updatedAt: '2000-01-01T00:00:00.000Z',
      materials: [], brands: [], models: [], slicers: [], presets: [] }),
    'app.js': 'var app = true;\n',
    'i18n.js': "var logo = './assets/logo/logo%20name.png';\n",
    'analytics.js': 'var analytics = false;\n',
    'style.css': "body { background: url('./assets/pattern.svg'); }\n",
    'favicon.ico': 'fixture icon',
    'CNAME': 'presets.polymaker.com\n',
    'robots.txt': 'User-agent: *\nAllow: /\n',
    'sitemap.xml': '<urlset></urlset>\n',
    'google123abc.html': 'google-site-verification: google123abc.html\n',
    'assets/logo/logo name.png': 'fixture image',
    'assets/pattern.svg': '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    'assets/.DS_Store': 'private metadata',
    'preset/PLA/BBL/A1/BambuStudio/PLA (Test) @BBL A1.json': JSON.stringify({
      name: 'PLA (Test) @BBL A1', filament_vendor: ['Polymaker'], filament_type: ['PLA'],
      compatible_printers: ['Bambu Lab A1 0.4 nozzle'],
    }),
    'preset/PLA/Prusa/Core One/PrusaSlicer/PLA.ini': '[filament:PLA]\ntemperature = 220\n',
    '.env': 'TEST_ONLY_SECRET=must-not-be-published\n',
    'node_modules/private.txt': 'must-not-be-published',
    'worker/subscribe/private.txt': 'must-not-be-published',
  };
  for (const [filename, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, filename)), { recursive: true });
    await writeFile(path.join(root, filename), content);
  }
  function git(args) {
    return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false',
      '-c', 'user.name=Site test', '-c', 'user.email=site-test@example.invalid', ...args], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_AUTHOR_DATE: '2024-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2024-01-01T00:00:00Z' },
    }).trim();
  }
  git(['init', '--quiet']);
  git(['add', '.']);
  git(['commit', '--quiet', '-m', 'Fixture with stale generated snapshots']);
  return { root, files, git };
}

it('builds a repeatable complete site from stale snapshots without changing source files', async (t) => {
  const f = await fixture(t);
  const output = await buildSite(f.root);
  const first = await verifySite(output);
  assert.equal(first.index.presets.length, 2);
  assert.equal(first.build.commit, f.git(['rev-parse', 'HEAD']));
  const jsonPreset = first.index.presets.find((preset) => preset.path.endsWith('.json'));
  assert.equal(new Date(jsonPreset.updatedAt).toISOString(), '2024-01-01T00:00:00.000Z');
  assert.equal(first.index.updatedAt, '2024-01-01T00:00:00.000Z');
  assert.ok(first.files.includes('google123abc.html'));
  assert.ok(first.files.includes('.nojekyll'));
  assert.ok(!first.files.some((filename) => /(^\.env|node_modules|worker\/|\.DS_Store)/.test(filename)));
  for (const [filename, content] of Object.entries(f.files)) {
    assert.equal(await readFile(path.join(f.root, filename), 'utf8'), content, `Source changed: ${filename}`);
  }
  assert.equal(f.git(['diff', '--exit-code']), '');
  const before = await Promise.all(first.files.map((filename) => readFile(path.join(output, filename))));
  await buildSite(f.root);
  const after = await Promise.all(first.files.map((filename) => readFile(path.join(output, filename))));
  assert.deepEqual(after, before, 'Repeated builds of the same commit must produce identical bytes');
});

it('blocks publication when a source preset is malformed', async (t) => {
  const f = await fixture(t);
  const filename = Object.keys(f.files).find((name) => name.startsWith('preset/') && name.endsWith('.json'));
  await writeFile(path.join(f.root, filename), '{invalid json');
  await assert.rejects(buildSite(f.root), SyntaxError);
});

it('blocks publication when a referenced asset is missing', async (t) => {
  const f = await fixture(t);
  await rm(path.join(f.root, 'assets/logo/logo name.png'));
  await assert.rejects(buildSite(f.root), { code: 'ENOENT' });
});

it('accepts both Prusa INI export formats and rejects HTML or broken JSON responses', () => {
  assert.doesNotThrow(() => validatePreset('[filament:PLA]\ntemperature = 220\n', 'PLA.ini'));
  assert.doesNotThrow(() => validatePreset('# PrusaSlicer export\nfilament_type = PLA\ntemperature = 220\n', 'PLA.ini'));
  assert.throws(() => validatePreset('<html>Not found</html>', 'PLA.ini'), /Invalid INI preset/);
  assert.throws(() => validatePreset('null', 'PLA.json'), /Invalid JSON preset/);
  assert.throws(() => validatePreset('{broken', 'PLA.json'), SyntaxError);
});

it('rejects missing, duplicated or unsafe presets and private files in the artifact', async (t) => {
  const f = await fixture(t);
  const output = await buildSite(f.root);
  const indexPath = path.join(output, 'index.json');
  const original = await readFile(indexPath, 'utf8');
  const index = JSON.parse(original);

  index.presets.push(index.presets[0]);
  await writeFile(indexPath, JSON.stringify(index));
  await assert.rejects(verifySite(output), /Duplicate preset path/);

  index.presets.pop();
  const presetPath = index.presets[0].path;
  index.presets[0].path = 'preset/../../outside.json';
  await writeFile(indexPath, JSON.stringify(index));
  await assert.rejects(verifySite(output), /Unsafe preset path/);
  await writeFile(indexPath, original);

  const filename = path.join(output, presetPath);
  await rename(filename, filename + '.bak');
  await assert.rejects(verifySite(output), /Missing preset file/);
  await rename(filename + '.bak', filename);

  await writeFile(path.join(output, '.env'), 'TEST_ONLY_SECRET');
  await assert.rejects(verifySite(output), /Unexpected public file/);
  await rm(path.join(output, '.env'));
  await symlink(path.join(f.root, '.env'), path.join(output, 'assets/private-link'));
  await assert.rejects(verifySite(output), /symbolic link/);
});

it('serves all artifact assets and JSON/INI downloads over HTTP and rejects a wrong deployment', async (t) => {
  const f = await fixture(t);
  const output = await buildSite(f.root);
  const server = createServer(async (request, response) => {
    try {
      const filename = path.resolve(output, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
      assert.ok(filename.startsWith(output + path.sep));
      response.end(await readFile(filename));
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const commit = f.git(['rev-parse', 'HEAD']);
  await smokeSite(url, commit, true);
  await assert.rejects(smokeSite(url, '0'.repeat(40)), /Published commit does not match/);
  await rm(path.join(output, 'preset/PLA/Prusa/Core One/PrusaSlicer/PLA.ini'));
  await assert.rejects(smokeSite(url, commit, true), /HTTP 404/);
});
