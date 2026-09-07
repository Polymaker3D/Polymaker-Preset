import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const analytics = readFileSync(new URL('../analytics.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const helper = app.slice(app.indexOf('function trackUsageEvent('), app.indexOf('function applyTheme('));

function browser(hostname = 'presets.polymaker.com') {
  const scripts = [];
  const context = vm.createContext({
    window: { location: { hostname } },
    document: {
      createElement: () => ({}),
      getElementsByTagName: () => [{ parentNode: { insertBefore: (script) => scripts.push(script) } }],
    },
    console: { warn() {} },
  });
  vm.runInContext(analytics, context);
  vm.runInContext(helper, context);
  return { context, scripts };
}

it('loads the browser SDK asynchronously and queues usage before it arrives', () => {
  const { context, scripts } = browser();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://us-assets.i.posthog.com/static/array.js');
  assert.equal(scripts[0].async, true);
  const [, config] = context.window.posthog._i[0];
  assert.equal(config.capture_pageview, true);
  assert.equal(config.autocapture, true);
  assert.equal(config.disable_session_recording, true);
  vm.runInContext("trackUsageEvent('download_single', {material: 'Panchroma PLA'});", context);
  assert.equal(context.window.posthog[0][0], 'capture');
  assert.equal(context.window.posthog[0][1], 'download_single');
  assert.equal(context.window.posthog[0][2].material, 'Panchroma PLA');
  vm.runInContext(analytics, context);
  assert.equal(scripts.length, 1, 'reloading bootstrap must not initialize twice');
});

it('does not load production analytics on local or preview hosts', () => {
  for (const host of ['localhost', '127.0.0.1', 'preview.example.com']) {
    const { context, scripts } = browser(host);
    assert.equal(scripts.length, 0);
    assert.doesNotThrow(() => vm.runInContext("trackUsageEvent('download_single');", context));
  }
});

it('sends to both providers independently, even when one is unavailable or throws', () => {
  const { context } = browser();
  const ga = [];
  const ph = [];
  context.window.gtag = (...args) => ga.push(args);
  context.window.posthog = { capture: (...args) => ph.push(args) };
  vm.runInContext("trackUsageEvent('download_selected', {selected_count: 2});", context);
  assert.equal(ga.length, 1);
  assert.equal(ph.length, 1);
  assert.equal(ph[0][1].selected_count, 2);
  context.window.gtag = () => { throw new Error('blocked GA'); };
  vm.runInContext("trackUsageEvent('download_bundle');", context);
  assert.equal(ph.length, 2);
  context.window.gtag = (...args) => ga.push(args);
  context.window.posthog.capture = () => { throw new Error('blocked PostHog'); };
  assert.doesNotThrow(() => vm.runInContext("trackUsageEvent('download_bundle_batch');", context));
  assert.equal(ga.length, 2);
});

it('captures a real dropdown selection after rendering its new filter state', () => {
  const { context } = browser();
  let select;
  let rendered = false;
  const option = { getAttribute: () => 'OrcaSlicer', textContent: 'OrcaSlicer', classList: { add() {} } };
  const menu = { addEventListener: (_, fn) => { select = fn; }, querySelector: () => null };
  const dropdown = {
    querySelector: (selector) => selector === '.dropdown-menu' ? menu : { addEventListener() {} },
    classList: { remove() {} },
  };
  Object.assign(context, {
    filterState: { slicer: '', series: '', brand: '', model: '', strict: true },
    selectedPresets: {}, escapeHtml: (s) => s, t: (s) => s,
    updateVisibility() {}, updateBrandDropdownState() {}, updateSelectedCount() {},
    render() { rendered = true; },
  });
  context.document.querySelector = () => dropdown;
  vm.runInContext(app.slice(app.indexOf('function setupDropdown('), app.indexOf('function closeAllDropdowns(')), context);
  vm.runInContext("setupDropdown('slicer', ['OrcaSlicer'], true);", context);
  select({ target: { closest: () => option } });
  assert.equal(rendered, true);
  const event = context.window.posthog[0];
  assert.equal(event[1], 'filter_changed');
  assert.equal(event[2].filter, 'slicer');
  assert.equal(event[2].slicer, 'OrcaSlicer');
});
