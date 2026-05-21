# FatSecret nutrition lookup — setup notes

These steps wire the new "Log a meal" search box to FatSecret. Do them in
order. They only need to happen once.

## 1. Set Vercel environment variables

Go to your Vercel project → **Settings → Environment Variables** and add:

| Name                          | Value                          |
| ----------------------------- | ------------------------------ |
| `FATSECRET_CONSUMER_KEY`      | (your FatSecret consumer key)  |
| `FATSECRET_CONSUMER_SECRET`   | (your FatSecret consumer secret) |

Scope them to **Production** (and Preview if you preview-deploy). Save.

Trigger a redeploy so the serverless function picks them up — either push a
commit, or hit the **Redeploy** button in Vercel.

## 2. Whitelist IPs in FatSecret

FatSecret's free Basic tier requires you to declare which IP addresses can
call the API. Vercel uses many dynamic IPs across regions, so the practical
fix is to whitelist all of them:

1. Log in at https://platform.fatsecret.com/
2. Go to **My Account → Manage API Keys** (or similar — UI shifts).
3. Find the "Allowed IP Addresses" field for your application.
4. Add `0.0.0.0/0` (or `0.0.0.0` — same effect; allows any IP).
5. Save.

Your consumer key + secret remain the actual gate. The IP whitelist on
Basic is mostly an anti-scraping tripwire; with credentials living in Vercel
env vars (never the browser), opening the IP list doesn't expose anything.

### Optional: apply for Premier Free

If you're using this for personal training and not selling anything, you
likely qualify for FatSecret's **Premier Free** tier — same free price but
unlocks barcode scanning, autocomplete-as-you-type, full feature parity
with paid plans, and **removes the IP whitelist requirement**. Apply at the
same dashboard. It can take a few days for them to approve. In the
meantime, Basic + the 0.0.0.0/0 whitelist works fine.

## 3. Run the Supabase migration

Open your Supabase project → **SQL Editor → New query**, paste the entire
contents of `supabase-setup.sql`, and run. The script is idempotent — it
uses `create table if not exists` and `alter table ... add column if not
exists` so re-running adds only the new columns (`sodium`, `food_id`,
`brand`, `serving_description`, `source`) without touching existing data.

## 4. Test from the deployed app

Open the Fuel tab, type something distinctive into the new "Search foods"
box (e.g. `goldfish cheddar`), wait ~300ms for the dropdown:

- If results appear: pick one, pick a serving, hit "Use this — fill the
  form", then Add. Everything's wired correctly.
- If you see `"Search failed: FatSecret request failed: ..."` with a 401
  error: your credentials aren't reaching the serverless function. Check
  that the env vars are set on the right environment (Production vs
  Preview) and that you redeployed after adding them.
- If you see a 403 about IP restrictions: the whitelist step (#2) didn't
  take. Double-check that `0.0.0.0/0` was saved on the right application
  in the FatSecret dashboard.
- If you see a 5xx with `non-JSON` errors: FatSecret may be down or
  rate-limiting. Wait a minute and retry.

## How it fits together

```
  Browser (Fuel tab)
      │ GET /api/fatsecret/proxy?method=search&query=goldfish
      ▼
  Vercel serverless function (api/fatsecret/proxy.js)
      │ 1. Mint OAuth bearer token (cached in module scope)
      │ 2. GET platform.fatsecret.com/rest/server.api?method=foods.search&...
      ▼
  FatSecret API
      │ Returns nested JSON
      ▼
  Function normalizes shape, strips credentials
      ▼
  Browser renders results dropdown
```

Credentials never leave the server. The browser only sees food data.

## Adding new endpoints later

If you want to support barcode scanning (Premier Free unlocks it), the
proxy function already has the shape — add a new branch in the `handler`:

```js
if (method === "barcode") {
  const upc = String(req.query.upc || "").trim();
  if (!upc) return res.status(400).json({ error: "Missing 'upc'" });
  const data = await callApi({
    method: "food.find_id_for_barcode",
    barcode: upc,
  });
  // ... return the food_id, then the client calls method=food&id=...
}
```

Same for `foods.autocomplete` (Premier only).
