const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, Trash2, Play, ExternalLink, GitBranch, Bell, Save, ArrowRight, Settings } from "lucide-react";

const TRIGGERS = [
  { id: "watchlist_match", label: "Watchlist Match", desc: "When OSINT finds a match on a watchlist entry" },
  { id: "new_target", label: "New Target Added", desc: "When a new target is created in the system" },
  { id: "intel_alert", label: "Intel Alert", desc: "When a new intel alert is generated" },
  { id: "keyword_detected", label: "Keyword Detected", desc: "When a keyword appears in data feeds" },
  { id: "scheduled", label: "Scheduled", desc: "Run on a time-based schedule" },
];

const ACTIONS = [
  { id: "save_dossier", label: "Save to Dossier", desc: "Automatically store findings in DossierFinding", color: "rgba(255,80,80,0.7)" },
  { id: "create_alert", label: "Create Intel Alert", desc: "Push a new alert to IntelAlert feed", color: "rgba(255,160,80,0.7)" },
  { id: "slack_notify", label: "Notify via Slack", desc: "Send message to your Slack workspace", color: "rgba(80,160,255,0.7)" },
  { id: "zapier_webhook", label: "Zapier Webhook", desc: "Trigger a Zapier automation via webhook", color: "rgba(255,120,80,0.7)" },
  { id: "n8n_webhook", label: "n8n Workflow", desc: "Trigger an n8n workflow via webhook URL", color: "rgba(80,220,120,0.7)" },
  { id: "email_report", label: "Email Report", desc: "Send a compiled report via email", color: "rgba(200,80,255,0.7)" },
];

const PLATFORM_LINKS = [
  { label: "Zapier", url: "https://zapier.com", color: "rgba(255,120,60,0.7)", desc: "Connect 5000+ apps" },
  { label: "n8n", url: "https://n8n.io", color: "rgba(80,220,120,0.7)", desc: "Open-source automation" },
  { label: "Slack", url: "https://api.slack.com/apps", color: "rgba(80,160,255,0.7)", desc: "Workspace messaging" },
  { label: "Make", url: "https://make.com", color: "rgba(160,80,255,0.7)", desc: "Visual automation builder" },
];

function genId() { return Math.random().toString(36).slice(2, 8); }

export default function AutomationHub() {
  const qc = useQueryClient();
  const [rules, setRules] = useState(() => {
    try { return JSON.parse(localStorage.getItem("iris-automation-rules") || "[]"); } catch { return []; }
  });
  const [showNew, setShowNew] = useState(false);
  const [newRule, setNewRule] = useState({ trigger: "watchlist_match", action: "save_dossier", webhookUrl: "", label: "" });
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("rules");

  const saveRules = (updated) => {
    setRules(updated);
    localStorage.setItem("iris-automation-rules", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const addRule = () => {
    if (!newRule.label) return;
    saveRules([...rules, { ...newRule, id: genId(), enabled: true, runs: 0 }]);
    setShowNew(false);
    setNewRule({ trigger: "watchlist_match", action: "save_dossier", webhookUrl: "", label: "" });
  };

  const deleteRule = (id) => saveRules(rules.filter(r => r.id !== id));
  const toggleRule = (id) => saveRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const triggerRule = async (rule) => {
    const startTime = Date.now();
    let success = true;
    let errorMsg = "";
    try {
      if (rule.action === "save_dossier") {
        await db.entities.IntelAlert.create({ title: `[AUTO] ${rule.label} triggered`, source: "agent", severity: "info" });
      }
      if (rule.webhookUrl && (rule.action === "zapier_webhook" || rule.action === "n8n_webhook" || rule.action === "slack_notify")) {
        const res = await fetch(rule.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trigger: rule.trigger, label: rule.label, ts: Date.now(), source: "IRIS" }) });
        if (!res.ok) { success = false; errorMsg = `HTTP ${res.status}`; }
      }
    } catch (e) {
      success = false;
      errorMsg = e.message;
    }
    const execTime = Date.now() - startTime;
    const logEntry = { ts: Date.now(), success, execTime, error: errorMsg };
    saveRules(rules.map(r => r.id === rule.id ? {
      ...r,
      runs: (r.runs || 0) + 1,
      lastRun: success ? Date.now() : r.lastRun,
      lastSuccess: success,
      lastExecTime: execTime,
      history: [...(r.history || []), logEntry].slice(-20),
    } : r));
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5" style={{ color: "rgba(240,200,200,0.85)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
          <h1 className="text-xs font-heading tracking-[0.4em]"
            style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,100,100,0.7)", fontWeight: 700 }}>
            AUTOMATION HUB
          </h1>
        </div>
        <div className="flex gap-1">
          {["rules","platforms"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1 rounded-lg text-[9px] font-mono tracking-wider transition-all"
              style={{ background: tab === t ? "rgba(200,30,30,0.2)" : "transparent", border: `1px solid ${tab === t ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.08)"}`, color: tab === t ? "rgba(255,120,120,0.8)" : "rgba(200,80,80,0.35)" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {tab === "platforms" ? (
        <div className="space-y-4">
          <p className="text-[10px] font-mono" style={{ color: "rgba(200,100,100,0.5)" }}>
            Connect IRIS to external automation platforms. Set webhook URLs in your rules to trigger flows automatically.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORM_LINKS.map(p => (
              <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-2 p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: "rgba(10,3,3,0.85)", border: `1px solid ${p.color.replace("0.7","0.2")}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: p.color }}>{p.label}</span>
                  <ExternalLink className="w-3 h-3" style={{ color: p.color.replace("0.7","0.4") }} />
                </div>
                <p className="text-[9px] font-mono" style={{ color: "rgba(200,100,100,0.4)" }}>{p.desc}</p>
              </a>
            ))}
          </div>
          <div className="rounded-xl p-4 space-y-2"
            style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
            <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>HOW TO CONNECT</p>
            <ol className="space-y-1.5">
              {[
                "1. Create a webhook trigger in Zapier/n8n/Make",
                "2. Copy the webhook URL from that platform",
                "3. Create an automation rule here and paste the URL",
                "4. IRIS will POST data whenever the trigger fires",
                "5. For Slack: use Slack's Incoming Webhooks app",
              ].map((s, i) => (
                <li key={i} className="text-[9px] font-mono" style={{ color: "rgba(200,120,120,0.5)" }}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <>
          {/* New rule form */}
          <AnimatePresence>
            {showNew && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="rounded-xl p-4 space-y-3 overflow-hidden"
                style={{ background: "rgba(15,4,4,0.95)", border: "1px solid rgba(200,40,40,0.25)" }}>
                <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>NEW AUTOMATION RULE</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>RULE NAME</label>
                    <input value={newRule.label} onChange={e => setNewRule(r => ({ ...r, label: e.target.value }))}
                      placeholder="e.g. Auto-dossier watchlist hits"
                      className="w-full px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                      style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>TRIGGER</label>
                      <select value={newRule.trigger} onChange={e => setNewRule(r => ({ ...r, trigger: e.target.value }))}
                        className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                        style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                        {TRIGGERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>ACTION</label>
                      <select value={newRule.action} onChange={e => setNewRule(r => ({ ...r, action: e.target.value }))}
                        className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                        style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                        {ACTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {(newRule.action === "zapier_webhook" || newRule.action === "n8n_webhook" || newRule.action === "slack_notify") && (
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>WEBHOOK URL</label>
                      <input value={newRule.webhookUrl} onChange={e => setNewRule(r => ({ ...r, webhookUrl: e.target.value }))}
                        placeholder="https://hooks.zapier.com/…"
                        className="w-full px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                        style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={addRule} disabled={!newRule.label}
                      className="flex-1 py-2 rounded-lg text-[9px] font-mono disabled:opacity-40"
                      style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.8)" }}>
                      CREATE RULE
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

          {/* Execution Timeline */}
          {rules.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
              <p className="text-[9px] font-mono tracking-widest mb-3 text-white/50">EXECUTION TIMELINE</p>
              <div className="space-y-2">
                {rules.filter(r => r.history && r.history.length > 0).map(rule => {
                  const total = rule.history.length;
                  const successes = rule.history.filter(h => h.success).length;
                  const avgTime = total > 0 ? Math.round(rule.history.reduce((s, h) => s + h.execTime, 0) / total) : 0;
                  return (
                    <div key={rule.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "rgba(20,4,4,0.5)" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-white/70 truncate">{rule.label}</span>
                          {rule.lastSuccess === false && rule.lastRun ? (
                            <span className="text-[7px] font-mono px-1.5 py-0.5 rounded text-white" style={{ background: "rgba(255,0,51,0.2)", border: "1px solid rgba(255,0,51,0.3)" }}>FAILED</span>
                          ) : rule.lastSuccess === true ? (
                            <span className="text-[7px] font-mono px-1.5 py-0.5 rounded text-white" style={{ background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.25)" }}>OK</span>
                          ) : null}
                        </div>
                        {/* Timeline bars */}
                        <div className="flex items-center gap-0.5 h-4">
                          {rule.history.slice(-15).map((h, i) => (
                            <div key={i} className="flex-1 rounded-sm transition-all" title={`${h.success ? "Success" : "Failed"} · ${h.execTime}ms`}
                              style={{
                                height: "100%",
                                background: h.success ? "rgba(200,16,46,0.6)" : "rgba(255,0,51,0.8)",
                                opacity: 0.4 + (i / 15) * 0.6,
                              }} />
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[8px] font-mono text-white/40">{successes}/{total} success</span>
                          <span className="text-[8px] font-mono text-white/40">avg {avgTime}ms</span>
                          {rule.lastExecTime && <span className="text-[8px] font-mono text-white/40">last {rule.lastExecTime}ms</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {rules.every(r => !r.history || r.history.length === 0) && (
                  <p className="text-[10px] font-mono text-white/30 text-center py-4">No executions yet. Test run a rule to populate timeline.</p>
                )}
              </div>
            </div>
          )}

          {/* Rules list */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(200,30,30,0.08)" }}>
              <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>
                AUTOMATION RULES ({rules.length})
              </p>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono"
                style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.25)", color: "rgba(255,100,100,0.7)" }}>
                <Plus className="w-3 h-3" /> NEW RULE
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(200,30,30,0.06)" }}>
              {rules.length === 0 && (
                <div className="p-6 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2" style={{ color: "rgba(200,60,60,0.2)" }} />
                  <p className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>No automation rules yet. Create one above.</p>
                </div>
              )}
              {rules.map(rule => {
                const trigger = TRIGGERS.find(t => t.id === rule.trigger);
                const action = ACTIONS.find(a => a.id === rule.action);
                return (
                  <div key={rule.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono" style={{ color: "rgba(255,200,200,0.7)" }}>{rule.label}</span>
                        {rule.enabled
                          ? <span className="text-[7px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(80,200,80,0.1)", color: "rgba(120,255,140,0.6)", border: "1px solid rgba(80,200,80,0.2)" }}>ACTIVE</span>
                          : <span className="text-[7px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(200,60,60,0.08)", color: "rgba(200,80,80,0.4)", border: "1px solid rgba(200,60,60,0.15)" }}>PAUSED</span>
                        }
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono">
                        <span style={{ color: "rgba(200,100,100,0.45)" }}>{trigger?.label}</span>
                        <ArrowRight className="w-2.5 h-2.5" style={{ color: "rgba(200,60,60,0.3)" }} />
                        <span style={{ color: action?.color || "rgba(200,100,100,0.45)" }}>{action?.label}</span>
                        {rule.runs > 0 && <span style={{ color: "rgba(180,80,80,0.3)" }}>· {rule.runs} runs</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => triggerRule(rule)}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ border: "1px solid rgba(80,200,80,0.2)", color: "rgba(80,200,80,0.5)" }}
                        title="Test run">
                        <Play className="w-3 h-3" />
                      </button>
                      <button onClick={() => toggleRule(rule.id)}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ border: "1px solid rgba(200,160,80,0.2)", color: "rgba(200,160,80,0.5)" }}
                        title={rule.enabled ? "Pause" : "Enable"}>
                        <Bell className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteRule(rule.id)}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ border: "1px solid rgba(200,30,30,0.15)", color: "rgba(200,60,60,0.4)" }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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