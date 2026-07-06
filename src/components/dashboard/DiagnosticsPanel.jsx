import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, CheckCircle, XCircle, Clock, Zap } from "lucide-react";

// Simulated diagnostics data per agent
const AGENTS = [
  { name: "Research Agent", color: "rgba(80,200,255,0.7)", successRate: 94, avgLatency: 1240, tokens: 18400, calls: 47 },
  { name: "Memory Sync", color: "rgba(160,80,255,0.7)", successRate: 99, avgLatency: 380, tokens: 4200, calls: 124 },
  { name: "OSINT Agent", color: "rgba(255,80,80,0.7)", successRate: 87, avgLatency: 2100, tokens: 31500, calls: 22 },
  { name: "Monitor Agent", color: "rgba(80,255,160,0.7)", successRate: 100, avgLatency: 120, tokens: 2800, calls: 312 },
  { name: "Automation Agent", color: "rgba(255,180,80,0.7)", successRate: 91, avgLatency: 890, tokens: 9600, calls: 35 },
];

function genLatencyHistory() {
  return Array.from({ length: 20 }, (_, i) => ({
    t: i,
    latency: 200 + Math.random() * 2000,
    tokens: 500 + Math.random() * 3000,
  }));
}

const CHART_STYLE = {
  contentStyle: { background: "rgba(8,2,2,0.95)", border: "1px solid rgba(200,30,30,0.2)", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace", color: "rgba(255,180,180,0.8)" },
  cursor: { stroke: "rgba(200,50,50,0.2)" },
};

export default function DiagnosticsPanel() {
  const [selected, setSelected] = useState(AGENTS[0]);
  const [history, setHistory] = useState(genLatencyHistory());

  useEffect(() => {
    const id = setInterval(() => {
      setHistory((prev) => [
        ...prev.slice(1),
        { t: Date.now(), latency: 200 + Math.random() * 2000, tokens: 500 + Math.random() * 3000 },
      ]);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      {/* Agent cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {AGENTS.map((agent) => (
          <motion.button
            key={agent.name}
            onClick={() => { setSelected(agent); setHistory(genLatencyHistory()); }}
            className="rounded-xl p-3 text-left transition-all"
            style={{
              background: selected.name === agent.name ? `${agent.color.replace("0.7", "0.08")}` : "rgba(10,3,3,0.8)",
              border: selected.name === agent.name ? `1px solid ${agent.color}` : "1px solid rgba(200,30,30,0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <Activity className="w-3 h-3" style={{ color: agent.color }} />
              <span className="text-[9px] font-mono" style={{ color: agent.color }}>{agent.successRate}%</span>
            </div>
            <p className="text-[10px] font-mono truncate" style={{ color: "rgba(255,200,200,0.6)" }}>{agent.name}</p>
            <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(200,80,80,0.35)" }}>{agent.calls} calls</p>
          </motion.button>
        ))}
      </div>

      {/* Selected agent deep dive */}
      <div className="rounded-xl p-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: selected.color }} />
          <h3 className="text-xs font-mono tracking-widest" style={{ color: "rgba(255,200,200,0.6)" }}>{selected.name.toUpperCase()}</h3>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "SUCCESS", value: `${selected.successRate}%`, icon: CheckCircle, color: "rgba(80,255,160,0.7)" },
            { label: "FAILURES", value: `${Math.round(selected.calls * (1 - selected.successRate / 100))}`, icon: XCircle, color: "rgba(255,80,80,0.7)" },
            { label: "AVG LATENCY", value: `${selected.avgLatency}ms`, icon: Clock, color: "rgba(255,180,80,0.7)" },
            { label: "TOKENS USED", value: `${(selected.tokens / 1000).toFixed(1)}k`, icon: Zap, color: "rgba(80,200,255,0.7)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-lg p-2.5" style={{ background: "rgba(20,5,5,0.8)", border: "1px solid rgba(200,30,30,0.08)" }}>
              <div className="flex items-center gap-1 mb-1">
                <Icon className="w-2.5 h-2.5" style={{ color }} />
                <span className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.35)" }}>{label}</span>
              </div>
              <p className="text-sm font-mono font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Latency chart */}
        <div>
          <p className="text-[9px] font-mono tracking-widest mb-2" style={{ color: "rgba(255,80,80,0.35)" }}>LATENCY HISTORY (ms)</p>
          <ResponsiveContainer width="100%" height={70}>
            <LineChart data={history}>
              <Line type="monotone" dataKey="latency" stroke={selected.color} strokeWidth={1.5} dot={false} />
              <Tooltip contentStyle={CHART_STYLE.contentStyle} cursor={CHART_STYLE.cursor} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Token usage chart */}
        <div className="mt-3">
          <p className="text-[9px] font-mono tracking-widest mb-2" style={{ color: "rgba(255,80,80,0.35)" }}>TOKEN USAGE PER CALL</p>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={history}>
              <Bar dataKey="tokens" fill={selected.color.replace("0.7", "0.4")} radius={[2, 2, 0, 0]} />
              <Tooltip contentStyle={CHART_STYLE.contentStyle} cursor={CHART_STYLE.cursor} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}