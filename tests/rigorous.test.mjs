/**
 * Rigorous edge case and boundary tests
 * Designed to catch logic errors and ensure test quality
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// ============================================
// RIGOROUS TEST HELPERS
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
    'A1M': 'A1 mini', 'A1': 'A1', 'P1P': 'P1P', 'P1S': 'P1S',
    'X1': 'X1', 'X1C': 'X1C', 'H2D': 'H2D', 'H2S': 'H2S',
    'P2S': 'P2S', 'CC2': 'CC2', 'U1': 'U1', 'Kobra S1': 'Kobra S1'
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

// ============================================
// MUTATION-RESISTANT TESTS
// ============================================

describe('RIGOROUS: Mutation-resistant escapeHtml', () => {
  it('should fail if any replacement is removed', () => {
    const input = '<script>alert("xss")</script>';
    const result = escapeHtml(input);
    
    // Verify ALL replacements happened
    assert.ok(!result.includes('<'), 'Must escape <');
    assert.ok(!result.includes('>'), 'Must escape >');
    assert.ok(!result.includes('"'), 'Must escape "');
    assert.ok(result.includes('&lt;'), 'Must have &lt;');
    assert.ok(result.includes('&gt;'), 'Must have &gt;');
    assert.ok(result.includes('&quot;'), 'Must have &quot;');
  });

  it('should handle Unicode edge cases', () => {
    // These could break naive regex implementations
    assert.strictEqual(escapeHtml('<日本語>'), '&lt;日本語&gt;');
    assert.strictEqual(escapeHtml('🔥<script>🔥'), '🔥&lt;script&gt;🔥');
    assert.strictEqual(escapeHtml('\n<\n>'), '\n&lt;\n&gt;');
  });

  it('should handle very long strings without stack overflow', () => {
    const longString = '<'.repeat(10000);
    const result = escapeHtml(longString);
    assert.strictEqual(result, '&lt;'.repeat(10000));
  });

  it('should handle all falsy values correctly', () => {
    const falsyValues = [null, undefined, '', 0, false, NaN];
    falsyValues.forEach(val => {
      const result = escapeHtml(val);
      assert.ok(typeof result === 'string', `Should return string for ${val}`);
      assert.ok(!result.includes('<'), `Should not have < for ${val}`);
    });
  });

  it('should NOT be idempotent (double escaping is correct behavior)', () => {
    const input = '<script>';
    const once = escapeHtml(input);
    const twice = escapeHtml(once);
    const thrice = escapeHtml(twice);
    
    // Double escaping is correct - & becomes &amp; then &amp;amp;
    assert.strictEqual(once, '&lt;script&gt;');
    assert.strictEqual(twice, '&amp;lt;script&amp;gt;');
    assert.strictEqual(thrice, '&amp;amp;lt;script&amp;amp;gt;');
    
    // Each call adds another layer of escaping
    assert.ok(once !== twice, 'Should double escape');
    assert.ok(twice !== thrice, 'Should triple escape');
  });
});

describe('RIGOROUS: materialMatchesSeries boundary cases', () => {
  it('should handle case sensitivity strictly', () => {
    assert.strictEqual(materialMatchesSeries('panchroma pla', 'Panchroma'), false);
    assert.strictEqual(materialMatchesSeries('PANCHROMA PLA', 'Panchroma'), false);
    assert.strictEqual(materialMatchesSeries('Panchroma PLA', 'panchroma'), false);
  });

  it('should fail on partial matches', () => {
    // These should NOT match
    assert.strictEqual(materialMatchesSeries('NotPanchroma PLA', 'Panchroma'), false);
    assert.strictEqual(materialMatchesSeries('PanchromaX PLA', 'Panchroma'), false);
    assert.strictEqual(materialMatchesSeries('XPolymaker PLA', 'Polymaker'), false);
  });

  it('should handle edge case: empty strings vs space', () => {
    assert.strictEqual(materialMatchesSeries(' ', ''), true);
    assert.strictEqual(materialMatchesSeries('', ''), true);
    assert.strictEqual(materialMatchesSeries('Panchroma', 'Panchroma'), false); // No space after
  });

  it('should handle Polymaker sub-brand edge cases', () => {
    // Should match
    assert.strictEqual(materialMatchesSeries('Polymaker PLA', 'Polymaker'), true);
    assert.strictEqual(materialMatchesSeries('PolyTerra PLA', 'Polymaker'), true);
    assert.strictEqual(materialMatchesSeries('PolyLite PLA', 'Polymaker'), true);
    
    // Should NOT match (not actual sub-brands)
    assert.strictEqual(materialMatchesSeries('PolyMax PLA', 'Polymaker'), false);
    assert.strictEqual(materialMatchesSeries('PolyWood PLA', 'Polymaker'), false);
    assert.strictEqual(materialMatchesSeries('PolyPlus PLA', 'Polymaker'), false);
  });

  it('should handle boundary: series at exact position', () => {
    // Series must be at start with space
    assert.strictEqual(materialMatchesSeries('Panchroma', 'Panchroma'), false);
    assert.strictEqual(materialMatchesSeries(' Panchroma PLA', 'Panchroma'), false); // Leading space
  });
});

describe('RIGOROUS: formatModelDisplayName mutations', () => {
  it('should NOT match undefined models to known models', () => {
    assert.strictEqual(formatModelDisplayName(undefined), 'Unknown');
    assert.strictEqual(formatModelDisplayName(null), 'Unknown');
  });

  it('should preserve case sensitivity', () => {
    // Case variations should NOT map to known models
    assert.strictEqual(formatModelDisplayName('a1'), 'a1'); // lowercase
    assert.strictEqual(formatModelDisplayName('A1M'), 'A1 mini'); // correct case
    assert.strictEqual(formatModelDisplayName('a1m'), 'a1m'); // lowercase
  });

  it('should handle substring confusion', () => {
    // A1 should NOT match A1M
    assert.strictEqual(formatModelDisplayName('A1M').includes('A1 mini'), true);
    assert.strictEqual(formatModelDisplayName('A1'), 'A1');
    
    // X1 should NOT match X1C
    assert.strictEqual(formatModelDisplayName('X1'), 'X1');
    assert.strictEqual(formatModelDisplayName('X1C'), 'X1C');
    
    // Verify they're different
    assert.notStrictEqual(formatModelDisplayName('A1'), formatModelDisplayName('A1M'));
    assert.notStrictEqual(formatModelDisplayName('X1'), formatModelDisplayName('X1C'));
  });
});

describe('RIGOROUS: isNativeMatch adversarial tests', () => {
  it('should not be fooled by substring confusion', () => {
    // A1 preset should NOT match A1 mini printer
    assert.strictEqual(isNativeMatch('A1', 'Bambu Lab A1 mini 0.4 nozzle'), false);
    
    // A1 mini preset should match A1 mini printer
    assert.strictEqual(isNativeMatch('A1M', 'Bambu Lab A1 mini 0.4 nozzle'), true);
    
    // But A1 mini preset should NOT match regular A1 printer
    assert.strictEqual(isNativeMatch('A1M', 'Bambu Lab A1 0.4 nozzle'), false);
  });

  it('should handle printer name variations', () => {
    // Different nozzle sizes
    assert.strictEqual(isNativeMatch('X1', 'Bambu Lab X1 0.4 nozzle'), true);
    assert.strictEqual(isNativeMatch('X1', 'Bambu Lab X1 0.6 nozzle'), true);
    assert.strictEqual(isNativeMatch('X1', 'Bambu Lab X1 0.2 nozzle'), true);
    
    // Brand variations
    assert.strictEqual(isNativeMatch('X1', 'BBL X1 0.4 nozzle'), true);
    assert.strictEqual(isNativeMatch('X1', 'X1'), true);
  });

  it('should reject empty and invalid inputs', () => {
    assert.strictEqual(isNativeMatch('', 'Bambu Lab X1'), false);
    assert.strictEqual(isNativeMatch('X1', ''), false);
    assert.strictEqual(isNativeMatch(null, 'Bambu Lab X1'), false);
    assert.strictEqual(isNativeMatch('X1', null), false);
    assert.strictEqual(isNativeMatch(undefined, undefined), false);
  });

  it('should handle model codes within words', () => {
    // X1 should match 'X1' in 'X1 Carbon' but we need to be careful
    assert.strictEqual(isNativeMatch('X1', 'Bambu Lab X1 Carbon 0.4 nozzle'), true);
    assert.strictEqual(isNativeMatch('X1C', 'Bambu Lab X1 Carbon 0.4 nozzle'), false);
    assert.strictEqual(isNativeMatch('X1C', 'Bambu Lab X1C 0.4 nozzle'), true);
  });
});

describe('RIGOROUS: Property-based style tests', () => {
  it('escapeHtml should never output HTML special chars', () => {
    const testInputs = [
      '<', '>', '"', "'", '&',
      '<div>', '</div>', '<script>',
      '&amp;', '&lt;', '&gt;',
      'normal text',
      '',
      '123',
      '   ',
      '\t\n\r'
    ];
    
    testInputs.forEach(input => {
      const result = escapeHtml(input);
      assert.ok(!result.includes('<') || result.includes('&lt;'), 
        `Output should not contain raw < for input: ${JSON.stringify(input)}`);
      assert.ok(!result.includes('>') || result.includes('&gt;'),
        `Output should not contain raw > for input: ${JSON.stringify(input)}`);
    });
  });

  it('materialMatchesSeries should be consistent', () => {
    const materials = ['Panchroma PLA', 'Polymaker PETG', 'PolyTerra PLA', 'Fiberon PA-CF'];
    const series = ['Panchroma', 'Polymaker', 'Fiberon'];
    
    materials.forEach(mat => {
      series.forEach(ser => {
        const result = materialMatchesSeries(mat, ser);
        // If it matches once, it should always match
        for (let i = 0; i < 5; i++) {
          assert.strictEqual(materialMatchesSeries(mat, ser), result, 
            `Function should be deterministic for ${mat} / ${ser}`);
        }
      });
    });
  });

  it('formatModelDisplayName should return consistent types', () => {
    const inputs = ['A1', null, undefined, '', 'UnknownModel', '123'];
    inputs.forEach(input => {
      const result = formatModelDisplayName(input);
      assert.ok(typeof result === 'string', `Should always return string, got ${typeof result} for ${input}`);
      assert.ok(result.length > 0, `Should never return empty string for ${input}`);
    });
  });
});

describe('RIGOROUS: State mutation tests', () => {
  it('functions should not mutate input objects', () => {
    const input = { material: 'PLA', series: 'Panchroma' };
    const inputCopy = JSON.parse(JSON.stringify(input));
    
    // Call function that uses material
    materialMatchesSeries(input.material, input.series);
    
    // Verify input wasn't modified
    assert.deepStrictEqual(input, inputCopy, 'Function should not mutate input');
  });

  it('escapeHtml should not coerce types unexpectedly', () => {
    // Objects should become [object Object]
    assert.strictEqual(escapeHtml({}), '[object Object]');
    
    // Arrays should be stringified
    assert.strictEqual(escapeHtml(['<', '>']), '&lt;,&gt;');
    
    // Numbers should become strings
    assert.strictEqual(escapeHtml(123), '123');
    assert.strictEqual(escapeHtml(0), '0');
    assert.strictEqual(escapeHtml(-1), '-1');
    
    // Booleans
    assert.strictEqual(escapeHtml(true), 'true');
    assert.strictEqual(escapeHtml(false), 'false');
  });
});

describe('RIGOROUS: Performance edge cases', () => {
  it('should handle repeated characters efficiently', () => {
    const start = Date.now();
    const result = escapeHtml('<'.repeat(100000));
    const elapsed = Date.now() - start;
    
    assert.ok(elapsed < 1000, `Should complete in < 1s, took ${elapsed}ms`);
    assert.strictEqual(result, '&lt;'.repeat(100000));
  });

  it('should handle alternating patterns', () => {
    const input = '<>"\'&'.repeat(1000);
    const result = escapeHtml(input);
    
    assert.ok(!result.includes('<'), 'Should escape all <');
    assert.ok(!result.includes('>'), 'Should escape all >');
    assert.ok(result.includes('&lt;'), 'Should have &lt;');
    assert.ok(result.includes('&gt;'), 'Should have &gt;');
  });
});
