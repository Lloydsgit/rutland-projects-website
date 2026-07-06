const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Filter, AlertTriangle, Zap, MapPin, Phone, Mail, Users, Database, Globe, Eye } from "lucide-react";

const EVENT_CONFIG = {
  data_leak: { label: "Data Leak", icon: Database, color: "#ff5050" },
  social_post: { label: "Social Post", icon: Globe, color: "#50c8ff" },
  domain_registration: { label: "Domain Reg", icon: Globe, color: "#80ff50" },
  breach: { label: "Breach", icon: AlertTriangle, color: "#ff3030" },
  location_ping: { label: "Location", icon: MapPin, color: "#ffaa50" },
  phone_found: { label: "Phone Found", icon: Phone, color: "#ff80aa" },
  email_found: { label: "Email Found", icon: Mail, color: "#aa80ff" },
  association: { label: "Association", icon: Users, color: "#50ffaa" },
  alert: { label: "Alert", icon: Zap, color: "#ffff50" },
  manual: { label: "Manual Entry", icon: Eye, color: "#aaaaaa" },
};

const SEV_COLOR = { low: "#50c8ff", medium: "#ffaa50", high: "#ff8050", critical: "#ff3030" };

export default function OsintTimeline() {
  const qc = useQueryClient();
  const [filterType, setFilterType] = useState("all");
  const [filterSev, setFilterSev] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [targetFilter, setTargetFilter] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "", event_type: "manual", description: "", source: "",
    severity: "medium", event_date: new Date().toISOString().slice(0, 16), target_id: ""
  });

  const { data: events = [] } = useQuery({
    queryKey: ["osint-timeline"],
    queryFn: () => db.entities.OsintTimeline.list("-event_date"),
    initialData: []
  });

  const { data: targets = [] } = useQuery({
    queryKey: ["targets-tl"],
    queryFn: () => db.entities.Target.list(),
    initialData: []
  });

  const create = useMutation({
    mutationFn: (data) => db.entities.OsintTimeline.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["osint-timeline"] }); setShowNew(false); setNewEvent({ title: "", event_type: "manual", description: "", source: "", severity: "medium", event_date: new Date().toISOString().slice(0, 16), target_id: "" }); }
  });

  const remove = useMutation({
    mutationFn: (id) => db.entities.OsintTimeline.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["osint-timeline"] })
  });

  const filtered = events.filter(e => {
    const matchType = filterType === "all" || e.event_type === filterType;
    const matchSev = filterSev === "all" || e.severity === filterSev;
    const matchTarget = !targetFilter || e.target_id === targetFilter || targets.find(t => t.id === e.target_id)?.name?.toLowerCase().includes(targetFilter.toLowerCase());
    return matchType && matchSev && matchTarget;
  });

  // Group by date
  const grouped = filtered.reduce((acc, ev) => {
    const date = ev.event_date ? new Date(ev.event_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unknown Date";
    if (!acc[date]) acc[date] = [];
    acc[date].push(ev);
    return acc;
  }, {});

  const getTargetName = (id) => targets.find(t => t.id === id)?.name || id || "Unknown";

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5" style={{ color: "rgba(240,200,200,0.85)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
          <h1 className="text-xs font-heading tracking-[0.4em]"
            style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,100,100,0.7)", fontWeight: 700 }}>
            OSINT TIMELINE
          </h1>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono"
          style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.25)", color: "rgba(255,100,100,0.7)" }}>
          <Plus className="w-3 h-3" /> LOG EVENT
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(200,80,80,0.4)" }} />
        <select value={targetFilter} onChange={e => setTargetFilter(e.target.value)}
          className="px-2 py-1 rounded text-[9px] font-mono focus:outline-none"
          style={{ background: "rgba(15,4,4,0.8)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
          <option value="">All Targets</option>
          {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex gap-1 flex-wrap">
          {["all", ...Object.keys(EVENT_CONFIG)].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-2 py-0.5 rounded text-[8px] font-mono transition-all"
              style={{ background: filterType === t ? "rgba(200,30,30,0.2)" : "transparent", border: `1px solid ${filterType === t ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.08)"}`, color: filterType === t ? "rgba(255,120,120,0.8)" : "rgba(180,80,80,0.3)" }}>
              {t === "all" ? "ALL" : EVENT_CONFIG[t]?.label.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["all", "low", "medium", "high", "critical"].map(s => (
            <button key={s} onClick={() => setFilterSev(s)}
              className="px-2 py-0.5 rounded text-[8px] font-mono transition-all"
              style={{ background: filterSev === s ? "rgba(200,30,30,0.15)" : "transparent", border: `1px solid ${SEV_COLOR[s] || "rgba(200,30,30,0.08)"}20`, color: SEV_COLOR[s] || "rgba(180,80,80,0.3)", opacity: filterSev === s ? 1 : 0.5 }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* New event form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 space-y-3 overflow-hidden"
            style={{ background: "rgba(15,4,4,0.95)", border: "1px solid rgba(200,40,40,0.25)" }}>
            <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>LOG TIMELINE EVENT</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={newEvent.title} onChange={e => setNewEvent(n => ({ ...n, title: e.target.value }))}
                placeholder="Event title"
                className="col-span-2 px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>EVENT TYPE</label>
                <select value={newEvent.event_type} onChange={e => setNewEvent(n => ({ ...n, event_type: e.target.value }))}
                  className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                  {Object.entries(EVENT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>SEVERITY</label>
                <select value={newEvent.severity} onChange={e => setNewEvent(n => ({ ...n, severity: e.target.value }))}
                  className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>DATE & TIME</label>
                <input type="datetime-local" value={newEvent.event_date} onChange={e => setNewEvent(n => ({ ...n, event_date: e.target.value }))}
                  className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }} />
              </div>
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>TARGET</label>
                <select value={newEvent.target_id} onChange={e => setNewEvent(n => ({ ...n, target_id: e.target.value }))}
                  className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                  <option value="">No Target</option>
                  {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <textarea value={newEvent.description} onChange={e => setNewEvent(n => ({ ...n, description: e.target.value }))}
                placeholder="Description / details…"
                rows={2}
                className="col-span-2 px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none resize-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
              <input value={newEvent.source} onChange={e => setNewEvent(n => ({ ...n, source: e.target.value }))}
                placeholder="Source (e.g. HaveIBeenPwned)"
                className="col-span-2 px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => create.mutate({ ...newEvent, event_date: newEvent.event_date ? new Date(newEvent.event_date).toISOString() : new Date().toISOString() })}
                disabled={!newEvent.title}
                className="flex-1 py-2 rounded-lg text-[9px] font-mono disabled:opacity-40"
                style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.8)" }}>
                LOG EVENT
              </button>
              <button onClick={() => setShowNew(false)}
                className="px-3 py-2 rounded-lg text-[9px] font-mono"
                style={{ border: "1px solid rgba(200,30,30,0.15)", color: "rgba(200,80,80,0.4)" }}>
                CANCEL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {Object.keys(grouped).length === 0 ? (
        <div className="py-16 text-center">
          <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(200,60,60,0.12)" }} />
          <p className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>No events logged yet. Click LOG EVENT to begin your investigation timeline.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, evts]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: "rgba(200,30,30,0.12)" }} />
                <span className="text-[9px] font-mono tracking-widest px-3 py-1 rounded-full"
                  style={{ background: "rgba(15,4,4,0.8)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,100,100,0.6)" }}>
                  {date}
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(200,30,30,0.12)" }} />
              </div>
              <div className="space-y-2 pl-4 border-l-2" style={{ borderColor: "rgba(200,30,30,0.1)" }}>
                {evts.map(ev => {
                  const cfg = EVENT_CONFIG[ev.event_type] || EVENT_CONFIG.manual;
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="group relative flex items-start gap-3 p-3 rounded-xl ml-3"
                      style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
                      <div className="absolute -left-5 top-3 w-3 h-3 rounded-full border-2 flex-shrink-0"
                        style={{ background: SEV_COLOR[ev.severity] || "#ff5050", borderColor: "rgba(8,2,4,1)", boxShadow: `0 0 6px ${SEV_COLOR[ev.severity] || "#ff5050"}60` }} />
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                        <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono" style={{ color: "rgba(255,200,200,0.8)" }}>{ev.title}</span>
                          <span className="text-[7px] font-mono px-1.5 rounded" style={{ color: SEV_COLOR[ev.severity], border: `1px solid ${SEV_COLOR[ev.severity]}30` }}>{ev.severity?.toUpperCase()}</span>
                          <span className="text-[7px] font-mono" style={{ color: cfg.color + "80" }}>{cfg.label}</span>
                        </div>
                        {ev.description && <p className="text-[9px] font-mono" style={{ color: "rgba(200,120,120,0.45)" }}>{ev.description}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          {ev.source && <span className="text-[8px] font-mono" style={{ color: "rgba(180,80,80,0.35)" }}>src: {ev.source}</span>}
                          {ev.target_id && <span className="text-[8px] font-mono" style={{ color: "rgba(80,200,255,0.4)" }}>→ {getTargetName(ev.target_id)}</span>}
                          {ev.event_date && <span className="text-[8px] font-mono" style={{ color: "rgba(180,80,80,0.25)" }}>{new Date(ev.event_date).toLocaleTimeString()}</span>}
                        </div>
                      </div>
                      <button onClick={() => remove.mutate(ev.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "rgba(200,60,60,0.4)" }}>
                        ×
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}