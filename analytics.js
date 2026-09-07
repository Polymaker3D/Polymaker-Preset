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
    loaded: function (posthog) {
      posthog.register({ site: 'polymaker-presets' });
    }
  });
}());
