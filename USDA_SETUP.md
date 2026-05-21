# USDA FoodData Central — setup notes

The Fuel-tab food search is now powered by USDA FoodData Central instead of
FatSecret. No IP whitelisting, no OAuth, no paid tiers — just a free API
key and a 1,000-request-per-hour limit (well beyond personal logging needs).

Three steps to bring it live; then it works.

## 1. Get a free USDA API key

1. Go to https://fdc.nal.usda.gov/api-key-signup
2. Fill in your name, email, and what you're using it for ("personal
   nutrition tracker" is fine).
3. Submit. The key arrives by email instantly — no approval queue.

The key looks like a long random string of letters and numbers. It's not
strictly a *secret* the way an OAuth client secret is — USDA treats it
more like an account-linked rate-limit token — but we still keep it
server-side as a good habit.

## 2. Add it to Vercel

Vercel project → **Settings → Environment Variables** → add:

| Name           | Value                |
| -------------- | -------------------- |
| `USDA_API_KEY` | (the key from step 1)|

Scope to **Production** (and Preview if you preview-deploy). Save, then
**Redeploy** so the new serverless function picks it up.

## 3. Test from the deployed app

Open the Fuel tab, type something in the new "Search foods (USDA)" box:

- Whole foods (`oatmeal`, `chicken thigh`, `banana`, `spinach raw`) →
  excellent results, often more accurate than FatSecret.
- Branded products (`goldfish`, `cheerios`, `cliff bar`) → results from
  the USDA Branded Foods database, which pulls from GS1 product
  registrations. Coverage is good but less polished than FatSecret —
  some niche brands may not appear.
- If you see `"Search failed: USDA request failed: ..."` with a 403
  error: the env var isn't reaching the function. Confirm `USDA_API_KEY`
  is set on the correct environment and that you redeployed after.
- If you see a 429 (rate limit): wait an hour and try again. You'd have
  to log a lot of food to hit 1,000/hr though.

## How it fits together

```
  Browser (Fuel tab)
      │ GET /api/usda/proxy?method=search&query=goldfish
      ▼
  Vercel serverless function (api/usda/proxy.js)
      │ GET api.nal.usda.gov/fdc/v1/foods/search?api_key=...&query=goldfish
      ▼
  USDA FoodData Central
      │ Returns verbose nested JSON
      ▼
  Function normalizes shape, hides the API key
      ▼
  Browser renders results dropdown
```

## If FatSecret Premier Free comes through later

The FatSecret proxy (`api/fatsecret/proxy.js`) is still in the repo and
still works — it's just not wired to the frontend. To switch back:

1. Confirm `0.0.0.0/0` is whitelisted in your FatSecret IP Restrictions
   (Premier Free unlocks this).
2. In `Katie_Mile_Training_Calendar_Interactive.html`, find the constant
   `const FOOD_API_BASE = "/api/usda/proxy";` and change it to
   `"/api/fatsecret/proxy"`.
3. Update the "Powered by" attribution + "Search foods (USDA)" label in
   the HTML if you care about being precise.
4. Commit + deploy.

The normalized response shape both proxies emit is identical, so the
Fuel-tab UI doesn't need any other changes.

## Notes on USDA's data model

USDA's response is messier than FatSecret's. The proxy handles this so
the frontend doesn't have to know, but worth knowing why some foods have
different serving options:

- **Branded** foods come with one declared "label serving" (e.g., `30
  pieces` of Goldfish at 140 cal) plus a `100 g` option. If the package
  has a `householdServingFullText` (e.g., "55 pieces"), we use that as
  the description.
- **Foundation / SR Legacy** (whole foods — apple raw, chicken breast,
  etc.) come with `100 g` as the baseline plus any `foodPortions`
  USDA has measured (e.g., "1 cup, chopped", "1 medium fruit"). These
  scaled-by-gram-weight portions match how nutrition labels usually
  appear on whole foods.
- **Survey (FNDDS)** entries are "what people actually ate" data — useful
  for things like "Pizza, cheese, regular crust" where there's no
  branded version but you want a realistic average.

If a search result looks like nothing (no calories, weird serving), the
proxy filters those out — USDA occasionally returns half-populated
records that we don't want polluting the dropdown.
