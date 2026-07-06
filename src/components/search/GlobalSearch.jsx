const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";

import { Search, X, Brain, GitBranch, Rss, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Cmd+/ to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const timer = setTimeout(async () => {
      const [memories, workflows, feeds] = await Promise.all([
        db.entities.Memory.list().catch(() => []),
        db.entities.Workflow.list().catch(() => []),
        db.entities.DataFeed.list().catch(() => []),
      ]);
      const hits = [];
      memories.forEach((m) => {
        if (m.title?.toLowerCase().includes(q) || m.content?.toLowerCase().includes(q)) {
          hits.push({ type: "memory", icon: Brain, label: m.title, sub: m.type, id: m.id, path: "/memory" });
        }
      });
      workflows.forEach((w) => {
        if (w.name?.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q)) {
          hits.push({ type: "workflow", icon: GitBranch, label: w.name, sub: w.status, id: w.id, path: "/workflows" });
        }
      });
      feeds.forEach((f) => {
        if (f.name?.toLowerCase().includes(q)) {
          hits.push({ type: "feed", icon: Rss, label: f.name, sub: f.source_type, id: f.id, path: "/dashboard" });
        }
      });
      setResults(hits.slice(0, 10));
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setOpen(false);
    setQuery("");
    navigate(item.path);
  };

  const TYPE_COLOR = {
    memory: "rgba(160,80,255,0.7)",
    workflow: "rgba(80,200,255,0.7)",
    feed: "rgba(80,255,160,0.7)",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-mono transition-all"
        style={{ border: "1px solid rgba(255,80,80,0.12)", color: "rgba(255,120,120,0.35)", background: "rgba(10,3,3,0.5)" }}
        title="Global Search (⌘/)"
      >
        <Search className="w-3 h-3" />
        <span className="hidden lg:inline">Search…</span>
        <span className="hidden lg:inline opacity-50">⌘/</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: "rgba(8,2,2,0.97)", border: "1px solid rgba(200,30,30,0.2)", boxShadow: "0 24px 80px rgba(200,0,0,0.15)" }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(200,30,30,0.1)" }}>
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,80,80,0.5)" }} />
                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Memory, Workflows, Feeds…"
                  className="flex-1 bg-transparent text-sm font-mono text-foreground/80 placeholder:text-foreground/20 focus:outline-none" />
                {query && <button onClick={() => setQuery("")}><X className="w-3.5 h-3.5 text-foreground/30" /></button>}
              </div>

              {results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto py-2">
                  {results.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button key={i} onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 transition-colors text-left">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TYPE_COLOR[item.type] }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-foreground/70 truncate">{item.label}</p>
                          <p className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.4)" }}>{item.type} · {item.sub}</p>
                        </div>
                        <Zap className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "rgba(255,80,80,0.3)" }} />
                      </button>
                    );
                  })}
                </div>
              ) : query ? (
                <div className="py-8 text-center text-[11px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>No results for "{query}"</div>
              ) : (
                <div className="py-6 text-center text-[11px] font-mono" style={{ color: "rgba(200,80,80,0.2)" }}>Type to search Memory · Workflows · Data Feeds</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}