import Parser from "rss-parser";
import cheerio from "cheerio";

export const parser = new Parser({ timeout: 20000 });

export async function tryFetch(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

export async function fetchFeedCandidates(candidates) {
  for (const url of candidates) {
    try {
      const feed = await parser.parseURL(url);
      if (feed?.items?.length) return { feed, url, ok: true };
    } catch {
      // try next candidate
    }
  }
  return { ok: false };
}

export async function basicScrape(url, max = 10) {
  try {
    const res = await tryFetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const items = [];
    $("article, .post, .entry").each((_, el) => {
      const a = $(el).find("a[href]").first();
      const title = a.text().trim();
      const link = a.attr("href");
      if (title && link) items.push({ title, link });
    });
    return items.slice(0, max);
  } catch {
    return [];
  }
}

export function normalizeItem(srcName, srcUrl, it) {
  const published = it.isoDate || it.pubDate || it.published || it.date;
  return {
    source: srcName,
    sourceUrl: srcUrl,
    title: it.title?.trim() || "(untitled)",
    link: it.link,
    author: it.creator || it.author || it.dc?.creator || undefined,
    publishedAt: published ? new Date(published).toISOString() : undefined,
    summary: it.contentSnippet || it.summary || undefined
  };
}
