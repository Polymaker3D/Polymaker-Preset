import { describe, it } from 'node:test';
import assert from 'node:assert';

// Test the strict mode filter logic from app.js
// This mirrors the filtering logic used in the render() function

describe('Strict Mode Filter Logic', () => {
  // Sample preset data for testing
  const createPresets = () => [
    {
      material: 'Panchroma PLA',
      brand: 'BBL',
      model: 'X1',
      slicer: 'BambuStudio',
      path: 'preset/Panchroma PLA/BBL/X1/BambuStudio/test.json',
      filename: 'test.json',
      compatiblePrinters: []
    },
    {
      material: 'Panchroma PLA',
      brand: 'BBL',
      model: 'P1S',
      slicer: 'BambuStudio',
      path: 'preset/Panchroma PLA/BBL/P1S/BambuStudio/test.json',
      filename: 'test.json',
      compatiblePrinters: [
        { brand: 'BBL', model: 'X1' },
        { brand: 'BBL', model: 'P1P' }
      ]
    },
    {
      material: 'PolyTerra PLA',
      brand: 'Elegoo',
      model: 'Neptune 4',
      slicer: 'ElegooSlicer',
      path: 'preset/PolyTerra PLA/Elegoo/Neptune 4/ElegooSlicer/test.json',
      filename: 'test.json',
      compatiblePrinters: [
        { brand: 'BBL', model: 'A1' }
      ]
    },
    {
      material: 'Fiberon PA12-CF',
      brand: 'BBL',
      model: 'X1',
      slicer: 'OrcaSlicer',
      path: 'preset/Fiberon PA12-CF/BBL/X1/OrcaSlicer/test.json',
      filename: 'test.json',
      compatiblePrinters: []
    }
  ];

  // Filter function that mirrors the logic in app.js render()
  function filterPresets(presets, filterState) {
    return presets.filter(function (p) {
      const series = filterState.series;
      const brand = filterState.brand;
      const model = filterState.model;
      const slicer = filterState.slicer;
      const strict = filterState.strict;

      // Series filter (simplified for testing)
      if (series && !p.material.startsWith(series)) return false;

      // Brand filter
      if (brand) {
        let brandMatches = p.brand === brand;
        // In strict mode, only match exact brand, ignore compatiblePrinters
        if (!strict && !brandMatches && p.compatiblePrinters && p.compatiblePrinters.length > 0) {
          for (let i = 0; i < p.compatiblePrinters.length; i++) {
            if (p.compatiblePrinters[i].brand === brand) {
              brandMatches = true;
              break;
            }
          }
        }
        if (!brandMatches) return false;
      }

      // Model filter
      if (model) {
        let modelMatches = p.model === model;
        // In strict mode, only match exact model, ignore compatiblePrinters
        if (!strict && !modelMatches && p.compatiblePrinters && p.compatiblePrinters.length > 0) {
          for (let j = 0; j < p.compatiblePrinters.length; j++) {
            if (p.compatiblePrinters[j].model === model) {
              modelMatches = true;
              break;
            }
          }
        }
        if (!modelMatches) return false;
      }

      // Slicer filter
      if (slicer && p.slicer !== slicer) return false;

      return true;
    });
  }

  describe('Non-strict mode (strict=false)', () => {
    it('should show presets with compatible printers when filtering by brand', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: 'BBL',
        model: '',
        slicer: '',
        strict: false
      };

      const result = filterPresets(presets, filterState);
      
      // Should include: X1 (exact), P1S (exact), Fiberon (exact), and Neptune 4 (compatible with BBL)
      // All 4 presets match BBL either exactly or via compatiblePrinters
      assert.strictEqual(result.length, 4);
      assert.ok(result.some(p => p.material === 'Panchroma PLA' && p.model === 'X1'));
      assert.ok(result.some(p => p.material === 'Panchroma PLA' && p.model === 'P1S'));
      assert.ok(result.some(p => p.brand === 'Elegoo' && p.model === 'Neptune 4'));
      assert.ok(result.some(p => p.material === 'Fiberon PA12-CF'));
    });

    it('should show presets with compatible printers when filtering by model', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: '',
        model: 'X1',
        slicer: '',
        strict: false
      };

      const result = filterPresets(presets, filterState);
      
      // Should include: X1 presets (Panchroma + Fiberon) and P1S (compatible with X1)
      assert.strictEqual(result.length, 3);
      assert.ok(result.some(p => p.model === 'X1' && p.material === 'Panchroma PLA'));
      assert.ok(result.some(p => p.model === 'X1' && p.material === 'Fiberon PA12-CF'));
      assert.ok(result.some(p => p.model === 'P1S'));
    });

    it('should show presets with compatible printers when filtering by both brand and model', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: 'BBL',
        model: 'X1',
        slicer: '',
        strict: false
      };

      const result = filterPresets(presets, filterState);
      
      // Should include: X1 presets (exact match BBL+X1) and P1S (matches BBL exactly, compatible with X1)
      // Note: Neptune 4 matches BBL via compatiblePrinters but doesn't match X1
      assert.strictEqual(result.length, 3);
      assert.ok(result.some(p => p.material === 'Panchroma PLA' && p.model === 'X1'));
      assert.ok(result.some(p => p.material === 'Fiberon PA12-CF' && p.model === 'X1'));
      assert.ok(result.some(p => p.model === 'P1S'));
    });

    it('should show all presets when no filters are applied', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: '',
        model: '',
        slicer: '',
        strict: false
      };

      const result = filterPresets(presets, filterState);
      assert.strictEqual(result.length, 4);
    });
  });

  describe('Strict mode (strict=true)', () => {
    it('should only show exact brand matches, ignoring compatible printers', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: 'BBL',
        model: '',
        slicer: '',
        strict: true
      };

      const result = filterPresets(presets, filterState);
      
      // Should only include exact BBL matches: X1, P1S, Fiberon PA12-CF
      // Should NOT include Neptune 4 (Elegoo brand, only compatible with BBL)
      assert.strictEqual(result.length, 3);
      assert.ok(result.every(p => p.brand === 'BBL'));
    });

    it('should only show exact model matches, ignoring compatible printers', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: '',
        model: 'X1',
        slicer: '',
        strict: true
      };

      const result = filterPresets(presets, filterState);
      
      // Should only include exact X1 matches
      // Should NOT include P1S (only compatible with X1)
      assert.strictEqual(result.length, 2);
      assert.ok(result.every(p => p.model === 'X1'));
    });

    it('should only show exact brand and model matches when both are specified', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: 'BBL',
        model: 'X1',
        slicer: '',
        strict: true
      };

      const result = filterPresets(presets, filterState);
      
      // Should only include exact BBL X1 matches
      // Should NOT include P1S (compatible with X1 but not exact match)
      assert.strictEqual(result.length, 2);
      assert.ok(result.every(p => p.brand === 'BBL' && p.model === 'X1'));
    });

    it('should work correctly with series filter', () => {
      const presets = createPresets();
      const filterState = {
        series: 'Panchroma',
        brand: 'BBL',
        model: '',
        slicer: '',
        strict: true
      };

      const result = filterPresets(presets, filterState);
      
      // Should only show Panchroma PLA with exact BBL brand
      assert.strictEqual(result.length, 2);
      assert.ok(result.every(p => p.material.startsWith('Panchroma') && p.brand === 'BBL'));
    });

    it('should work correctly with slicer filter', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: 'BBL',
        model: '',
        slicer: 'BambuStudio',
        strict: true
      };

      const result = filterPresets(presets, filterState);
      
      // Should only show BambuStudio presets with exact BBL brand
      assert.strictEqual(result.length, 2);
      assert.ok(result.every(p => p.slicer === 'BambuStudio' && p.brand === 'BBL'));
    });

    it('should return empty array when no exact matches exist', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: 'Anycubic',
        model: '',
        slicer: '',
        strict: true
      };

      const result = filterPresets(presets, filterState);
      assert.strictEqual(result.length, 0);
    });

    it('should show all presets when no filters are applied, even in strict mode', () => {
      const presets = createPresets();
      const filterState = {
        series: '',
        brand: '',
        model: '',
        slicer: '',
        strict: true
      };

      const result = filterPresets(presets, filterState);
      assert.strictEqual(result.length, 4);
    });
  });

  describe('Edge cases', () => {
    it('should handle presets with empty compatiblePrinters array', () => {
      const presets = [
        {
          material: 'Test',
          brand: 'BBL',
          model: 'X1',
          slicer: 'BambuStudio',
          path: 'test.json',
          filename: 'test.json',
          compatiblePrinters: []
        }
      ];
      
      // Non-strict mode
      const resultNonStrict = filterPresets(presets, {
        brand: 'BBL', model: 'X1', series: '', slicer: '', strict: false
      });
      assert.strictEqual(resultNonStrict.length, 1);

      // Strict mode
      const resultStrict = filterPresets(presets, {
        brand: 'BBL', model: 'X1', series: '', slicer: '', strict: true
      });
      assert.strictEqual(resultStrict.length, 1);
    });

    it('should handle presets with undefined compatiblePrinters', () => {
      const presets = [
        {
          material: 'Test',
          brand: 'BBL',
          model: 'X1',
          slicer: 'BambuStudio',
          path: 'test.json',
          filename: 'test.json'
          // compatiblePrinters is undefined
        }
      ];
      
      // Should not throw error
      const result = filterPresets(presets, {
        brand: 'BBL', model: '', series: '', slicer: '', strict: false
      });
      assert.strictEqual(result.length, 1);
    });

    it('should handle compatible printers with missing brand or model fields', () => {
      const presets = [
        {
          material: 'Test',
          brand: 'BBL',
          model: 'X1',
          slicer: 'BambuStudio',
          path: 'test.json',
          filename: 'test.json',
          compatiblePrinters: [
            { brand: 'BBL' },  // Missing model
            { model: 'X1' }    // Missing brand
          ]
        }
      ];
      
      // Should not throw error and should match exact brand
      const result = filterPresets(presets, {
        brand: 'BBL', model: '', series: '', slicer: '', strict: false
      });
      assert.strictEqual(result.length, 1);
    });

    it('should handle multiple compatible printers correctly', () => {
      const presets = [
        {
          material: 'Test',
          brand: 'Elegoo',
          model: 'Generic',
          slicer: 'ElegooSlicer',
          path: 'test.json',
          filename: 'test.json',
          compatiblePrinters: [
            { brand: 'BBL', model: 'X1' },
            { brand: 'BBL', model: 'P1S' },
            { brand: 'BBL', model: 'A1' }
          ]
        }
      ];
      
      // Non-strict: should match any BBL model
      const resultNonStrict = filterPresets(presets, {
        brand: 'BBL', model: 'X1', series: '', slicer: '', strict: false
      });
      assert.strictEqual(resultNonStrict.length, 1);

      // Strict: should not match (exact brand is Elegoo)
      const resultStrict = filterPresets(presets, {
        brand: 'BBL', model: 'X1', series: '', slicer: '', strict: true
      });
      assert.strictEqual(resultStrict.length, 0);
    });
  });

  describe('Real-world scenarios', () => {
    it('should help users find printer-specific presets when strict mode is enabled', () => {
      // Simulates a user looking for presets specifically made for X1
      const presets = createPresets();
      
      // Without strict mode, they see compatible presets too
      const nonStrictResults = filterPresets(presets, {
        brand: 'BBL', model: 'X1', series: '', slicer: '', strict: false
      });
      // Panchroma X1 (exact), Fiberon X1 (exact), P1S (compatible with X1)
      assert.strictEqual(nonStrictResults.length, 3);

      // With strict mode, they only see presets made for X1
      const strictResults = filterPresets(presets, {
        brand: 'BBL', model: 'X1', series: '', slicer: '', strict: true
      });
      // Only exact BBL X1 matches: Panchroma PLA and Fiberon PA12-CF
      assert.strictEqual(strictResults.length, 2);
      assert.ok(strictResults.every(p => p.model === 'X1' && p.brand === 'BBL'));
    });

    it('should handle case where preset is compatible but not exact match for brand', () => {
      const presets = [
        {
          material: 'PolyLite PLA',
          brand: 'Elegoo',
          model: 'Neptune 4',
          slicer: 'ElegooSlicer',
          path: 'test.json',
          filename: 'test.json',
          compatiblePrinters: [
            { brand: 'BBL', model: 'A1' },
            { brand: 'BBL', model: 'X1' }
          ]
        }
      ];

      // Non-strict: should show when filtering for BBL
      const nonStrict = filterPresets(presets, {
        brand: 'BBL', model: '', series: '', slicer: '', strict: false
      });
      assert.strictEqual(nonStrict.length, 1);

      // Strict: should NOT show when filtering for BBL
      const strict = filterPresets(presets, {
        brand: 'BBL', model: '', series: '', slicer: '', strict: true
      });
      assert.strictEqual(strict.length, 0);
    });
  });
});
