import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifySite } from './verify-site.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicFiles = [
  'index.html', 'index.json', 'app.js', 'i18n.js', 'analytics.js',
  'style.css', 'favicon.ico', 'CNAME', 'robots.txt', 'sitemap.xml',
  'assets', 'preset',
];

export async function buildSite(root = process.cwd()) {
  const output = path.join(root, '_site');
  const git = (format) => execFileSync('git', ['log', '-1', `--format=${format}`, 'HEAD'], {
    cwd: root, encoding: 'utf8',
  }).trim();
  const commit = git('%H');
  const timestamp = git('%cI');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  const verificationFiles = (await readdir(root)).filter((name) => /^google[a-z0-9]+\.html$/i.test(name));
  for (const name of [...publicFiles, ...verificationFiles]) {
    await cp(path.join(root, name), path.join(output, name), {
      recursive: true,
      filter: (source) => !path.relative(root, source).split(path.sep).some((part) => part.startsWith('.')),
    });
  }

  const run = (script, args, cwd) => execFileSync(process.execPath, [
    path.join(scriptDirectory, script), ...args,
  ], {
    cwd,
    stdio: 'inherit',
    // Publishing must not depend on an analytics service or its credentials.
    env: { ...process.env, POSTHOG_API_KEY: '', NODE_ENV: 'production' },
  });
  // Keep Git lookups rooted in the source checkout while writing to the artifact.
  run('generate-index-json.mjs', ['--output', path.join(output, 'index.json'), '--timestamp', timestamp], root);
  run('generate-seo.mjs', [], output);
  const index = JSON.parse(await readFile(path.join(output, 'index.json'), 'utf8'));
  await writeFile(path.join(output, '.nojekyll'), '');
  await writeFile(path.join(output, 'build-info.json'), JSON.stringify({
    commit, presetCount: index.presets.length,
  }, null, 2) + '\n');
  await verifySite(output);
  console.log(`Built _site for ${commit} with ${index.presets.length} presets.`);
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSite();
}
