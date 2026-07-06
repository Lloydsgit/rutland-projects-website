const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Rss, Plus, ExternalLink, Globe, AlertTriangle, Trash2 } from "lucide-react";

const SOURCE_ICONS = { rss: "📡", twitter: "🐦", linkedin: "💼", reddit: "🟠", osint: "🔍", news_api: "📰", custom: "⚡" };
const STATUS_COLOR = { active: "rgba(80,255,160,0.7)", paused: "rgba(255,180,80,0.5)", error: "rgba(255,60,60,0.7)" };

const PRESET_FEEDS = [
  { name: "Hacker News", source_type: "rss", url: "https://news.ycombinator.com", keywords: ["AI", "security", "startup"] },
  { name: "Google News - India", source_type: "news_api", url: "https://news.google.com/rss?hl=en-IN", keywords: ["India", "news"] },
  { name: "TechCrunch", source_type: "rss", url: "https://techcrunch.com", keywords: ["funding", "launch"] },
];

export default function DataFeedPanel() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", source_type: "rss", url: "", keywords: "" });

  const { data: feeds = [] } = useQuery({
    queryKey: ["data-feeds"],
    queryFn: () => db.entities.DataFeed.list("-created_date"),
  });

  const create = useMutation({
    mutationFn: (d) => db.entities.DataFeed.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["data-feeds"] }); setShowAdd(false); setForm({ name: "", source_type: "rss", url: "", keywords: "" }); },
  });

  const remove = useMutation({
    mutationFn: (id) => db.entities.DataFeed.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["data-feeds"] }),
  });

  const addPreset = (preset) => {
    create.mutate({ ...preset, status: "active", item_count: 0 });
  };

  const handleCreate = () => {
    create.mutate({
      name: form.name,
      source_type: form.source_type,
      url: form.url,
      keywords: form.keywords ? form.keywords.split(",").map((k) => k.trim()) : [],
      status: "active",
      item_count: 0,
    });
  };

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rss className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
          <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.35)" }}>LIVE DATA FEEDS</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ color: "rgba(255,80,80,0.4)" }}><Plus className="w-3.5 h-3.5" /></button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 rounded-lg space-y-2" style={{ border: "1px solid rgba(200,40,40,0.15)", background: "rgba(15,4,4,0.8)" }}>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Feed name..."
                className="bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }} />
              <select value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}
                className="bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }}>
                {["rss", "twitter", "linkedin", "reddit", "osint", "news_api", "custom"].map((t) => <option key={t} value={t} style={{ background: "#080204" }}>{t}</option>)}
              </select>
            </div>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Source URL..."
              className="w-full bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }} />
            <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="Keywords (comma-separated)..."
              className="w-full bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }} />
            <div className="flex gap-2 items-center">
              <button onClick={handleCreate} disabled={!form.name} className="px-3 py-1 rounded text-[10px] font-mono" style={{ background: "rgba(200,20,20,0.3)", color: "rgba(255,150,150,0.8)" }}>ADD FEED</button>
              <span className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>— or quick add:</span>
              {PRESET_FEEDS.map((p) => (
                <button key={p.name} onClick={() => addPreset(p)} className="px-2 py-0.5 rounded text-[9px] font-mono"
                  style={{ border: "1px solid rgba(200,40,40,0.2)", color: "rgba(255,130,130,0.5)" }}>{p.name}</button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {feeds.length === 0 && (
        <p className="text-[9px] font-mono text-center py-3" style={{ color: "rgba(200,80,80,0.2)" }}>No feeds configured — add one above</p>
      )}
      <div className="space-y-1.5">
        {feeds.map((feed) => (
          <div key={feed.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(15,4,4,0.6)", border: "1px solid rgba(200,30,30,0.08)" }}>
            <span className="text-sm">{SOURCE_ICONS[feed.source_type] || "📡"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono truncate" style={{ color: "rgba(255,190,190,0.65)" }}>{feed.name}</span>
                <span className="text-[8px] font-mono px-1 rounded" style={{ background: "rgba(200,30,30,0.1)", color: STATUS_COLOR[feed.status] }}>{feed.status}</span>
              </div>
              {(feed.keywords || []).length > 0 && (
                <div className="flex gap-1 mt-0.5">
                  {feed.keywords.slice(0, 3).map((k) => (
                    <span key={k} className="text-[8px] font-mono px-1 rounded" style={{ background: "rgba(200,40,40,0.08)", color: "rgba(255,100,100,0.4)" }}>{k}</span>
                  ))}
                </div>
              )}
            </div>
            {feed.url && (
              <a href={feed.url} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(200,80,80,0.35)" }}>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button onClick={() => remove.mutate(feed.id)} style={{ color: "rgba(200,60,60,0.3)" }}><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}