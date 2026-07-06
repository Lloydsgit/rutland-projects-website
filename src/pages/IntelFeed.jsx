const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Zap, Mail, AlertTriangle, CheckCircle, Info, TrendingUp, Bell, BellOff, Trash2, Plus, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const SEV_CONFIG = {
  info: { icon: Info, color: "rgba(80,180,255,0.7)", bg: "rgba(80,180,255,0.06)", label: "INFO" },
  warn: { icon: AlertTriangle, color: "rgba(255,180,80,0.7)", bg: "rgba(255,180,80,0.06)", label: "WARN" },
  critical: { icon: AlertTriangle, color: "rgba(255,60,60,0.8)", bg: "rgba(255,60,60,0.08)", label: "CRITICAL" },
  opportunity: { icon: TrendingUp, color: "rgba(80,255,140,0.7)", bg: "rgba(80,255,140,0.06)", label: "OPP" },
};

const SOURCE_ICON = {
  gmail: "✉",
  github: "⚡",
  calendar: "📅",
  system: "⬡",
  agent: "◈",
  manual: "◎",
};

function AlertCard({ alert, onRead, onDelete }) {
  const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.info;
  const Icon = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
      className="group relative p-3.5 rounded-xl transition-all"
      style={{
        background: alert.read ? "rgba(8,2,2,0.7)" : cfg.bg,
        border: `1px solid ${alert.read ? "rgba(200,30,30,0.06)" : `${cfg.color}30`}`,
        opacity: alert.read ? 0.55 : 1,
      }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}25` }}>
            <Icon className="w-3 h-3" style={{ color: cfg.color }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[8px] font-mono" style={{ color: cfg.color }}>{cfg.label}</span>
            <span className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>
              {SOURCE_ICON[alert.source]} {alert.source?.toUpperCase()}
            </span>
            {!alert.read && <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: cfg.color }} />}
          </div>
          <p className="text-[11px] font-mono" style={{ color: "rgba(255,200,200,0.8)" }}>{alert.title}</p>
          {alert.body && (
            <p className="text-[9px] font-mono mt-1 leading-relaxed" style={{ color: "rgba(200,120,120,0.45)" }}>
              {alert.body.slice(0, 180)}{alert.body.length > 180 ? "…" : ""}
            </p>
          )}
          {alert.action_url && (
            <a href={alert.action_url} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-1.5 text-[8px] font-mono underline" style={{ color: `${cfg.color}80` }}>
              VIEW →
            </a>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.25)" }}>
            {alert.created_date ? formatDistanceToNow(new Date(alert.created_date), { addSuffix: true }) : "now"}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!alert.read && (
              <button onClick={() => onRead(alert.id)} title="Mark read"
                className="w-5 h-5 rounded flex items-center justify-center"
                style={{ border: "1px solid rgba(200,30,30,0.12)" }}>
                <CheckCircle className="w-2.5 h-2.5" style={{ color: "rgba(80,255,140,0.5)" }} />
              </button>
            )}
            <button onClick={() => onDelete(alert.id)} title="Delete"
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ border: "1px solid rgba(200,30,30,0.12)" }}>
              <Trash2 className="w-2.5 h-2.5" style={{ color: "rgba(255,80,80,0.4)" }} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function IntelFeed() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", source: "manual", severity: "info" });

  const { data: alerts = [], refetch, isFetching } = useQuery({
    queryKey: ["intel-alerts"],
    queryFn: () => db.entities.IntelAlert.list("-created_date", 50),
    initialData: [],
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id) => db.entities.IntelAlert.update(id, { read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intel-alerts"] }),
  });

  const deleteAlert = useMutation({
    mutationFn: (id) => db.entities.IntelAlert.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intel-alerts"] }),
  });

  const createAlert = useMutation({
    mutationFn: (data) => db.entities.IntelAlert.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["intel-alerts"] }); setShowForm(false); setForm({ title: "", body: "", source: "manual", severity: "info" }); },
  });

  const markAllRead = async () => {
    const unread = alerts.filter((a) => !a.read);
    for (const a of unread) await markRead.mutateAsync(a.id);
  };

  const filtered = filter === "all" ? alerts : filter === "unread" ? alerts.filter((a) => !a.read) : alerts.filter((a) => a.severity === filter);
  const unreadCount = alerts.filter((a) => !a.read).length;

  const FILTERS = [
    { id: "all", label: "ALL" },
    { id: "unread", label: `UNREAD (${unreadCount})` },
    { id: "critical", label: "CRITICAL" },
    { id: "opportunity", label: "OPPORTUNITY" },
    { id: "warn", label: "WARN" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#050103" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,80,80,0.07)" }}>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
          <span className="text-[10px] font-mono tracking-[0.3em]" style={{ color: "rgba(255,120,120,0.5)" }}>
            INTELLIGENCE FEED
          </span>
          {unreadCount > 0 && (
            <div className="px-1.5 py-0.5 rounded text-[8px] font-mono animate-pulse"
              style={{ background: "rgba(255,60,60,0.2)", color: "rgba(255,80,80,0.8)", border: "1px solid rgba(255,60,60,0.3)" }}>
              {unreadCount} NEW
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${isFetching ? "opacity-60" : ""}`}
            style={{ border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,80,80,0.4)" }}>
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="px-2.5 py-1.5 rounded-lg text-[9px] font-mono"
              style={{ border: "1px solid rgba(200,30,30,0.12)", color: "rgba(200,80,80,0.5)" }}>
              MARK ALL READ
            </button>
          )}
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono"
            style={{ background: "rgba(200,30,30,0.15)", border: "1px solid rgba(200,30,30,0.25)", color: "rgba(255,100,100,0.7)" }}>
            <Plus className="w-2.5 h-2.5" /> LOG ALERT
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex-shrink-0 px-5 py-2 flex items-center gap-1"
        style={{ borderBottom: "1px solid rgba(200,30,30,0.05)" }}>
        {FILTERS.map(({ id, label }) => (
          <button key={id} onClick={() => setFilter(id)}
            className="px-2.5 py-1 rounded text-[8px] font-mono tracking-wider transition-all"
            style={{
              background: filter === id ? "rgba(200,30,30,0.2)" : "transparent",
              border: `1px solid ${filter === id ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.06)"}`,
              color: filter === id ? "rgba(255,100,100,0.8)" : "rgba(200,80,80,0.3)",
            }}>
            {label}
          </button>
        ))}

        {/* Source indicators */}
        <div className="ml-auto flex items-center gap-3">
          {[
            { src: "gmail", label: "GMAIL", connected: true },
            { src: "github", label: "GITHUB", connected: false },
            { src: "calendar", label: "CALENDAR", connected: false },
          ].map(({ src, label, connected }) => (
            <div key={src} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: connected ? "rgba(80,255,140,0.6)" : "rgba(200,80,80,0.2)" }} />
              <span className="text-[8px] font-mono" style={{ color: connected ? "rgba(80,255,140,0.4)" : "rgba(200,80,80,0.2)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manual log form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden"
            style={{ borderBottom: "1px solid rgba(200,30,30,0.07)", background: "rgba(10,3,3,0.95)" }}>
            <div className="p-4 grid grid-cols-4 gap-2">
              <div className="col-span-4">
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.3)" }}>ALERT TITLE</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.1)", color: "rgba(255,200,200,0.7)" }} />
              </div>
              <div className="col-span-4">
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.3)" }}>BODY (OPTIONAL)</label>
                <input value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.1)", color: "rgba(255,200,200,0.7)" }} />
              </div>
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.3)" }}>SOURCE</label>
                <select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded text-xs font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.1)", color: "rgba(255,200,200,0.7)" }}>
                  {["gmail","github","calendar","system","agent","manual"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.3)" }}>SEVERITY</label>
                <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded text-xs font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.1)", color: "rgba(255,200,200,0.7)" }}>
                  {["info","warn","critical","opportunity"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex items-end gap-2">
                <button onClick={() => createAlert.mutate(form)} disabled={!form.title.trim()}
                  className="px-3 py-1.5 rounded text-[9px] font-mono disabled:opacity-40"
                  style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,100,100,0.8)" }}>
                  LOG
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 rounded text-[9px] font-mono"
                  style={{ border: "1px solid rgba(200,30,30,0.1)", color: "rgba(200,80,80,0.4)" }}>
                  CANCEL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,80,80,0.1)" }} />
              <p className="text-[11px] font-mono" style={{ color: "rgba(255,100,100,0.2)" }}>FEED CLEAR</p>
              <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,80,80,0.12)" }}>
                GMAIL CONNECTED · POLLING EVERY 30s · ALERTS WILL SURFACE HERE
              </p>
            </div>
          </div>
        )}
        <AnimatePresence>
          <div className="space-y-2 max-w-3xl mx-auto">
            {filtered.map((alert) => (
              <AlertCard key={alert.id} alert={alert}
                onRead={(id) => markRead.mutate(id)}
                onDelete={(id) => deleteAlert.mutate(id)} />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}