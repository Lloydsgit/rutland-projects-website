const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Cpu, Send, Zap, Brain, Shield, Code, TrendingUp, DollarSign, Wrench, Loader2, ChevronDown, ChevronUp, Plus, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

const PERSPECTIVES = [
  { id: "CEO", icon: TrendingUp, color: "#ff6644", label: "CEO VIEW" },
  { id: "CFO", icon: DollarSign, color: "#44ff88", label: "CFO VIEW" },
  { id: "ENG", icon: Wrench, color: "#44aaff", label: "ENGINEER VIEW" },
];

const SUB_AGENTS = [
  { id: "research", icon: Brain, label: "Research", color: "rgba(160,80,255,0.7)", desc: "Deep web intel + analysis" },
  { id: "security", icon: Shield, label: "Security", color: "rgba(255,80,80,0.7)", desc: "Threat model + mitigations" },
  { id: "coding", icon: Code, label: "Coding", color: "rgba(80,200,255,0.7)", desc: "Architecture + stack decisions" },
];

const QUICK_PROMPTS = [
  "Synthesize: Should I go all-in on short-form video content vs long-form?",
  "Synthesize: Evaluate launching a paid newsletter vs free + sponsorships",
  "Delegate to Research: Best AI tools for content automation in 2025",
  "Synthesize: Should I hire a team or stay solo for the next 12 months?",
];

const PERSISTENT_CONV_KEY = "commander-conv-id";

export default function Commander() {
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState(() => localStorage.getItem(PERSISTENT_CONV_KEY) || null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [activeMode, setActiveMode] = useState("synthesis");
  const messagesEndRef = useRef(null);
  const qc = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["commander-tasks"],
    queryFn: () => db.entities.CommanderTask.list("-created_date", 10),
    initialData: [],
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!convId) return;
    const unsub = db.agents.subscribeToConversation(convId, (data) => {
      setMessages(data.messages || []);
      const last = (data.messages || []).slice(-1)[0];
      if (last?.role === "assistant" && last.content) setIsLoading(false);
    });
    return unsub;
  }, [convId]);

  // Load existing conv
  useEffect(() => {
    if (!convId) return;
    db.agents.getConversation(convId).then((conv) => {
      setMessages(conv.messages || []);
    }).catch(() => {
      localStorage.removeItem(PERSISTENT_CONV_KEY);
      setConvId(null);
    });
  }, []);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    // Create task log
    db.entities.CommanderTask.create({ objective: msg, mode: activeMode, status: "running" }).then(() => {
      qc.invalidateQueries({ queryKey: ["commander-tasks"] });
    });

    let cid = convId;
    if (!cid) {
      const conv = await db.agents.createConversation({
        agent_name: "commander",
        metadata: { name: msg.slice(0, 50) },
      });
      cid = conv.id;
      setConvId(cid);
      localStorage.setItem(PERSISTENT_CONV_KEY, cid);
      db.agents.subscribeToConversation(cid, (data) => {
        setMessages(data.messages || []);
        const last = (data.messages || []).slice(-1)[0];
        if (last?.role === "assistant" && last.content) {
          setIsLoading(false);
          qc.invalidateQueries({ queryKey: ["commander-tasks"] });
        }
      });
    }

    const conv = await db.agents.getConversation(cid);
    await db.agents.addMessage(conv, { role: "user", content: msg });
  };

  const newSession = () => {
    localStorage.removeItem(PERSISTENT_CONV_KEY);
    setConvId(null);
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#050103" }}>
      {/* Left: task history */}
      <div className="w-56 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: "1px solid rgba(200,30,30,0.07)" }}>
        <div className="p-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(200,30,30,0.07)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3 h-3" style={{ color: "rgba(255,80,80,0.5)" }} />
            <span className="text-[9px] font-mono tracking-[0.3em]" style={{ color: "rgba(255,100,100,0.4)" }}>COMMANDER</span>
          </div>
          <button onClick={newSession}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[9px] font-mono"
            style={{ background: "rgba(200,30,30,0.12)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,100,100,0.6)" }}>
            <Plus className="w-2.5 h-2.5" /> NEW OBJECTIVE
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-[8px] font-mono tracking-widest px-1 mb-1" style={{ color: "rgba(255,80,80,0.25)" }}>RECENT TASKS</p>
          {tasks.map((t) => (
            <div key={t.id} className="px-2 py-2 rounded-lg" style={{ background: "rgba(10,3,3,0.8)", border: "1px solid rgba(200,30,30,0.06)" }}>
              <p className="text-[9px] font-mono leading-tight" style={{ color: "rgba(255,180,180,0.5)" }}>
                {t.objective?.slice(0, 60)}{t.objective?.length > 60 ? "…" : ""}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1 h-1 rounded-full" style={{ background: t.status === "complete" ? "rgba(80,255,120,0.6)" : t.status === "running" ? "rgba(255,180,80,0.6)" : "rgba(200,80,80,0.3)" }} />
                <span className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: conversation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mode + sub-agent selector */}
        <div className="flex-shrink-0 px-4 py-2 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(200,30,30,0.06)" }}>
          <div className="flex items-center gap-1">
            {["synthesis", "delegation"].map((m) => (
              <button key={m} onClick={() => setActiveMode(m)}
                className="px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all"
                style={{
                  background: activeMode === m ? "rgba(200,30,30,0.2)" : "transparent",
                  border: `1px solid ${activeMode === m ? "rgba(200,30,30,0.35)" : "rgba(200,30,30,0.08)"}`,
                  color: activeMode === m ? "rgba(255,100,100,0.8)" : "rgba(200,80,80,0.3)",
                }}>
                {m}
              </button>
            ))}
          </div>
          <div className="h-4 w-px" style={{ background: "rgba(200,30,30,0.1)" }} />
          <div className="flex items-center gap-1.5">
            {PERSPECTIVES.map(({ id, icon: Icon, color, label }) => (
              <div key={id} className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono"
                style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}>
                <Icon className="w-2.5 h-2.5" />{label}
              </div>
            ))}
          </div>
          {activeMode === "delegation" && (
            <>
              <div className="h-4 w-px" style={{ background: "rgba(200,30,30,0.1)" }} />
              <div className="flex items-center gap-1">
                {SUB_AGENTS.map(({ id, icon: Icon, label, color }) => (
                  <div key={id} className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono"
                    style={{ background: `${color}10`, border: `1px solid ${color}30`, color }}>
                    <Icon className="w-2 h-2" />{label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <Cpu className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,80,80,0.15)" }} />
                <p className="text-[11px] font-mono tracking-widest" style={{ color: "rgba(255,100,100,0.25)" }}>
                  COMMANDER STANDING BY
                </p>
                <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,80,80,0.15)" }}>
                  CEO · CFO · ENGINEER — MULTI-PERSPECTIVE SYNTHESIS
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => handleSend(p)}
                    className="text-left px-3 py-2 rounded-lg text-[10px] font-mono transition-all"
                    style={{ background: "rgba(10,3,3,0.8)", border: "1px solid rgba(200,30,30,0.08)", color: "rgba(200,120,120,0.5)" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isExpanded = expandedMsg === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: "rgba(200,30,30,0.2)", background: "rgba(200,30,30,0.05)" }}>
                    <Cpu className="w-3 h-3" style={{ color: "rgba(255,80,80,0.5)" }} />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${isUser ? "" : "w-full"}`}
                  style={{
                    background: isUser ? "rgba(200,30,30,0.15)" : "rgba(10,3,3,0.9)",
                    border: `1px solid ${isUser ? "rgba(200,30,30,0.2)" : "rgba(200,30,30,0.08)"}`,
                  }}>
                  {isUser ? (
                    <p className="text-sm font-mono" style={{ color: "rgba(255,200,200,0.8)" }}>{msg.content}</p>
                  ) : (
                    <div className="text-[11px] font-mono leading-relaxed" style={{ color: "rgba(255,180,180,0.7)" }}>
                      <ReactMarkdown
                        components={{
                          h2: ({ children }) => <h2 className="text-xs font-mono tracking-wider mt-3 mb-1" style={{ color: "rgba(255,100,100,0.7)" }}>{children}</h2>,
                          h3: ({ children }) => <h3 className="text-[10px] font-mono tracking-wider mt-2 mb-1" style={{ color: "rgba(255,120,120,0.6)" }}>{children}</h3>,
                          ul: ({ children }) => <ul className="ml-3 space-y-0.5">{children}</ul>,
                          li: ({ children }) => <li className="flex gap-2"><span style={{ color: "rgba(255,80,80,0.4)" }}>·</span><span>{children}</span></li>,
                          strong: ({ children }) => <strong style={{ color: "rgba(255,200,200,0.9)" }}>{children}</strong>,
                          p: ({ children }) => <p className="mb-1.5">{children}</p>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: "rgba(200,30,30,0.2)", background: "rgba(200,30,30,0.05)" }}>
                <Cpu className="w-3 h-3" style={{ color: "rgba(255,80,80,0.5)" }} />
              </div>
              <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(10,3,3,0.9)", border: "1px solid rgba(200,30,30,0.08)" }}>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: "rgba(255,80,80,0.5)" }} />
                  <span className="text-[9px] font-mono" style={{ color: "rgba(255,80,80,0.4)" }}>
                    SYNTHESIZING CEO · CFO · ENGINEER PERSPECTIVES…
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-4" style={{ borderTop: "1px solid rgba(200,30,30,0.06)" }}>
          <div className="flex gap-2 max-w-3xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`State your objective… (${activeMode} mode)`}
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-mono resize-none focus:outline-none"
              style={{ background: "rgba(20,4,4,0.8)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.8)" }}
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
              className="px-3 rounded-xl transition-all disabled:opacity-30"
              style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.3)" }}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "rgba(255,80,80,0.6)" }} /> : <Send className="w-4 h-4" style={{ color: "rgba(255,80,80,0.7)" }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Right: sub-agent status */}
      <div className="w-48 flex-shrink-0 p-3 overflow-y-auto" style={{ borderLeft: "1px solid rgba(200,30,30,0.07)" }}>
        <p className="text-[8px] font-mono tracking-widest mb-3" style={{ color: "rgba(255,80,80,0.3)" }}>SUB-AGENTS</p>
        <div className="space-y-2">
          {SUB_AGENTS.map(({ id, icon: Icon, label, color, desc }) => (
            <div key={id} className="p-2.5 rounded-lg"
              style={{ background: "rgba(8,2,2,0.9)", border: "1px solid rgba(200,30,30,0.06)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3 h-3" style={{ color }} />
                <span className="text-[9px] font-mono" style={{ color }}>{label}</span>
              </div>
              <p className="text-[8px] font-mono" style={{ color: "rgba(200,100,100,0.35)" }}>{desc}</p>
              <div className="mt-1.5 h-0.5 rounded-full" style={{ background: "rgba(200,30,30,0.08)" }}>
                <div className="h-full rounded-full w-0" style={{ background: color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(200,30,30,0.06)" }}>
          <p className="text-[8px] font-mono tracking-widest mb-2" style={{ color: "rgba(255,80,80,0.3)" }}>PERSPECTIVES</p>
          {PERSPECTIVES.map(({ id, icon: Icon, color, label }) => (
            <div key={id} className="flex items-center gap-2 py-1">
              <Icon className="w-2.5 h-2.5" style={{ color }} />
              <span className="text-[8px] font-mono" style={{ color: `${color}90` }}>{label}</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: `${color}40` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}