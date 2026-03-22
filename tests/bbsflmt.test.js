/**
 * TDD Tests for .bbsflmt Bundle Download Feature
 * Using Node.js built-in test runner
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

// ============================================
// TEST SUITE: Bundle Button Visibility
// ============================================

describe('Bundle Button Visibility', () => {
  
  test('Bundle button should be visible for BambuStudio presets', () => {
    // Given a BambuStudio preset
    const preset = {
      material: 'Panchroma PLA Galaxy',
      brand: 'BBL',
      model: 'X1',
      slicer: 'BambuStudio',
      path: 'preset/Panchroma PLA Galaxy/BBL/X1/BambuStudio/Panchroma PLA Galaxy @BBL X1.json',
      filename: 'Panchroma PLA Galaxy @BBL X1.json'
    };

    // When checking if bundle button should show
    const shouldShowBundle = preset.slicer === 'BambuStudio';

    // Then it should be true
    assert.strictEqual(shouldShowBundle, true, 'Bundle button should show for BambuStudio');
  });

  test('Bundle button should be hidden for OrcaSlicer presets', () => {
    // Given an OrcaSlicer preset
    const preset = {
      material: 'Panchroma PLA Galaxy',
      brand: 'BBL',
      model: 'X1',
      slicer: 'OrcaSlicer',
      path: 'preset/Panchroma PLA Galaxy/BBL/X1/OrcaSlicer/Panchroma PLA Galaxy @BBL X1.json',
      filename: 'Panchroma PLA Galaxy @BBL X1.json'
    };

    // When checking if bundle button should show
    const shouldShowBundle = preset.slicer === 'BambuStudio';

    // Then it should be false
    assert.strictEqual(shouldShowBundle, false, 'Bundle button should be hidden for OrcaSlicer');
  });

  test('Bundle button should be hidden for ElegooSlicer presets', () => {
    // Given an ElegooSlicer preset
    const preset = {
      material: 'Panchroma PLA Galaxy',
      brand: 'Elegoo',
      model: 'CC2',
      slicer: 'ElegooSlicer',
      path: 'preset/Panchroma PLA Galaxy/Elegoo/CC2/ElegooSlicer/Panchroma PLA Galaxy @Elegoo CC2.json',
      filename: 'Panchroma PLA Galaxy @Elegoo CC2.json'
    };

    // When checking if bundle button should show
    const shouldShowBundle = preset.slicer === 'BambuStudio';

    // Then it should be false
    assert.strictEqual(shouldShowBundle, false, 'Bundle button should be hidden for ElegooSlicer');
  });
});

// ============================================
// TEST SUITE: Bundle Structure Generation
// ============================================

describe('Bundle Structure Generation', () => {
  
  test('Should generate correct bundle_structure.json for single preset', () => {
    // Given a preset
    const preset = {
      material: 'Panchroma PLA Galaxy',
      brand: 'BBL',
      model: 'X1',
      slicer: 'BambuStudio',
      path: 'preset/Panchroma PLA Galaxy/BBL/X1/BambuStudio/Panchroma PLA Galaxy @BBL X1.json',
      filename: 'Panchroma PLA Galaxy @BBL X1.json',
      filament_vendor: ['Polymaker']
    };

    // When generating bundle structure
    const structure = generateBundleStructure([preset], 'single');

    // Then structure should have correct fields
    assert.ok(structure.bundle_id, 'Should have bundle_id');
    assert.ok(structure.bundle_id.startsWith('0_'), 'bundle_id should start with 0_');
    assert.ok(structure.bundle_id.includes('Panchroma'), 'bundle_id should include filament name');
    assert.strictEqual(structure.bundle_type, 'filament config bundle', 'Should have correct bundle_type');
    assert.ok(structure.filament_name, 'Should have filament_name');
    assert.ok(Array.isArray(structure.filament_vendor), 'filament_vendor should be an array');
    assert.strictEqual(structure.filament_vendor.length, 1, 'Should have one vendor entry');
    
    // Check vendor object has filament_path FIRST, vendor SECOND (BambuStudio format)
    const vendorKeys = Object.keys(structure.filament_vendor[0]);
    assert.strictEqual(vendorKeys[0], 'filament_path', 'filament_path should be first key');
    assert.strictEqual(vendorKeys[1], 'vendor', 'vendor should be second key');
    assert.ok(Array.isArray(structure.filament_vendor[0].filament_path), 'filament_path should be an array');
    assert.strictEqual(structure.filament_vendor[0].vendor, 'Polymaker', 'Vendor should be Polymaker');
    
    // Check field order in structure (bundle_id first, version last)
    const structureKeys = Object.keys(structure);
    assert.strictEqual(structureKeys[0], 'bundle_id', 'bundle_id should be first field');
    assert.strictEqual(structureKeys[structureKeys.length - 1], 'version', 'version should be last field');
    assert.ok(structure.version, 'Should have version');
    
    // Check version format (should be like "02.05.00.56")
    assert.ok(/\d{2}\.\d{2}\.\d{2}\.\d{2}/.test(structure.version), 'version should be in BambuStudio format');
  });

  test('Should group presets by vendor in batch bundle', () => {
    // Given multiple presets from different vendors
    const presets = [
      {
        material: 'Panchroma PLA Galaxy',
        brand: 'BBL',
        model: 'X1',
        slicer: 'BambuStudio',
        path: 'preset/Panchroma PLA Galaxy/BBL/X1/BambuStudio/Panchroma PLA Galaxy @BBL X1.json',
        filename: 'Panchroma PLA Galaxy @BBL X1.json',
        filament_vendor: ['Polymaker']
      },
      {
        material: 'Generic PLA',
        brand: 'BBL',
        model: 'X1',
        slicer: 'BambuStudio',
        path: 'preset/Generic PLA/BBL/X1/BambuStudio/Generic PLA @BBL X1.json',
        filename: 'Generic PLA @BBL X1.json',
        filament_vendor: ['Generic']
      }
    ];

    // When generating batch bundle structure
    const structure = generateBundleStructure(presets, 'batch');

    // Then structure should group by vendor
    assert.strictEqual(structure.filament_vendor.length, 2, 'Should have two vendor entries');
    
    const vendors = structure.filament_vendor.map(v => v.vendor);
    assert.ok(vendors.includes('Polymaker'), 'Should have Polymaker vendor');
    assert.ok(vendors.includes('Generic'), 'Should have Generic vendor');
  });
});

// ============================================
// TEST SUITE: Batch Download Button State
// ============================================

describe('Batch Download Button State', () => {
  
  test('Bundle download button should only consider BambuStudio presets', () => {
    // Given a mix of selected presets
    const selectedPresets = {
      'preset1': { slicer: 'BambuStudio', filename: 'test1.json' },
      'preset2': { slicer: 'OrcaSlicer', filename: 'test2.json' },
      'preset3': { slicer: 'BambuStudio', filename: 'test3.json' },
      'preset4': { slicer: 'ElegooSlicer', filename: 'test4.json' }
    };

    // When filtering for BambuStudio presets
    const bambuPresets = Object.values(selectedPresets).filter(p => p.slicer === 'BambuStudio');

    // Then only BambuStudio presets should be included
    assert.strictEqual(bambuPresets.length, 2, 'Should have 2 BambuStudio presets');
    
    // And button should be enabled if any BambuStudio presets exist
    const shouldEnableBundleButton = bambuPresets.length > 0;
    assert.strictEqual(shouldEnableBundleButton, true, 'Bundle button should be enabled');
  });

  test('Bundle download button should be disabled when no BambuStudio presets selected', () => {
    // Given only non-BambuStudio presets selected
    const selectedPresets = {
      'preset1': { slicer: 'OrcaSlicer', filename: 'test1.json' },
      'preset2': { slicer: 'ElegooSlicer', filename: 'test2.json' }
    };

    // When filtering for BambuStudio presets
    const bambuPresets = Object.values(selectedPresets).filter(p => p.slicer === 'BambuStudio');

    // Then button should be disabled
    const shouldEnableBundleButton = bambuPresets.length > 0;
    assert.strictEqual(shouldEnableBundleButton, false, 'Bundle button should be disabled');
  });
});

// ============================================
// TEST SUITE: Filename Generation
// ============================================

describe('Filename Generation', () => {
  
  test('Should generate correct bundle filename for single preset', () => {
    // Given a preset
    const preset = {
      material: 'Panchroma PLA Galaxy',
      filename: 'Panchroma PLA Galaxy @BBL X1.json'
    };

    // When generating bundle filename
    const bundleFilename = generateBundleFilename([preset]);

    // Then filename should end with .bbsflmt
    assert.ok(bundleFilename.endsWith('.bbsflmt'), 'Filename should have .bbsflmt extension');
    
    // And should contain preset name (sanitized with dashes) or 'bundle'
    const hasPresetName = bundleFilename.includes('Panchroma');
    const hasBundleWord = bundleFilename.includes('bundle');
    assert.ok(hasPresetName || hasBundleWord, 'Filename should be descriptive');
  });

  test('Should generate descriptive filename for batch bundle', () => {
    // Given multiple presets
    const presets = [
      { material: 'Panchroma PLA Galaxy' },
      { material: 'Polymaker PETG' }
    ];

    // When generating bundle filename
    const bundleFilename = generateBundleFilename(presets);

    // Then filename should have .bbsflmt extension
    assert.ok(bundleFilename.endsWith('.bbsflmt'), 'Should have .bbsflmt extension');
  });
});

// ============================================
// TEST SUITE: Vendor Extraction
// ============================================

describe('Vendor Extraction', () => {
  
  test('Should extract vendor from preset filename', () => {
    // Given preset data
    const preset = {
      filename: 'Panchroma PLA Galaxy @BBL X1.json',
      path: 'preset/Panchroma PLA Galaxy/BBL/X1/BambuStudio/Panchroma PLA Galaxy @BBL X1.json'
    };

    // When extracting vendor
    const vendor = extractVendorFromPreset(preset);

    // Then should return vendor name
    assert.strictEqual(typeof vendor, 'string', 'Vendor should be a string');
    assert.ok(vendor.length > 0, 'Vendor should not be empty');
  });
});

// ============================================
// PLACEHOLDER FUNCTIONS - Will be implemented
// ============================================

/**
 * Generate bundle_structure.json content
 * @param {Array} presets - Array of preset objects
 * @param {string} type - 'single' or 'batch'
 * @returns {Object} Bundle structure object
 */
function generateBundleStructure(presets, type) {
  if (!presets || presets.length === 0) {
    throw new Error('No presets provided');
  }

  // Use numeric timestamp format like BambuStudio (seconds since epoch)
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const isBatch = type === 'batch' || presets.length > 1;

  // Group presets by vendor
  const vendorMap = new Map();

  for (const preset of presets) {
    const vendor = extractVendorFromPreset(preset);

    if (!vendorMap.has(vendor)) {
      vendorMap.set(vendor, {
        // IMPORTANT: filament_path comes FIRST, vendor SECOND
        filament_path: [],
        vendor: vendor
      });
    }

    const vendorEntry = vendorMap.get(vendor);
    // Path format: {vendor}/{filename}
    vendorEntry.filament_path.push(`${vendor}/${preset.filename}`);
  }

  // Determine filament_name
  let filamentName;
  if (isBatch) {
    filamentName = 'Multiple Filaments';
  } else {
    filamentName = presets[0].material || 'Unknown Filament';
  }

  // Generate bundle_id in BambuStudio format: {user_id}_{filament_name}_{timestamp}
  // Using "0" as user_id since we're generating publicly
  const bundleId = `0_${filamentName}_${timestamp}`;

  // Build structure with CORRECT FIELD ORDER (bundle_id first, version LAST)
  const structure = {};
  structure.bundle_id = bundleId;
  structure.bundle_type = 'filament config bundle';
  structure.filament_name = filamentName;
  structure.filament_vendor = Array.from(vendorMap.values());
  structure.version = '02.05.00.56';  // BambuStudio version format, LAST field

  return structure;
}

/**
 * Generate filename for bundle download
 * @param {Array} presets - Array of preset objects
 * @returns {string} Bundle filename
 */
function generateBundleFilename(presets) {
  if (!presets || presets.length === 0) {
    return 'polymaker-bundle.bbsflmt';
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  
  if (presets.length === 1) {
    // Single preset: use material name
    const material = presets[0].material || 'bundle';
    const sanitized = material.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
    return `${sanitized}-${timestamp}.bbsflmt`;
  } else {
    // Multiple presets: use count
    return `polymaker-bundle-${presets.length}-${timestamp}.bbsflmt`;
  }
}

/**
 * Extract vendor name from preset
 * @param {Object} preset - Preset object
 * @returns {string} Vendor name
 */
function extractVendorFromPreset(preset) {
  // Use filament_vendor field if available
  if (preset.filament_vendor && Array.isArray(preset.filament_vendor) && preset.filament_vendor.length > 0) {
    return preset.filament_vendor[0];
  }
  
  // Extract vendor from filename: "Name @Vendor Model.json"
  const filename = preset.filename || '';
  const match = filename.match(/@([^\s]+)/);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: try to extract from path
  const path = preset.path || '';
  const pathParts = path.split('/');
  
  // Path format: preset/<Material>/<Brand>/<Model>/<Slicer>/<Preset>.json
  if (pathParts.length >= 4) {
    return pathParts[2]; // Brand is at index 2
  }
  
  return 'Unknown';
}
// ============================================
// TEST SUITE: Filename Generation from compatible_printers
// ============================================

describe('Filename Generation from compatible_printers', () => {
  
  test('Should generate one filename for single compatible_printer entry', () => {
    // Given a preset with a single compatible printer
    const preset = {
      material: 'Panchroma PLA Galaxy',
      compatible_printers: ['Bambu Lab X1 0.4 nozzle']
    };

    // When generating filenames from compatible_printers
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should generate exactly one filename
    assert.strictEqual(filenames.length, 1, 'Should generate one filename');
    
    // And filename should follow the format: {material} @{compatible_printer}.json
    assert.strictEqual(filenames[0], 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json', 
      'Filename should match expected format');
  });

  test('Should generate multiple filenames for multiple compatible_printers entries', () => {
    // Given a preset with multiple compatible printers
    const preset = {
      material: 'Panchroma PLA Galaxy',
      compatible_printers: [
        'Bambu Lab X1 0.4 nozzle',
        'Bambu Lab X1 Carbon 0.4 nozzle',
        'Bambu Lab P1S 0.4 nozzle'
      ]
    };

    // When generating filenames from compatible_printers
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should generate three filenames
    assert.strictEqual(filenames.length, 3, 'Should generate three filenames');
    
    // And each should follow the format
    assert.strictEqual(filenames[0], 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json');
    assert.strictEqual(filenames[1], 'Panchroma PLA Galaxy @Bambu Lab X1 Carbon 0.4 nozzle.json');
    assert.strictEqual(filenames[2], 'Panchroma PLA Galaxy @Bambu Lab P1S 0.4 nozzle.json');
  });

  test('Should preserve nozzle specification in filename', () => {
    // Given a preset with various nozzle specifications
    const preset = {
      material: 'PolyLite PETG',
      compatible_printers: [
        'Bambu Lab X1 0.4 nozzle',
        'Bambu Lab A1 0.6 nozzle',
        'Bambu Lab P1S 0.2 nozzle'
      ]
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then nozzle specification should be preserved
    assert.ok(filenames[0].includes('0.4 nozzle'), 'Should preserve 0.4 nozzle');
    assert.ok(filenames[1].includes('0.6 nozzle'), 'Should preserve 0.6 nozzle');
    assert.ok(filenames[2].includes('0.2 nozzle'), 'Should preserve 0.2 nozzle');
  });

  test('Should use "Bambu Lab" format (not "BBL") in filename', () => {
    // Given a preset with "Bambu Lab" brand in compatible_printers
    const preset = {
      material: 'Fiberon PA-CF',
      compatible_printers: ['Bambu Lab X1 Carbon 0.4 nozzle']
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should use "Bambu Lab" format
    assert.ok(filenames[0].includes('Bambu Lab'), 'Should use "Bambu Lab" format');
    assert.ok(!filenames[0].includes('BBL'), 'Should not use "BBL" abbreviation');
  });

  test('Should generate correct filename format: {material} @{compatible_printer}.json', () => {
    // Given a preset with various materials
    const testCases = [
      {
        material: 'Panchroma PLA Silk',
        compatible_printers: ['Bambu Lab X1 0.4 nozzle'],
        expected: 'Panchroma PLA Silk @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        material: 'PolyTerra PLA+',
        compatible_printers: ['Bambu Lab A1M 0.4 nozzle'],
        expected: 'PolyTerra PLA+ @Bambu Lab A1M 0.4 nozzle.json'
      },
      {
        material: 'Fiberon PETG-ESD',
        compatible_printers: ['Bambu Lab H2D 0.4 nozzle'],
        expected: 'Fiberon PETG-ESD @Bambu Lab H2D 0.4 nozzle.json'
      }
    ];

    // When generating filenames for each case
    testCases.forEach((testCase) => {
      const preset = {
        material: testCase.material,
        compatible_printers: testCase.compatible_printers
      };
      
      const filenames = generateFilenamesFromCompatiblePrinters(preset);
      
      // Then filename should match expected format
      assert.strictEqual(filenames[0], testCase.expected, 
        `Filename for ${testCase.material} should match expected format`);
    });
  });
});

// ============================================
// TEST SUITE: Edge cases for filename generation
// ============================================

describe('Edge cases for filename generation', () => {
  
  test('Should handle empty compatible_printers array', () => {
    // Given a preset with empty compatible_printers array
    const preset = {
      material: 'Panchroma PLA Galaxy',
      compatible_printers: []
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should return empty array
    assert.strictEqual(filenames.length, 0, 'Should return empty array for empty compatible_printers');
  });

  test('Should handle null compatible_printers', () => {
    // Given a preset with null compatible_printers
    const preset = {
      material: 'Panchroma PLA Galaxy',
      compatible_printers: null
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should return empty array
    assert.strictEqual(filenames.length, 0, 'Should return empty array for null compatible_printers');
  });

  test('Should handle undefined compatible_printers', () => {
    // Given a preset without compatible_printers field
    const preset = {
      material: 'Panchroma PLA Galaxy'
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should return empty array
    assert.strictEqual(filenames.length, 0, 'Should return empty array for undefined compatible_printers');
  });

  test('Should handle special characters in material names', () => {
    // Given a preset with special characters in material name
    const preset = {
      material: 'Panchroma PLA UV Shift',
      compatible_printers: ['Bambu Lab X1 0.4 nozzle']
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should preserve special characters in filename
    assert.strictEqual(filenames[0], 'Panchroma PLA UV Shift @Bambu Lab X1 0.4 nozzle.json',
      'Should preserve special characters like UV Shift');
  });

  test('Should handle very long material names', () => {
    // Given a preset with a very long material name
    const longMaterialName = 'PolyLite PLA Pro Metallic Carbon Fiber Reinforced High Temperature';
    const preset = {
      material: longMaterialName,
      compatible_printers: ['Bambu Lab X1 0.4 nozzle']
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should generate filename with full material name
    assert.ok(filenames[0].startsWith(longMaterialName + ' @'), 
      'Should handle very long material names');
  });

  test('Should handle single-character material names', () => {
    // Given a preset with minimal material name
    const preset = {
      material: 'A',
      compatible_printers: ['Bambu Lab X1 0.4 nozzle']
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should still generate valid filename
    assert.strictEqual(filenames[0], 'A @Bambu Lab X1 0.4 nozzle.json',
      'Should handle single-character material names');
  });

  test('Should handle printer names with special characters', () => {
    // Given a preset with special characters in printer name
    const preset = {
      material: 'Test PLA',
      compatible_printers: ['Bambu Lab X1 Carbon 0.4 nozzle']
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should preserve special characters in printer name
    assert.ok(filenames[0].includes('Carbon'), 'Should preserve Carbon in printer name');
  });

  test('Should handle missing material field gracefully', () => {
    // Given a preset without material field
    const preset = {
      compatible_printers: ['Bambu Lab X1 0.4 nozzle']
    };

    // When generating filenames
    const filenames = generateFilenamesFromCompatiblePrinters(preset);

    // Then should use empty string for material
    assert.strictEqual(filenames[0], ' @Bambu Lab X1 0.4 nozzle.json',
      'Should handle missing material field');
  });
});

// ============================================
// HELPER FUNCTION: Generate filenames from compatible_printers
// ============================================

/**
 * Generate filenames from compatible_printers field
 * Format: {material} @{compatible_printer}.json
 * @param {Object} preset - Preset object with material and compatible_printers
 * @returns {Array<string>} Array of filenames
 */
function generateFilenamesFromCompatiblePrinters(preset) {
  const filenames = [];
  
  // Handle null/undefined/empty compatible_printers
  if (!preset.compatible_printers || !Array.isArray(preset.compatible_printers)) {
    return filenames;
  }
  
  const material = preset.material || '';
  
  // Generate one filename per compatible_printer entry
  preset.compatible_printers.forEach((compatiblePrinter) => {
    const filename = material + ' @' + compatiblePrinter + '.json';
    filenames.push(filename);
  });
  
  return filenames;
}

// ============================================
// TEST SUITE: Duplicate Filename Detection
// ============================================

describe('Duplicate Filename Detection', () => {
  
  /**
   * Find duplicate filenames among preset mappings
   * @param {Array} filenameMappings - Array of { originalPreset, printerName, generatedFilename }
   * @returns {Array} Array of { filename, presets } objects for duplicates
   */
  function findDuplicateFilenames(filenameMappings) {
    // Handle null/undefined/empty input
    if (!filenameMappings || !Array.isArray(filenameMappings) || filenameMappings.length === 0) {
      return [];
    }

    // Group by generated filename
    const filenameGroups = new Map();

    for (const mapping of filenameMappings) {
      const filename = mapping.generatedFilename;
      
      if (!filenameGroups.has(filename)) {
        filenameGroups.set(filename, []);
      }
      
      filenameGroups.get(filename).push(mapping.originalPreset);
    }

    // Filter to only return duplicates (groups with more than one preset)
    const duplicates = [];
    
    for (const [filename, presets] of filenameGroups) {
      if (presets.length > 1) {
        duplicates.push({
          filename: filename,
          presets: presets
        });
      }
    }

    return duplicates;
  }

  // TEST 1: No duplicates scenario - unique filenames
  test('Should return empty array when all filenames are unique', () => {
    // Given multiple presets with unique generated filenames
    const filenameMappings = [
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', brand: 'BBL', model: 'X1' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Polymaker PETG', brand: 'BBL', model: 'X1' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Polymaker PETG @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'PolyLite PLA', brand: 'BBL', model: 'P1P' },
        printerName: 'Bambu Lab P1P 0.4 nozzle',
        generatedFilename: 'PolyLite PLA @Bambu Lab P1P 0.4 nozzle.json'
      }
    ];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return empty duplicates array
    assert.deepStrictEqual(duplicates, [], 'Should return empty array when no duplicates exist');
  });

  // TEST 2: Exact filename duplicates
  test('Should detect exact filename duplicates', () => {
    // Given two presets that generate the same filename
    const filenameMappings = [
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', brand: 'BBL', model: 'X1', slicer: 'BambuStudio' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', brand: 'BBL', model: 'X1', slicer: 'OrcaSlicer' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      }
    ];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return one duplicate entry with both presets
    assert.strictEqual(duplicates.length, 1, 'Should find exactly one duplicate');
    assert.strictEqual(duplicates[0].filename, 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json', 'Filename should match');
    assert.strictEqual(duplicates[0].presets.length, 2, 'Should contain both conflicting presets');
  });

  // TEST 3: Same printer, different materials (NOT duplicates)
  test('Should NOT flag different materials as duplicates', () => {
    // Given presets with same printer but different materials
    const filenameMappings = [
      {
        originalPreset: { material: 'Panchroma PLA', brand: 'BBL', model: 'X1' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Polymaker PETG', brand: 'BBL', model: 'X1' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Polymaker PETG @Bambu Lab X1 0.4 nozzle.json'
      }
    ];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should NOT be duplicates (different material names = different filenames)
    assert.strictEqual(duplicates.length, 0, 'Different materials should not be duplicates');
  });

  // TEST 4: Empty preset arrays
  test('Should handle empty array input', () => {
    // Given empty array
    const filenameMappings = [];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return empty array without errors
    assert.deepStrictEqual(duplicates, [], 'Should return empty array for empty input');
  });

  test('Should handle null input', () => {
    // Given null input
    const filenameMappings = null;

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return empty array without errors
    assert.deepStrictEqual(duplicates, [], 'Should return empty array for null input');
  });

  test('Should handle undefined input', () => {
    // Given undefined input
    const filenameMappings = undefined;

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return empty array without errors
    assert.deepStrictEqual(duplicates, [], 'Should return empty array for undefined input');
  });

  // TEST 5: Multiple duplicates across many presets
  test('Should detect multiple duplicates across many presets', () => {
    // Given 5 presets resulting in 3 duplicates
    const filenameMappings = [
      // Duplicate 1: Two presets with same filename
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', id: 1 },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', id: 2 },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      // Unique: Different material
      {
        originalPreset: { material: 'Polymaker PETG', id: 3 },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Polymaker PETG @Bambu Lab X1 0.4 nozzle.json'
      },
      // Duplicate 2: Two presets with same filename
      {
        originalPreset: { material: 'PolyLite PLA', id: 4 },
        printerName: 'Bambu Lab P1P 0.4 nozzle',
        generatedFilename: 'PolyLite PLA @Bambu Lab P1P 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'PolyLite PLA', id: 5 },
        printerName: 'Bambu Lab P1P 0.4 nozzle',
        generatedFilename: 'PolyLite PLA @Bambu Lab P1P 0.4 nozzle.json'
      },
      // Duplicate 3: Two presets with same filename
      {
        originalPreset: { material: 'Fiberon PA-CF', id: 6 },
        printerName: 'Bambu Lab H2D 0.4 nozzle',
        generatedFilename: 'Fiberon PA-CF @Bambu Lab H2D 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Fiberon PA-CF', id: 7 },
        printerName: 'Bambu Lab H2D 0.4 nozzle',
        generatedFilename: 'Fiberon PA-CF @Bambu Lab H2D 0.4 nozzle.json'
      }
    ];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return array with 3 duplicate entries
    assert.strictEqual(duplicates.length, 3, 'Should find exactly 3 duplicates');
    
    // Verify each duplicate has correct number of presets
    const presetCounts = duplicates.map(d => d.presets.length);
    assert.ok(presetCounts.every(count => count === 2), 'Each duplicate should have exactly 2 presets');
    
    // Verify the duplicate filenames
    const duplicateFilenames = duplicates.map(d => d.filename);
    assert.ok(duplicateFilenames.includes('Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'), 'Should include first duplicate');
    assert.ok(duplicateFilenames.includes('PolyLite PLA @Bambu Lab P1P 0.4 nozzle.json'), 'Should include second duplicate');
    assert.ok(duplicateFilenames.includes('Fiberon PA-CF @Bambu Lab H2D 0.4 nozzle.json'), 'Should include third duplicate');
  });

  // TEST 6: Complex duplicate scenario
  test('Should handle complex scenario with multiple materials, printers, and mixed duplicates', () => {
    // Given a complex mix of presets
    const filenameMappings = [
      // Bambu Lab X1 presets
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', brand: 'BBL', model: 'X1', id: 'x1-panchroma' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', brand: 'BBL', model: 'X1', id: 'x1-panchroma-dup' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'  // DUPLICATE
      },
      {
        originalPreset: { material: 'Polymaker PETG', brand: 'BBL', model: 'X1', id: 'x1-petg' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Polymaker PETG @Bambu Lab X1 0.4 nozzle.json'  // UNIQUE
      },
      // Bambu Lab P1P presets
      {
        originalPreset: { material: 'PolyLite PLA', brand: 'BBL', model: 'P1P', id: 'p1p-polylite' },
        printerName: 'Bambu Lab P1P 0.4 nozzle',
        generatedFilename: 'PolyLite PLA @Bambu Lab P1P 0.4 nozzle.json'  // UNIQUE
      },
      {
        originalPreset: { material: 'PolyTerra PLA', brand: 'BBL', model: 'P1P', id: 'p1p-polyterra' },
        printerName: 'Bambu Lab P1P 0.4 nozzle',
        generatedFilename: 'PolyTerra PLA @Bambu Lab P1P 0.4 nozzle.json'  // UNIQUE
      },
      // Bambu Lab A1 presets
      {
        originalPreset: { material: 'Panchroma PLA Silk', brand: 'BBL', model: 'A1', id: 'a1-silk' },
        printerName: 'Bambu Lab A1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Silk @Bambu Lab A1 0.4 nozzle.json'  // UNIQUE
      },
      {
        originalPreset: { material: 'Panchroma PLA Silk', brand: 'BBL', model: 'A1', id: 'a1-silk-dup' },
        printerName: 'Bambu Lab A1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Silk @Bambu Lab A1 0.4 nozzle.json'  // DUPLICATE
      },
      // Elegoo CC2 preset (unique)
      {
        originalPreset: { material: 'PolyLite PETG', brand: 'Elegoo', model: 'CC2', id: 'cc2-petg' },
        printerName: 'Elegoo CC2 0.4 nozzle',
        generatedFilename: 'PolyLite PETG @Elegoo CC2 0.4 nozzle.json'  // UNIQUE
      }
    ];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should correctly identify duplicates
    assert.strictEqual(duplicates.length, 2, 'Should find exactly 2 duplicates');
    
    // Verify first duplicate (X1)
    const x1Duplicate = duplicates.find(d => d.filename.includes('X1'));
    assert.ok(x1Duplicate, 'Should have X1 duplicate');
    assert.strictEqual(x1Duplicate.presets.length, 2, 'X1 duplicate should have 2 presets');
    const x1Ids = x1Duplicate.presets.map(p => p.id);
    assert.ok(x1Ids.includes('x1-panchroma'), 'Should include first X1 preset');
    assert.ok(x1Ids.includes('x1-panchroma-dup'), 'Should include duplicate X1 preset');
    
    // Verify second duplicate (A1)
    const a1Duplicate = duplicates.find(d => d.filename.includes('A1'));
    assert.ok(a1Duplicate, 'Should have A1 duplicate');
    assert.strictEqual(a1Duplicate.presets.length, 2, 'A1 duplicate should have 2 presets');
    const a1Ids = a1Duplicate.presets.map(p => p.id);
    assert.ok(a1Ids.includes('a1-silk'), 'Should include first A1 preset');
    assert.ok(a1Ids.includes('a1-silk-dup'), 'Should include duplicate A1 preset');
    
    // Verify unique presets are NOT in duplicates
    const duplicateFilenames = duplicates.map(d => d.filename);
    assert.ok(!duplicateFilenames.includes('Polymaker PETG @Bambu Lab X1 0.4 nozzle.json'), 'Unique X1 PETG should not be in duplicates');
    assert.ok(!duplicateFilenames.includes('PolyLite PLA @Bambu Lab P1P 0.4 nozzle.json'), 'Unique P1P PolyLite should not be in duplicates');
    assert.ok(!duplicateFilenames.includes('PolyTerra PLA @Bambu Lab P1P 0.4 nozzle.json'), 'Unique P1P PolyTerra should not be in duplicates');
    assert.ok(!duplicateFilenames.includes('PolyLite PETG @Elegoo CC2 0.4 nozzle.json'), 'Unique CC2 PETG should not be in duplicates');
  });

  // TEST 7: Single preset (edge case)
  test('Should return empty array for single preset', () => {
    // Given a single preset
    const filenameMappings = [
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', brand: 'BBL', model: 'X1' },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      }
    ];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return empty array
    assert.deepStrictEqual(duplicates, [], 'Should return empty array for single preset');
  });

  // TEST 8: All presets are duplicates
  test('Should handle all presets being duplicates', () => {
    // Given 4 presets all with the same filename
    const filenameMappings = [
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', id: 1 },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', id: 2 },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', id: 3 },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      },
      {
        originalPreset: { material: 'Panchroma PLA Galaxy', id: 4 },
        printerName: 'Bambu Lab X1 0.4 nozzle',
        generatedFilename: 'Panchroma PLA Galaxy @Bambu Lab X1 0.4 nozzle.json'
      }
    ];

    // When detecting duplicates
    const duplicates = findDuplicateFilenames(filenameMappings);

    // Then should return one duplicate entry with all 4 presets
    assert.strictEqual(duplicates.length, 1, 'Should find exactly one duplicate group');
    assert.strictEqual(duplicates[0].presets.length, 4, 'Duplicate should contain all 4 presets');
  });
});
