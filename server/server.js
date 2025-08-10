import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import cron from "node-cron";
import pino from "pino";
import { formatISO, subDays, isAfter } from "date-fns";
import { z } from "zod";
import { FEEDS } from "./feeds.js";
import { fetchFeedCandidates, normalizeItem, basicScrape } from "./utils.js";

const app = express();
app.use(cors());
app.use(express.json());
const log = pino({ level: process.env.LOG_LEVEL || "info" });

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "weekly.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

async function aggregate(days = 7) {
  const since = subDays(new Date(), days);
  const aggregated = [];

  for (const src of FEEDS) {
    let result = await fetchFeedCandidates(src.urls);
    if (!result.ok) {
      // try scraping the first URL as a last resort
      const scraped = await basicScrape(src.urls[0]);
      scraped.forEach(s => aggregated.push({
        source: src.name,
        sourceUrl: src.urls[0],
        title: s.title,
        link: s.link,
        publishedAt: undefined
      }));
      continue;
    }

    const { feed, url } = result;
    for (const it of feed.items) {
      const item = normalizeItem(src.name, url, it);
      if (!item.link) continue;
      if (item.publishedAt && !isAfter(new Date(item.publishedAt), since)) continue;
      aggregated.push(item);
    }
  }

  // de‑dupe by link or title
  const seen = new Set();
  const deduped = aggregated.filter(it => {
    const key = (it.link || it.title).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // sort by publishedAt desc
  deduped.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  const payload = {
    generatedAt: formatISO(new Date()),
    windowDays: days,
    count: deduped.length,
    items: deduped
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2));
  return payload;
}

// Endpoint: trigger aggregation now
app.post("/api/fetch", async (req, res) => {
  try {
    const days = z.number().int().positive().optional().parse(req.body?.days) || 7;
    const data = await aggregate(days);
    res.json(data);
  } catch (e) {
    log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Endpoint: read latest
app.get("/api/news", (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json({ generatedAt: null, items: [] });
    const json = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});

// Schedule: every Monday 09:00 America/Denver
cron.schedule("0 9 * * 1", async () => {
  try {
    console.log("[cron] Weekly aggregation running…");
    await aggregate(7);
  } catch (e) {
    console.error("[cron] failed", e);
  }
}, { timezone: "America/Denver" });