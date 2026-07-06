import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, FileText, Mail, Globe, Brain, Shield, Eye, Target, Cpu, ChevronRight } from "lucide-react";

const WORKFLOWS = [
  { id: "daily-report", label: "Send Daily Report", icon: FileText, shortcut: "⌘1", prompt: "Generate and send a comprehensive daily activity report summarizing all key actions, decisions, and outcomes from today." },
  { id: "weekly-email", label: "Draft Weekly Email", icon: Mail, shortcut: "⌘2", prompt: "Draft a professional weekly summary email covering progress, blockers, wins, and next week's priorities." },
  { id: "research-mode", label: "Deep Research Mode", icon: Globe, shortcut: "⌘3", prompt: "Enter deep research mode. Search the web, gather intelligence, synthesize findings into a structured report." },
  { id: "osint-sweep", label: "OSINT Intelligence Sweep", icon: Eye, shortcut: "⌘4", prompt: "Perform an OSINT sweep. Use all available intelligence-gathering tools to compile a comprehensive profile." },
  { id: "memory-sync", label: "Sync Memory & Context", icon: Brain, shortcut: "⌘5", prompt: "Review all stored memories, goals, and past decisions. Synthesize context and suggest optimal next actions." },
  { id: "monitor-target", label: "Launch Monitoring Agent", icon: Target, shortcut: "⌘6", prompt: "Deploy a continuous monitoring agent. Track specified targets, alert on changes, compile reports automatically." },
  { id: "ats-mode", label: "Activate ATS — Deep Thought", icon: Cpu, shortcut: "⌘7", prompt: "Use ATS. Engage maximum cognitive depth. Analyze the situation from all angles before responding." },
  { id: "security-audit", label: "Security Audit Protocol", icon: Shield, shortcut: "⌘8", prompt: "Perform a security audit. Analyze vulnerabilities, assess risks, provide hardening recommendations." },
  { id: "shadow-mode", label: "Shadow Mode — Ambient Watch", icon: Zap, shortcut: "⌘9", prompt: "Enter shadow mode. Monitor silently, surface insights only when critical thresholds are crossed." },
];

export default function CommandPalette({ onExecute, onClose }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  const filtered = WORKFLOWS.filter(
    (w) => !query || w.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    setSelected(0);
  }, [query]);

  const execute = useCallback((workflow) => {
    onExecute(workflow.prompt, workflow.label);
    onClose();
  }, [onExecute, onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelected((s) => Math.min(s + 1, filtered.length - 1));
      if (e.key === "ArrowUp") setSelected((s) => Math.max(s - 1, 0));
      if (e.key === "Enter" && filtered[selected]) execute(filtered[selected]);
      // Shortcut keys ⌘1-9
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key) - 1;
        if (WORKFLOWS[idx]) { execute(WORKFLOWS[idx]); e.preventDefault(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, selected, execute, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl mx-4"
        style={{
          background: "rgba(8,4,4,0.95)",
          border: "1px solid rgba(220,30,30,0.25)",
          borderRadius: "16px",
          boxShadow: "0 0 60px rgba(200,20,20,0.15), 0 0 120px rgba(200,20,20,0.06), inset 0 1px 0 rgba(255,80,80,0.08)",
        }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(220,30,30,0.12)" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(220,50,50,0.5)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workflows..."
            className="flex-1 bg-transparent text-sm font-mono focus:outline-none"
            style={{ color: "rgba(240,200,200,0.8)", caretColor: "rgba(220,50,50,0.8)" }}
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: "rgba(200,100,100,0.4)", border: "1px solid rgba(200,50,50,0.15)" }}>ESC</span>
        </div>

        {/* Workflow list */}
        <div className="py-1.5 max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-center py-6 text-xs font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>NO WORKFLOWS FOUND</p>
          )}
          {filtered.map((w, i) => {
            const Icon = w.icon;
            const isSelected = i === selected;
            return (
              <button
                key={w.id}
                onClick={() => execute(w)}
                onMouseEnter={() => setSelected(i)}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-100"
                style={{
                  background: isSelected ? "rgba(200,20,20,0.12)" : "transparent",
                  borderLeft: isSelected ? "2px solid rgba(220,40,40,0.5)" : "2px solid transparent",
                }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isSelected ? "rgba(255,80,80,0.9)" : "rgba(200,80,80,0.35)" }} />
                <span className="flex-1 text-left text-xs font-mono" style={{ color: isSelected ? "rgba(255,200,200,0.9)" : "rgba(200,150,150,0.45)" }}>
                  {w.label}
                </span>
                <span className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>{w.shortcut}</span>
                {isSelected && <ChevronRight className="w-3 h-3" style={{ color: "rgba(220,50,50,0.5)" }} />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: "1px solid rgba(220,30,30,0.08)" }}>
          <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(200,80,80,0.25)" }}>COMMAND PALETTE — ⌘K</span>
          <span className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.25)" }}>↑↓ NAVIGATE · ENTER EXECUTE</span>
        </div>
      </motion.div>
    </motion.div>
  );
}