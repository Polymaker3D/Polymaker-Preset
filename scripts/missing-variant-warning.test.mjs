import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mirrors collectMissingVariantWarnings() in app.js.
// Aggregates the currently-selected presets into one de-duplicated list of
// { material, model, variants } entries for presets that have missing variants.
function collectMissingVariantWarnings(selectedPresets) {
  var seen = {};
  var items = [];
  for (var key in selectedPresets) {
    if (!Object.prototype.hasOwnProperty.call(selectedPresets, key)) continue;
    var p = selectedPresets[key];
    var missing = p && p.missingExtruderVariants;
    if (!missing || !missing.length) continue;
    var dedupKey = (p.material || '') + '||' + (p.model || '') + '||' + missing.join(',');
    if (seen[dedupKey]) continue;
    seen[dedupKey] = true;
    items.push({ material: p.material || '', model: p.model || '', variants: missing.slice() });
  }
  return items;
}

describe('collectMissingVariantWarnings', () => {
  it('returns [] when nothing is selected', () => {
    assert.deepStrictEqual(collectMissingVariantWarnings({}), []);
  });

  it('returns [] when no selected preset has missing variants', () => {
    const sel = {
      a: { material: 'PolyLite PLA', model: 'X1', missingExtruderVariants: [] },
      b: { material: 'Polymaker PLA', model: 'A1' }
    };
    assert.deepStrictEqual(collectMissingVariantWarnings(sel), []);
  });

  it('collects affected presets with material, model and variant names', () => {
    const sel = {
      a: { material: 'PolyLite PLA', model: 'X2D', missingExtruderVariants: ['Direct Drive High Flow', 'Bowden Standard'] },
      b: { material: 'Polymaker PLA', model: 'A1', missingExtruderVariants: [] }
    };
    assert.deepStrictEqual(collectMissingVariantWarnings(sel), [
      { material: 'PolyLite PLA', model: 'X2D', variants: ['Direct Drive High Flow', 'Bowden Standard'] }
    ]);
  });

  it('de-duplicates identical material+model+variants entries', () => {
    const sel = {
      a: { material: 'PolyLite PLA', model: 'X2D', missingExtruderVariants: ['Bowden Standard'] },
      b: { material: 'PolyLite PLA', model: 'X2D', missingExtruderVariants: ['Bowden Standard'] }
    };
    assert.strictEqual(collectMissingVariantWarnings(sel).length, 1);
  });
});
