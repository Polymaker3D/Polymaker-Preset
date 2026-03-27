import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = process.cwd();
const PRESET_DIR = path.join(REPO_ROOT, 'preset');
const INDEX_JSON_PATH = path.join(REPO_ROOT, 'index.json');

function getGitLastUpdate(filePath) {
  try {
    const output = execSync(
      `git log -1 --format=%cI -- "${filePath}"`,
      { encoding: 'utf8', cwd: REPO_ROOT }
    );
    return output.trim() || null;
  } catch {
    return null;
  }
}

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

// Machine name mapping table: maps full printer names to canonical brand/model
// This avoids regex parsing and makes naming consistent across the application
const MACHINE_NAME_MAP = {
    // Anycubic
    'Anycubic Kobra S1 0.4 nozzle': { brand: 'Anycubic', model: 'Kobra S1' },
    
    // BBL (Bambu Lab) - X1 variants are different machines
    'Bambu Lab A1 0.4 nozzle': { brand: 'BBL', model: 'A1' },
    'Bambu Lab A1 mini 0.4 nozzle': { brand: 'BBL', model: 'A1M' },
    'Bambu Lab H2C 0.4 nozzle': { brand: 'BBL', model: 'H2C' },
    'Bambu Lab H2D 0.4 nozzle': { brand: 'BBL', model: 'H2D' },
    'Bambu Lab H2S 0.4 nozzle': { brand: 'BBL', model: 'H2S' },
    'Bambu Lab P1P 0.4 nozzle': { brand: 'BBL', model: 'P1P' },
    'Bambu Lab P1S 0.4 nozzle': { brand: 'BBL', model: 'P1S' },
    'Bambu Lab P2S 0.4 nozzle': { brand: 'BBL', model: 'P2S' },
    'Bambu Lab X1 0.4 nozzle': { brand: 'BBL', model: 'X1' },
    'Bambu Lab X1 Carbon 0.4 nozzle': { brand: 'BBL', model: 'X1C' },
    'Bambu Lab X1C 0.4 nozzle': { brand: 'BBL', model: 'X1C' },
    'Bambu Lab X1E 0.4 nozzle': { brand: 'BBL', model: 'X1E' },
    
    // Elegoo
    'Elegoo Centauri Carbon 2 0.4 nozzle': { brand: 'Elegoo', model: 'CC2' },
    
    // Snapmaker
    'Snapmaker U1 (0.4 nozzle)': { brand: 'Snapmaker', model: 'U1' }
};

function extractCompatiblePrinters(presetData) {
    if (!presetData || !Array.isArray(presetData.compatible_printers)) {
        return [];
    }

    const printers = [];
    for (const printerString of presetData.compatible_printers) {
        // Use mapping table for known machines
        const mapped = MACHINE_NAME_MAP[printerString];
        if (mapped) {
            printers.push({
                brand: mapped.brand,
                model: mapped.model,
                fullName: printerString
            });
        } else {
            // Unknown machine: log warning and skip
            console.warn(`Unknown printer in compatible_printers: ${printerString}`);
        }
    }
    return printers;
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

  /** @type {{material:string,brand:string,model:string,slicer:string,path:string,filename:string,updatedAt:string|null,compatiblePrinters:{brand:string,model:string,fullName:string}[]}[]} */
  const presets = [];

  for (const absFile of jsonFiles) {
    const relFromPreset = path.relative(PRESET_DIR, absFile);
    const parts = relFromPreset.split(path.sep);

    // Expected: <Material>/<PrinterBrand>/<PrinterModel>/<Slicer>/<Preset>.json
    if (parts.length < 5) continue;

    const material = parts[0];
    const printerBrand = parts[1];
    const printerModel = parts[2];
    const slicer = parts[3];
    const filename = parts[parts.length - 1];

    const relPath = normalizePosix(path.join('preset', relFromPreset));
    const updatedAt = getGitLastUpdate(relPath);

    // Read the preset JSON content to extract compatible_printers
    let compatiblePrinters = [];
    try {
        const fileContent = await fs.readFile(absFile, 'utf8');
        const presetData = JSON.parse(fileContent);
        compatiblePrinters = extractCompatiblePrinters(presetData);
    } catch (e) {
        console.warn(`Failed to parse ${relFromPreset}: ${e.message}`);
    }

    materials.add(material);
    brands.add(printerBrand);
    models.add(printerModel);
    slicers.add(slicer);

    presets.push({
      material: material,
      brand: printerBrand,
      model: printerModel,
      slicer,
      path: relPath,
      filename,
      updatedAt,
      compatiblePrinters: compatiblePrinters
    });
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

