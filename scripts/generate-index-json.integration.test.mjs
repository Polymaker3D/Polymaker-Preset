import { it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-index-json.mjs', import.meta.url));
const originalDate = '2024-01-01T00:00:00Z';
const oldGenerationTime = '2000-01-01T00:00:00.000Z';

async function fixture(t, filename = 'PLA @BBL A1.json') {
  const root = await mkdtemp(path.join(tmpdir(), 'polymaker-index-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'preset', 'PLA', 'BBL', 'A1', 'BambuStudio');
  await mkdir(directory, { recursive: true });
  const presetPath = path.join(directory, filename);
  await writeFile(presetPath, JSON.stringify({
    name: filename.slice(0, -5),
    compatible_printers: ['Bambu Lab A1 0.4 nozzle'],
  }));
  const indexPath = path.join(root, 'index.json');

  function git(args, date = originalDate) {
    return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'Index test',
        GIT_AUTHOR_EMAIL: 'index-test@example.invalid',
        GIT_COMMITTER_NAME: 'Index test',
        GIT_COMMITTER_EMAIL: 'index-test@example.invalid',
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_DATE: date,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  async function generate() {
    execFileSync(process.execPath, [generator], {
      cwd: root,
      encoding: 'utf8',
      timeout: 10000,
      env: { ...process.env, POSTHOG_API_KEY: '', NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(await readFile(indexPath, 'utf8'));
  }

  async function seedOldGenerationTime() {
    const index = await generate();
    index.updatedAt = oldGenerationTime;
    await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
    return index;
  }

  git(['init', '--quiet']);
  git(['add', 'preset']);
  git(['commit', '--quiet', '-m', 'Add preset']);
  return { root, directory, presetPath, indexPath, git, generate, seedOldGenerationTime };
}

it('does not rewrite an unchanged index or advance its timestamp', async (t) => {
  const f = await fixture(t);
  const before = await f.seedOldGenerationTime();
  await utimes(f.indexPath, new Date(originalDate), new Date(originalDate));
  const beforeStat = await stat(f.indexPath);

  assert.deepEqual(await f.generate(), before);
  assert.equal((await stat(f.indexPath)).mtimeMs, beforeStat.mtimeMs);
});

it('regenerates the index after adding and removing presets, including INI files', async (t) => {
  const f = await fixture(t);
  await f.seedOldGenerationTime();
  const iniPath = path.join(f.directory, 'PLA.ini');
  await writeFile(iniPath, '[filament:PLA]\ntemperature = 220\n');
  f.git(['add', 'preset']);
  f.git(['commit', '--quiet', '-m', 'Add INI preset']);

  const added = await f.generate();
  assert.equal(added.presets.length, 2);
  assert.notEqual(added.updatedAt, oldGenerationTime);
  assert.ok(added.presets.some((preset) => preset.filename === 'PLA.ini'));
  assert.deepEqual(await f.generate(), added);

  await f.seedOldGenerationTime();
  await rm(iniPath);
  const removed = await f.generate();
  assert.equal(removed.presets.length, 1);
  assert.notEqual(removed.updatedAt, oldGenerationTime);
  assert.deepEqual(await f.generate(), removed);
});

it('updates per-file Git dates when preset settings change', async (t) => {
  const f = await fixture(t);
  const before = await f.seedOldGenerationTime();
  assert.equal(new Date(before.presets[0].updatedAt).toISOString(), '2024-01-01T00:00:00.000Z');

  await writeFile(f.presetPath, JSON.stringify({
    name: 'PLA @BBL A1',
    compatible_printers: ['Bambu Lab A1 0.4 nozzle'],
    nozzle_temperature: ['230'],
  }));
  f.git(['add', 'preset']);
  f.git(['commit', '--quiet', '-m', 'Tune temperature'], '2024-02-01T00:00:00Z');

  const after = await f.generate();
  assert.notEqual(after.updatedAt, oldGenerationTime);
  assert.equal(new Date(after.presets[0].updatedAt).toISOString(), '2024-02-01T00:00:00.000Z');
  assert.deepEqual(await f.generate(), after);
});

it('treats shell metacharacters in preset filenames as literal Git arguments', async (t) => {
  const filename = 'PLA "$(touch injected)" @BBL A1.json';
  const f = await fixture(t, filename);
  const index = await f.generate();

  assert.equal(index.presets[0].filename, filename);
  assert.equal(new Date(index.presets[0].updatedAt).toISOString(), '2024-01-01T00:00:00.000Z');
  await assert.rejects(access(path.join(f.root, 'injected')), { code: 'ENOENT' });
});
