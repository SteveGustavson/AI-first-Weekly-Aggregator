export const FEEDS = [
  // Official frontier & platform blogs (multiple candidate URLs to avoid 404s)
  {
    name: "Google AI (The Keyword)",
    tags: ["frontier", "platform"],
    urls: [
      "https://blog.google/rss/", // site-wide
      "https://blog.google/technology/ai/rss/" // category (works in most regions)
    ]
  },
  {
    name: "Google DeepMind Blog",
    tags: ["frontier", "research"],
    urls: [
      "https://deepmind.com/blog/feed/basic",
      "https://deepmind.google/discover/blog/rss/"
    ]
  },
  {
    name: "OpenAI Blog",
    tags: ["frontier"],
    urls: [
      "https://openai.com/feed.xml",
      "https://blog.openai.com/rss", // legacy
      "https://openai.com/blog/rss.xml" // community‑referenced fallback
    ]
  },
  {
    name: "Anthropic News",
    tags: ["frontier"],
    urls: [
      "https://www.anthropic.com/news/rss.xml",
      "https://www.anthropic.com/rss.xml" // fallback if they expose a root feed
    ]
  },
  {
    name: "Microsoft Research Blog",
    tags: ["research"],
    urls: [
      "https://www.microsoft.com/en-us/research/blog/feed/"
    ]
  },
  {
    name: "Google Research Blog",
    tags: ["research"],
    urls: [
      "https://research.google/blog/feed/",
      "https://blog.research.google/atom.xml"
    ]
  },
  // Ecosystem / engineering
  {
    name: "NVIDIA Technical Blog (AI)",
    tags: ["engineering", "hardware"],
    urls: ["https://developer.nvidia.com/blog/category/ai/feed/"]
  },
  {
    name: "Hugging Face Blog",
    tags: ["open", "tools"],
    urls: ["https://huggingface.co/blog/feed.xml"]
  },
  {
    name: "Papers with Code – Trending",
    tags: ["research", "trending"],
    urls: ["https://paperswithcode.com/trending/rss"]
  },
  {
    name: "arXiv cs.LG",
    tags: ["research"],
    urls: ["https://arxiv.org/rss/cs.LG"]
  }
];