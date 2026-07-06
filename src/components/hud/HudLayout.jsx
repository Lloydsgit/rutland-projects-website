import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Settings, Wrench, Target, Eye, Scale, Brain, Terminal, LayoutDashboard, GitBranch, Network, Shield, Globe, Cpu, Zap, LayoutGrid, X, FileText, Music, Camera, Map, Share2, Sparkles, Layers, Search, Globe2, Mic, Upload, Archive, Clock, Bot } from "lucide-react";
import CommandPalette from "./CommandPalette";
import ParticleLogo from "./ParticleLogo";
import FloatingIris from "../iris/FloatingIris";

import HolographicField from "../effects/HolographicField";
import AuroraField from "../effects/AuroraField";
import HandCursor from "../hand/HandCursor";

const NAV_ITEMS = [
  { path: "/", icon: MessageSquare, label: "IRIS" },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tools", icon: Wrench, label: "Tools" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/decisions", icon: Scale, label: "Decisions" },
  { path: "/watchlist", icon: Eye, label: "Watchlist" },
  { path: "/memory", icon: Brain, label: "Memory" },
  { path: "/workflows", icon: GitBranch, label: "Workflows" },
  { path: "/memory-graph", icon: Network, label: "MemGraph" },
  { path: "/dossier", icon: Shield, label: "Dossier" },
  { path: "/world-map", icon: Globe, label: "WorldMap" },
  { path: "/commander", icon: Cpu, label: "Commander" },
  { path: "/intel", icon: Zap, label: "Intel" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/music", icon: Music, label: "Music" },
  { path: "/camera", icon: Camera, label: "Vision" },
  { path: "/map", icon: Map, label: "Map" },
  { path: "/hardware", icon: Cpu, label: "Hardware" },
  { path: "/graph", icon: Share2, label: "LinkGraph" },
  { path: "/mind", icon: Sparkles, label: "Mind" },
  { path: "/workspace", icon: Layers, label: "Workspace" },
  { path: "/findings", icon: Search, label: "Findings" },
  { path: "/iris-global", icon: Globe2, label: "IRIS Global" },
  { path: "/voice-settings", icon: Mic, label: "Voice" },
  { path: "/bulk-import", icon: Upload, label: "Import" },
  { path: "/automation", icon: Zap, label: "Automation" },
  { path: "/iris-command", icon: Bot, label: "IRIS Cmd" },
  { path: "/intel-assets", icon: Archive, label: "Assets" },
  { path: "/osint-timeline", icon: Clock, label: "Timeline" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function HudLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [handEnabled, setHandEnabled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleWorkflow = useCallback((prompt, label) => {
    // Store intent in sessionStorage for ChatInterface to pick up
    sessionStorage.setItem("cmd-palette-prompt", JSON.stringify({ prompt, label, ts: Date.now() }));
    // Navigate to chat if not already there
    if (location.pathname !== "/") window.location.href = "/";
  }, [location]);

  return (
    <>
      <AnimatePresence>
        {cmdOpen && (
          <CommandPalette
            onExecute={handleWorkflow}
            onClose={() => setCmdOpen(false)}
          />
        )}
      </AnimatePresence>

      <HolographicField />
      <AuroraField />
      <HandCursor enabled={handEnabled} />
      <div
        className="h-screen flex flex-col overflow-hidden relative"
        style={{ background: "#080204", zIndex: 1 }}
      >
        {/* Minimal top bar */}
        <header
          className="flex items-center justify-between px-5 py-3 relative flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(232,236,239,0.06)" }}
        >
          <div
            className="hairline-draw"
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "rgba(125,211,252,0.15)" }}
          />
          <div className="flex items-center gap-3">
            <ParticleLogo size={28} onClick={() => window.location.href = "/"} />
            <Link
              to="/"
              className="font-heading text-xs hover:text-foreground/70 transition-colors duration-300"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, letterSpacing: "0.25em", color: "rgba(200,16,46,0.8)", fontSize: "11px" }}
            >
              IRIS
            </Link>
          </div>
          <nav className="flex items-center gap-1.5">
            {/* Single modules button */}
            <button
              onClick={() => setNavOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-mono transition-all ${
                navOpen ? "border-[#C8102E]/40 text-[#C8102E]/80 bg-[#C8102E]/5" : "border-foreground/8 text-foreground/25 hover:border-foreground/20 hover:text-foreground/55"
              }`}
            >
              {navOpen ? <X className="w-3 h-3" /> : <LayoutGrid className="w-3 h-3" />}
              <span style={{ letterSpacing: "0.18em" }}>MODULES</span>
            </button>
            <button
              onClick={() => setCmdOpen(true)}
              title="Command Palette (⌘K)"
              className="flex items-center gap-1 px-2 py-1 rounded border text-[9px] font-mono transition-all"
              style={{ border: "1px solid rgba(200,16,46,0.2)", color: "rgba(200,16,46,0.5)", background: "transparent" }}
            >
              <Terminal className="w-2.5 h-2.5" /> ⌘K
            </button>
            <button
              onClick={() => setHandEnabled((h) => !h)}
              title="Hand Tracking"
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
                handEnabled
                  ? "border-[#C8102E]/40 text-[#C8102E]/70 bg-[#C8102E]/5"
                  : "border-foreground/10 text-foreground/20 hover:border-foreground/25"
              }`}
            >
              ✋
            </button>
          </nav>
        </header>

        {/* Modules overlay */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-12 right-16 z-[9999] w-72 rounded-xl p-3 grid grid-cols-3 gap-1.5 max-h-[80vh] overflow-y-auto"
              style={{ background: "rgba(6,0,0,0.97)", border: "1px solid rgba(200,16,46,0.18)", backdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
            >
              {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setNavOpen(false)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg text-center transition-all ${
                      isActive ? "bg-[#C8102E]/10 border border-[#C8102E]/25" : "hover:bg-foreground/4 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? "rgba(200,16,46,0.8)" : "rgba(200,16,46,0.35)" }} />
                    <span className="text-[8px] font-mono tracking-wider" style={{ color: isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                      {label.toUpperCase()}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        {navOpen && <div className="absolute inset-0 z-[9998]" onClick={() => setNavOpen(false)} />}

        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      <FloatingIris />
    </>
  );
}