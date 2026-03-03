/**
 * TDD Tests for .bbsflmt Bundle Download Feature
 * Run in browser console or Node.js (with appropriate setup)
 */

// Test Suite
var BbsflmtTests = {
  tests: [],
  passed: 0,
  failed: 0,

  test: function(name, fn) {
    this.tests.push({ name: name, fn: fn });
  },

  run: function() {
    console.log('\n=== Running .bbsflmt Bundle Tests ===\n');
    this.passed = 0;
    this.failed = 0;

    for (var i = 0; i < this.tests.length; i++) {
      var t = this.tests[i];
      try {
        t.fn();
        console.log('✓ PASS: ' + t.name);
        this.passed++;
      } catch (e) {
        console.log('✗ FAIL: ' + t.name);
        console.log('  Error: ' + e.message);
        this.failed++;
      }
    }

    console.log('\n=== Results ===');
    console.log('Passed: ' + this.passed);
    console.log('Failed: ' + this.failed);
    console.log('Total: ' + this.tests.length);
    
    return this.failed === 0;
  },

  assert: function(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  },

  assertEquals: function(actual, expected, message) {
    if (actual !== expected) {
      throw new Error((message || 'Assertion failed') + ': expected ' + expected + ', got ' + actual);
    }
  }
};

// ============================================
// TEST 1: Bundle button visibility for BambuStudio
// ============================================
BbsflmtTests.test('Bundle button should be visible for BambuStudio presets', function() {
  // Given a BambuStudio preset
  var preset = {
    material: 'Panchroma PLA Galaxy',
    brand: 'BBL',
    model: 'X1',
    slicer: 'BambuStudio',
    path: 'preset/Panchroma PLA Galaxy/BBL/X1/BambuStudio/Panchroma PLA Galaxy @BBL X1.json',
    filename: 'Panchroma PLA Galaxy @BBL X1.json'
  };

  // When checking if bundle button should show
  var shouldShowBundle = preset.slicer === 'BambuStudio';

  // Then it should be true
  BbsflmtTests.assertEquals(shouldShowBundle, true, 'Bundle button should show for BambuStudio');
});

// ============================================
// TEST 2: Bundle button hidden for OrcaSlicer
// ============================================
BbsflmtTests.test('Bundle button should be hidden for OrcaSlicer presets', function() {
  // Given an OrcaSlicer preset
  var preset = {
    material: 'Panchroma PLA Galaxy',
    brand: 'BBL',
    model: 'X1',
    slicer: 'OrcaSlicer',
    path: 'preset/Panchroma PLA Galaxy/BBL/X1/OrcaSlicer/Panchroma PLA Galaxy @BBL X1.json',
    filename: 'Panchroma PLA Galaxy @BBL X1.json'
  };

  // When checking if bundle button should show
  var shouldShowBundle = preset.slicer === 'BambuStudio';

  // Then it should be false
  BbsflmtTests.assertEquals(shouldShowBundle, false, 'Bundle button should be hidden for OrcaSlicer');
});

// ============================================
// TEST 3: Bundle button hidden for ElegooSlicer
// ============================================
BbsflmtTests.test('Bundle button should be hidden for ElegooSlicer presets', function() {
  // Given an ElegooSlicer preset
  var preset = {
    material: 'Panchroma PLA Galaxy',
    brand: 'Elegoo',
    model: 'CC2',
    slicer: 'ElegooSlicer',
    path: 'preset/Panchroma PLA Galaxy/Elegoo/CC2/ElegooSlicer/Panchroma PLA Galaxy @Elegoo CC2.json',
    filename: 'Panchroma PLA Galaxy @Elegoo CC2.json'
  };

  // When checking if bundle button should show
  var shouldShowBundle = preset.slicer === 'BambuStudio';

  // Then it should be false
  BbsflmtTests.assertEquals(shouldShowBundle, false, 'Bundle button should be hidden for ElegooSlicer');
});

// ============================================
// TEST 4: Bundle structure generation for single preset
// ============================================
BbsflmtTests.test('Should generate correct bundle_structure.json for single preset', function() {
  // Given a preset
  var preset = {
    material: 'Panchroma PLA Galaxy',
    brand: 'BBL',
    model: 'X1',
    slicer: 'BambuStudio',
    path: 'preset/Panchroma PLA Galaxy/BBL/X1/BambuStudio/Panchroma PLA Galaxy @BBL X1.json',
    filename: 'Panchroma PLA Galaxy @BBL X1.json'
  };

  // When generating bundle structure
  var structure = generateBundleStructure([preset], 'single');

  // Then structure should have correct fields
  BbsflmtTests.assert(structure.version, 'Should have version');
  BbsflmtTests.assert(structure.bundle_id, 'Should have bundle_id');
  BbsflmtTests.assertEquals(structure.bundle_type, 'filament config bundle', 'Should have correct bundle_type');
  BbsflmtTests.assert(structure.filament_name, 'Should have filament_name');
  BbsflmtTests.assert(Array.isArray(structure.filament_vendor), 'filament_vendor should be an array');
  BbsflmtTests.assertEquals(structure.filament_vendor.length, 1, 'Should have one vendor entry');
  BbsflmtTests.assertEquals(structure.filament_vendor[0].vendor, 'Polymaker', 'Vendor should be Polymaker');
  BbsflmtTests.assert(Array.isArray(structure.filament_vendor[0].filament_path), 'filament_path should be an array');
});

// ============================================
// TEST 5: Batch bundle structure with multiple vendors
// ============================================
BbsflmtTests.test('Should group presets by vendor in batch bundle', function() {
  // Given multiple presets from different vendors
  var presets = [
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
  var structure = generateBundleStructure(presets, 'batch');

  // Then structure should group by vendor
  BbsflmtTests.assertEquals(structure.filament_vendor.length, 2, 'Should have two vendor entries');
  
  var vendors = structure.filament_vendor.map(function(v) { return v.vendor; });
  BbsflmtTests.assert(vendors.indexOf('Polymaker') !== -1, 'Should have Polymaker vendor');
  BbsflmtTests.assert(vendors.indexOf('Generic') !== -1, 'Should have Generic vendor');
});

// ============================================
// TEST 6: Bundle button state for batch download
// ============================================
BbsflmtTests.test('Bundle download button should only consider BambuStudio presets', function() {
  // Given a mix of selected presets
  var selectedPresets = {
    'preset1': { slicer: 'BambuStudio', filename: 'test1.json' },
    'preset2': { slicer: 'OrcaSlicer', filename: 'test2.json' },
    'preset3': { slicer: 'BambuStudio', filename: 'test3.json' },
    'preset4': { slicer: 'ElegooSlicer', filename: 'test4.json' }
  };

  // When filtering for BambuStudio presets
  var bambuPresets = [];
  for (var key in selectedPresets) {
    if (selectedPresets[key].slicer === 'BambuStudio') {
      bambuPresets.push(selectedPresets[key]);
    }
  }

  // Then only BambuStudio presets should be included
  BbsflmtTests.assertEquals(bambuPresets.length, 2, 'Should have 2 BambuStudio presets');
  
  // And button should be enabled if any BambuStudio presets exist
  var shouldEnableBundleButton = bambuPresets.length > 0;
  BbsflmtTests.assertEquals(shouldEnableBundleButton, true, 'Bundle button should be enabled');
});

// ============================================
// TEST 7: Bundle button disabled when no BambuStudio presets selected
// ============================================
BbsflmtTests.test('Bundle download button should be disabled when no BambuStudio presets selected', function() {
  // Given only non-BambuStudio presets selected
  var selectedPresets = {
    'preset1': { slicer: 'OrcaSlicer', filename: 'test1.json' },
    'preset2': { slicer: 'ElegooSlicer', filename: 'test2.json' }
  };

  // When filtering for BambuStudio presets
  var bambuPresets = [];
  for (var key in selectedPresets) {
    if (selectedPresets[key].slicer === 'BambuStudio') {
      bambuPresets.push(selectedPresets[key]);
    }
  }

  // Then button should be disabled
  var shouldEnableBundleButton = bambuPresets.length > 0;
  BbsflmtTests.assertEquals(shouldEnableBundleButton, false, 'Bundle button should be disabled');
});

// ============================================
// TEST 8: Bundle filename generation
// ============================================
BbsflmtTests.test('Should generate correct bundle filename for single preset', function() {
  // Given a preset
  var preset = {
    material: 'Panchroma PLA Galaxy',
    filename: 'Panchroma PLA Galaxy @BBL X1.json'
  };

  // When generating bundle filename
  var bundleFilename = generateBundleFilename([preset]);

  // Then filename should end with .bbsflmt
  BbsflmtTests.assert(bundleFilename.indexOf('.bbsflmt') !== -1, 'Filename should have .bbsflmt extension');
  
  // And should contain preset name
  BbsflmtTests.assert(bundleFilename.indexOf('Panchroma PLA Galaxy') !== -1 || 
                      bundleFilename.indexOf('bundle') !== -1, 
                      'Filename should be descriptive');
});

// ============================================
// TEST 9: Batch bundle filename generation
// ============================================
BbsflmtTests.test('Should generate descriptive filename for batch bundle', function() {
  // Given multiple presets
  var presets = [
    { material: 'Panchroma PLA Galaxy' },
    { material: 'Polymaker PETG' }
  ];

  // When generating bundle filename
  var bundleFilename = generateBundleFilename(presets);

  // Then filename should indicate it's a batch
  BbsflmtTests.assert(bundleFilename.indexOf('.bbsflmt') !== -1, 'Should have .bbsflmt extension');
});

// ============================================
// TEST 10: Vendor path extraction
// ============================================
BbsflmtTests.test('Should extract vendor from preset filename', function() {
  // Given preset data
  var preset = {
    filename: 'Panchroma PLA Galaxy @BBL X1.json',
    path: 'preset/Panchroma PLA Galaxy/BBL/X1/BambuStudio/Panchroma PLA Galaxy @BBL X1.json'
  };

  // When extracting vendor
  var vendor = extractVendorFromPreset(preset);

  // Then should return vendor name
  BbsflmtTests.assert(typeof vendor === 'string', 'Vendor should be a string');
  BbsflmtTests.assert(vendor.length > 0, 'Vendor should not be empty');
});

// ============================================
// PLACEHOLDER FUNCTIONS - Will be implemented
// ============================================

// These are placeholder functions that tests expect to exist
// They will be implemented in app.js

function generateBundleStructure(presets, type) {
  // Placeholder - will fail test
  throw new Error('Not implemented');
}

function generateBundleFilename(presets) {
  // Placeholder - will fail test
  throw new Error('Not implemented');
}

function extractVendorFromPreset(preset) {
  // Placeholder - will fail test
  throw new Error('Not implemented');
}

// ============================================
// RUN TESTS
// ============================================

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BbsflmtTests;
}

// Run tests if in browser console
if (typeof window !== 'undefined') {
  window.BbsflmtTests = BbsflmtTests;
  console.log('BbsflmtTests loaded. Run BbsflmtTests.run() to execute tests.');
}