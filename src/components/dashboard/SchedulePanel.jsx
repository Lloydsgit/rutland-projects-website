const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Play, Pause, Trash2, Clock } from "lucide-react";

const PRESETS = [
  { name: "Daily OSINT Sweep", agent_task: "Scan social media and dark web sources for target keywords", frequency: "daily", hour: 8, category: "osint" },
  { name: "Weekly Market Synthesis", agent_task: "Aggregate and synthesize market data, funding rounds, and competitor moves", frequency: "weekly", day_of_week: 1, hour: 9, category: "market" },
  { name: "Daily News Brief", agent_task: "Compile top news headlines and summarize key developments", frequency: "daily", hour: 7, category: "research" },
  { name: "Security Scan", agent_task: "Monitor for security vulnerabilities, breach alerts, and threat intelligence", frequency: "daily", hour: 6, category: "security" },
];

const FREQ_COLOR = { hourly: "rgba(255,220,80,0.7)", daily: "rgba(80,200,255,0.7)", weekly: "rgba(160,80,255,0.7)", monthly: "rgba(80,255,160,0.7)", custom: "rgba(255,80,80,0.7)" };
const CAT_ICONS = { osint: "🔍", research: "🧠", market: "📈", security: "🛡️", content: "✍️", custom: "⚡" };

function nextRunLabel(sched) {
  if (!sched.next_run) {
    if (sched.frequency === "daily") return `Today at ${sched.hour || 9}:00`;
    if (sched.frequency === "weekly") return `Next ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][sched.day_of_week || 1]}`;
    return "Scheduled";
  }
  return new Date(sched.next_run).toLocaleDateString();
}

export default function SchedulePanel() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", agent_task: "", frequency: "daily", hour: 9, category: "research" });

  const { data: schedules = [] } = useQuery({
    queryKey: ["agent-schedules"],
    queryFn: () => db.entities.AgentSchedule.list("-created_date"),
  });

  const create = useMutation({
    mutationFn: (d) => db.entities.AgentSchedule.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agent-schedules"] }); setShowAdd(false); },
  });

  const remove = useMutation({
    mutationFn: (id) => db.entities.AgentSchedule.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-schedules"] }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }) => db.entities.AgentSchedule.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-schedules"] }),
  });

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
          <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.35)" }}>AUTOMATION SCHEDULE</p>
          <span className="text-[8px] font-mono px-1.5 rounded" style={{ border: "1px solid rgba(200,40,40,0.2)", color: "rgba(255,80,80,0.3)" }}>{schedules.filter((s) => s.status === "active").length} ACTIVE</span>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ color: "rgba(255,80,80,0.4)" }}><Plus className="w-3.5 h-3.5" /></button>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {PRESETS.map((p) => (
          <button key={p.name} onClick={() => create.mutate({ ...p, status: "active", run_count: 0 })}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono transition-all"
            style={{ border: "1px solid rgba(200,40,40,0.15)", color: "rgba(255,120,120,0.5)", background: "rgba(15,4,4,0.5)" }}>
            {CAT_ICONS[p.category]} {p.name}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 rounded-lg space-y-2" style={{ border: "1px solid rgba(200,40,40,0.15)", background: "rgba(15,4,4,0.8)" }}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Schedule name..."
              className="w-full bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }} />
            <textarea value={form.agent_task} onChange={(e) => setForm({ ...form, agent_task: e.target.value })} placeholder="Task description..."
              rows={2} className="w-full bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded resize-none" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }} />
            <div className="grid grid-cols-3 gap-2">
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }}>
                {["hourly", "daily", "weekly", "monthly"].map((f) => <option key={f} value={f} style={{ background: "#080204" }}>{f}</option>)}
              </select>
              <input type="number" min={0} max={23} value={form.hour} onChange={(e) => setForm({ ...form, hour: +e.target.value })} placeholder="Hour (0-23)"
                className="bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }} />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-transparent text-[10px] font-mono focus:outline-none px-2 py-1 rounded" style={{ border: "1px solid rgba(200,50,50,0.15)", color: "rgba(255,200,200,0.6)" }}>
                {["osint", "research", "market", "security", "content", "custom"].map((c) => <option key={c} value={c} style={{ background: "#080204" }}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => create.mutate({ ...form, status: "active", run_count: 0 })} disabled={!form.name}
                className="px-3 py-1 rounded text-[10px] font-mono" style={{ background: "rgba(200,20,20,0.3)", color: "rgba(255,150,150,0.8)" }}>SCHEDULE</button>
              <button onClick={() => setShowAdd(false)} className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        {schedules.map((sched) => (
          <div key={sched.id} className="flex items-center gap-2 px-2 py-2 rounded-lg"
            style={{ background: "rgba(15,4,4,0.6)", border: "1px solid rgba(200,30,30,0.08)", opacity: sched.status === "paused" ? 0.5 : 1 }}>
            <span className="text-sm flex-shrink-0">{CAT_ICONS[sched.category] || "⚡"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono truncate" style={{ color: "rgba(255,190,190,0.65)" }}>{sched.name}</span>
                <span className="text-[8px] font-mono px-1 rounded" style={{ color: FREQ_COLOR[sched.frequency] }}>{sched.frequency}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" style={{ color: "rgba(200,80,80,0.3)" }} />
                <span className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>{nextRunLabel(sched)}</span>
                {sched.run_count > 0 && <span className="text-[8px] font-mono ml-1" style={{ color: "rgba(200,80,80,0.25)" }}>ran {sched.run_count}×</span>}
              </div>
            </div>
            <button onClick={() => toggle.mutate({ id: sched.id, status: sched.status === "active" ? "paused" : "active" })}
              style={{ color: sched.status === "active" ? "rgba(255,180,80,0.5)" : "rgba(80,255,160,0.5)" }}>
              {sched.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button onClick={() => remove.mutate(sched.id)} style={{ color: "rgba(200,60,60,0.3)" }}><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        {schedules.length === 0 && (
          <p className="text-[9px] font-mono text-center py-2" style={{ color: "rgba(200,80,80,0.2)" }}>Click a preset above or add custom schedule</p>
        )}
      </div>
    </div>
  );
}