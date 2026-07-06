const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Brain, GitBranch, Globe, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContextSidebar({ currentPath }) {
  const [open, setOpen] = useState(false);

  const { data: memories = [] } = useQuery({
    queryKey: ["sidebar-memories"],
    queryFn: () => db.entities.Memory.filter({ active: true }, "-importance", 5),
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ["sidebar-workflows"],
    queryFn: () => db.entities.Workflow.filter({ status: "active" }, "-updated_date", 4),
  });

  const { data: feeds = [] } = useQuery({
    queryKey: ["sidebar-feeds"],
    queryFn: () => db.entities.DataFeed.filter({ status: "active" }, "-updated_date", 4),
  });

  const STATUS_COLOR = {
    active: "rgba(80,255,160,0.7)",
    running: "rgba(255,180,80,0.8)",
    draft: "rgba(150,150,150,0.5)",
    completed: "rgba(80,160,255,0.7)",
  };

  return (
    <div className="relative flex-shrink-0 h-full">
      {/* Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-4 h-12 rounded-l transition-all"
        style={{ background: "rgba(20,5,5,0.9)", border: "1px solid rgba(200,30,30,0.12)", borderRight: "none", color: "rgba(255,80,80,0.35)" }}
        title={open ? "Close context panel" : "Open context panel"}
      >
        {open ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-hidden flex flex-col"
            style={{ background: "rgba(8,2,2,0.92)", borderLeft: "1px solid rgba(200,30,30,0.1)" }}
          >
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Memory Nodes */}
              <section>
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-3 h-3" style={{ color: "rgba(160,80,255,0.7)" }} />
                  <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(200,80,200,0.5)" }}>MEMORY</span>
                </div>
                <div className="space-y-1.5">
                  {memories.length === 0 && <p className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.25)" }}>No active nodes</p>}
                  {memories.map((m) => (
                    <div key={m.id} className="rounded-lg p-2" style={{ background: "rgba(160,80,255,0.05)", border: "1px solid rgba(160,80,255,0.1)" }}>
                      <p className="text-[10px] font-mono truncate" style={{ color: "rgba(220,180,255,0.65)" }}>{m.title}</p>
                      <p className="text-[9px] font-mono mt-0.5 truncate" style={{ color: "rgba(160,80,255,0.4)" }}>{m.type}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Active Workflows */}
              <section>
                <div className="flex items-center gap-1.5 mb-2">
                  <GitBranch className="w-3 h-3" style={{ color: "rgba(80,200,255,0.7)" }} />
                  <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(80,200,255,0.5)" }}>WORKFLOWS</span>
                </div>
                <div className="space-y-1.5">
                  {workflows.length === 0 && <p className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.25)" }}>No active workflows</p>}
                  {workflows.map((w) => (
                    <div key={w.id} className="rounded-lg p-2" style={{ background: "rgba(80,200,255,0.04)", border: "1px solid rgba(80,200,255,0.1)" }}>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[10px] font-mono truncate flex-1" style={{ color: "rgba(180,220,255,0.65)" }}>{w.name}</p>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[w.status] || "rgba(150,150,150,0.5)" }} />
                      </div>
                      <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(80,200,255,0.4)" }}>{w.status} · {w.trigger}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Data Feeds */}
              <section>
                <div className="flex items-center gap-1.5 mb-2">
                  <Globe className="w-3 h-3" style={{ color: "rgba(80,255,160,0.7)" }} />
                  <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(80,255,160,0.5)" }}>FEEDS</span>
                </div>
                <div className="space-y-1.5">
                  {feeds.length === 0 && <p className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.25)" }}>No active feeds</p>}
                  {feeds.map((f) => (
                    <div key={f.id} className="rounded-lg p-2" style={{ background: "rgba(80,255,160,0.04)", border: "1px solid rgba(80,255,160,0.1)" }}>
                      <p className="text-[10px] font-mono truncate" style={{ color: "rgba(180,255,220,0.65)" }}>{f.name}</p>
                      <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(80,255,160,0.4)" }}>{f.source_type}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-2 flex items-center gap-1.5" style={{ borderTop: "1px solid rgba(200,30,30,0.08)" }}>
              <Zap className="w-2.5 h-2.5" style={{ color: "rgba(255,80,80,0.3)" }} />
              <span className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>CONTEXT LIVE</span>
              <div className="w-1 h-1 rounded-full bg-green-500/50 animate-pulse ml-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}