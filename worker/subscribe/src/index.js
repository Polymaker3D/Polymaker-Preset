var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var ALLOWED_ORIGINS = [
  'https://presets.polymaker.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000'
];

var rateBuckets = new Map();

function corsHeaders(origin) {
  var allow = ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status: status, headers: headers });
}

function isValidEmail(email) {
  return !!(email && EMAIL_RE.test(email));
}

function isHoneypotFilled(value) {
  return !!(value && String(value).replace(/^\s+|\s+$/g, ''));
}

function isRateLimited(ip) {
  var now = Date.now();
  var rec = rateBuckets.get(ip) || { n: 0, t: now };
  if (now - rec.t > 60000) {
    rec.n = 0;
    rec.t = now;
  }
  rec.n += 1;
  rateBuckets.set(ip, rec);
  return rec.n > 8;
}

async function createBrevoContact(env, email, lang) {
  var listId = Number(env.BREVO_LIST_ID);
  var apiKey = env.BREVO_API_KEY;
  if (!apiKey || !listId) {
    return { ok: false, status: 503, error: 'not_configured' };
  }

  var useDoi = env.BREVO_DOI === '1';
  var url = useDoi
    ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
    : 'https://api.brevo.com/v3/contacts';
  var payload = useDoi
    ? {
        email: email,
        includeListIds: [listId],
        templateId: Number(env.BREVO_DOI_TEMPLATE_ID),
        redirectionUrl: env.BREVO_DOI_REDIRECT_URL || 'https://presets.polymaker.com/',
        attributes: { SOURCE: 'presets.polymaker.com', LANG: lang }
      }
    : {
        email: email,
        listIds: [listId],
        updateEnabled: true,
        attributes: { SOURCE: 'presets.polymaker.com', LANG: lang }
      };

  var res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'accept': 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok || res.status === 204) {
    return { ok: true, status: 200 };
  }

  var text = await res.text();
  if (/already exist|duplicate/i.test(text)) {
    return { ok: true, status: 200 };
  }
  return { ok: false, status: 502, error: 'upstream' };
}

export default {
  async fetch(request, env) {
    var origin = request.headers.get('Origin') || '';
    var headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: headers });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, headers);
    }

    var ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return json({ error: 'rate_limited' }, 429, headers);
    }

    var body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'invalid_json' }, 400, headers);
    }

    if (isHoneypotFilled(body && (body.company || body.website))) {
      return json({ ok: true }, 200, headers);
    }

    var email = String((body && body.email) || '').replace(/^\s+|\s+$/g, '').toLowerCase();
    if (!isValidEmail(email)) {
      return json({ error: 'invalid_email' }, 400, headers);
    }

    var lang = String((body && body.lang) || 'en').slice(0, 8);
    var result = await createBrevoContact(env, email, lang);
    if (result.ok) {
      return json({ ok: true }, 200, headers);
    }
    return json({ error: result.error }, result.status, headers);
  }
};

export { isValidEmail, isHoneypotFilled, isRateLimited };
