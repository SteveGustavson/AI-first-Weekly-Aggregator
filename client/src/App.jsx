import React, { useEffect, useMemo, useState } from "react";

function useNews() {
  const [data, setData] = useState({ items: [], generatedAt: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:5174";
    fetch(`${url}/api/news`)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  return { data, loading, error };
}

export default function App() {
  const { data, loading, error } = useNews();
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("all");

  const sources = useMemo(() => {
    const s = new Set(data.items.map(i => i.source));
    return ["all", ...Array.from(s).sort()];
  }, [data.items]);

  const filtered = useMemo(() => {
    return data.items.filter(i => {
      const okQ = q
        ? (i.title?.toLowerCase().includes(q.toLowerCase()) ||
           i.summary?.toLowerCase().includes(q.toLowerCase()))
        : true;
      const okS = src === "all" ? true : i.source === src;
      return okQ && okS;
    });
  }, [data.items, q, src]);

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container">Error: {String(error)}</div>;

  return (
    <div className="container">
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>AI-First Weekly</h1>
        <p style={{ opacity: 0.7, fontSize: 12 }}>
          Updated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "never"}
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search headlines…"
          style={{ flex: 1, minWidth: 240 }}
        />
        <select value={src} onChange={e => setSrc(e.target.value)}>
          {sources.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
        {filtered.map((item, idx) => (
          <li key={idx} className="card">
            <div style={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 11, opacity: 0.6 }}>
              {item.source}
            </div>
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              style={{ display: "block", fontSize: 18, fontWeight: 700, marginTop: 4 }}
            >
              {item.title}
            </a>
            {item.publishedAt && (
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                {new Date(item.publishedAt).toLocaleString()}
              </div>
            )}
            {item.summary && (
              <p style={{ fontSize: 14, marginTop: 8, opacity: 0.85 }}>{item.summary}</p>
            )}
          </li>
        ))}
      </ul>

      <footer style={{ marginTop: 24, fontSize: 12, opacity: 0.6 }}>
        <p>
          Sources configurable in <code>server/feeds.js</code>. Backend runs every Monday 09:00 America/Denver
          or on demand via <code>POST /api/fetch</code>.
        </p>
      </footer>
    </div>
  );
}
