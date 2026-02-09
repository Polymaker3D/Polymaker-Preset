import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const PRESET_DIR = path.join(REPO_ROOT, 'preset');
const INDEX_JSON_PATH = path.join(REPO_ROOT, 'index.json');

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walkJsonFiles(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkJsonFiles(full)));
      continue;
    }
    if (!ent.isFile()) continue;
    if (ent.name.toLowerCase().endsWith('.json')) out.push(full);
  }
  return out;
}

function normalizePosix(p) {
  return p.split(path.sep).join('/');
}

function cmp(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

async function main() {
  if (!(await fileExists(PRESET_DIR))) {
    throw new Error('Missing preset/ directory at repo root.');
  }

  /** @type {any | undefined} */
  let existing;
  if (await fileExists(INDEX_JSON_PATH)) {
    try {
      existing = JSON.parse(await fs.readFile(INDEX_JSON_PATH, 'utf8'));
    } catch {
      // ignore and overwrite
    }
  }

  const jsonFiles = await walkJsonFiles(PRESET_DIR);

  const materials = new Set();
  const brands = new Set();
  const models = new Set();
  const slicers = new Set();

  /** @type {{material:string,brand:string,model:string,slicer:string,path:string,filename:string}[]} */
  const presets = [];

  for (const absFile of jsonFiles) {
    const relFromPreset = path.relative(PRESET_DIR, absFile);
    const parts = relFromPreset.split(path.sep);

    // Expected: <Material>/<Brand>/<Model>/<Slicer>/<Preset>.json
    if (parts.length < 5) continue;

    const material = parts[0];
    const brand = parts[1];
    const model = parts[2];
    const slicer = parts[3];
    const filename = parts[parts.length - 1];

    const relPath = normalizePosix(path.join('preset', relFromPreset));

    materials.add(material);
    brands.add(brand);
    models.add(model);
    slicers.add(slicer);

    presets.push({ material, brand, model, slicer, path: relPath, filename });
  }

  const next = {
    version: (existing && typeof existing.version === 'string' ? existing.version : '1.0'),
    updatedAt: new Date().toISOString(),
    materials: Array.from(materials).sort(cmp),
    brands: Array.from(brands).sort(cmp),
    models: Array.from(models).sort(cmp),
    slicers: Array.from(slicers).sort(cmp),
    presets: presets.sort((a, b) => (
      cmp(a.material, b.material) ||
      cmp(a.brand, b.brand) ||
      cmp(a.model, b.model) ||
      cmp(a.slicer, b.slicer) ||
      cmp(a.filename, b.filename)
    )),
  };

  await fs.writeFile(INDEX_JSON_PATH, JSON.stringify(next, null, 2) + '\n', 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Generated index.json with ${next.presets.length} presets.`);
}

await main();

