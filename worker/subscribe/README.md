# LayerHub Banner Subscribe — Ops and Deploy

The banner POSTs emails to this Worker. The Worker writes contacts to a dedicated Brevo list, `LayerHub Waitlist`. The API key lives only in Cloudflare Secrets and is never committed to Git.

## 1. Brevo (one-time setup)

1. Sign up for [Brevo Free](https://www.brevo.com/) (about 300 emails/day).
2. Contacts → Lists → create **LayerHub Waitlist** (do not merge it into the main Polymaker list).
3. Add contact attributes: `SOURCE` (text) and `LANG` (text).
4. Note the List ID.
5. Settings → SMTP & API → API keys → generate a key with Contacts permission only.
6. Sending domain: start with Brevo’s default domain; switch to a branded domain later.
7. Leave double opt-in off for now. To enable it later: create a DOI template, set the Worker’s `BREVO_DOI` to `1`, and configure `BREVO_DOI_TEMPLATE_ID` and `BREVO_DOI_REDIRECT_URL`.

## 2. Deploy the Worker

```bash
cd worker/subscribe
npx wrangler login
npx wrangler secret put BREVO_API_KEY
npx wrangler secret put BREVO_LIST_ID
npx wrangler deploy
```

Note the `*.workers.dev` URL. To use `subscribe.presets.polymaker.com`, add a Worker route on the presets domain in Cloudflare.

The frontend URL is `#layerhub-banner[data-subscribe-url]` in [`index.html`](../../index.html). Update it to the real Worker URL after deploy.

Local: `npx wrangler dev`, then temporarily set `data-subscribe-url` to `http://127.0.0.1:8787`.

## 3. Turn off the Klaviyo popup

Keep the Klaviyo script (`WZCXdW`) in `index.html` for now. After the banner ships, disable the presets.polymaker.com popup in Klaviyo Onsite so you do not run two subscribe boxes and two lists. **Do not** write LayerHub subscribers into Klaviyo.

## 4. Day-to-day ops

- List: Brevo → Contacts → `LayerHub Waitlist`. Filter with `SOURCE = presets.polymaker.com`.
- Launch email: create a Campaign against that list (free tier is about 300 emails/day; send in batches if needed).
- Unsubscribe: Brevo campaign emails include unsubscribe by default.
- Export: CSV. Upgrade the plan if you hit limits; the API does not need to change.

## 5. Acceptance check

```bash
curl -sS -X POST "$WORKER_URL" \
  -H "Origin: https://presets.polymaker.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","lang":"en"}'
```

It should return `{"ok":true}`, and the email should appear in the Brevo list. Sending the same email again should also succeed (`updateEnabled`).
