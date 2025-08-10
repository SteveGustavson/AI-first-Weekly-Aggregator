import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);

// ===============================
// client/src/App.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";

function useNews() {
  const [data, setData] = useState({ items: [], generatedAt: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:5174";
    fetch(`${url}/api/news`).then(r => r.json()).then(setData).catch(setError).finally(() => setLoading(false));
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
      const okQ = q ? (i.title?.toLowerCase().includes(q.toLowerCase()) || i.summary?.toLowerCase().includes(q.toLowerCase())) : true;
      const okS = src === "all" ? true : i.source === src;
      return okQ && okS;
    });
  }, [data.items, q, src]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6">Error: {String(error)}</div>;

  return (
    <div className="min-h-screen p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">AI‑First Weekly</h1>
        <p className="text-sm opacity-70">Updated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "never"}</p>
      </header>

      <div className="flex gap-3 mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search headlines…"
          className="border rounded-xl px-3 py-2 w-full max-w-md"
        />
        <select value={src} onChange={e => setSrc(e.target.value)} className="border rounded-xl px-3 py-2">
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <ul className="grid gap-4">
        {filtered.map((item, idx) => (
          <li key={idx} className="border rounded-2xl p-4 hover:shadow">
            <div className="text-xs uppercase tracking-wide opacity-60">{item.source}</div>
            <a href={item.link} target="_blank" rel="noreferrer" className="block text-lg font-semibold leading-snug mt-1">
              {item.title}
            </a>
            {item.publishedAt && (
              <div className="text-xs opacity-60 mt-1">{new Date(item.publishedAt).toLocaleString()}</div>
            )}
            {item.summary && <p className="text-sm mt-2 opacity-80">{item.summary}</p>}
          </li>
        ))}
      </ul>

      <footer className="mt-8 text-xs opacity-60">
        <p>Sources configurable in <code>server/feeds.js</code>. Backend fetch runs every Monday 09:00 America/Denver or on demand via <code>POST /api/fetch</code>.</p>
      </footer>
    </div>
  );
}
