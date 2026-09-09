// Browser analytics. This is the public, write-only PostHog project token.
// The Node build client is configured separately through GitHub Actions secrets.
(function () {
  if (window.location.hostname !== 'presets.polymaker.com') return;
  if (window.posthog && (window.posthog.__loaded || window.posthog.__SV)) return;

  // PostHog's asynchronous snippet queues early interactions while the SDK loads.
  // https://posthog.com/docs/libraries/js
  var posthog = window.posthog = [];
  posthog._i = [];
  posthog.__SV = 1;
  posthog.people = [];
  posthog.init = function (token, config) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.src = config.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    function queueMethod(name) {
      posthog[name] = function () {
        posthog.push([name].concat(Array.prototype.slice.call(arguments)));
      };
    }
    var methods = ['capture', 'register', 'identify', 'reset', 'set_config', 'opt_in_capturing', 'opt_out_capturing'];
    for (var i = 0; i < methods.length; i++) queueMethod(methods[i]);
    posthog._i.push([token, config, 'posthog']);
  };

  // Drop exceptions raised entirely by third-party scripts (Klaviyo, Google, CDNs).
  // Their frames name files we do not host, so we can neither fix nor retry them.
  // Keeping only exceptions with a frame from our own origin also clears frameless
  // browser noise such as "ResizeObserver loop" and bare "ProgressEvent" errors.
  var HAS_SCHEME = /^https?:\/\//i;
  var URL_HOST = /^https?:\/\/([^/?#]+)/i;
  var OWN_HOST = String(window.location.hostname).toLowerCase();
  // Our own first-party scripts, matched by file name when error tracking reports a
  // frame as a host-stripped path. Keep in sync with the same-origin <script> tags in
  // index.html; tests/analytics-third-party-filter.test.js fails if this drifts.
  var OWN_SCRIPTS = ['analytics.js', 'app.js', 'i18n.js'];

  function frameHostname(ref) {
    var match = URL_HOST.exec(ref);
    return match ? match[1].split(':')[0].toLowerCase() : '';
  }

  function isOwnFrame(frame) {
    var ref = frame && (frame.filename || frame.source);
    if (!ref) return false;
    // A full URL carries its host; trust it.
    if (HAS_SCHEME.test(ref)) return frameHostname(ref) === OWN_HOST;
    // A host-stripped path: recognise our own files by name, or the page itself.
    var path = String(ref).split('?')[0].split('#')[0];
    if (path === '' || path.charAt(path.length - 1) === '/') return true;
    return OWN_SCRIPTS.indexOf(path.substring(path.lastIndexOf('/') + 1)) !== -1;
  }

  function hasOwnFrame(event) {
    var list = event.properties && event.properties.$exception_list;
    if (!Array.isArray(list)) return true;
    return list.some(function (entry) {
      var frames = entry && entry.stacktrace && entry.stacktrace.frames;
      return Array.isArray(frames) && frames.some(isOwnFrame);
    });
  }

  function beforeSend(event) {
    if (!event || event.event !== '$exception') return event;
    return hasOwnFrame(event) ? event : null;
  }

  window.posthog.init('phc_CdvtTDKLvkXysqQN43CbH674J2p9r9LoEZBGEHbrfsYi', {
    api_host: 'https://us.i.posthog.com',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-05-30',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    person_profiles: 'identified_only',
    cross_subdomain_cookie: false,
    disable_session_recording: true,
    disable_surveys: true,
    before_send: beforeSend,
    loaded: function (posthog) {
      posthog.register({ site: 'polymaker-presets' });
    }
  });
}());
