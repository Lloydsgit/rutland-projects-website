const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plus, Trash2, Star, Tag, ChevronDown, ChevronUp } from "lucide-react";

const TYPE_COLORS = {
  goal: "rgba(255,80,80,0.7)",
  milestone: "rgba(80,255,160,0.7)",
  workflow: "rgba(80,160,255,0.7)",
  preference: "rgba(255,200,80,0.7)",
  research: "rgba(160,80,255,0.7)",
  decision: "rgba(255,120,80,0.7)",
  note: "rgba(180,180,180,0.5)",
};

export default function Memory() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", type: "note", importance: 5, tags: "" });
  const [filterType, setFilterType] = useState("all");

  const { data: memories = [] } = useQuery({
    queryKey: ["memories"],
    queryFn: () => db.entities.Memory.list("-importance"),
  });

  const create = useMutation({
    mutationFn: (data) => db.entities.Memory.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memories"] }); setShowForm(false); setForm({ title: "", content: "", type: "note", importance: 5, tags: "" }); },
  });

  const remove = useMutation({
    mutationFn: (id) => db.entities.Memory.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });

  const filtered = filterType === "all" ? memories : memories.filter((m) => m.type === filterType);

  return (
    <div className="h-full overflow-y-auto p-5" style={{ color: "rgba(240,200,200,0.8)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
          <h1 className="font-heading text-sm tracking-[0.3em]" style={{ fontFamily: "var(--font-heading)", color: "rgba(255,180,180,0.7)" }}>MEMORY ENGINE</h1>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ border: "1px solid rgba(255,60,60,0.2)", color: "rgba(255,80,80,0.4)" }}>{memories.length} NODES</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
          style={{ border: "1px solid rgba(220,40,40,0.3)", color: "rgba(255,120,120,0.7)", background: showForm ? "rgba(200,20,20,0.15)" : "transparent" }}
        >
          <Plus className="w-3 h-3" /> ENCODE MEMORY
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {["all", "goal", "milestone", "workflow", "research", "decision", "note"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className="px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-all"
            style={{
              background: filterType === t ? "rgba(200,20,20,0.2)" : "transparent",
              border: filterType === t ? "1px solid rgba(220,40,40,0.35)" : "1px solid rgba(255,80,80,0.08)",
              color: filterType === t ? "rgba(255,120,120,0.9)" : "rgba(200,100,100,0.35)",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* New memory form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-4 rounded-xl p-4 space-y-3"
            style={{ border: "1px solid rgba(220,40,40,0.2)", background: "rgba(20,5,5,0.6)" }}
          >
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Memory title..." className="w-full bg-transparent text-sm font-mono focus:outline-none"
              style={{ color: "rgba(255,200,200,0.8)", borderBottom: "1px solid rgba(200,50,50,0.2)", paddingBottom: "6px" }} />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Memory content..." rows={3} className="w-full bg-transparent text-xs font-mono focus:outline-none resize-none"
              style={{ color: "rgba(255,180,180,0.6)" }} />
            <div className="flex items-center gap-3 flex-wrap">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="bg-transparent text-[11px] font-mono focus:outline-none"
                style={{ color: "rgba(255,120,120,0.6)", border: "1px solid rgba(200,50,50,0.2)", padding: "2px 6px", borderRadius: "6px" }}>
                {["goal", "milestone", "workflow", "preference", "research", "decision", "note"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-1.5">
                <Star className="w-3 h-3" style={{ color: "rgba(255,160,80,0.5)" }} />
                <input type="range" min={1} max={10} value={form.importance} onChange={(e) => setForm({ ...form, importance: parseInt(e.target.value) })} className="w-20" />
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,160,80,0.5)" }}>{form.importance}</span>
              </div>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tags, comma, separated" className="bg-transparent text-[11px] font-mono focus:outline-none"
                style={{ color: "rgba(255,150,150,0.5)", borderBottom: "1px solid rgba(200,50,50,0.15)", paddingBottom: "2px" }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => create.mutate({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) })}
                disabled={!form.title || !form.content}
                className="px-3 py-1.5 rounded text-[11px] font-mono transition-all"
                style={{ background: "rgba(200,20,20,0.3)", border: "1px solid rgba(220,40,40,0.4)", color: "rgba(255,150,150,0.8)" }}>
                ENCODE
              </button>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded text-[11px] font-mono"
                style={{ color: "rgba(200,100,100,0.4)" }}>CANCEL</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 font-mono text-[11px]" style={{ color: "rgba(200,80,80,0.2)" }}>NO MEMORIES ENCODED</div>
        )}
        {filtered.map((mem) => (
          <motion.div key={mem.id} layout
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(200,30,30,0.12)", background: "rgba(12,4,4,0.7)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(expanded === mem.id ? null : mem.id)}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[mem.type] || TYPE_COLORS.note }} />
              <span className="flex-1 text-xs font-mono truncate" style={{ color: "rgba(255,200,200,0.7)" }}>{mem.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: TYPE_COLORS[mem.type], border: `1px solid ${TYPE_COLORS[mem.type]}40` }}>{mem.type?.toUpperCase()}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.round((mem.importance || 5) / 2) }).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full" style={{ background: "rgba(255,160,80,0.5)" }} />
                  ))}
                </div>
                {expanded === mem.id ? <ChevronUp className="w-3 h-3" style={{ color: "rgba(200,80,80,0.4)" }} /> : <ChevronDown className="w-3 h-3" style={{ color: "rgba(200,80,80,0.4)" }} />}
              </div>
            </div>
            <AnimatePresence>
              {expanded === mem.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-3 pt-0" style={{ borderTop: "1px solid rgba(200,30,30,0.08)" }}>
                    <p className="text-[11px] font-mono leading-relaxed mt-2" style={{ color: "rgba(255,180,180,0.5)" }}>{mem.content}</p>
                    {mem.tags?.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <Tag className="w-2.5 h-2.5" style={{ color: "rgba(200,80,80,0.3)" }} />
                        {mem.tags.map((tag) => (
                          <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(200,20,20,0.1)", color: "rgba(255,120,120,0.4)" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => remove.mutate(mem.id)} className="mt-3 flex items-center gap-1 text-[10px] font-mono transition-colors"
                      style={{ color: "rgba(200,60,60,0.35)" }}>
                      <Trash2 className="w-2.5 h-2.5" /> PURGE
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}