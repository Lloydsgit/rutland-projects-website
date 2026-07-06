const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, Play, Pause, Trash2, TrendingUp, Target, Zap, ExternalLink, ChevronDown, ChevronUp, Brain, DollarSign, Activity } from "lucide-react";

const PLATFORMS = [
  { id: "n8n", label: "n8n", color: "rgba(80,220,120,0.7)", url: "https://n8n.io", desc: "Open-source workflow automation" },
  { id: "zapier", label: "Zapier", color: "rgba(255,120,60,0.7)", url: "https://zapier.com", desc: "Connect 5000+ apps" },
  { id: "make", label: "Make.com", color: "rgba(160,80,255,0.7)", url: "https://make.com", desc: "Visual automation builder" },
  { id: "slack", label: "Slack Bot", color: "rgba(80,160,255,0.7)", url: "https://api.slack.com/apps", desc: "Workspace automation" },
  { id: "custom", label: "Custom API", color: "rgba(255,200,80,0.7)", url: "#", desc: "Direct webhook integration" },
  { id: "multi", label: "Multi-Platform", color: "rgba(255,80,80,0.7)", url: "#", desc: "Orchestrated across platforms" },
];

const CATEGORIES = [
  { id: "lead_gen", label: "Lead Gen", color: "rgba(80,200,255,0.7)" },
  { id: "content", label: "Content", color: "rgba(160,80,255,0.7)" },
  { id: "sales", label: "Sales", color: "rgba(80,255,120,0.7)" },
  { id: "outreach", label: "Outreach", color: "rgba(255,160,80,0.7)" },
  { id: "research", label: "Research", color: "rgba(255,80,80,0.7)" },
  { id: "monitoring", label: "Monitoring", color: "rgba(80,255,200,0.7)" },
  { id: "finance", label: "Finance", color: "rgba(255,220,80,0.7)" },
];

const STATUS_COLOR = {
  active: "rgba(80,255,120,0.8)",
  paused: "rgba(255,180,80,0.6)",
  error: "rgba(255,60,60,0.8)",
  learning: "rgba(160,80,255,0.8)",
};

function genId() { return Math.random().toString(36).slice(2, 8); }

export default function IrisCommand() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("bots");
  const [showNew, setShowNew] = useState(false);
  const [expandedBot, setExpandedBot] = useState(null);
  const [newBot, setNewBot] = useState({
    name: "", goal: "", platform: "n8n", category: "research",
    webhook_url: "", revenue_target: 0, description: ""
  });

  const { data: bots = [] } = useQuery({
    queryKey: ["business-bots"],
    queryFn: () => db.entities.BusinessBot.list("-created_date"),
    initialData: []
  });

  const createBot = useMutation({
    mutationFn: (data) => db.entities.BusinessBot.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["business-bots"] }); setShowNew(false); setNewBot({ name: "", goal: "", platform: "n8n", category: "research", webhook_url: "", revenue_target: 0, description: "" }); }
  });

  const updateBot = useMutation({
    mutationFn: ({ id, data }) => db.entities.BusinessBot.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-bots"] })
  });

  const deleteBot = useMutation({
    mutationFn: (id) => db.entities.BusinessBot.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-bots"] })
  });

  const triggerBot = async (bot) => {
    if (!bot.webhook_url) return;
    const payload = {
      bot_name: bot.name, goal: bot.goal, platform: bot.platform,
      source: "IRIS", timestamp: new Date().toISOString(),
      command: "execute", revenue_target: bot.revenue_target
    };
    try {
      await fetch(bot.webhook_url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      await updateBot.mutateAsync({ id: bot.id, data: { last_run: new Date().toISOString(), last_action: "Triggered via IRIS Command", decisions_made: (bot.decisions_made || 0) + 1 } });
    } catch (e) {
      await updateBot.mutateAsync({ id: bot.id, data: { status: "error", last_action: `Error: ${e.message}` } });
    }
  };

  const totalRevenue = bots.reduce((s, b) => s + (b.revenue_generated || 0), 0);
  const activeBots = bots.filter(b => b.status === "active").length;
  const totalDecisions = bots.reduce((s, b) => s + (b.decisions_made || 0), 0);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5" style={{ color: "rgba(240,200,200,0.85)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
          <h1 className="text-xs font-heading tracking-[0.4em]"
            style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,100,100,0.7)", fontWeight: 700 }}>
            IRIS COMMAND — AUTONOMOUS BUSINESS ENGINE
          </h1>
        </div>
        <div className="flex gap-1">
          {["bots", "platforms", "strategy"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1 rounded-lg text-[9px] font-mono tracking-wider transition-all"
              style={{ background: tab === t ? "rgba(200,30,30,0.2)" : "transparent", border: `1px solid ${tab === t ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.08)"}`, color: tab === t ? "rgba(255,120,120,0.8)" : "rgba(200,80,80,0.35)" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "ACTIVE BOTS", value: activeBots, icon: Bot, color: "rgba(80,255,120,0.8)" },
          { label: "DECISIONS MADE", value: totalDecisions, icon: Brain, color: "rgba(160,80,255,0.8)" },
          { label: "REVENUE TRACKED", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "rgba(255,220,80,0.8)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: "rgba(12,4,4,0.8)", border: "1px solid rgba(200,30,30,0.12)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono tracking-wider" style={{ color: "rgba(200,100,100,0.4)" }}>{label}</span>
              <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <span className="text-xl font-heading" style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      {tab === "strategy" && (
        <div className="space-y-4">
          <div className="rounded-xl p-5 space-y-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
            <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>IRIS AUTONOMOUS STRATEGY</p>
            <p className="text-[10px] font-mono leading-relaxed" style={{ color: "rgba(200,120,120,0.6)" }}>
              IRIS operates as a self-improving business AI. Each bot executes assigned workflows, reports outcomes,
              and IRIS synthesizes learnings to refine future decisions. Revenue targets are tracked, KPIs auto-adjusted,
              and underperforming automations are flagged for human review or self-optimization.
            </p>
            <div className="space-y-2">
              {[
                "1. Define a revenue goal and assign it to a bot",
                "2. Bot triggers your n8n/Zapier/Make workflow via webhook",
                "3. Workflow runs real outreach, content, or lead gen",
                "4. Results flow back to IRIS via webhook response",
                "5. IRIS logs decisions, learns patterns, adjusts strategy",
                "6. Self-growth loop: IRIS proposes new bots to meet unmet goals",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "rgba(255,80,80,0.5)" }} />
                  <p className="text-[9px] font-mono" style={{ color: "rgba(200,120,120,0.5)" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(255,220,80,0.1)" }}>
            <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,220,80,0.5)" }}>RECOMMENDED SETUP</p>
            {[
              { step: "Lead Gen Bot", desc: "n8n scrapes LinkedIn + sends personalized outreach via Gmail" },
              { step: "Content Bot", desc: "Make.com generates daily posts, schedules via Buffer/Typefully" },
              { step: "Monitor Bot", desc: "Zapier watches brand mentions, triggers alerts to Slack" },
              { step: "Finance Bot", desc: "Custom webhook aggregates Stripe/PayPal data into IRIS dashboard" },
            ].map(({ step, desc }) => (
              <div key={step} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: "rgba(15,6,0,0.6)", border: "1px solid rgba(255,200,80,0.08)" }}>
                <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "rgba(255,200,80,0.5)" }} />
                <div>
                  <p className="text-[10px] font-mono" style={{ color: "rgba(255,200,160,0.7)" }}>{step}</p>
                  <p className="text-[9px] font-mono" style={{ color: "rgba(200,140,80,0.4)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "platforms" && (
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <a key={p.id} href={p.url !== "#" ? p.url : undefined} target="_blank" rel="noopener noreferrer"
              className="flex flex-col gap-2 p-4 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: "rgba(10,3,3,0.85)", border: `1px solid ${p.color.replace("0.7", "0.18")}` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold" style={{ color: p.color }}>{p.label}</span>
                {p.url !== "#" && <ExternalLink className="w-3 h-3" style={{ color: p.color.replace("0.7", "0.4") }} />}
              </div>
              <p className="text-[9px] font-mono" style={{ color: "rgba(200,100,100,0.4)" }}>{p.desc}</p>
            </a>
          ))}
        </div>
      )}

      {tab === "bots" && (
        <>
          <AnimatePresence>
            {showNew && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="rounded-xl p-4 space-y-3 overflow-hidden"
                style={{ background: "rgba(15,4,4,0.95)", border: "1px solid rgba(200,40,40,0.25)" }}>
                <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>DEPLOY NEW BUSINESS BOT</p>
                <div className="space-y-3">
                  <input value={newBot.name} onChange={e => setNewBot(r => ({ ...r, name: e.target.value }))}
                    placeholder="Bot name (e.g. Lead Hunter Alpha)"
                    className="w-full px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                    style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
                  <textarea value={newBot.goal} onChange={e => setNewBot(r => ({ ...r, goal: e.target.value }))}
                    placeholder="Primary goal (e.g. Find 50 qualified leads/day from LinkedIn and send cold email sequences)"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none resize-none"
                    style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>PLATFORM</label>
                      <select value={newBot.platform} onChange={e => setNewBot(r => ({ ...r, platform: e.target.value }))}
                        className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                        style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                        {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>CATEGORY</label>
                      <select value={newBot.category} onChange={e => setNewBot(r => ({ ...r, category: e.target.value }))}
                        className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                        style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <input value={newBot.webhook_url} onChange={e => setNewBot(r => ({ ...r, webhook_url: e.target.value }))}
                    placeholder="Webhook URL (from n8n/Zapier/Make)"
                    className="w-full px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                    style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>REVENUE TARGET (USD/month)</label>
                    <input type="number" value={newBot.revenue_target} onChange={e => setNewBot(r => ({ ...r, revenue_target: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                      style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => createBot.mutate(newBot)} disabled={!newBot.name || !newBot.goal}
                      className="flex-1 py-2 rounded-lg text-[9px] font-mono disabled:opacity-40"
                      style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.8)" }}>
                      DEPLOY BOT
                    </button>
                    <button onClick={() => setShowNew(false)}
                      className="px-3 py-2 rounded-lg text-[9px] font-mono"
                      style={{ border: "1px solid rgba(200,30,30,0.15)", color: "rgba(200,80,80,0.4)" }}>
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(200,30,30,0.08)" }}>
              <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>
                AUTONOMOUS BOTS ({bots.length})
              </p>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono"
                style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.25)", color: "rgba(255,100,100,0.7)" }}>
                <Plus className="w-3 h-3" /> DEPLOY BOT
              </button>
            </div>

            {bots.length === 0 && (
              <div className="p-8 text-center">
                <Brain className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(200,60,60,0.15)" }} />
                <p className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>No bots deployed. Create your first autonomous business agent.</p>
              </div>
            )}

            <div className="divide-y" style={{ borderColor: "rgba(200,30,30,0.06)" }}>
              {bots.map(bot => {
                const platform = PLATFORMS.find(p => p.id === bot.platform);
                const category = CATEGORIES.find(c => c.id === bot.category);
                const isExpanded = expandedBot === bot.id;
                const progress = bot.revenue_target > 0 ? Math.min(100, Math.round((bot.revenue_generated / bot.revenue_target) * 100)) : 0;
                return (
                  <div key={bot.id}>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono" style={{ color: "rgba(255,200,200,0.8)" }}>{bot.name}</span>
                          <span className="text-[7px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(200,30,30,0.1)", color: STATUS_COLOR[bot.status] || "rgba(200,80,80,0.4)", border: `1px solid ${STATUS_COLOR[bot.status]?.replace("0.8","0.2") || "rgba(200,30,30,0.15)"}` }}>
                            {bot.status?.toUpperCase()}
                          </span>
                          {category && <span className="text-[7px] px-1 rounded font-mono" style={{ color: category.color, border: `1px solid ${category.color.replace("0.7","0.15")}` }}>{category.label}</span>}
                        </div>
                        <p className="text-[9px] font-mono truncate" style={{ color: "rgba(200,120,120,0.4)" }}>{bot.goal}</p>
                        {bot.revenue_target > 0 && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(200,30,30,0.1)" }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "rgba(255,200,80,0.6)" }} />
                            </div>
                            <span className="text-[8px] font-mono flex-shrink-0" style={{ color: "rgba(255,200,80,0.5)" }}>
                              ${bot.revenue_generated || 0} / ${bot.revenue_target}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {bot.webhook_url && (
                          <button onClick={() => triggerBot(bot)}
                            className="w-6 h-6 rounded flex items-center justify-center" title="Trigger now"
                            style={{ border: "1px solid rgba(80,200,80,0.2)", color: "rgba(80,200,80,0.5)" }}>
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => updateBot.mutate({ id: bot.id, data: { status: bot.status === "active" ? "paused" : "active" } })}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ border: "1px solid rgba(255,180,80,0.2)", color: "rgba(255,180,80,0.5)" }} title={bot.status === "active" ? "Pause" : "Resume"}>
                          {bot.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button onClick={() => setExpandedBot(isExpanded ? null : bot.id)}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ border: "1px solid rgba(200,30,30,0.15)", color: "rgba(200,80,80,0.4)" }}>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button onClick={() => deleteBot.mutate(bot.id)}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ border: "1px solid rgba(200,30,30,0.12)", color: "rgba(200,60,60,0.35)" }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden px-4 pb-3 space-y-2"
                          style={{ borderTop: "1px solid rgba(200,30,30,0.06)" }}>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="p-2 rounded-lg" style={{ background: "rgba(15,4,4,0.7)", border: "1px solid rgba(200,30,30,0.08)" }}>
                              <p className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.35)" }}>PLATFORM</p>
                              <p className="text-[10px] font-mono mt-0.5" style={{ color: platform?.color || "rgba(200,120,120,0.6)" }}>{platform?.label}</p>
                            </div>
                            <div className="p-2 rounded-lg" style={{ background: "rgba(15,4,4,0.7)", border: "1px solid rgba(200,30,30,0.08)" }}>
                              <p className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.35)" }}>DECISIONS</p>
                              <p className="text-[10px] font-mono mt-0.5" style={{ color: "rgba(160,80,255,0.7)" }}>{bot.decisions_made || 0}</p>
                            </div>
                          </div>
                          {bot.last_action && (
                            <div className="p-2 rounded-lg" style={{ background: "rgba(15,4,4,0.7)", border: "1px solid rgba(200,30,30,0.08)" }}>
                              <p className="text-[8px] font-mono mb-0.5" style={{ color: "rgba(200,80,80,0.35)" }}>LAST ACTION</p>
                              <p className="text-[9px] font-mono" style={{ color: "rgba(200,140,140,0.6)" }}>{bot.last_action}</p>
                            </div>
                          )}
                          {bot.webhook_url && (
                            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(15,4,4,0.7)", border: "1px solid rgba(200,30,30,0.08)" }}>
                              <p className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.35)" }}>WEBHOOK:</p>
                              <p className="text-[9px] font-mono truncate flex-1" style={{ color: "rgba(80,200,255,0.5)" }}>{bot.webhook_url}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Update revenue generated"
                              className="flex-1 px-2 py-1.5 rounded text-[9px] font-mono focus:outline-none"
                              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.7)" }}
                              onKeyDown={e => {
                                if (e.key === "Enter" && e.target.value) {
                                  updateBot.mutate({ id: bot.id, data: { revenue_generated: Number(e.target.value) } });
                                  e.target.value = "";
                                }
                              }}
                            />
                            <span className="text-[8px] font-mono self-center" style={{ color: "rgba(200,80,80,0.3)" }}>Press Enter to save revenue</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}