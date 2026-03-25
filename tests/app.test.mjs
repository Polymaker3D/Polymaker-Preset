/**
 * Tests for app.js pure functions
 * Testing core business logic without browser dependencies
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// ============================================
// HELPER FUNCTIONS (extracted from app.js)
// ============================================

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    var date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return '-';
  }
}

function formatCompatiblePrinters(compatiblePrinters) {
  if (!compatiblePrinters || compatiblePrinters.length === 0) {
    return '-';
  }

  var modelDisplayMap = {
    'Centauri Carbon 2': 'CC2'
  };

  var models = [];
  var seen = {};
  for (var i = 0; i < compatiblePrinters.length; i++) {
    var model = compatiblePrinters[i].model;
    if (model && modelDisplayMap[model]) {
      model = modelDisplayMap[model];
    }
    if (model && !seen[model]) {
      seen[model] = true;
      models.push(model);
    }
  }

  return models.join(', ');
}

function getPrinterBrand(compatiblePrinters, fallbackBrand) {
  if (!compatiblePrinters || compatiblePrinters.length === 0) {
    return fallbackBrand || '-';
  }
  return compatiblePrinters[0].brand || fallbackBrand || '-';
}

function materialMatchesSeries(material, series) {
  if (!series) return true;
  if (!material) return false;
  if (series === 'Polymaker') {
    return material.indexOf('Polymaker ') === 0 ||
           material.indexOf('PolyTerra ') === 0 ||
           material.indexOf('PolyLite ') === 0;
  }
  return material.indexOf(series + ' ') === 0;
}

function formatModelDisplayName(model) {
  if (!model) return 'Unknown';
  var modelMap = {
    'A1M': 'A1 mini',
    'A1': 'A1',
    'P1P': 'P1P',
    'P1S': 'P1S',
    'X1': 'X1',
    'X1C': 'X1C',
    'H2D': 'H2D',
    'H2S': 'H2S',
    'P2S': 'P2S',
    'CC2': 'CC2',
    'U1': 'U1',
    'Kobra S1': 'Kobra S1'
  };
  return modelMap[model] || model;
}

function isNativeMatch(sourceModel, targetPrinter) {
  if (!sourceModel || !targetPrinter) return false;

  var displayName = formatModelDisplayName(sourceModel);

  if (sourceModel === 'A1M') {
    return targetPrinter.indexOf('A1 mini') !== -1 || targetPrinter.indexOf('A1M') !== -1;
  }
  if (sourceModel === 'A1') {
    return targetPrinter.indexOf('A1') !== -1 && targetPrinter.indexOf('A1 mini') === -1;
  }

  return targetPrinter.indexOf(displayName) !== -1;
}

function normalizeSlicerName(slicer) {
  if (!slicer) return slicer;
  if (slicer.toLowerCase() === 'orcaslicer') return 'OrcaSlicer';
  return slicer;
}

function generateBundleStructure(presets, type) {
  if (!presets || presets.length === 0) {
    throw new Error('No presets provided');
  }

  var timestamp = Math.floor(Date.now() / 1000).toString();
  var isBatch = type === 'batch' || presets.length > 1;

  var vendorMap = {};

  presets.forEach(function(preset) {
    var vendor = extractVendorFromPreset(preset);

    if (!vendorMap[vendor]) {
      vendorMap[vendor] = {
        filament_path: [],
        vendor: vendor
      };
    }

    vendorMap[vendor].filament_path.push(vendor + '/' + preset.filename);
  });

  var filamentName;
  if (isBatch) {
    filamentName = 'Multiple Filaments';
  } else {
    filamentName = presets[0].material || 'Unknown Filament';
  }

  var bundleId = '0_' + filamentName + '_' + timestamp;

  var structure = {};
  structure.bundle_id = bundleId;
  structure.bundle_type = 'filament config bundle';
  structure.filament_name = filamentName;
  structure.filament_vendor = Object.keys(vendorMap).map(function(k) { return vendorMap[k]; });
  structure.version = '02.05.00.56';

  return structure;
}

function generateBundleFilename(presets) {
  if (!presets || presets.length === 0) {
    return 'polymaker-bundle.bbsflmt';
  }

  var timestamp = new Date().toISOString().slice(0, 10);

  if (presets.length === 1) {
    var material = presets[0].material || 'bundle';
    var sanitized = material.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
    return sanitized + '-' + timestamp + '.bbsflmt';
  } else {
    return 'polymaker-bundle-' + presets.length + '-' + timestamp + '.bbsflmt';
  }
}

function extractVendorFromPreset(preset) {
  if (preset.filament_vendor && Array.isArray(preset.filament_vendor) && preset.filament_vendor.length > 0) {
    return preset.filament_vendor[0];
  }

  var filename = preset.filename || '';
  var match = filename.match(/@([^\s]+)/);

  if (match && match[1]) {
    return match[1];
  }

  var path = preset.path || '';
  var pathParts = path.split('/');

  if (pathParts.length >= 4) {
    return pathParts[2];
  }

  return 'Unknown';
}

function generateFilenamesFromPrinters(preset, presetData) {
  var mappings = [];
  var material = preset.material || 'Unknown';
  var compatiblePrinters = presetData && presetData.compatible_printers;

  if (!compatiblePrinters || !Array.isArray(compatiblePrinters) || compatiblePrinters.length === 0) {
    mappings.push({
      originalPreset: preset,
      presetData: presetData,
      printerName: null,
      generatedFilename: preset.filename
    });
    return mappings;
  }

  compatiblePrinters.forEach(function(printerName) {
    var filename = material + ' @' + printerName + '.json';
    mappings.push({
      originalPreset: preset,
      presetData: presetData,
      printerName: printerName,
      generatedFilename: filename
    });
  });

  return mappings;
}

function findDuplicateFilenames(filenameMappings) {
  if (!filenameMappings || !Array.isArray(filenameMappings) || filenameMappings.length === 0) {
    return [];
  }

  var materialGroups = {};

  filenameMappings.forEach(function(mapping) {
    var material = mapping.originalPreset.material || 'Unknown';
    var targetPrinter = mapping.printerName;

    if (!materialGroups[material]) {
      materialGroups[material] = {};
    }

    if (!materialGroups[material][targetPrinter]) {
      materialGroups[material][targetPrinter] = [];
    }

    materialGroups[material][targetPrinter].push(mapping);
  });

  var conflicts = [];

  for (var material in materialGroups) {
    if (!materialGroups.hasOwnProperty(material)) continue;

    var targetPrinters = materialGroups[material];
    var targetPrinterConflicts = [];

    for (var targetPrinter in targetPrinters) {
      if (!targetPrinters.hasOwnProperty(targetPrinter)) continue;

      var options = targetPrinters[targetPrinter];
      if (options.length > 1) {
        targetPrinterConflicts.push({
          targetPrinter: targetPrinter,
          generatedFilename: options[0].generatedFilename,
          options: options
        });
      }
    }

    if (targetPrinterConflicts.length > 0) {
      conflicts.push({
        material: material,
        targets: targetPrinterConflicts
      });
    }
  }

  return conflicts;
}

function generateBundleStructureFromMappings(filenameMappings, type, materialName) {
  if (!filenameMappings || filenameMappings.length === 0) {
    throw new Error('No filename mappings provided');
  }

  var timestamp = Math.floor(Date.now() / 1000).toString();
  var isBatch = type === 'batch';

  var vendorMap = {};

  filenameMappings.forEach(function(mapping) {
    var vendor = extractVendorFromPreset(mapping.originalPreset);

    if (!vendorMap[vendor]) {
      vendorMap[vendor] = {
        filament_path: [],
        vendor: vendor
      };
    }

    vendorMap[vendor].filament_path.push(vendor + '/' + mapping.generatedFilename);
  });

  var filamentName;
  if (materialName) {
    filamentName = materialName;
  } else if (isBatch) {
    filamentName = 'Multiple Filaments';
  } else {
    filamentName = filenameMappings[0].originalPreset.material || 'Unknown Filament';
  }

  var bundleId = '0_' + filamentName + '_' + timestamp;

  var structure = {};
  structure.bundle_id = bundleId;
  structure.bundle_type = 'filament config bundle';
  structure.filament_name = filamentName;
  structure.filament_vendor = Object.keys(vendorMap).map(function(k) { return vendorMap[k]; });
  structure.version = '02.05.00.56';

  return structure;
}

function filterDuplicates(filenameMappings, selectedOptions, duplicates) {
  if (!duplicates || duplicates.length === 0) {
    return filenameMappings;
  }

  var excludeSet = {};

  duplicates.forEach(function(materialGroup, materialIndex) {
    var materialTargets = materialGroup.targets;

    materialTargets.forEach(function(target, targetIndex) {
      var selectedOptionIndex = selectedOptions[materialIndex][targetIndex];

      target.options.forEach(function(mapping, optionIndex) {
        if (optionIndex !== selectedOptionIndex) {
          var key = mapping.generatedFilename + '|' + mapping.originalPreset.path;
          excludeSet[key] = true;
        }
      });
    });
  });

  return filenameMappings.filter(function(mapping) {
    var key = mapping.generatedFilename + '|' + mapping.originalPreset.path;
    return !excludeSet[key];
  });
}

// ============================================
// VIRTUAL SLICER FUNCTIONS
// ============================================

var VIRTUAL_SLICERS = {
  'OrcaSlicer (Snapmaker)': { actualSlicer: 'OrcaSlicer', forcedBrand: 'Snapmaker' }
};

function isVirtualSlicer(slicer) {
  return !!(slicer && VIRTUAL_SLICERS.hasOwnProperty(slicer));
}

function getActualSlicer(slicer) {
  return isVirtualSlicer(slicer) ? VIRTUAL_SLICERS[slicer].actualSlicer : slicer;
}

function getForcedBrand(slicer) {
  return isVirtualSlicer(slicer) ? VIRTUAL_SLICERS[slicer].forcedBrand : null;
}

// ============================================
// TESTS
// ============================================

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;');
    assert.strictEqual(escapeHtml('"test"'), '&quot;test&quot;');
    assert.strictEqual(escapeHtml("'test'"), '&#39;test&#39;');
    assert.strictEqual(escapeHtml('a & b'), 'a &amp; b');
  });

  it('should handle null and undefined', () => {
    assert.strictEqual(escapeHtml(null), '');
    assert.strictEqual(escapeHtml(undefined), '');
  });

  it('should handle empty strings', () => {
    assert.strictEqual(escapeHtml(''), '');
  });

  it('should handle strings without special characters', () => {
    assert.strictEqual(escapeHtml('hello world'), 'hello world');
  });

  it('should handle numbers', () => {
    assert.strictEqual(escapeHtml(123), '123');
  });

  it('should handle multiple special characters', () => {
    assert.strictEqual(
      escapeHtml('<div class="test">It\'s working &gt;</div>'),
      '&lt;div class=&quot;test&quot;&gt;It&#39;s working &amp;gt;&lt;/div&gt;'
    );
  });
});

describe('formatDate', () => {
  it('should format valid date strings', () => {
    const result = formatDate('2024-01-15');
    assert.ok(result !== '-', 'Should return formatted date');
    assert.ok(result.includes('2024') || result.includes('15'), 'Should contain date parts');
  });

  it('should return dash for null', () => {
    assert.strictEqual(formatDate(null), '-');
  });

  it('should return dash for undefined', () => {
    assert.strictEqual(formatDate(undefined), '-');
  });

  it('should return dash for empty string', () => {
    assert.strictEqual(formatDate(''), '-');
  });

  it('should handle ISO date strings', () => {
    const result = formatDate('2024-03-22T10:30:00.000Z');
    assert.ok(result !== '-', 'Should format ISO date');
  });

  it('should handle invalid dates gracefully', () => {
    // Invalid dates may return 'Invalid Date' string or '-'
    const result = formatDate('not-a-date');
    assert.ok(result === '-' || result === 'Invalid Date', 'Should handle invalid date');
  });
});

describe('formatCompatiblePrinters', () => {
  it('should format single printer', () => {
    const printers = [{ brand: 'BBL', model: 'X1' }];
    assert.strictEqual(formatCompatiblePrinters(printers), 'X1');
  });

  it('should format multiple printers', () => {
    const printers = [
      { brand: 'BBL', model: 'X1' },
      { brand: 'BBL', model: 'P1S' }
    ];
    assert.strictEqual(formatCompatiblePrinters(printers), 'X1, P1S');
  });

  it('should map Centauri Carbon 2 to CC2', () => {
    const printers = [{ brand: 'Elegoo', model: 'Centauri Carbon 2' }];
    assert.strictEqual(formatCompatiblePrinters(printers), 'CC2');
  });

  it('should deduplicate models', () => {
    const printers = [
      { brand: 'BBL', model: 'X1' },
      { brand: 'BBL', model: 'X1' }
    ];
    assert.strictEqual(formatCompatiblePrinters(printers), 'X1');
  });

  it('should return dash for empty array', () => {
    assert.strictEqual(formatCompatiblePrinters([]), '-');
  });

  it('should return dash for null', () => {
    assert.strictEqual(formatCompatiblePrinters(null), '-');
  });

  it('should return dash for undefined', () => {
    assert.strictEqual(formatCompatiblePrinters(undefined), '-');
  });

  it('should skip entries without model', () => {
    const printers = [
      { brand: 'BBL' },
      { brand: 'BBL', model: 'X1' }
    ];
    assert.strictEqual(formatCompatiblePrinters(printers), 'X1');
  });
});

describe('getPrinterBrand', () => {
  it('should return first printer brand', () => {
    const printers = [
      { brand: 'BBL', model: 'X1' },
      { brand: 'BBL', model: 'P1S' }
    ];
    assert.strictEqual(getPrinterBrand(printers, 'Fallback'), 'BBL');
  });

  it('should return fallback when no compatible printers', () => {
    assert.strictEqual(getPrinterBrand([], 'BBL'), 'BBL');
  });

  it('should return fallback when null', () => {
    assert.strictEqual(getPrinterBrand(null, 'BBL'), 'BBL');
  });

  it('should return dash when no fallback', () => {
    assert.strictEqual(getPrinterBrand([], ''), '-');
    assert.strictEqual(getPrinterBrand(null, null), '-');
  });

  it('should handle undefined', () => {
    assert.strictEqual(getPrinterBrand(undefined, 'BBL'), 'BBL');
  });
});

describe('materialMatchesSeries', () => {
  it('should match Panchroma series', () => {
    assert.strictEqual(materialMatchesSeries('Panchroma PLA Galaxy', 'Panchroma'), true);
    assert.strictEqual(materialMatchesSeries('Panchroma PLA Silk', 'Panchroma'), true);
  });

  it('should match Polymaker series including sub-brands', () => {
    assert.strictEqual(materialMatchesSeries('Polymaker PETG', 'Polymaker'), true);
    assert.strictEqual(materialMatchesSeries('PolyTerra PLA+', 'Polymaker'), true);
    assert.strictEqual(materialMatchesSeries('PolyLite PLA', 'Polymaker'), true);
  });

  it('should match Fiberon series', () => {
    assert.strictEqual(materialMatchesSeries('Fiberon PA-CF', 'Fiberon'), true);
    assert.strictEqual(materialMatchesSeries('Fiberon PETG-ESD', 'Fiberon'), true);
  });

  it('should return true when no series specified', () => {
    assert.strictEqual(materialMatchesSeries('Any Material', ''), true);
    assert.strictEqual(materialMatchesSeries('Any Material', null), true);
    assert.strictEqual(materialMatchesSeries('Any Material', undefined), true);
  });

  it('should return false for no material', () => {
    assert.strictEqual(materialMatchesSeries('', 'Panchroma'), false);
    assert.strictEqual(materialMatchesSeries(null, 'Panchroma'), false);
  });

  it('should not match different series', () => {
    assert.strictEqual(materialMatchesSeries('Panchroma PLA', 'Fiberon'), false);
    assert.strictEqual(materialMatchesSeries('Polymaker PETG', 'Panchroma'), false);
  });

  it('should require space after series name', () => {
    assert.strictEqual(materialMatchesSeries('PolymakerX', 'Polymaker'), false);
    assert.strictEqual(materialMatchesSeries('PanchromaX', 'Panchroma'), false);
  });
});

describe('formatModelDisplayName', () => {
  it('should map known models', () => {
    assert.strictEqual(formatModelDisplayName('A1M'), 'A1 mini');
    assert.strictEqual(formatModelDisplayName('A1'), 'A1');
    assert.strictEqual(formatModelDisplayName('X1'), 'X1');
    assert.strictEqual(formatModelDisplayName('X1C'), 'X1C');
    assert.strictEqual(formatModelDisplayName('P1P'), 'P1P');
    assert.strictEqual(formatModelDisplayName('P1S'), 'P1S');
    assert.strictEqual(formatModelDisplayName('H2D'), 'H2D');
    assert.strictEqual(formatModelDisplayName('H2S'), 'H2S');
    assert.strictEqual(formatModelDisplayName('P2S'), 'P2S');
    assert.strictEqual(formatModelDisplayName('CC2'), 'CC2');
    assert.strictEqual(formatModelDisplayName('U1'), 'U1');
  });

  it('should return unknown for null', () => {
    assert.strictEqual(formatModelDisplayName(null), 'Unknown');
  });

  it('should return unknown for undefined', () => {
    assert.strictEqual(formatModelDisplayName(undefined), 'Unknown');
  });

  it('should return unknown for empty string', () => {
    assert.strictEqual(formatModelDisplayName(''), 'Unknown');
  });

  it('should pass through unknown models', () => {
    assert.strictEqual(formatModelDisplayName('XYZ123'), 'XYZ123');
  });
});

describe('isNativeMatch', () => {
  it('should match A1 mini specifically', () => {
    assert.strictEqual(isNativeMatch('A1M', 'Bambu Lab A1 mini 0.4 nozzle'), true);
    assert.strictEqual(isNativeMatch('A1M', 'Bambu Lab A1 0.4 nozzle'), false);
  });

  it('should match A1 but not A1 mini', () => {
    assert.strictEqual(isNativeMatch('A1', 'Bambu Lab A1 0.4 nozzle'), true);
    assert.strictEqual(isNativeMatch('A1', 'Bambu Lab A1 mini 0.4 nozzle'), false);
  });

  it('should match other models', () => {
    assert.strictEqual(isNativeMatch('X1', 'Bambu Lab X1 0.4 nozzle'), true);
    assert.strictEqual(isNativeMatch('P1S', 'Bambu Lab P1S 0.4 nozzle'), true);
    // X1C maps to 'X1C' display name but printer string uses 'X1 Carbon'
    // The function checks for displayName in target, so this returns false
    assert.strictEqual(isNativeMatch('X1C', 'Bambu Lab X1 Carbon 0.4 nozzle'), false);
    // But should match if 'X1C' is in the string
    assert.strictEqual(isNativeMatch('X1C', 'Bambu Lab X1C 0.4 nozzle'), true);
  });

  it('should return false for null inputs', () => {
    assert.strictEqual(isNativeMatch(null, 'Bambu Lab X1'), false);
    assert.strictEqual(isNativeMatch('X1', null), false);
    assert.strictEqual(isNativeMatch(null, null), false);
  });

  it('should handle A1M abbreviation', () => {
    assert.strictEqual(isNativeMatch('A1M', 'BBL A1M'), true);
  });
});

describe('normalizeSlicerName', () => {
  it('should normalize Orcaslicer to OrcaSlicer', () => {
    assert.strictEqual(normalizeSlicerName('Orcaslicer'), 'OrcaSlicer');
    assert.strictEqual(normalizeSlicerName('orcaslicer'), 'OrcaSlicer');
    assert.strictEqual(normalizeSlicerName('ORCASLICER'), 'OrcaSlicer');
  });

  it('should pass through other slicer names', () => {
    assert.strictEqual(normalizeSlicerName('BambuStudio'), 'BambuStudio');
    assert.strictEqual(normalizeSlicerName('ElegooSlicer'), 'ElegooSlicer');
  });

  it('should handle null', () => {
    assert.strictEqual(normalizeSlicerName(null), null);
  });

  it('should handle undefined', () => {
    assert.strictEqual(normalizeSlicerName(undefined), undefined);
  });

  it('should handle empty string', () => {
    assert.strictEqual(normalizeSlicerName(''), '');
  });
});

describe('generateBundleStructure', () => {
  it('should throw error for empty presets', () => {
    assert.throws(() => generateBundleStructure([], 'single'), /No presets provided/);
  });

  it('should throw error for null presets', () => {
    assert.throws(() => generateBundleStructure(null, 'single'), /No presets provided/);
  });

  it('should generate structure for single preset', () => {
    const preset = {
      material: 'Panchroma PLA',
      filename: 'test.json',
      filament_vendor: ['Polymaker']
    };
    const structure = generateBundleStructure([preset], 'single');

    assert.ok(structure.bundle_id.startsWith('0_'), 'bundle_id should start with 0_');
    assert.ok(structure.bundle_id.includes('Panchroma'), 'bundle_id should include material');
    assert.strictEqual(structure.bundle_type, 'filament config bundle');
    assert.strictEqual(structure.filament_name, 'Panchroma PLA');
    assert.ok(Array.isArray(structure.filament_vendor), 'filament_vendor should be array');
    assert.strictEqual(structure.version, '02.05.00.56');
  });

  it('should use Multiple Filaments for batch', () => {
    const presets = [
      { material: 'PLA', filename: 'a.json', filament_vendor: ['Polymaker'] },
      { material: 'PETG', filename: 'b.json', filament_vendor: ['Polymaker'] }
    ];
    const structure = generateBundleStructure(presets, 'batch');
    assert.strictEqual(structure.filament_name, 'Multiple Filaments');
  });

  it('should group by vendor', () => {
    const presets = [
      { material: 'PLA', filename: 'a.json', filament_vendor: ['Polymaker'] },
      { material: 'PLA', filename: 'b.json', filament_vendor: ['Generic'] }
    ];
    const structure = generateBundleStructure(presets, 'batch');
    assert.strictEqual(structure.filament_vendor.length, 2);
  });

  it('should have correct field order', () => {
    const preset = {
      material: 'PLA',
      filename: 'test.json',
      filament_vendor: ['Polymaker']
    };
    const structure = generateBundleStructure([preset], 'single');
    const keys = Object.keys(structure);
    assert.strictEqual(keys[0], 'bundle_id', 'First key should be bundle_id');
    assert.strictEqual(keys[keys.length - 1], 'version', 'Last key should be version');
  });
});

describe('generateBundleFilename', () => {
  it('should return default for empty presets', () => {
    assert.strictEqual(generateBundleFilename([]), 'polymaker-bundle.bbsflmt');
  });

  it('should return default for null', () => {
    assert.strictEqual(generateBundleFilename(null), 'polymaker-bundle.bbsflmt');
  });

  it('should include material name for single preset', () => {
    const preset = { material: 'Panchroma PLA Galaxy' };
    const filename = generateBundleFilename([preset]);
    assert.ok(filename.endsWith('.bbsflmt'));
    assert.ok(filename.includes('Panchroma'));
  });

  it('should sanitize material name', () => {
    const preset = { material: 'PLA @#$% Galaxy!' };
    const filename = generateBundleFilename([preset]);
    assert.ok(filename.includes('PLA-Galaxy'));
    assert.ok(!filename.includes('@'));
    assert.ok(!filename.includes('!'));
  });

  it('should include count for multiple presets', () => {
    const presets = [{ material: 'PLA' }, { material: 'PETG' }];
    const filename = generateBundleFilename(presets);
    assert.ok(filename.includes('-2-'));
  });

  it('should include date', () => {
    const preset = { material: 'PLA' };
    const filename = generateBundleFilename([preset]);
    const today = new Date().toISOString().slice(0, 10);
    assert.ok(filename.includes(today));
  });
});

describe('extractVendorFromPreset', () => {
  it('should extract from filament_vendor array', () => {
    const preset = {
      filament_vendor: ['Polymaker'],
      filename: 'test.json'
    };
    assert.strictEqual(extractVendorFromPreset(preset), 'Polymaker');
  });

  it('should extract from filename', () => {
    const preset = {
      filename: 'PLA @BBL X1.json'
    };
    assert.strictEqual(extractVendorFromPreset(preset), 'BBL');
  });

  it('should extract from path', () => {
    const preset = {
      filename: 'test.json',
      path: 'preset/PLA/Anycubic/X1/BambuStudio/test.json'
    };
    assert.strictEqual(extractVendorFromPreset(preset), 'Anycubic');
  });

  it('should return Unknown when no info', () => {
    const preset = { filename: 'test.json' };
    assert.strictEqual(extractVendorFromPreset(preset), 'Unknown');
  });

  it('should prefer filament_vendor over filename', () => {
    const preset = {
      filament_vendor: ['Polymaker'],
      filename: 'PLA @BBL X1.json'
    };
    assert.strictEqual(extractVendorFromPreset(preset), 'Polymaker');
  });
});

describe('generateFilenamesFromPrinters', () => {
  it('should generate single filename when no compatible_printers', () => {
    const preset = {
      material: 'PLA',
      filename: 'original.json'
    };
    const mappings = generateFilenamesFromPrinters(preset, {});
    assert.strictEqual(mappings.length, 1);
    assert.strictEqual(mappings[0].generatedFilename, 'original.json');
  });

  it('should generate multiple filenames', () => {
    const preset = {
      material: 'PLA',
      filename: 'test.json'
    };
    const presetData = {
      compatible_printers: ['Bambu Lab X1', 'Bambu Lab P1S']
    };
    const mappings = generateFilenamesFromPrinters(preset, presetData);
    assert.strictEqual(mappings.length, 2);
    assert.strictEqual(mappings[0].generatedFilename, 'PLA @Bambu Lab X1.json');
    assert.strictEqual(mappings[1].generatedFilename, 'PLA @Bambu Lab P1S.json');
  });

  it('should include original preset reference', () => {
    const preset = { material: 'PLA', filename: 'test.json' };
    const mappings = generateFilenamesFromPrinters(preset, {});
    assert.strictEqual(mappings[0].originalPreset, preset);
  });

  it('should include presetData reference', () => {
    const preset = { material: 'PLA', filename: 'test.json' };
    const presetData = { temp: 200 };
    const mappings = generateFilenamesFromPrinters(preset, presetData);
    assert.strictEqual(mappings[0].presetData, presetData);
  });

  it('should handle null compatible_printers', () => {
    const preset = { material: 'PLA', filename: 'test.json' };
    const mappings = generateFilenamesFromPrinters(preset, { compatible_printers: null });
    assert.strictEqual(mappings.length, 1);
  });

  it('should handle empty compatible_printers', () => {
    const preset = { material: 'PLA', filename: 'test.json' };
    const mappings = generateFilenamesFromPrinters(preset, { compatible_printers: [] });
    assert.strictEqual(mappings.length, 1);
  });
});

describe('findDuplicateFilenames', () => {
  it('should return empty for unique filenames', () => {
    const mappings = [
      { originalPreset: { material: 'PLA' }, printerName: 'X1', generatedFilename: 'PLA @X1.json' },
      { originalPreset: { material: 'PETG' }, printerName: 'X1', generatedFilename: 'PETG @X1.json' }
    ];
    assert.deepStrictEqual(findDuplicateFilenames(mappings), []);
  });

  it('should detect duplicates', () => {
    const mappings = [
      { originalPreset: { material: 'PLA', path: 'a.json' }, printerName: 'X1', generatedFilename: 'PLA @X1.json' },
      { originalPreset: { material: 'PLA', path: 'b.json' }, printerName: 'X1', generatedFilename: 'PLA @X1.json' }
    ];
    const duplicates = findDuplicateFilenames(mappings);
    assert.strictEqual(duplicates.length, 1);
    assert.strictEqual(duplicates[0].material, 'PLA');
  });

  it('should group by material and target', () => {
    const mappings = [
      { originalPreset: { material: 'PLA', path: 'a' }, printerName: 'X1', generatedFilename: 'PLA @X1.json' },
      { originalPreset: { material: 'PLA', path: 'b' }, printerName: 'X1', generatedFilename: 'PLA @X1.json' },
      { originalPreset: { material: 'PLA', path: 'c' }, printerName: 'P1S', generatedFilename: 'PLA @P1S.json' },
      { originalPreset: { material: 'PLA', path: 'd' }, printerName: 'P1S', generatedFilename: 'PLA @P1S.json' }
    ];
    const duplicates = findDuplicateFilenames(mappings);
    assert.strictEqual(duplicates.length, 1);
    assert.strictEqual(duplicates[0].targets.length, 2);
  });

  it('should return empty for empty input', () => {
    assert.deepStrictEqual(findDuplicateFilenames([]), []);
  });

  it('should return empty for null', () => {
    assert.deepStrictEqual(findDuplicateFilenames(null), []);
  });
});

describe('generateBundleStructureFromMappings', () => {
  it('should throw error for empty mappings', () => {
    assert.throws(() => generateBundleStructureFromMappings([], 'single'), /No filename mappings/);
  });

  it('should use provided material name', () => {
    const mappings = [
      { originalPreset: { material: 'Original', filename: 'test.json', filament_vendor: ['Polymaker'] }, generatedFilename: 'test.json' }
    ];
    const structure = generateBundleStructureFromMappings(mappings, 'single', 'Override');
    assert.strictEqual(structure.filament_name, 'Override');
  });

  it('should use first preset material when no override', () => {
    const mappings = [
      { originalPreset: { material: 'PLA', filename: 'test.json', filament_vendor: ['Polymaker'] }, generatedFilename: 'test.json' }
    ];
    const structure = generateBundleStructureFromMappings(mappings, 'single');
    assert.strictEqual(structure.filament_name, 'PLA');
  });

  it('should use Multiple Filaments for batch', () => {
    const mappings = [
      { originalPreset: { material: 'PLA', filename: 'a.json', filament_vendor: ['Polymaker'] }, generatedFilename: 'a.json' },
      { originalPreset: { material: 'PETG', filename: 'b.json', filament_vendor: ['Polymaker'] }, generatedFilename: 'b.json' }
    ];
    const structure = generateBundleStructureFromMappings(mappings, 'batch');
    assert.strictEqual(structure.filament_name, 'Multiple Filaments');
  });
});

describe('filterDuplicates', () => {
  it('should return all mappings when no duplicates', () => {
    const mappings = [
      { generatedFilename: 'a.json', originalPreset: { path: 'a' } }
    ];
    const result = filterDuplicates(mappings, {}, []);
    assert.strictEqual(result.length, 1);
  });

  it('should filter unselected duplicates', () => {
    const mappings = [
      { generatedFilename: 'test.json', originalPreset: { path: 'a' } },
      { generatedFilename: 'test.json', originalPreset: { path: 'b' } }
    ];
    const duplicates = [{
      material: 'PLA',
      targets: [{
        targetPrinter: 'X1',
        generatedFilename: 'test.json',
        options: mappings
      }]
    }];
    const selectedOptions = { 0: { 0: 0 } };
    const result = filterDuplicates(mappings, selectedOptions, duplicates);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].originalPreset.path, 'a');
  });

  it('should keep selected option', () => {
    const mappings = [
      { generatedFilename: 'test.json', originalPreset: { path: 'a' } },
      { generatedFilename: 'test.json', originalPreset: { path: 'b' } }
    ];
    const duplicates = [{
      material: 'PLA',
      targets: [{
        targetPrinter: 'X1',
        generatedFilename: 'test.json',
        options: mappings
      }]
    }];
    const selectedOptions = { 0: { 0: 1 } };
    const result = filterDuplicates(mappings, selectedOptions, duplicates);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].originalPreset.path, 'b');
  });
});

describe('isVirtualSlicer', () => {
  it('should return true for OrcaSlicer (Snapmaker)', () => {
    assert.strictEqual(isVirtualSlicer('OrcaSlicer (Snapmaker)'), true);
  });

  it('should return false for regular slicer names', () => {
    assert.strictEqual(isVirtualSlicer('OrcaSlicer'), false);
    assert.strictEqual(isVirtualSlicer('BambuStudio'), false);
    assert.strictEqual(isVirtualSlicer('ElegooSlicer'), false);
  });

  it('should return false for null', () => {
    assert.strictEqual(isVirtualSlicer(null), false);
  });

  it('should return false for undefined', () => {
    assert.strictEqual(isVirtualSlicer(undefined), false);
  });

  it('should return false for empty string', () => {
    assert.strictEqual(isVirtualSlicer(''), false);
  });

  it('should return false for similar but non-virtual names', () => {
    assert.strictEqual(isVirtualSlicer('OrcaSlicer (Snapmaker) '), false);
    assert.strictEqual(isVirtualSlicer(' OrcaSlicer (Snapmaker)'), false);
    assert.strictEqual(isVirtualSlicer('orcaSlicer (snapmaker)'), false);
  });
});

describe('getActualSlicer', () => {
  it('should return actual slicer for virtual slicer', () => {
    assert.strictEqual(getActualSlicer('OrcaSlicer (Snapmaker)'), 'OrcaSlicer');
  });

  it('should return original for regular slicer names', () => {
    assert.strictEqual(getActualSlicer('OrcaSlicer'), 'OrcaSlicer');
    assert.strictEqual(getActualSlicer('BambuStudio'), 'BambuStudio');
    assert.strictEqual(getActualSlicer('ElegooSlicer'), 'ElegooSlicer');
  });

  it('should return null for null', () => {
    assert.strictEqual(getActualSlicer(null), null);
  });

  it('should return undefined for undefined', () => {
    assert.strictEqual(getActualSlicer(undefined), undefined);
  });

  it('should return empty string for empty string', () => {
    assert.strictEqual(getActualSlicer(''), '');
  });

  it('should return the exact string for non-virtual names', () => {
    assert.strictEqual(getActualSlicer('SomeRandomSlicer'), 'SomeRandomSlicer');
  });
});

describe('getForcedBrand', () => {
  it('should return Snapmaker for OrcaSlicer (Snapmaker)', () => {
    assert.strictEqual(getForcedBrand('OrcaSlicer (Snapmaker)'), 'Snapmaker');
  });

  it('should return null for regular slicer names', () => {
    assert.strictEqual(getForcedBrand('OrcaSlicer'), null);
    assert.strictEqual(getForcedBrand('BambuStudio'), null);
    assert.strictEqual(getForcedBrand('ElegooSlicer'), null);
  });

  it('should return null for null', () => {
    assert.strictEqual(getForcedBrand(null), null);
  });

  it('should return null for undefined', () => {
    assert.strictEqual(getForcedBrand(undefined), null);
  });

  it('should return null for empty string', () => {
    assert.strictEqual(getForcedBrand(''), null);
  });

  it('should return null for non-virtual names', () => {
    assert.strictEqual(getForcedBrand('SomeRandomSlicer'), null);
  });
});
