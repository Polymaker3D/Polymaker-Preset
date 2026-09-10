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

  // Suppress only exceptions whose frames are all identifiable third-party code.
  // Missing stacks and unfamiliar paths may be first-party failures: retain them.
  var OWN_HOST = String(window.location.hostname).toLowerCase();
  var URL_HOST = /^(?:https?:)?\/\/([^/?#]+)/i;

  function isThirdPartyFrame(frame) {
    // filename is the raw SDK location; source can be a host-stripped path.
    var ref = frame && (frame.filename || frame.source);
    if (typeof ref !== 'string' || !ref) return false;
    var match = URL_HOST.exec(ref);
    if (match) {
      var host = match[1].toLowerCase();
      // Unusual authorities are unknown, rather than evidence of foreign code.
      if (!/^[a-z0-9.-]+(?::[0-9]+)?$/.test(host)) return false;
      return host.split(':')[0] !== OWN_HOST;
    }
    // Klaviyo's onsite runtime is also reported without its hostname.
    return /^\/onsite\/js\//.test(ref);
  }

  function isThirdPartyException(event) {
    var list = event.properties && event.properties.$exception_list;
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.every(function(entry) {
      var frames = entry && entry.stacktrace && entry.stacktrace.frames;
      return Array.isArray(frames) && frames.length > 0 && frames.every(isThirdPartyFrame);
    });
  }

  function beforeSend(event) {
    if (!event || event.event !== '$exception') return event;
    return isThirdPartyException(event) ? null : event;
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
