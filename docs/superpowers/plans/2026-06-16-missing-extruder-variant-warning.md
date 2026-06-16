# Missing Extruder-Variant Download Warning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Warn users (inline badge + acknowledge-only modal at download) when selected Bambu presets have nozzle/extruder variants with no tuned values (`nozzle_temperature` column is `"nil"`).

**Architecture:** Detection runs at build time in `scripts/generate-index-json.mjs`, recording a `missingExtruderVariants` string array per affected preset into `index.json`. The front end (`app.js`) reads that field: it renders a warning badge on affected preset rows, carries the field into the per-preset selection payload, and shows a single aggregated modal at the top of the two bulk download functions before the download proceeds.

**Tech Stack:** Vanilla ES modules (Node `node:test` for tests), plain browser JS (`app.js`), `i18n.js` translation map, static HTML/CSS.

**Scope note:** Per the approved spec, the modal hooks only the two *bulk* download paths (`downloadSelectedPresets`, `downloadSelectedBundle`). Per-row single-file download buttons are intentionally NOT modal-gated — the inline badge already sits on each affected row. This is a deliberate non-goal, not an omission.

---

## File Structure

- `scripts/generate-index-json.mjs` — add `extractMissingExtruderVariants()` pure helper + wire its result into each preset object.
- `scripts/generate-index-json.test.mjs` — unit tests for the detection rule (inline copy of the helper, matching the file's existing convention).
- `scripts/missing-variant-warning.test.mjs` — NEW: unit tests for the `collectMissingVariantWarnings()` selection-aggregation helper (mirrors the logic in `app.js`, matching the `app-filter.test.mjs` convention).
- `index.json` — regenerated; affected presets gain `missingExtruderVariants`.
- `index.html` — add the `missing-variant-modal` dialog markup.
- `i18n.js` — add `en` + `zh` keys for the modal and badge.
- `style.css` — add badge + modal-list styling.
- `app.js` — carry the field into the selection payload, render badges, add the aggregation helper + modal show/init functions, and guard the two bulk download functions.

---

## Task 1: Build-time detection helper

**Files:**
- Modify: `scripts/generate-index-json.mjs` (add helper near `extractCompatiblePrinters`, ~line 84; wire into the preset loop ~line 154-179)
- Test: `scripts/generate-index-json.test.mjs`

- [ ] **Step 1: Write the failing tests**

Add this `describe` block inside `scripts/generate-index-json.test.mjs`, immediately before the final closing `});` of the top-level `describe('Preset Files', ...)` block:

```javascript
  describe('extractMissingExtruderVariants function', () => {
    // Mirrors the helper in generate-index-json.mjs
    function extractMissingExtruderVariants(presetData) {
      if (!presetData) return [];
      const variants = presetData.filament_extruder_variant;
      const temps = presetData.nozzle_temperature;
      if (!Array.isArray(variants) || variants.length <= 1) return [];
      if (!Array.isArray(temps) || temps.length !== variants.length) return [];
      const missing = [];
      for (let i = 0; i < variants.length; i++) {
        if (String(temps[i]).toLowerCase() === 'nil') {
          missing.push(variants[i]);
        }
      }
      return missing;
    }

    it('returns the names of variants whose nozzle_temperature is nil', () => {
      const data = {
        filament_extruder_variant: [
          'Direct Drive Standard', 'Direct Drive High Flow', 'Bowden Standard', 'Bowden High Flow'
        ],
        nozzle_temperature: ['280', 'nil', 'nil', 'nil']
      };
      assert.deepStrictEqual(
        extractMissingExtruderVariants(data),
        ['Direct Drive High Flow', 'Bowden Standard', 'Bowden High Flow']
      );
    });

    it('returns [] when every column has a value', () => {
      const data = {
        filament_extruder_variant: ['Direct Drive Standard', 'Direct Drive High Flow'],
        nozzle_temperature: ['280', '290']
      };
      assert.deepStrictEqual(extractMissingExtruderVariants(data), []);
    });

    it('returns [] for single-variant presets', () => {
      const data = {
        filament_extruder_variant: ['Direct Drive Standard'],
        nozzle_temperature: ['280']
      };
      assert.deepStrictEqual(extractMissingExtruderVariants(data), []);
    });

    it('returns [] when filament_extruder_variant is missing', () => {
      assert.deepStrictEqual(extractMissingExtruderVariants({ nozzle_temperature: ['280', 'nil'] }), []);
    });

    it('returns [] when array lengths mismatch (skips detection safely)', () => {
      const data = {
        filament_extruder_variant: ['Direct Drive Standard', 'Direct Drive High Flow'],
        nozzle_temperature: ['280']
      };
      assert.deepStrictEqual(extractMissingExtruderVariants(data), []);
    });

    it('returns [] for null/undefined preset data', () => {
      assert.deepStrictEqual(extractMissingExtruderVariants(null), []);
      assert.deepStrictEqual(extractMissingExtruderVariants(undefined), []);
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/generate-index-json.test.mjs`
Expected: the new `extractMissingExtruderVariants` tests are present and PASS on their own (they test an inline copy). This step confirms the *intended behavior* of the helper. Then proceed to put the real helper in the source module.

> Note: because this file's convention is to test inline copies (like `cmp`, `normalizePosix`), these tests pass immediately. They lock the spec of the helper you add to the source in Step 3. If you prefer a true red phase, temporarily change one `assert` to a wrong value, watch it fail, then revert.

- [ ] **Step 3: Add the helper to the source module**

In `scripts/generate-index-json.mjs`, directly after the `extractCompatiblePrinters` function (it ends at the line with `return printers;` then `}` around line 105), add:

```javascript
/**
 * Find extruder/nozzle variants that have no tuned values.
 * A preset is multi-variant when filament_extruder_variant has length > 1.
 * The authority field is nozzle_temperature, aligned index-for-index.
 * Any column equal to the string "nil" means that variant was not authored.
 * @param {any} presetData
 * @returns {string[]} names of missing variants (empty when none / not applicable)
 */
function extractMissingExtruderVariants(presetData) {
    if (!presetData) return [];
    const variants = presetData.filament_extruder_variant;
    const temps = presetData.nozzle_temperature;
    if (!Array.isArray(variants) || variants.length <= 1) return [];
    if (!Array.isArray(temps) || temps.length !== variants.length) return [];
    const missing = [];
    for (let i = 0; i < variants.length; i++) {
        if (String(temps[i]).toLowerCase() === 'nil') {
            missing.push(variants[i]);
        }
    }
    return missing;
}
```

- [ ] **Step 4: Wire the helper into the preset loop**

In `scripts/generate-index-json.mjs`, find this block (around lines 153-163):

```javascript
    // Read the preset JSON content to extract compatible_printers
    let compatiblePrinters = [];
    if (extension === '.json') {
      try {
          const fileContent = await fs.readFile(absFile, 'utf8');
          const presetData = JSON.parse(fileContent);
          compatiblePrinters = extractCompatiblePrinters(presetData);
      } catch (e) {
          console.warn(`Failed to parse ${relFromPreset}: ${e.message}`);
      }
    }
```

Replace it with:

```javascript
    // Read the preset JSON content to extract compatible_printers
    let compatiblePrinters = [];
    let missingExtruderVariants = [];
    if (extension === '.json') {
      try {
          const fileContent = await fs.readFile(absFile, 'utf8');
          const presetData = JSON.parse(fileContent);
          compatiblePrinters = extractCompatiblePrinters(presetData);
          missingExtruderVariants = extractMissingExtruderVariants(presetData);
      } catch (e) {
          console.warn(`Failed to parse ${relFromPreset}: ${e.message}`);
      }
    }
```

Then find the `presets.push({ ... })` block (around lines 170-179):

```javascript
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
```

Replace it with (conditionally include the field only when non-empty, so unaffected presets stay byte-identical):

```javascript
    presets.push({
      material: material,
      brand: printerBrand,
      model: printerModel,
      slicer,
      path: relPath,
      filename,
      updatedAt,
      compatiblePrinters: compatiblePrinters,
      ...(missingExtruderVariants.length ? { missingExtruderVariants } : {})
    });
```

- [ ] **Step 5: Run the build tests to verify they pass**

Run: `node --test scripts/generate-index-json.test.mjs`
Expected: PASS, all tests including the new block.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-index-json.mjs scripts/generate-index-json.test.mjs
git commit -m "feat(build): detect missing extruder variants for index.json

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 2: Regenerate index.json

**Files:**
- Modify: `index.json` (generated)

- [ ] **Step 1: Regenerate**

Run: `npm run generate-index`
Expected: console prints `Generated index.json with <N> presets.`

- [ ] **Step 2: Verify the field landed correctly**

Run:
```bash
node -e "const d=require('./index.json'); const a=d.presets.filter(p=>p.missingExtruderVariants&&p.missingExtruderVariants.length); console.log('affected presets:', a.length); console.log(JSON.stringify(a[0],null,1));"
```
Expected: `affected presets:` is a positive number (in the current data, on the order of dozens), and the sample shows a `missingExtruderVariants` string array.

- [ ] **Step 3: Confirm full test suite still green**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add index.json
git commit -m "chore: regenerate index.json with missingExtruderVariants

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 3: Selection-aggregation helper + tests

**Files:**
- Create: `scripts/missing-variant-warning.test.mjs`
- Modify: `app.js` (add `collectMissingVariantWarnings` near the other download helpers, e.g. just above `function downloadSelectedPresets()` ~line 921)

- [ ] **Step 1: Write the failing test file**

Create `scripts/missing-variant-warning.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run the test to verify the spec passes for the inline copy**

Run: `node --test scripts/missing-variant-warning.test.mjs`
Expected: PASS (inline copy). This locks the contract for the `app.js` function added next.

- [ ] **Step 3: Add the function to `app.js`**

In `app.js`, immediately above `function downloadSelectedPresets() {` (around line 921), add:

```javascript
      // Aggregate the selected presets into a de-duplicated list of
      // { material, model, variants } for those missing extruder variants.
      function collectMissingVariantWarnings(presets) {
        var seen = {};
        var items = [];
        for (var key in presets) {
          if (!Object.prototype.hasOwnProperty.call(presets, key)) continue;
          var p = presets[key];
          var missing = p && p.missingExtruderVariants;
          if (!missing || !missing.length) continue;
          var dedupKey = (p.material || '') + '||' + (p.model || '') + '||' + missing.join(',');
          if (seen[dedupKey]) continue;
          seen[dedupKey] = true;
          items.push({ material: p.material || '', model: p.model || '', variants: missing.slice() });
        }
        return items;
      }
```

- [ ] **Step 4: Run the test suite**

Run: `npm test`
Expected: PASS (new test file included via `scripts/*.test.mjs`).

- [ ] **Step 5: Commit**

```bash
git add app.js scripts/missing-variant-warning.test.mjs
git commit -m "feat(app): add collectMissingVariantWarnings selection aggregator

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 4: Modal markup, i18n keys, and styles

**Files:**
- Modify: `index.html` (add modal after the `bambu-restart-modal` block, ~line 9146)
- Modify: `i18n.js` (add keys in the `en` block ~line 75 and the `zh` block ~line 215)
- Modify: `style.css`

- [ ] **Step 1: Add the modal markup**

In `index.html`, immediately after the closing `</div>` of `#bambu-restart-modal` (the line after `9146`), insert:

```html
  <div id="missing-variant-modal" class="modal" role="dialog" aria-labelledby="missing-variant-modal-title" aria-hidden="true">
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="missing-variant-modal-title" class="modal-title" data-i18n="modal.missingvariant.title">⚠️ Some Nozzle Options Have No Preset</h2>
        <button class="modal-close" type="button" aria-label="Close modal" id="missing-variant-modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="warning-modal-body">
          <p class="warning-modal-text" data-i18n="modal.missingvariant.intro">Some selected presets don't include every nozzle/extruder option for this printer. We didn't make presets for these variants:</p>
          <ul class="missing-variant-list" id="missing-variant-list"></ul>
          <p class="warning-modal-text" data-i18n="modal.missingvariant.note">You can still download — those nozzle options just won't have tuned values.</p>
          <div class="warning-modal-actions">
            <button type="button" class="btn-primary" id="missing-variant-ack" data-i18n="modal.missingvariant.ack">Download anyway</button>
          </div>
        </div>
      </div>
    </div>
  </div>
```

- [ ] **Step 2: Add English i18n keys**

In `i18n.js`, in the `en` block right after `'modal.restart.confirm': 'Continue Download',` (line 75), add:

```javascript
      'modal.missingvariant.title': '⚠️ Some Nozzle Options Have No Preset',
      'modal.missingvariant.intro': "Some selected presets don't include every nozzle/extruder option for this printer. We didn't make presets for these variants:",
      'modal.missingvariant.note': "You can still download — those nozzle options just won't have tuned values.",
      'modal.missingvariant.ack': 'Download anyway',
      'badge.missingvariant.title': 'No preset for these nozzle options:',
```

- [ ] **Step 3: Add Chinese i18n keys**

In `i18n.js`, in the `zh` block right after `'modal.restart.confirm': ...` (around line 216; mirror the exact placement used in `en`), add:

```javascript
      'modal.missingvariant.title': '⚠️ 部分喷嘴选项没有预设',
      'modal.missingvariant.intro': '所选的部分预设并未覆盖该打印机的全部喷嘴/挤出机选项。以下变体我们没有制作预设：',
      'modal.missingvariant.note': '你仍然可以下载 —— 这些喷嘴选项只是没有调校好的数值。',
      'modal.missingvariant.ack': '仍然下载',
      'badge.missingvariant.title': '以下喷嘴选项没有预设：',
```

- [ ] **Step 4: Add styles**

Append to `style.css`:

```css
/* Missing extruder-variant warning */
.variant-warning-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 6px;
  border-radius: 50%;
  background: #e0a800;
  color: #fff;
  cursor: help;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  vertical-align: middle;
}

.missing-variant-list {
  margin: 12px 0;
  padding-left: 20px;
  list-style: disc;
}

.missing-variant-list li {
  margin-bottom: 6px;
  line-height: 1.4;
}
```

- [ ] **Step 5: Sanity-check the page still loads**

Run: `node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');if(!h.includes('missing-variant-modal'))throw new Error('modal markup missing');console.log('ok');"`
Expected: `ok`.

- [ ] **Step 6: Commit**

```bash
git add index.html i18n.js style.css
git commit -m "feat(ui): add missing-variant warning modal markup, i18n, styles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 5: Wire the modal + guard the bulk download functions

**Files:**
- Modify: `app.js` (modal state/show/init near `bambuRestartModalState` ~line 1901-1969; init call ~line 2245; guards in `downloadSelectedPresets` ~line 921 and `downloadSelectedBundle` ~line 1043)

- [ ] **Step 1: Add modal state, show, and init functions**

In `app.js`, immediately after the `showBambuRestartWarning` function (it ends around line 1969), add:

```javascript
var missingVariantModalState = {
  onAck: null
};

function showMissingVariantWarning(items, onAck) {
  var modal = document.getElementById('missing-variant-modal');
  if (!modal || !items || !items.length) {
    if (onAck) onAck();
    return;
  }

  var listEl = document.getElementById('missing-variant-list');
  if (listEl) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '<li><strong>' + escapeHtml(items[i].material) + ' — ' + escapeHtml(items[i].model) +
        '</strong>: ' + escapeHtml(items[i].variants.join(', ')) + '</li>';
    }
    listEl.innerHTML = html;
  }

  missingVariantModalState.onAck = onAck;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function initMissingVariantModal() {
  var modal = document.getElementById('missing-variant-modal');
  if (!modal) return;

  var closeBtn = document.getElementById('missing-variant-modal-close');
  var ackBtn = document.getElementById('missing-variant-ack');
  var overlay = modal.querySelector('.modal-overlay');

  // Acknowledge-only: every dismissal path proceeds with the download.
  function ack() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    var cb = missingVariantModalState.onAck;
    missingVariantModalState.onAck = null;
    if (cb) cb();
  }

  if (closeBtn) closeBtn.addEventListener('click', ack);
  if (ackBtn) ackBtn.addEventListener('click', ack);
  if (overlay) overlay.addEventListener('click', ack);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      ack();
    }
  });
}
```

- [ ] **Step 2: Call the init**

In `app.js`, find `initBambuRestartModal();` (around line 2245) and add directly after it:

```javascript
initMissingVariantModal();
```

- [ ] **Step 3: Guard `downloadSelectedPresets`**

In `app.js`, change the signature and add the guard at the very top. Find:

```javascript
      function downloadSelectedPresets() {
        var presetIds = Object.keys(selectedPresets);
        if (presetIds.length === 0) return;
```

Replace with:

```javascript
      function downloadSelectedPresets(skipVariantWarning) {
        var presetIds = Object.keys(selectedPresets);
        if (presetIds.length === 0) return;

        if (!skipVariantWarning) {
          var variantWarnings = collectMissingVariantWarnings(selectedPresets);
          if (variantWarnings.length) {
            showMissingVariantWarning(variantWarnings, function () {
              downloadSelectedPresets(true);
            });
            return;
          }
        }
```

- [ ] **Step 4: Guard `downloadSelectedBundle`**

In `app.js`, find:

```javascript
      function downloadSelectedBundle() {
        // Filter for BambuStudio presets only
        var bambuPresets = [];
```

Replace with:

```javascript
      function downloadSelectedBundle(skipVariantWarning) {
        if (!skipVariantWarning) {
          var variantWarnings = collectMissingVariantWarnings(selectedPresets);
          if (variantWarnings.length) {
            showMissingVariantWarning(variantWarnings, function () {
              downloadSelectedBundle(true);
            });
            return;
          }
        }
        // Filter for BambuStudio presets only
        var bambuPresets = [];
```

- [ ] **Step 5: Carry the field into the per-preset selection payload**

In `app.js` (around line 1555), find:

```javascript
          var presetData = JSON.stringify({ url: url, filename: filename, slicer: p.slicer, path: p.path, material: p.material, model: p.model, brand: p.brand });
```

Replace with:

```javascript
          var presetData = JSON.stringify({ url: url, filename: filename, slicer: p.slicer, path: p.path, material: p.material, model: p.model, brand: p.brand, missingExtruderVariants: p.missingExtruderVariants || [] });
```

- [ ] **Step 6: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Manual smoke check in a browser**

Serve the folder (e.g. `python3 -m http.server 8080`), open `http://localhost:8080`, select BambuStudio, select an X2D material known to have a `nil` variant (e.g. a `Polymaker HT-PLA @BBL X2D` preset), check its box, and click **Download Selected**.
Expected: the modal appears listing the material — X2D and the missing variant names; clicking **Download anyway** dismisses it and the ZIP download starts. Selecting only fully-populated presets shows no modal.

- [ ] **Step 8: Commit**

```bash
git add app.js
git commit -m "feat(app): show missing-variant warning before bulk downloads

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 6: Inline badge on affected rows

**Files:**
- Modify: `app.js` (`generatePresetRowHtml` ~line 1554-1586; folder row ~line 1610-1615)

- [ ] **Step 1: Add the badge to preset rows**

In `app.js`, inside `generatePresetRowHtml`, find the start of the `return '<tr...'` (around line 1578). Immediately *before* that `return`, add:

```javascript
          var variantBadgeHtml = (p.missingExtruderVariants && p.missingExtruderVariants.length)
            ? ' <span class="variant-warning-badge" title="' + escapeHtml(t('badge.missingvariant.title') + ' ' + p.missingExtruderVariants.join(', ')) + '">?</span>'
            : '';
```

Then in the same `return`, change the material cell. Find:

```javascript
            '<td' + (materialClass ? ' class="' + materialClass + '"' : '') + '>' + escapeHtml(options.material) + '</td>' +
```

Replace with:

```javascript
            '<td' + (materialClass ? ' class="' + materialClass + '"' : '') + '>' + escapeHtml(options.material) + variantBadgeHtml + '</td>' +
```

- [ ] **Step 2: Add the badge to folder (parent) rows**

In `app.js`, find the folder-row push (around lines 1610-1615):

```javascript
            rowsHtml.push('<tr class="folder-row" data-folder-id="' + folderId + '">' +
              '<td><label class="checkbox-label folder-checkbox-label" data-folder-id="' + folderId + '"><input type="checkbox" class="checkbox-input folder-checkbox-input"' + folderChecked + folderIndeterminate + '><span class="checkbox-custom"></span></label></td>' +
              '<td colspan="4">' + folderIconSvg + escapeHtml(mat) + ' <span class="folder-count">(' + t('folder.presets', { n: list.length }) + ')</span></td>' +
              '<td>-</td>' +
              '<td class="td-actions"><span class="folder-hint">' + t('folder.expand') + '</span></td>' +
              '</tr>');
```

Immediately *before* that push, compute the aggregated badge:

```javascript
            var folderMissing = [];
            list.forEach(function (cp) {
              if (cp.missingExtruderVariants && cp.missingExtruderVariants.length) {
                cp.missingExtruderVariants.forEach(function (v) {
                  if (folderMissing.indexOf(v) === -1) folderMissing.push(v);
                });
              }
            });
            var folderBadgeHtml = folderMissing.length
              ? ' <span class="variant-warning-badge" title="' + escapeHtml(t('badge.missingvariant.title') + ' ' + folderMissing.join(', ')) + '">?</span>'
              : '';
```

Then in the push, change the material cell. Find:

```javascript
              '<td colspan="4">' + folderIconSvg + escapeHtml(mat) + ' <span class="folder-count">(' + t('folder.presets', { n: list.length }) + ')</span></td>' +
```

Replace with:

```javascript
              '<td colspan="4">' + folderIconSvg + escapeHtml(mat) + folderBadgeHtml + ' <span class="folder-count">(' + t('folder.presets', { n: list.length }) + ')</span></td>' +
```

- [ ] **Step 3: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Manual smoke check**

Reload the served page, select BambuStudio + an affected printer/material. The affected rows (and their folder header when grouped) show a `?` badge; hovering shows the missing variant names. Fully-populated rows show no badge.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat(ui): show inline warning badge on presets missing variants

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Regeneration is idempotent**

Run: `npm run generate-index && git status --porcelain index.json`
Expected: no unexpected churn beyond the regeneration timestamp line; `missingExtruderVariants` fields stable.

- [ ] **Step 3: End-to-end manual pass**

With the page served: (a) affected rows show the badge; (b) bulk **Download Selected** and **Download .bbsflmt Bundle** both show the modal when an affected preset is selected; (c) acknowledging proceeds with the download; (d) no modal when only fully-populated presets are selected; (e) switch language to 中文 and confirm the modal + badge tooltip strings are translated.
