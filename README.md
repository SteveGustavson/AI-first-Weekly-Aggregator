# AI‑First Weekly Aggregator

A tiny full‑stack app that aggregates AI‑first product development news weekly from official research and product blogs. It dedupes, filters to the last 7 days, and exposes a simple React UI.

## Quickstart

```bash
# prerequisites: Node 20+, pnpm
pnpm install
pnpm dev
# server on :5174, client on :5173
```

## Production
- Deploy `server` to Render/Fly/Heroku. Cron is built‑in (Mondays 09:00 America/Denver). For serverless, disable `node-cron` and use a scheduler (e.g., GitHub Actions) to call `POST /api/fetch` weekly.
- Deploy `client` as static to Vercel/Netlify and set `VITE_API_URL`.

## Customize sources
Edit `server/feeds.js`. Each entry supports multiple candidate feed URLs; the first that returns items is used. If none work, we do a light HTML scrape as a last resort.

## Notes
- Some providers change feed paths (e.g., Google AI / DeepMind). This app tries sensible fallbacks to avoid 404s.
- You can add X/Twitter via third‑party RSS gateways, but rate limits vary, so they’re omitted by default.
