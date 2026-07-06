const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Globe, Plus, Play, Trash2, Monitor, Bot, Eye, ChevronDown, ChevronUp, ExternalLink, Chrome, Flame } from "lucide-react";

const ENGINE_ICONS = { chrome: "🌐", brave: "🦁", firefox: "🦊", tor: "🧅", edge: "🔷" };
const ENGINE_COLORS = {
  chrome: "rgba(66,133,244,0.7)", brave: "rgba(255,80,50,0.7)",
  firefox: "rgba(255,120,0,0.7)", tor: "rgba(120,80,200,0.7)", edge: "rgba(0,120,215,0.7)"
};

const QUICK_TABS = [
  { title: "YouTube", url: "https://youtube.com", engine: "chrome" },
  { title: "Google News", url: "https://news.google.com", engine: "chrome" },
  { title: "GitHub", url: "https://github.com", engine: "chrome" },
  { title: "DuckDuckGo", url: "https://duckduckgo.com", engine: "brave" },
];

export default function WorkspaceManager() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: workspaces = [] } = useQuery({
    queryKey: ["browser-workspaces"],
    queryFn: () => db.entities.BrowserWorkspace.list("-created_date"),
  });

  const create = useMutation({
    mutationFn: (data) => db.entities.BrowserWorkspace.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["browser-workspaces"] }); setShowNew(false); setForm({ name: "", description: "" }); },
  });

  const remove = useMutation({
    mutationFn: (id) => db.entities.BrowserWorkspace.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["browser-workspaces"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => db.entities.BrowserWorkspace.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["browser-workspaces"] }),
  });

  const restoreWorkspace = (ws) => {
    // Open each tab
    (ws.tabs || []).forEach((tab, i) => {
      if (tab.url) setTimeout(() => window.open(tab.url, "_blank"), i * 300);
    });
    update.mutate({ id: ws.id, data: { status: "active", last_session: new Date().toISOString() } });
  };

  const openTab = (url) => window.open(url, "_blank");

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
          <span className="text-[11px] font-mono tracking-widest" style={{ color: "rgba(255,150,150,0.6)" }}>BROWSER WORKSPACES</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ border: "1px solid rgba(255,60,60,0.2)", color: "rgba(255,80,80,0.4)" }}>{workspaces.length}</span>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-all"
          style={{ border: "1px solid rgba(220,40,40,0.25)", color: "rgba(255,120,120,0.6)" }}>
          <Plus className="w-3 h-3" /> NEW
        </button>
      </div>

      {/* Quick launch */}
      <div className="flex gap-1.5 flex-wrap">
        {QUICK_TABS.map((t) => (
          <button key={t.url} onClick={() => openTab(t.url)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all"
            style={{ background: "rgba(20,5,5,0.8)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,150,150,0.5)" }}>
            <span>{ENGINE_ICONS[t.engine]}</span>
            {t.title}
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        ))}
      </div>

      {/* New workspace form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-3 space-y-2" style={{ border: "1px solid rgba(220,40,40,0.2)", background: "rgba(15,4,4,0.7)" }}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Workspace name..."
              className="w-full bg-transparent text-xs font-mono focus:outline-none" style={{ color: "rgba(255,200,200,0.7)", borderBottom: "1px solid rgba(200,50,50,0.2)", paddingBottom: "4px" }} />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..."
              className="w-full bg-transparent text-xs font-mono focus:outline-none" style={{ color: "rgba(255,180,180,0.5)" }} />
            <div className="flex gap-2">
              <button onClick={() => create.mutate({ ...form, tabs: [], agents: [], monitoring_rules: [] })} disabled={!form.name}
                className="px-3 py-1 rounded text-[10px] font-mono" style={{ background: "rgba(200,20,20,0.3)", border: "1px solid rgba(220,40,40,0.35)", color: "rgba(255,150,150,0.8)" }}>
                CREATE
              </button>
              <button onClick={() => setShowNew(false)} className="px-3 py-1 rounded text-[10px] font-mono" style={{ color: "rgba(200,100,100,0.4)" }}>CANCEL</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace list */}
      {workspaces.length === 0 && !showNew && (
        <p className="text-center py-6 text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.2)" }}>NO WORKSPACES SAVED</p>
      )}
      {workspaces.map((ws) => (
        <motion.div key={ws.id} layout className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(200,30,30,0.15)", background: "rgba(10,3,3,0.8)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: ws.status === "active" ? "rgba(255,80,80,0.8)" : "rgba(255,80,80,0.25)" }} />
            <span className="flex-1 text-xs font-mono truncate" style={{ color: "rgba(255,200,200,0.7)" }}>{ws.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono" style={{ color: "rgba(200,100,100,0.4)" }}>{(ws.tabs || []).length} tabs</span>
              <button onClick={() => restoreWorkspace(ws)} title="Restore workspace"
                className="p-1 rounded transition-all" style={{ color: "rgba(255,100,100,0.6)" }}>
                <Play className="w-3 h-3" />
              </button>
              <button onClick={() => remove.mutate(ws.id)} className="p-1 rounded" style={{ color: "rgba(200,60,60,0.35)" }}>
                <Trash2 className="w-3 h-3" />
              </button>
              <button onClick={() => setExpanded(expanded === ws.id ? null : ws.id)} className="p-1 rounded" style={{ color: "rgba(200,80,80,0.4)" }}>
                {expanded === ws.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {expanded === ws.id && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-3 pb-3 space-y-2" style={{ borderTop: "1px solid rgba(200,30,30,0.08)" }}>
                  {/* Tabs */}
                  {(ws.tabs || []).length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.3)" }}>TABS</p>
                      {ws.tabs.map((tab, i) => (
                        <button key={i} onClick={() => openTab(tab.url)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all"
                          style={{ background: "rgba(20,5,5,0.5)", border: "1px solid rgba(200,30,30,0.1)" }}>
                          <span>{ENGINE_ICONS[tab.engine] || "🌐"}</span>
                          <span className="flex-1 text-[10px] font-mono truncate" style={{ color: "rgba(255,180,180,0.5)" }}>{tab.title || tab.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "rgba(200,80,80,0.3)" }} />
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Agents */}
                  {(ws.agents || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.3)" }}>AGENTS</p>
                      {ws.agents.map((agent, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1" style={{ borderLeft: "1px solid rgba(200,50,50,0.2)" }}>
                          <Bot className="w-3 h-3" style={{ color: "rgba(255,100,100,0.4)" }} />
                          <span className="text-[10px] font-mono" style={{ color: "rgba(255,180,180,0.5)" }}>{agent.name}</span>
                          <span className="ml-auto text-[9px] font-mono" style={{ color: agent.status === "running" ? "rgba(80,255,120,0.6)" : "rgba(200,80,80,0.3)" }}>{agent.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Monitoring rules */}
                  {(ws.monitoring_rules || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.3)" }}>MONITORS</p>
                      {ws.monitoring_rules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1" style={{ borderLeft: "1px solid rgba(200,50,50,0.2)" }}>
                          <Eye className="w-3 h-3" style={{ color: "rgba(255,100,100,0.4)" }} />
                          <span className="text-[10px] font-mono" style={{ color: "rgba(255,180,180,0.5)" }}>{rule.target}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(ws.tabs || []).length === 0 && (ws.agents || []).length === 0 && (
                    <p className="text-[10px] font-mono text-center py-2" style={{ color: "rgba(200,80,80,0.2)" }}>Empty workspace</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}