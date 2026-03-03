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