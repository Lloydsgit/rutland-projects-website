import { useState } from "react";
import { useTheme, THEMES } from "../lib/ThemeContext";
import HudPanel from "../components/hud/HudPanel";
import { Check, Target, Eye, Scale, Mic, Upload, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Settings() {
  const { themeId, changeTheme } = useTheme();
  const [elKey, setElKey] = useState(() => localStorage.getItem("jarvis-el-key") || "");
  const [elSaving, setElSaving] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-lg text-foreground tracking-wide">System Settings</h1>
          <p className="text-xs text-muted-foreground/50 font-mono">Customize your IRIS interface.</p>
        </div>

        <HudPanel title="Color Theme">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-1">
            {Object.entries(THEMES).map(([id, theme]) => {
              const isActive = themeId === id;
              const primaryHsl = theme.vars["--primary"];
              const bgHsl = theme.vars["--background"];
              return (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => changeTheme(id)}
                  className={`relative p-3 rounded-lg border text-left transition-all ${
                    isActive
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/40 bg-card/30 hover:border-primary/30"
                  }`}
                >
                  {/* Preview swatch */}
                  <div
                    className="w-full h-10 rounded mb-2 overflow-hidden"
                    style={{ background: `hsl(${bgHsl})` }}
                  >
                    <div className="flex h-full items-end p-1.5 gap-1">
                      <div className="h-2 rounded-full flex-1" style={{ background: `hsl(${primaryHsl})`, opacity: 0.9 }} />
                      <div className="h-1.5 rounded-full w-6" style={{ background: `hsl(${primaryHsl})`, opacity: 0.4 }} />
                      <div className="h-1 rounded-full w-4" style={{ background: `hsl(${primaryHsl})`, opacity: 0.3 }} />
                    </div>
                  </div>
                  <p className="text-xs font-heading text-foreground/80">{theme.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{theme.description}</p>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </HudPanel>

        {/* Advanced sections */}
        <HudPanel title="Data & Memory">
          <div className="space-y-1.5">
            {[
              { label: "Goal Trajectory", path: "/goals", icon: Target },
              { label: "Decision Journal", path: "/decisions", icon: Scale },
              { label: "Watchlist", path: "/watchlist", icon: Eye },
              { label: "Voice Configuration", path: "/voice-settings", icon: Mic },
              { label: "Bulk Import (CSV)", path: "/bulk-import", icon: Upload },
              { label: "Automation Hub", path: "/automation", icon: GitBranch },
            ].map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-foreground/4 transition-all group">
                <Icon className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground/60" />
                <span className="text-xs font-mono text-foreground/50 group-hover:text-foreground/70">{label}</span>
                <span className="ml-auto text-foreground/20 text-xs">→</span>
              </Link>
            ))}
          </div>
        </HudPanel>

        <HudPanel title="ElevenLabs API Key">
          <p className="text-[10px] font-mono text-muted-foreground/40 mb-3">Required for realistic voice. Configure full voice settings in the Voice module.</p>
          <div className="flex gap-2">
            <input type="password" value={elKey} onChange={e => setElKey(e.target.value)}
              placeholder="sk_…"
              className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
            <button onClick={() => { localStorage.setItem("jarvis-el-key", elKey); setElSaving(true); setTimeout(() => setElSaving(false), 1500); }}
              className="px-3 py-1.5 rounded-lg text-[9px] font-mono transition-all"
              style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.25)", color: elSaving ? "rgba(80,255,120,0.8)" : "rgba(255,120,120,0.7)" }}>
              {elSaving ? "SAVED ✓" : "SAVE"}
            </button>
          </div>
          <p className="text-[9px] font-mono mt-2" style={{ color: "rgba(180,80,80,0.35)" }}>Get your key at elevenlabs.io — free tier available.</p>
        </HudPanel>

        <HudPanel title="System Info">
          <div className="space-y-2">
            {[
              { label: "Version", value: "IRIS v1.0.0" },
              { label: "Build", value: "Arc Reactor Edition" },
              { label: "Agent", value: "IRIS AI — 14 Domains" },
              { label: "System", value: "IRIS — Intelligence & Reconnaissance Integrated System" },
              { label: "Operator", value: "Mr. Lloyds (Tejas Reddy)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60 font-mono">{item.label}</span>
                <span className="text-xs text-foreground/70 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </HudPanel>
      </div>
    </div>
  );
}