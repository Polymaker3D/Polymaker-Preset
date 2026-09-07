import { it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

async function isolatedClient(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'polymaker-posthog-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await copyFile(new URL('./posthog.mjs', import.meta.url), path.join(dir, 'posthog.mjs'));
  return dir;
}

function run(dir, code, extraEnv = {}) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 10000,
    env: {
      ...process.env,
      NODE_OPTIONS: '',
      POSTHOG_API_KEY: '',
      POSTHOG_HOST: '',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

for (const mode of ['development', 'production']) {
  it(`works without the SDK or a key in ${mode}`, async (t) => {
    const dir = await isolatedClient(t);
    const output = run(dir, `
      const client = await import('./posthog.mjs');
      client.capture('index_generated', { preset_count: 1 });
      client.captureException(new Error('test error'));
      await client.shutdown();
      console.log('done');
    `, { NODE_ENV: mode });
    assert.equal(output.trim(), 'done');
  });
}

it('loads the SDK and forwards events, exceptions and shutdown when configured', async (t) => {
  const dir = await isolatedClient(t);
  const sdkDir = path.join(dir, 'node_modules', 'posthog-node');
  await mkdir(sdkDir, { recursive: true });
  await writeFile(path.join(sdkDir, 'package.json'), JSON.stringify({
    name: 'posthog-node', type: 'module', exports: './index.js',
  }));
  // A local SDK double exercises initialization without sending analytics.
  await writeFile(path.join(sdkDir, 'index.js'), `
    export class PostHog {
      constructor(key, options) { console.log(JSON.stringify({ key, options })); }
      capture(event) { console.log(JSON.stringify(event)); }
      captureException(error, id) { console.log(JSON.stringify({ error: error.message, id })); }
      async shutdown() { console.log(JSON.stringify('shutdown')); }
    }
  `);
  const output = run(dir, `
    const client = await import('./posthog.mjs');
    client.capture('index_generated', { preset_count: 1 });
    client.captureException(new Error('test error'));
    await client.shutdown();
  `, {
    POSTHOG_API_KEY: 'test-only-key',
    POSTHOG_HOST: 'https://example.invalid',
    CI_COMMIT_AUTHOR: 'test-builder',
  });
  const [init, event, exception, shutdown] = output.trim().split('\n').map(JSON.parse);
  assert.equal(init.key, 'test-only-key');
  assert.equal(init.options.host, 'https://example.invalid');
  assert.deepEqual(event, {
    distinctId: 'test-builder', event: 'index_generated', properties: { preset_count: 1 },
  });
  assert.deepEqual(exception, { error: 'test error', id: 'test-builder' });
  assert.equal(shutdown, 'shutdown');
});
