const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import DataFeedPanel from "@/components/dashboard/DataFeedPanel";
import SchedulePanel from "@/components/dashboard/SchedulePanel";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, AlertTriangle, Activity, Bot, Globe, Eye, CheckCircle, Clock, Bell, BellOff, BellRing, FileText, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import MiniPlayer from "@/components/dashboard/MiniPlayer";

// Generate mock telemetry for charts
function genTelemetry(points = 20) {
  return Array.from({ length: points }, (_, i) => ({
    t: `${i}s`,
    cpu: 20 + Math.random() * 60,
    mem: 30 + Math.random() * 40,
    net: 10 + Math.random() * 80,
    agents: Math.floor(Math.random() * 8) + 1,
  }));
}

const AGENT_TYPES = [
  { name: "Research Agent", icon: Globe, status: "running", task: "Scanning AI startup landscape", progress: 68 },
  { name: "Memory Sync", icon: Brain, status: "running", task: "Indexing recent conversations", progress: 45 },
  { name: "Monitor Agent", icon: Eye, status: "idle", task: "Awaiting target assignment", progress: 0 },
  { name: "Automation Agent", icon: Zap, status: "complete", task: "Daily report delivered", progress: 100 },
];

const STATUS_COLOR = {
  running: "rgba(255,0,51,0.8)",
  idle: "rgba(200,16,46,0.5)",
  complete: "rgba(139,0,0,0.7)",
  error: "rgba(255,0,51,0.9)",
};

const CHART_STYLE = {
  tooltip: {
    contentStyle: { background: "rgba(8,2,2,0.95)", border: "1px solid rgba(200,30,30,0.2)", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace", color: "rgba(255,180,180,0.8)" },
    cursor: { stroke: "rgba(200,50,50,0.2)" },
  }
};

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [alertsEnabled, setAlertsEnabled] = useState(() => localStorage.getItem("jarvis-alerts") !== "off");

  const toggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    localStorage.setItem("jarvis-alerts", next ? "on" : "off");
  };
  const [telemetry, setTelemetry] = useState(() => genTelemetry());
  const [alerts, setAlerts] = useState([
    { id: 1, msg: "Research Agent: 3 new AI funding rounds detected", severity: "info", time: "2m ago" },
    { id: 2, msg: "Memory Engine: 847 nodes indexed", severity: "success", time: "5m ago" },
    { id: 3, msg: "ElevenLabs TTS: Credits will reset Jul 01", severity: "warn", time: "1h ago" },
  ]);

  const { data: memories = [] } = useQuery({ queryKey: ["memories"], queryFn: () => db.entities.Memory.list(), initialData: [] });
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: () => db.entities.Goal.list(), initialData: [] });
  const { data: workspaces = [] } = useQuery({ queryKey: ["browser-workspaces"], queryFn: () => db.entities.BrowserWorkspace.list(), initialData: [] });
  const { data: bots = [] } = useQuery({ queryKey: ["business-bots-dash"], queryFn: () => db.entities.BusinessBot.list(), initialData: [] });
  const qc = useQueryClient();
  const { data: intelAlerts = [] } = useQuery({ queryKey: ["intel-alerts-dash"], queryFn: () => db.entities.IntelAlert.list("-created_date", 30), initialData: [] });
  const markRead = useMutation({ mutationFn: (id) => db.entities.IntelAlert.update(id, { read: true }), onSuccess: () => qc.invalidateQueries({ queryKey: ["intel-alerts-dash"] }) });
  const unreadCount = intelAlerts.filter(a => !a.read).length;

  // Simulate live telemetry
  useEffect(() => {
    const id = setInterval(() => {
      setTelemetry((prev) => {
        const next = [...prev.slice(1), {
          t: "now",
          cpu: 20 + Math.random() * 60,
          mem: 30 + Math.random() * 40,
          net: 10 + Math.random() * 80,
          agents: Math.floor(Math.random() * 8) + 1,
        }];
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const statCards = [
    { label: "ACTIVE AGENTS", value: 4, icon: Bot, color: "rgba(200,16,46,0.8)" },
    { label: "MEMORY NODES", value: memories.length, icon: Brain, color: "rgba(255,0,51,0.7)" },
    { label: "ACTIVE GOALS", value: goals.filter((g) => g.status === "active").length, icon: Activity, color: "rgba(255,0,51,0.8)" },
    { label: "BOT REVENUE", value: `₹${bots.reduce((s, b) => s + (b.revenue_generated || 0), 0).toLocaleString()}`, icon: Bot, color: "rgba(200,16,46,0.7)" },
  ];

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5" style={{ color: "rgba(240,200,200,0.8)" }}>
      {/* Tab bar */}
      <div className="flex items-center gap-2">
        <button onClick={toggleAlerts}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-mono ml-auto"
          style={{ background: alertsEnabled ? "rgba(255,0,51,0.12)" : "rgba(200,16,46,0.04)", border: `1px solid ${alertsEnabled ? "rgba(255,0,51,0.3)" : "rgba(200,16,46,0.12)"}`, color: alertsEnabled ? "rgba(255,0,51,0.7)" : "rgba(200,16,46,0.35)" }}>
          {alertsEnabled ? <BellRing className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          {alertsEnabled ? "ALERTS ON" : "ALERTS OFF"}
        </button>
        {[{ id: "overview", label: "OVERVIEW" }, { id: "alerts", label: "ALERTS", badge: alertsEnabled ? unreadCount : 0 }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-wider transition-all"
            style={{ background: tab === t.id ? "rgba(200,30,30,0.2)" : "transparent", border: `1px solid ${tab === t.id ? "rgba(200,30,30,0.35)" : "rgba(200,30,30,0.08)"}`, color: tab === t.id ? "rgba(255,120,120,0.8)" : "rgba(180,80,80,0.4)" }}>
            {t.id === "alerts" && <Bell className="w-3 h-3" />}
            {t.label}
            {t.badge > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-[7px] font-bold text-white flex items-center justify-center animate-pulse">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === "alerts" ? (
        <div className="space-y-2">
          <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(200,80,80,0.4)" }}>INTEL ALERTS — Click to mark read</p>
          {intelAlerts.length === 0 && <p className="text-[10px] font-mono text-center py-8" style={{ color: "rgba(180,80,80,0.3)" }}>No alerts yet. JARVIS will populate this from Watchlist and Intel Feed activity.</p>}
          {intelAlerts.map(alert => (
            <div key={alert.id} onClick={() => markRead.mutate(alert.id)}
              className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
              style={{ background: alert.read ? "rgba(10,3,3,0.7)" : "rgba(20,5,5,0.95)", border: `1px solid ${alert.read ? "rgba(200,30,30,0.07)" : "rgba(200,30,30,0.22)"}` }}>
              {!alert.read && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0 animate-pulse" />}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono" style={{ color: "rgba(255,180,180,0.7)" }}>{alert.title}</span>
                  <span className="text-[8px] font-mono" style={{ color: alert.severity === "critical" ? "rgba(255,0,51,0.8)" : alert.severity === "warn" ? "rgba(200,16,46,0.6)" : "rgba(139,0,0,0.5)" }}>{alert.severity?.toUpperCase()}</span>
                </div>
                {alert.body && <p className="text-[9px] font-mono" style={{ color: "rgba(200,120,120,0.45)" }}>{alert.body.slice(0, 140)}</p>}
                <span className="text-[8px] font-mono" style={{ color: "rgba(180,80,80,0.3)" }}>{alert.source}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (<>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
          <h1 className="text-sm tracking-[0.35em]" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "rgba(255,120,120,0.7)", fontSize: "12px" }}>
            IRIS — COMMAND OVERVIEW
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(200,16,46,0.6)" }} />
          <span className="text-[9px] font-mono" style={{ color: "rgba(255,100,100,0.35)" }}>SYSTEMS NOMINAL</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: "rgba(12,4,4,0.8)", border: "1px solid rgba(200,30,30,0.12)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono tracking-wider" style={{ color: "rgba(200,100,100,0.4)" }}>{label}</span>
              <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <span className="text-2xl font-heading" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color }}>{value}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* CPU / Memory */}
        <div className="rounded-xl p-3" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
          <p className="text-[9px] font-mono tracking-widest mb-3" style={{ color: "rgba(255,80,80,0.35)" }}>SYSTEM LOAD</p>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={telemetry}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(200,16,46,0.4)" />
                  <stop offset="95%" stopColor="rgba(200,16,46,0)" />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(139,0,0,0.35)" />
                  <stop offset="95%" stopColor="rgba(139,0,0,0)" />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cpu" stroke="rgba(200,16,46,0.6)" fill="url(#cpuGrad)" strokeWidth={1} dot={false} />
              <Area type="monotone" dataKey="mem" stroke="rgba(139,0,0,0.5)" fill="url(#memGrad)" strokeWidth={1} dot={false} />
              <Tooltip {...CHART_STYLE.tooltip} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Network */}
        <div className="rounded-xl p-3" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
          <p className="text-[9px] font-mono tracking-widest mb-3" style={{ color: "rgba(255,80,80,0.35)" }}>NETWORK I/O</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={telemetry}>
              <Line type="monotone" dataKey="net" stroke="rgba(255,0,51,0.5)" strokeWidth={1.5} dot={false} />
              <Tooltip {...CHART_STYLE.tooltip} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agent activity */}
        <div className="rounded-xl p-3" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
          <p className="text-[9px] font-mono tracking-widest mb-3" style={{ color: "rgba(255,80,80,0.35)" }}>AGENT ACTIVITY</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={telemetry}>
              <Bar dataKey="agents" fill="rgba(200,16,46,0.45)" radius={[2, 2, 0, 0]} />
              <Tooltip {...CHART_STYLE.tooltip} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent swarm status */}
      <div className="rounded-xl p-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
        <p className="text-[9px] font-mono tracking-widest mb-3" style={{ color: "rgba(255,80,80,0.35)" }}>AGENT SWARM</p>
        <div className="space-y-2">
          {AGENT_TYPES.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.name} className="flex items-center gap-3">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: STATUS_COLOR[agent.status] }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono" style={{ color: "rgba(255,200,200,0.6)" }}>{agent.name}</span>
                    <span className="text-[9px] font-mono" style={{ color: STATUS_COLOR[agent.status] }}>{agent.status.toUpperCase()}</span>
                  </div>
                  <p className="text-[9px] font-mono" style={{ color: "rgba(200,100,100,0.35)" }}>{agent.task}</p>
                  {agent.progress > 0 && (
                    <div className="mt-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(200,30,30,0.1)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: STATUS_COLOR[agent.status], width: `${agent.progress}%` }}
                        initial={{ width: 0 }} animate={{ width: `${agent.progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-xl p-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
        <p className="text-[9px] font-mono tracking-widest mb-3" style={{ color: "rgba(255,80,80,0.35)" }}>LIVE ALERTS</p>
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="flex items-start gap-2 py-1.5" style={{ borderBottom: "1px solid rgba(200,30,30,0.06)" }}>
              {alert.severity === "warn"
                ? <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "rgba(200,16,46,0.7)" }} />
                : alert.severity === "success"
                  ? <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "rgba(200,16,46,0.7)" }} />
                  : <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "rgba(139,0,0,0.7)" }} />
              }
              <span className="flex-1 text-[10px] font-mono" style={{ color: "rgba(255,180,180,0.55)" }}>{alert.msg}</span>
              <span className="text-[9px] font-mono flex-shrink-0" style={{ color: "rgba(200,80,80,0.3)" }}>{alert.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Intel Brief */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.35)" }}>MORNING INTEL BRIEF</p>
          <div className="flex gap-2">
            <Link to="/intel-assets" className="text-[9px] font-mono flex items-center gap-1" style={{ color: "rgba(200,16,46,0.5)" }}>
              <Archive className="w-3 h-3" /> Assets
            </Link>
            <Link to="/osint-timeline" className="text-[9px] font-mono flex items-center gap-1 ml-2" style={{ color: "rgba(255,0,51,0.5)" }}>
              <Clock className="w-3 h-3" /> Timeline
            </Link>
            <Link to="/reports" className="text-[9px] font-mono flex items-center gap-1 ml-2" style={{ color: "rgba(139,0,0,0.5)" }}>
              <FileText className="w-3 h-3" /> Report
            </Link>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Watchlist Status", value: `${alertsEnabled ? "ACTIVE" : "PAUSED"} — alerts ${alertsEnabled ? "enabled" : "disabled"}`, color: alertsEnabled ? "rgba(255,0,51,0.7)" : "rgba(200,16,46,0.4)" },
            { label: "Unread Intel Alerts", value: `${unreadCount} unread`, color: unreadCount > 0 ? "rgba(200,16,46,0.7)" : "rgba(139,0,0,0.5)" },
            { label: "Platform", value: "IRIS — Integration credits reset 2026-07-01", color: "rgba(200,100,100,0.5)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(200,30,30,0.06)" }}>
              <span className="text-[9px] font-mono" style={{ color: "rgba(200,100,100,0.4)" }}>{label}</span>
              <span className="text-[9px] font-mono" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <Link to="/iris-command"
            className="flex-1 text-center py-2 rounded-lg text-[9px] font-mono"
            style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.18)", color: "rgba(200,16,46,0.7)" }}>
            IRIS COMMAND →
          </Link>
          <Link to="/automation"
            className="flex-1 text-center py-2 rounded-lg text-[9px] font-mono"
            style={{ background: "rgba(139,0,0,0.1)", border: "1px solid rgba(139,0,0,0.18)", color: "rgba(200,16,46,0.7)" }}>
            AUTOMATION HUB →
          </Link>
        </div>
      </div>

      {/* Bot Revenue vs Target Chart */}
      {bots.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
          <p className="text-[9px] font-mono tracking-widest mb-3 text-white/50">BOT REVENUE vs TARGET</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bots.map(b => ({ name: b.name?.slice(0, 12), target: b.revenue_target || 0, generated: b.revenue_generated || 0 }))}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 8, fontFamily: "monospace" }} axisLine={{ stroke: "rgba(200,30,30,0.1)" }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 8, fontFamily: "monospace" }} axisLine={{ stroke: "rgba(200,30,30,0.1)" }} />
              <Tooltip contentStyle={{ background: "rgba(8,2,2,0.95)", border: "1px solid rgba(200,30,30,0.2)", fontSize: "10px", fontFamily: "monospace", color: "#fff" }} cursor={{ fill: "rgba(200,30,30,0.05)" }} />
              <Bar dataKey="target" fill="rgba(139,0,0,0.5)" radius={[2, 2, 0, 0]} name="Target" />
              <Bar dataKey="generated" fill="rgba(255,0,51,0.7)" radius={[2, 2, 0, 0]} name="Generated" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(139,0,0,0.5)" }} />
              <span className="text-[8px] font-mono text-white/40">TARGET</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,0,51,0.7)" }} />
              <span className="text-[8px] font-mono text-white/40">GENERATED</span>
            </div>
            <span className="text-[9px] font-mono ml-auto text-white/40">
              Total: ₹{(bots.reduce((s, b) => s + (b.revenue_generated || 0), 0)).toLocaleString()} / ₹{(bots.reduce((s, b) => s + (b.revenue_target || 0), 0)).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Mini Player + Data Feeds */}
      <MiniPlayer />

      {/* Data Feeds + Schedules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DataFeedPanel />
        <SchedulePanel />
      </div>
      </>)}
    </div>
  );
}