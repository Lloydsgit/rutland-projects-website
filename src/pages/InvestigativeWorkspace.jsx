import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Search, X, Plus, Globe, ExternalLink, ChevronDown } from "lucide-react";

const OSINT_TOOLS = [
  { id: "shodan", label: "Shodan", url: (q) => `https://www.shodan.io/search?query=${encodeURIComponent(q)}`, category: "network" },
  { id: "linkedin", label: "LinkedIn", url: (q) => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}`, category: "social" },
  { id: "haveibeenpwned", label: "HaveIBeenPwned", url: (q) => `https://haveibeenpwned.com/account/${encodeURIComponent(q)}`, category: "breach" },
  { id: "hunter", label: "Hunter.io", url: (q) => `https://hunter.io/search/${encodeURIComponent(q)}`, category: "email" },
  { id: "whois", label: "WHOIS", url: (q) => `https://who.is/whois/${encodeURIComponent(q)}`, category: "domain" },
  { id: "virustotal", label: "VirusTotal", url: (q) => `https://www.virustotal.com/gui/search/${encodeURIComponent(q)}`, category: "security" },
  { id: "urlscan", label: "URLScan.io", url: (q) => `https://urlscan.io/search/#${encodeURIComponent(q)}`, category: "security" },
  { id: "censys", label: "Censys", url: (q) => `https://search.censys.io/search?resource=hosts&q=${encodeURIComponent(q)}`, category: "network" },
  { id: "securitytrails", label: "SecurityTrails", url: (q) => `https://securitytrails.com/domain/${encodeURIComponent(q)}/dns`, category: "domain" },
  { id: "wayback", label: "Wayback Machine", url: (q) => `https://web.archive.org/web/*/${encodeURIComponent(q)}`, category: "historical" },
  { id: "github", label: "GitHub Search", url: (q) => `https://github.com/search?q=${encodeURIComponent(q)}&type=code`, category: "code" },
  { id: "reddit", label: "Reddit", url: (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}`, category: "social" },
  { id: "intelx", label: "Intelligence X", url: (q) => `https://intelx.io/?s=${encodeURIComponent(q)}`, category: "breach" },
  { id: "pipl", label: "Pipl", url: (q) => `https://pipl.com/search/?q=${encodeURIComponent(q)}`, category: "people" },
  { id: "social_searcher", label: "Social Searcher", url: (q) => `https://www.social-searcher.com/social-buzz/?q5=${encodeURIComponent(q)}`, category: "social" },
  { id: "google", label: "Google OSINT", url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}+site:linkedin.com+OR+site:twitter.com`, category: "people" },
];

const CATEGORY_COLORS = {
  network: "#50c8ff", social: "#50ff80", breach: "#ff5050",
  email: "#ffaa50", domain: "#ff50aa", security: "#ff8050",
  historical: "#50ffff", code: "#80ff50", people: "#ffff50",
};

const LAYOUTS = [
  { id: "2col", label: "2 Panels", cols: 2 },
  { id: "3col", label: "3 Panels", cols: 3 },
  { id: "4col", label: "4 Panels", cols: 2 },
];

export default function InvestigativeWorkspace() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [panels, setPanels] = useState([
    { id: "p1", toolId: "shodan" },
    { id: "p2", toolId: "linkedin" },
  ]);
  const [layout, setLayout] = useState("2col");
  const [showToolPicker, setShowToolPicker] = useState(null);

  const layoutDef = LAYOUTS.find(l => l.id === layout) || LAYOUTS[0];
  const gridClass = layoutDef.cols === 3 ? "grid-cols-3" : "grid-cols-2";

  const applySearch = () => {
    if (!query.trim()) return;
    setActiveQuery(query);
  };

  const addPanel = () => {
    if (panels.length >= 4) return;
    setPanels(prev => [...prev, { id: Date.now().toString(), toolId: "whois" }]);
  };

  const removePanel = (id) => {
    if (panels.length <= 1) return;
    setPanels(prev => prev.filter(p => p.id !== id));
  };

  const setTool = (panelId, toolId) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, toolId } : p));
    setShowToolPicker(null);
  };

  const getTool = (toolId) => OSINT_TOOLS.find(t => t.id === toolId);

  const getPanelUrl = (panel) => {
    const tool = getTool(panel.toolId);
    if (!tool || !activeQuery) return null;
    return tool.url(activeQuery);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#050103" }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(200,30,30,0.12)", background: "rgba(8,2,4,0.98)" }}>
        <Layers className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,80,80,0.5)" }} />
        <span className="text-[10px] font-mono tracking-widest" style={{ color: "rgba(255,100,100,0.5)", fontFamily: "'Orbitron', sans-serif" }}>
          INVESTIGATIVE WORKSPACE
        </span>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl max-w-md"
          style={{ background: "rgba(20,4,4,0.8)", border: "1px solid rgba(200,30,30,0.18)" }}>
          <Search className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(200,80,80,0.4)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applySearch()}
            placeholder="Target query — all panels sync…"
            className="flex-1 bg-transparent text-xs font-mono text-foreground/70 placeholder:text-foreground/20 focus:outline-none" />
        </div>
        <button onClick={applySearch}
          className="px-3 py-1.5 rounded-xl text-[9px] font-mono"
          style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.7)" }}>
          RECON ALL
        </button>

        <div className="flex items-center gap-1">
          {LAYOUTS.map(l => (
            <button key={l.id} onClick={() => setLayout(l.id)}
              className="px-2 py-1 rounded text-[8px] font-mono"
              style={{ background: layout === l.id ? "rgba(200,30,30,0.2)" : "transparent", border: `1px solid ${layout === l.id ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.08)"}`, color: layout === l.id ? "rgba(255,120,120,0.7)" : "rgba(180,80,80,0.3)" }}>
              {l.label}
            </button>
          ))}
          {panels.length < 4 && (
            <button onClick={addPanel}
              className="px-2 py-1 rounded text-[8px] font-mono ml-1"
              style={{ background: "rgba(80,200,80,0.08)", border: "1px solid rgba(80,200,80,0.15)", color: "rgba(80,200,80,0.5)" }}>
              + PANEL
            </button>
          )}
        </div>
      </div>

      {activeQuery && (
        <div className="flex items-center gap-2 px-4 py-1.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(200,30,30,0.08)", background: "rgba(200,30,30,0.04)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
          <span className="text-[9px] font-mono" style={{ color: "rgba(255,160,160,0.5)" }}>
            ACTIVE TARGET: <span style={{ color: "rgba(255,120,120,0.8)" }}>"{activeQuery}"</span> across {panels.length} panels
          </span>
        </div>
      )}

      <div className={`flex-1 grid ${gridClass} gap-1 p-1 overflow-hidden`}>
        {panels.map((panel) => {
          const tool = getTool(panel.toolId);
          const url = getPanelUrl(panel);
          const catColor = CATEGORY_COLORS[tool?.category] || "#ff5050";

          return (
            <div key={panel.id} className="flex flex-col overflow-hidden rounded-xl relative"
              style={{ background: "rgba(8,2,4,0.9)", border: "1px solid rgba(200,30,30,0.1)" }}>
              <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
                style={{ borderBottom: `1px solid ${catColor}20`, background: "rgba(6,2,4,0.95)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background: catColor, opacity: 0.7 }} />
                <button onClick={() => setShowToolPicker(showToolPicker === panel.id ? null : panel.id)}
                  className="flex items-center gap-1 text-[10px] font-mono hover:opacity-80"
                  style={{ color: catColor, opacity: 0.75 }}>
                  {tool?.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
                <span className="text-[8px] font-mono" style={{ color: `${catColor}50` }}>{tool?.category}</span>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="ml-auto text-foreground/20 hover:text-foreground/60">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {panels.length > 1 && (
                  <button onClick={() => removePanel(panel.id)} className="text-foreground/15 hover:text-red-500/60 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showToolPicker === panel.id && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-9 left-0 z-30 w-52 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: "rgba(6,1,3,0.98)", border: "1px solid rgba(200,30,30,0.2)" }}>
                    <div className="p-2 max-h-60 overflow-y-auto space-y-0.5">
                      {OSINT_TOOLS.map(t => (
                        <button key={t.id} onClick={() => setTool(panel.id, t.id)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all hover:bg-foreground/5"
                          style={{ background: panel.toolId === t.id ? "rgba(200,30,30,0.12)" : "transparent" }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[t.category] || "#ff5050", opacity: 0.7 }} />
                          <span className="text-[10px] font-mono" style={{ color: "rgba(220,160,160,0.7)" }}>{t.label}</span>
                          <span className="ml-auto text-[8px] font-mono" style={{ color: "rgba(160,80,80,0.35)" }}>{t.category}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {showToolPicker === panel.id && (
                <div className="absolute inset-0 z-20" onClick={() => setShowToolPicker(null)} />
              )}

              <div className="flex-1 relative overflow-hidden">
                {!activeQuery ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
                    <Globe className="w-8 h-8 opacity-10" style={{ color: catColor }} />
                    <p className="text-[10px] font-mono" style={{ color: `${catColor}50` }}>{tool?.label}</p>
                    <p className="text-[9px] font-mono" style={{ color: "rgba(180,80,80,0.25)" }}>Enter a query above</p>
                  </div>
                ) : (
                  <iframe
                    key={`${panel.id}-${activeQuery}`}
                    src={url}
                    className="w-full h-full"
                    style={{ border: "none", background: "#050103" }}
                    title={tool?.label}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center px-4 py-1.5 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(200,30,30,0.06)" }}>
        <p className="text-[8px] font-mono" style={{ color: "rgba(180,60,60,0.25)" }}>
          Some tools block iframes — use ↗ to open in new tab. All panels search the same target simultaneously.
        </p>
      </div>
    </div>
  );
}