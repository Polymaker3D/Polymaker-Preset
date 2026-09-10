import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const appContent = fs.readFileSync(path.join(root, 'app.js'), 'utf-8');
const styleContent = fs.readFileSync(path.join(root, 'style.css'), 'utf-8');

describe('Row download busy state', () => {
  it('exposes helpers that mark a row download button busy', () => {
    assert.ok(appContent.includes('function setRowDownloadBusy(link, busy)'));
    assert.ok(appContent.includes('function isRowDownloadBusy(link)'));
    assert.ok(appContent.includes("link.classList.add('is-busy')"));
    assert.ok(appContent.includes("link.setAttribute('aria-busy', 'true')"));
  });

  it('guards every async row download against a repeat click', () => {
    assert.ok(appContent.includes('if (isRowDownloadBusy(directJsonLink)) return;'));
    assert.ok(appContent.includes('if (isRowDownloadBusy(bambuJsonLink)) return;'));
    assert.ok(appContent.includes('if (isRowDownloadBusy(bundleLink)) return;'));
  });

  it('clears the busy state on both success and failure', () => {
    ['directJsonLink', 'bambuJsonLink', 'bundleLink'].forEach((link) => {
      assert.ok(appContent.includes('setRowDownloadBusy(' + link + ', true)'));
      const cleared = appContent.split('setRowDownloadBusy(' + link + ', false)').length - 1;
      assert.ok(cleared >= 2, link + ' must clear busy on success and on error');
    });
  });

  it('styles the busy state in a theme-neutral way', () => {
    assert.ok(styleContent.includes('.btn-download.is-busy'));
    assert.ok(styleContent.includes('.btn-bundle.is-busy'));
    assert.ok(styleContent.includes('@keyframes row-download-spin'));
    assert.ok(styleContent.includes('prefers-reduced-motion'));
  });
});

// Execute the production click handler and bundle lifecycle with a deferred ZIP.
// This catches early busy resets that source-string assertions cannot detect.
function bundleHarness(options = {}) {
  const classes = new Set();
  const attrs = new Map(Object.entries({
    'data-bundle-url': '/preset.json', 'data-bundle-filename': 'preset.json',
    'data-bundle-material': 'PLA', 'data-bundle-model': 'X1'
  }));
  const link = {
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
    setAttribute: (k, v) => attrs.set(k, v), removeAttribute: k => attrs.delete(k),
    getAttribute: k => attrs.get(k)
  };
  let resolveZip, rejectZip, handler, confirm, cancel;
  let fetches = 0, saves = 0, alerts = 0;
  const zipResult = new Promise((resolve, reject) => { resolveZip = resolve; rejectZip = reject; });
  const context = {
    console: { log() {}, warn() {}, error() {} }, Promise, Blob,
    setTimeout() {}, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    document: { createElement: () => ({ click: () => saves++ }), body: { appendChild() {}, removeChild() {} } },
    t: x => x, alert: () => alerts++, trackUsageEvent() {}, getGaValue: x => x,
    fetch: () => {
      fetches++;
      return options.fetchError ? Promise.reject(new Error('Fetch failed')) : Promise.resolve({
        ok: true, json: () => Promise.resolve({ name: 'PLA', compatible_printers: ['X1'] })
      });
    },
    JSZip: function() {
      if (options.syncZipError) throw new Error('ZIP unavailable');
      this.folder = () => ({ file() {} });
      this.file = () => {};
      this.generateAsync = () => zipResult;
    },
    generateBundleStructureFromMappings: () => ({}), extractVendorFromPreset: () => 'Polymaker',
    generateBundleFilename: () => 'PLA.bbsflmt',
    resolveBambuMappingsWithDedup: (presets, resolved, cancelled) => {
      if (options.mappingCancel) return cancelled();
      if (options.mappingError) return cancelled(new Error('Mapping failed'));
      resolved([{ originalPreset: presets[0], presetData: presets[0].presetData,
        generatedFilename: 'PLA @X1.json', printerName: 'X1' }]);
    },
    isBambuStudioSlicerSelected: () => true,
    showBambuRestartWarning: (yes, no) => { confirm = yes; cancel = no; },
    withMissingVariantWarning: (link, action) => action(),
    tbody: { addEventListener: (name, callback) => { handler = callback; } }
  };
  vm.createContext(context);
  const helperStart = appContent.indexOf('function setRowDownloadBusy');
  vm.runInContext(appContent.slice(helperStart, appContent.indexOf('function initBannerCta', helperStart)), context);
  for (const name of ['downloadAsBbsflmt', 'generateAndDownloadBbsflmt']) {
    const start = appContent.indexOf('  function ' + name + '(');
    const end = appContent.indexOf('\n  }', start) + 4;
    vm.runInContext(appContent.slice(start, end), context);
  }
  const start = appContent.indexOf("      tbody.addEventListener('click', function (e) {");
  vm.runInContext(appContent.slice(start, appContent.indexOf('\n      render();', start)), context);
  return {
    click: () => handler({ preventDefault() {}, target: { closest: selector => selector === 'a.btn-bundle' ? link : null } }),
    confirm: () => confirm(), cancel: () => cancel(), resolveZip, rejectZip,
    busy: () => classes.has('is-busy'), ariaBusy: () => attrs.get('aria-busy'),
    fetches: () => fetches, saves: () => saves, alerts: () => alerts
  };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

describe('Bundle download lifecycle', () => {
  it('stays busy through the dialog and ZIP generation and suppresses repeat clicks', async () => {
    const h = bundleHarness();
    h.click();
    await flush();
    assert.equal(h.busy(), true);
    assert.equal(h.ariaBusy(), 'true');
    h.click();
    assert.equal(h.fetches(), 1);
    h.confirm();
    await flush();
    h.click();
    assert.equal(h.busy(), true);
    assert.equal(h.fetches(), 1);
    assert.equal(h.saves(), 0);
    h.resolveZip(new Blob(['bundle']));
    await flush();
    assert.equal(h.saves(), 1);
    assert.equal(h.busy(), false);
    assert.equal(h.ariaBusy(), undefined);
  });

  it('clears busy after restart-warning cancellation and allows retry', async () => {
    const h = bundleHarness();
    h.click();
    await flush();
    h.cancel();
    await flush();
    assert.equal(h.busy(), false);
    assert.equal(h.saves(), 0);
    h.click();
    assert.equal(h.fetches(), 2);
  });

  for (const option of ['fetchError', 'mappingCancel', 'mappingError', 'syncZipError', 'zipError']) {
    it('clears busy on ' + option, async () => {
      const h = bundleHarness({ [option]: true });
      h.click();
      await flush();
      if (option === 'syncZipError' || option === 'zipError') {
        h.confirm();
        await flush();
        if (option === 'zipError') h.rejectZip(new Error('ZIP failed'));
        await flush();
      }
      assert.equal(h.busy(), false);
      assert.equal(h.ariaBusy(), undefined);
      assert.equal(h.saves(), 0);
      assert.equal(h.alerts(), option === 'mappingCancel' ? 0 : 1);
    });
  }
});
