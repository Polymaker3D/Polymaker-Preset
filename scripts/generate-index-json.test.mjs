import { describe, it } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = process.cwd();
const PRESET_DIR = path.join(REPO_ROOT, 'preset');
const TEST_DIR = path.join(__dirname, 'test-fixtures');

function isPresetFile(filename) {
  const lower = filename.toLowerCase();
  return lower.endsWith('.json') || lower.endsWith('.ini');
}

async function walkPresetFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkPresetFiles(full)));
      continue;
    }
    if (!ent.isFile()) continue;
    if (isPresetFile(ent.name)) out.push(full);
  }
  return out;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

describe('Preset Files', () => {
  describe('cmp function', () => {
    it('should return -1 when a < b', () => {
      const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
      assert.strictEqual(cmp('a', 'b'), -1);
      assert.strictEqual(cmp(1, 2), -1);
    });

    it('should return 1 when a > b', () => {
      const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
      assert.strictEqual(cmp('b', 'a'), 1);
      assert.strictEqual(cmp(2, 1), 1);
    });

    it('should return 0 when a === b', () => {
      const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
      assert.strictEqual(cmp('a', 'a'), 0);
      assert.strictEqual(cmp(1, 1), 0);
    });
  });

  describe('normalizePosix function', () => {
    it('should convert mixed paths to POSIX format', () => {
      const normalizePosix = (p) => p.split(/[\\/]/).join('/');
      assert.strictEqual(normalizePosix('preset\\Material\\Brand'), 'preset/Material/Brand');
      assert.strictEqual(normalizePosix('preset/Material/Brand'), 'preset/Material/Brand');
    });

    it('should handle nested paths', () => {
      const normalizePosix = (p) => p.split(/[\\/]/).join('/');
      assert.strictEqual(
        normalizePosix('preset/Panchroma PLA/BBL/X1/BambuStudio/file.json'),
        'preset/Panchroma PLA/BBL/X1/BambuStudio/file.json'
      );
    });
  });

  describe('fileExists function', () => {
    it('should return true for existing files', async () => {
      const result = await fileExists(__filename);
      assert.strictEqual(result, true);
    });

    it('should return false for non-existent files', async () => {
      const result = await fileExists(path.join(__dirname, 'non-existent-file.txt'));
      assert.strictEqual(result, false);
    });
  });

  describe('walkPresetFiles function', () => {
    it('should find JSON and INI files recursively', async () => {
      await fs.mkdir(TEST_DIR, { recursive: true });
      await fs.mkdir(path.join(TEST_DIR, 'subdir'), { recursive: true });
      await fs.writeFile(path.join(TEST_DIR, 'file1.json'), '{}');
      await fs.writeFile(path.join(TEST_DIR, 'file2.JSON'), '{}');
      await fs.writeFile(path.join(TEST_DIR, 'file3.ini'), '[filament:test]\ntemperature = 220\n');
      await fs.writeFile(path.join(TEST_DIR, 'file3.txt'), 'text');
      await fs.writeFile(path.join(TEST_DIR, 'subdir', 'file4.json'), '{}');
      await fs.writeFile(path.join(TEST_DIR, 'subdir', 'file5.INI'), '[filament:test]\ntemperature = 220\n');

      const files = await walkPresetFiles(TEST_DIR);
      assert.strictEqual(files.length, 5);
      assert.ok(files.some(f => f.includes('file1.json')));
      assert.ok(files.some(f => f.includes('file2.JSON')));
      assert.ok(files.some(f => f.includes('file3.ini')));
      assert.ok(files.some(f => f.includes('file4.json')));
      assert.ok(files.some(f => f.includes('file5.INI')));
    });

    it('should return empty array for empty directory', async () => {
      const emptyDir = path.join(TEST_DIR, 'empty');
      await fs.mkdir(emptyDir, { recursive: true });
      const files = await walkPresetFiles(emptyDir);
      assert.deepStrictEqual(files, []);
    });
  });

  describe('Real Preset Files', () => {
    it('should have preset directory', async () => {
      const exists = await fileExists(PRESET_DIR);
      assert.strictEqual(exists, true, 'preset/ directory should exist');
    });

    it('should have at least one preset file', async () => {
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      assert.ok(presetFiles.length > 0, 'should have at least one preset file');
    });

    it('should follow correct directory structure (Material/Brand/Model/Slicer/File.ext)', async () => {
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      
      for (const absFile of presetFiles) {
        const relFromPreset = path.relative(PRESET_DIR, absFile);
        const parts = relFromPreset.split(path.sep);
        
        assert.ok(parts.length >= 5, 
          `File ${relFromPreset} should be at least 5 levels deep (Material/Brand/Model/Slicer/File.ext)`);
        
        const filename = parts[parts.length - 1];
        assert.ok(isPresetFile(filename), 
          `File ${filename} should end with .json or .ini`);
      }
    });

    it('should have valid JSON in all preset files', async () => {
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      const jsonFiles = presetFiles.filter((file) => file.toLowerCase().endsWith('.json'));
      
      for (const absFile of jsonFiles) {
        try {
          const content = await fs.readFile(absFile, 'utf8');
          const data = JSON.parse(content);
          assert.ok(typeof data === 'object' && data !== null, 
            `File ${absFile} should parse to an object`);
        } catch (err) {
          assert.fail(`File ${absFile} should be valid JSON: ${err.message}`);
        }
      }
    });

    it('should have required fields in preset files', async () => {
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      const jsonFiles = presetFiles.filter((file) => file.toLowerCase().endsWith('.json'));
      
      for (const absFile of jsonFiles) {
        const content = await fs.readFile(absFile, 'utf8');
        const data = JSON.parse(content);
        
        assert.ok(typeof data.name === 'string', 
          `File ${absFile} should have string 'name' field`);
        assert.ok(Array.isArray(data.filament_type) || typeof data.filament_type === 'string', 
          `File ${absFile} should have 'filament_type' field`);
        assert.ok(Array.isArray(data.filament_vendor) || typeof data.filament_vendor === 'string', 
          `File ${absFile} should have 'filament_vendor' field`);
        
        // Validate type is 'filament' when present
        if (data.type !== undefined) {
          assert.strictEqual(data.type, 'filament', 
            `File ${absFile} should have type='filament'`);
        }
        
        // Validate vendor is Polymaker
        const vendor = Array.isArray(data.filament_vendor) 
          ? data.filament_vendor[0] 
          : data.filament_vendor;
        assert.strictEqual(vendor, 'Polymaker', 
          `File ${absFile} should have vendor='Polymaker'`);
      }
    });

    it('should have name matching filename pattern', async () => {
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      const jsonFiles = presetFiles.filter((file) => file.toLowerCase().endsWith('.json'));
      
      for (const absFile of jsonFiles) {
        const content = await fs.readFile(absFile, 'utf8');
        const data = JSON.parse(content);
        const filename = path.basename(absFile, '.json');
        
        // The name field should match the filename (without .json)
        assert.strictEqual(data.name, filename, 
          `File ${absFile} should have name='${filename}'`);
      }
    });

    it('should have temperature fields in correct format', async () => {
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      const jsonFiles = presetFiles.filter((file) => file.toLowerCase().endsWith('.json'));
      const tempFields = [
        'nozzle_temperature',
        'nozzle_temperature_initial_layer',
        'cool_plate_temp',
        'eng_plate_temp',
        'hot_plate_temp'
      ];
      
      for (const absFile of jsonFiles) {
        const content = await fs.readFile(absFile, 'utf8');
        const data = JSON.parse(content);
        
        for (const field of tempFields) {
          if (data[field] !== undefined) {
            const value = Array.isArray(data[field]) ? data[field][0] : data[field];
            const numValue = parseInt(value, 10);
            // Temperature can be 0 (disabled) or a positive value up to 500
            assert.ok(!isNaN(numValue) && numValue >= 0 && numValue < 500, 
              `File ${absFile} should have valid ${field} value: ${value}`);
          }
        }
      }
    });

    it('should have compatible_printers as array', async () => {
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      const jsonFiles = presetFiles.filter((file) => file.toLowerCase().endsWith('.json'));
      
      for (const absFile of jsonFiles) {
        const content = await fs.readFile(absFile, 'utf8');
        const data = JSON.parse(content);
        
        if (data.compatible_printers !== undefined) {
          assert.ok(Array.isArray(data.compatible_printers), 
            `File ${absFile} should have compatible_printers as array`);
          assert.ok(data.compatible_printers.length > 0, 
            `File ${absFile} should have at least one compatible_printer`);
        }
      }
    });
  });

  describe('index.json', () => {
    it('should exist and be valid JSON', async () => {
      const indexPath = path.join(REPO_ROOT, 'index.json');
      const exists = await fileExists(indexPath);
      
      if (!exists) {
        console.log('Skipping: index.json does not exist');
        return;
      }

      const content = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(content);
      assert.ok(typeof index === 'object' && index !== null);
    });

    it('should have all required top-level fields', async () => {
      const indexPath = path.join(REPO_ROOT, 'index.json');
      const exists = await fileExists(indexPath);
      
      if (!exists) {
        console.log('Skipping: index.json does not exist');
        return;
      }

      const content = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(content);

      assert.ok(typeof index.version === 'string', 'version should be a string');
      assert.ok(typeof index.updatedAt === 'string', 'updatedAt should be a string');
      assert.ok(Array.isArray(index.materials), 'materials should be an array');
      assert.ok(Array.isArray(index.brands), 'brands should be an array');
      assert.ok(Array.isArray(index.models), 'models should be an array');
      assert.ok(Array.isArray(index.slicers), 'slicers should be an array');
      assert.ok(Array.isArray(index.presets), 'presets should be an array');
    });

    it('should have valid preset entries matching real files', async () => {
      const indexPath = path.join(REPO_ROOT, 'index.json');
      const exists = await fileExists(indexPath);
      
      if (!exists) {
        console.log('Skipping: index.json does not exist');
        return;
      }

      const content = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(content);

      if (index.presets.length === 0) {
        console.log('Skipping: no presets to validate');
        return;
      }

      for (const preset of index.presets) {
        assert.ok(typeof preset.material === 'string', 'preset.material should be a string');
        assert.ok(typeof preset.brand === 'string', 'preset.brand should be a string');
        assert.ok(typeof preset.model === 'string', 'preset.model should be a string');
        assert.ok(typeof preset.slicer === 'string', 'preset.slicer should be a string');
        assert.ok(typeof preset.path === 'string', 'preset.path should be a string');
        assert.ok(typeof preset.filename === 'string', 'preset.filename should be a string');
        assert.ok(preset.path.startsWith('preset/'), 'preset.path should start with preset/');
        assert.ok(isPresetFile(preset.filename), 'preset.filename should end with .json or .ini');
        assert.ok(Array.isArray(preset.compatiblePrinters), 'preset.compatiblePrinters should be an array');
        
        // Verify the file actually exists
        const fullPath = path.join(REPO_ROOT, preset.path);
        const fileExists = await fs.access(fullPath).then(() => true).catch(() => false);
        assert.ok(fileExists, `Preset file should exist: ${preset.path}`);
      }
    });

    it('should have sorted arrays', async () => {
      const indexPath = path.join(REPO_ROOT, 'index.json');
      const exists = await fileExists(indexPath);
      
      if (!exists) {
        console.log('Skipping: index.json does not exist');
        return;
      }

      const content = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(content);

      const isSorted = (arr) => {
        for (let i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i - 1]) return false;
        }
        return true;
      };

      assert.ok(isSorted(index.materials), 'materials should be sorted');
      assert.ok(isSorted(index.brands), 'brands should be sorted');
      assert.ok(isSorted(index.models), 'models should be sorted');
      assert.ok(isSorted(index.slicers), 'slicers should be sorted');
    });

    it('should have presets count matching actual files', async () => {
      const indexPath = path.join(REPO_ROOT, 'index.json');
      const indexExists = await fileExists(indexPath);
      const presetsExist = await fileExists(PRESET_DIR);
      
      if (!indexExists || !presetsExist) {
        console.log('Skipping: index.json or preset directory does not exist');
        return;
      }

      const content = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(content);
      
      const presetFiles = await walkPresetFiles(PRESET_DIR);
      
      assert.strictEqual(index.presets.length, presetFiles.length, 
        `index.json should have ${presetFiles.length} presets, but has ${index.presets.length}`);
    });
  });
});

// Cleanup after tests
process.on('exit', async () => {
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});
