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

  // Drop an exception only when its stack points at third-party code alone.
  // Native and anonymous frames name no source, so skip them.
  // Any first-party or unknown frame keeps the exception, so first-party failures stay visible.
  var OWN_HOST = String(window.location.hostname).toLowerCase();
  var URL_HOST = /^(?:https?:)?\/\/([^/?#]+)/i;

  function isNativeFrame(frame) {
    // The browser reports built-in frames such as Array.reduce with no source file.
    if (!frame || frame.in_app === true) return false;
    var ref = frame.filename || frame.source;
    return ref === '<anonymous>' || ref === '[native code]';
  }

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

  function isThirdPartyEntry(entry) {
    var frames = entry && entry.stacktrace && entry.stacktrace.frames;
    if (!Array.isArray(frames) || frames.length === 0) return false;
    var sawThirdParty = false;
    for (var i = 0; i < frames.length; i++) {
      var frame = frames[i];
      if (isNativeFrame(frame)) continue;
      if (!isThirdPartyFrame(frame)) return false;
      sawThirdParty = true;
    }
    return sawThirdParty;
  }

  function isThirdPartyException(event) {
    var list = event.properties && event.properties.$exception_list;
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.every(isThirdPartyEntry);
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
