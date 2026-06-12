# Food scan setup (barcode + label photo)

The Fuel tab's **Scan barcode or label** button works in two stages:

1. **Barcode** — decoded on-device, looked up in [Open Food Facts](https://world.openfoodfacts.org).
   Free, no key needed, excellent German/EU product coverage. Works immediately.
2. **Nutrition label photo** — if no barcode is found in the photo, the image is sent to
   `/api/label/proxy`, which uses Claude (vision) to read the label — including German/Danish
   labels, kJ→kcal and salt→sodium conversion, and per-100g vs per-serving detection.

## One-time setup for the label reader

1. Get an API key at https://console.anthropic.com (Settings → API keys).
2. In Vercel → your project → **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key (Production + Preview + Development)
3. Redeploy.

Cost: each label scan is one small Haiku request — well under a cent.
Optional: set `ANTHROPIC_MODEL` to override the default model.

## Usage notes

- Take the photo close enough that the nutrition table fills most of the frame.
- EU labels are usually per 100 g — the form pre-fills those values and flags it in the
  food name so you can scale to your actual portion before tapping Add.
- Everything lands in the normal meal form for review first; nothing is logged until you tap Add.
