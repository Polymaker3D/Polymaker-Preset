/**
 * Tests for the third-party exception filter in analytics.js.
 *
 * The filter is the before_send hook passed to PostHog. It keeps an exception
 * unless every frame is identifiable third-party code. Unknown origins and
 * missing stacks are retained so first-party failures remain visible.
 *
 * The test runs the real analytics.js source in a stub browser, then reads the
 * before_send function that the snippet queued for the SDK.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const analyticsSource = fs.readFileSync(path.join(__dirname, '..', 'analytics.js'), 'utf-8');
const htmlSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');

// Same-origin (relative src) scripts loaded by index.html. Cross-origin CDN/vendor
// tags (Google, Klaviyo, jsDelivr) are excluded because they are not our code.
function ownScriptNames() {
  const names = [];
  const re = /<script[^>]*\ssrc="([^"]+)"/gi;
  let match;
  while ((match = re.exec(htmlSource))) {
    const src = match[1];
    if (/^(https?:)?\/\//i.test(src)) continue;
    names.push(src.split('?')[0].split('#')[0].split('/').pop());
  }
  return names;
}

function runSnippet(hostname) {
  const window = { location: { hostname } };
  const document = {
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: { insertBefore: () => {} } }]
  };
  // eslint-disable-next-line no-new-func
  new Function('window', 'document', analyticsSource)(window, document);
  return window;
}

function loadBeforeSend() {
  const window = runSnippet('presets.polymaker.com');
  const entry = window.posthog && window.posthog._i && window.posthog._i[0];
  return entry && entry[1].before_send;
}

function exceptionEvent(frames) {
  return { event: '$exception', properties: { $exception_list: [{ stacktrace: { frames } }] } };
}

describe('analytics.js before_send filter', () => {
  it('is wired into the PostHog init config on our host', () => {
    assert.strictEqual(typeof loadBeforeSend(), 'function');
  });

  it('does not initialise PostHog on other hosts', () => {
    const window = runSnippet('example.com');
    assert.ok(!window.posthog || !window.posthog._i || !window.posthog._i.length);
  });

  it('drops the Klaviyo chunk load failure (host-stripped paths)', () => {
    const beforeSend = loadBeforeSend();
    const event = exceptionEvent([
      { source: '/onsite/js/runtime.08a889cad67f0.js', in_app: true },
      { source: '/onsite/js/532.a95ebb9d438a8.css)', in_app: true }
    ]);
    assert.strictEqual(beforeSend(event), null);
  });

  it('drops third-party frames served from a foreign host', () => {
    const beforeSend = loadBeforeSend();
    const event = exceptionEvent([
      { filename: 'https://static.klaviyo.com/onsite/js/runtime.08a889cad67f0.js?cb=2' }
    ]);
    assert.strictEqual(beforeSend(event), null);
  });

  it('retains frameless exceptions whose origin cannot be established', () => {
    const beforeSend = loadBeforeSend();
    for (const frames of [[], undefined]) {
      const event = exceptionEvent(frames);
      assert.strictEqual(beforeSend(event), event);
    }
  });

  it('keeps a host-stripped frame from every first-party script in index.html', () => {
    const beforeSend = loadBeforeSend();
    const names = ownScriptNames();
    assert.ok(names.length > 0, 'expected same-origin scripts in index.html');
    for (const name of names) {
      const event = exceptionEvent([{ source: '/' + name, in_app: true }]);
      assert.strictEqual(beforeSend(event), event, name + ' should be treated as our own code');
    }
  });

  it('keeps exceptions with a frame from our own host (full URL)', () => {
    const beforeSend = loadBeforeSend();
    const event = exceptionEvent([
      { filename: 'https://static.klaviyo.com/onsite/js/klaviyo.js' },
      { filename: 'https://presets.polymaker.com/i18n.js' }
    ]);
    assert.strictEqual(beforeSend(event), event);
  });

  it('keeps exceptions raised in an inline page script', () => {
    const beforeSend = loadBeforeSend();
    const event = exceptionEvent([{ filename: 'https://presets.polymaker.com/' }]);
    assert.strictEqual(beforeSend(event), event);
  });

  it('passes non-exception events through unchanged', () => {
    const beforeSend = loadBeforeSend();
    const pageview = { event: '$pageview', properties: {} };
    assert.strictEqual(beforeSend(pageview), pageview);
  });
});

describe('unknown-origin exception protection', () => {
  it('retains unknown, inline, malformed, and newly added first-party frames', () => {
    const beforeSend = loadBeforeSend();
    for (const frame of [
      { filename: '/index.html' }, { source: '/new-feature.js' },
      { filename: '<anonymous>' }, {}, { filename: 123 },
      { filename: 'blob:https://presets.polymaker.com/example' },
      { filename: '//presets.polymaker.com/app.js' },
      { filename: 'https://presets.polymaker.com:443/app.js' }
    ]) {
      const event = exceptionEvent([frame]);
      assert.strictEqual(beforeSend(event), event);
    }
  });

  it('retains mixed foreign and unknown frames and exception causes', () => {
    const beforeSend = loadBeforeSend();
    const foreign = { filename: 'https://static.klaviyo.com/runtime.js' };
    const mixed = exceptionEvent([foreign, { filename: '/new-feature.js' }]);
    assert.strictEqual(beforeSend(mixed), mixed);
    const cause = exceptionEvent([foreign]);
    cause.properties.$exception_list.push({ type: 'UnhandledRejection', value: 'Preset export failed' });
    assert.strictEqual(beforeSend(cause), cause);
  });

  it('retains absent, empty, and malformed exception lists', () => {
    const beforeSend = loadBeforeSend();
    for (const list of [undefined, [], [null], 'unexpected']) {
      const event = { event: '$exception', properties: { $exception_list: list } };
      assert.strictEqual(beforeSend(event), event);
    }
  });

  it('drops protocol-relative foreign scripts but trusts an explicit own URL over source', () => {
    const beforeSend = loadBeforeSend();
    assert.strictEqual(beforeSend(exceptionEvent([{ filename: '//static.klaviyo.com/runtime.js' }])), null);
    const event = exceptionEvent([{
      filename: 'https://presets.polymaker.com/app.js', source: '/onsite/js/runtime.js'
    }]);
    assert.strictEqual(beforeSend(event), event);
  });
});
