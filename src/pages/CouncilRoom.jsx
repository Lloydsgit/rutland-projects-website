import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AGENTS = [
  { id: "iris",    name: "IRIS",    role: "Chief of Staff",         color: "#50c8ff", desc: "The eye. Routes everything. Protects you above all.", personality: "calm, watchful, dry humor" },
  { id: "reaper",  name: "REAPER",  role: "Field Ops / OSINT",      color: "#ff5050", desc: "Quiet, lethal. Hunts. Never misses.", personality: "laconic, precise, loyal" },
  { id: "forge",   name: "FORGE",   role: "Engineering Lead",       color: "#ff8830", desc: "Gruff, impatient. Swears at bad code. Claps when things ship.", personality: "direct, technical, no-nonsense" },
  { id: "muse",    name: "MUSE",    role: "Visual & Design",        color: "#cc50ff", desc: "Soft-spoken perfectionist. Holds the line on taste.", personality: "aesthetic, thoughtful, perfectionist" },
  { id: "nolan",   name: "NOLAN",   role: "Motion & Film",          color: "#ff50aa", desc: "Poetic. Sees stories everywhere. Speaks in metaphors.", personality: "cinematic, romantic about craft" },
  { id: "ink",     name: "INK",     role: "Content & Copy",         color: "#80ff50", desc: "Sharp tongue, fast. Cynical with warmth underneath.", personality: "witty, punchy, knows what lands" },
  { id: "oracle",  name: "ORACLE",  role: "Data & Strategy",        color: "#50ffff", desc: "Measured, slightly cold. Reveals warmth when right calls save you.", personality: "analytical, precise, strategic" },
  { id: "relay",   name: "RELAY",   role: "Workflow & Automation",  color: "#ffff50", desc: "Cheerful, hyper-competent. Never panics. The glue.", personality: "efficient, upbeat, systematic" },
  { id: "envoy",   name: "ENVOY",   role: "Comms & Outreach",       color: "#50ffaa", desc: "Charming. Knows what to say and what not to.", personality: "diplomatic, persuasive, perceptive" },
  { id: "aegis",   name: "AEGIS",   role: "Security & OPSEC",       color: "#ffaa50", desc: "Stoic, paranoid (productively). Watches every flank.", personality: "vigilant, protective, tactical" },
  { id: "archive", name: "ARCHIVE", role: "Knowledge & Memory",     color: "#aaaaff", desc: "Old soul. Remembers everything. Whispers callbacks.", personality: "methodical, archival, wise" },
  { id: "atlas",   name: "ATLAS",   role: "Deep Reasoning (ATS)",   color: "#ffffff", desc: "Silent monk. Speaks rarely. When he speaks, the room stops.", personality: "profound, unhurried, decisive" },
];

const BANTER = [
  { from: "FORGE", to: "REAPER", line: "Still haven't slept?" },
  { from: "REAPER", to: null, line: "Don't need to." },
  { from: "INK", to: "MUSE", line: "Is 'aesthetic' a plan?" },
  { from: "MUSE", to: null, line: "It's the only plan." },
  { from: "ORACLE", to: null, line: "Pattern holds. Third time this week." },
  { from: "AEGIS", to: "RELAY", line: "Exposure vector at 3 o'clock." },
  { from: "RELAY", to: null, line: "Routing around it." },
  { from: "ARCHIVE", to: null, line: "You said the same thing on March 4th." },
  { from: "IRIS", to: null, line: "All of you, focus." },
  { from: "FORGE", to: "INK", line: "Just ship the copy." },
  { from: "INK", to: null, line: "Bad copy sinks ships." },
  { from: "NOLAN", to: null, line: "Every op is a story. Make it worth telling." },
];

function AgentSeat({ agent, index, total, selected, onSelect }) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const R = 195;
  const cx = 300 + R * Math.cos(angle);
  const cy = 300 + R * Math.sin(angle);
  const isSelected = selected === agent.id;
  const isAtlas = agent.id === "atlas";

  return (
    <g onClick={() => onSelect(agent.id)} style={{ cursor: "pointer" }}>
      {/* Outer pulse */}
      {!isAtlas && (
        <circle cx={cx} cy={cy} r={28} fill="none" stroke={agent.color} strokeWidth={0.5} opacity={0.1}>
          <animate attributeName="r" values="26;34;26" dur={`${2.5 + index * 0.2}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.04;0.1" dur={`${2.5 + index * 0.2}s`} repeatCount="indefinite" />
        </circle>
      )}
      {/* Seat circle */}
      <circle cx={cx} cy={cy} r={22}
        fill={isSelected ? `${agent.color}25` : isAtlas ? "rgba(0,0,0,0.8)" : `${agent.color}10`}
        stroke={agent.color}
        strokeWidth={isSelected ? 2 : isAtlas ? 0.5 : 1}
        strokeOpacity={isAtlas ? 0.2 : isSelected ? 0.9 : 0.4}
      />
      {/* Active glow for selected */}
      {isSelected && <circle cx={cx} cy={cy} r={26} fill="none" stroke={agent.color} strokeWidth={1} opacity={0.5} strokeDasharray="4 3" />}
      {/* Initial */}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={isAtlas && !isSelected ? "#333" : agent.color}
        fontSize={isAtlas ? 10 : 11}
        fontFamily="'Orbitron', monospace" fontWeight="700"
        opacity={isAtlas && !isSelected ? 0.5 : 1}
        pointerEvents="none">
        {agent.name.slice(0, 2)}
      </text>
      {/* Name tag */}
      <text x={cx} y={cy + 33} textAnchor="middle"
        fill={agent.color} fontSize={7.5} fontFamily="monospace"
        opacity={isSelected ? 0.9 : 0.45} pointerEvents="none">
        {agent.name}
      </text>
    </g>
  );
}

export default function CouncilRoom() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [banterIdx, setBanterIdx] = useState(0);
  const [banterVisible, setBanterVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setBanterVisible(false);
      setTimeout(() => {
        setBanterIdx(i => (i + 1) % BANTER.length);
        setBanterVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const selectedAgent = AGENTS.find(a => a.id === selected);

  const handleChat = () => {
    if (!selectedAgent) return;
    sessionStorage.setItem("cmd-palette-prompt", JSON.stringify({
      prompt: `You are now ${selectedAgent.name} of the Council. Role: ${selectedAgent.role}. Personality: ${selectedAgent.personality}. ${selectedAgent.desc} Respond in character. Mr. Lloyds is addressing you.`,
      label: `Chat with ${selectedAgent.name}`,
      ts: Date.now()
    }));
    navigate("/");
  };

  const banter = BANTER[banterIdx];

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#020105" }}>
      {/* Main canvas */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Background particle field */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(80,100,255,0.04) 0%, transparent 70%)"
        }} />

        <svg width="600" height="600" viewBox="0 0 600 600" style={{ maxWidth: "90vmin", maxHeight: "90vmin" }}>
          <defs>
            <radialGradient id="tableGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(40,20,60,0.6)" />
              <stop offset="100%" stopColor="rgba(10,5,20,0.8)" />
            </radialGradient>
            <filter id="councilGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Council table */}
          <circle cx={300} cy={300} r={120} fill="url(#tableGrad)" stroke="rgba(80,100,255,0.15)" strokeWidth={1} />
          <circle cx={300} cy={300} r={100} fill="none" stroke="rgba(80,100,255,0.08)" strokeWidth={0.5} />

          {/* Connection arcs */}
          {selected && (() => {
            const agentIdx = AGENTS.findIndex(a => a.id === selected);
            const angle = (agentIdx / AGENTS.length) * 2 * Math.PI - Math.PI / 2;
            const R = 195;
            const x = 300 + R * Math.cos(angle);
            const y = 300 + R * Math.sin(angle);
            const ag = AGENTS[agentIdx];
            return (
              <line x1={300} y1={300} x2={x} y2={y}
                stroke={ag.color} strokeWidth={0.8} opacity={0.3} strokeDasharray="4 4" />
            );
          })()}

          {/* IRIS at center */}
          <g onClick={() => setSelected(selected === "iris" ? null : "iris")} style={{ cursor: "pointer" }}>
            <circle cx={300} cy={300} r={38} fill="rgba(80,200,255,0.06)" stroke="#50c8ff" strokeWidth={1} opacity={0.6} filter="url(#councilGlow)" />
            <circle cx={300} cy={300} r={30} fill="rgba(80,200,255,0.08)" stroke="#50c8ff" strokeWidth={1.5} opacity={0.8} />
            <text x={300} y={297} textAnchor="middle" dominantBaseline="middle" fill="#50c8ff" fontSize={11} fontFamily="'Orbitron', monospace" fontWeight="800">IRIS</text>
            <text x={300} y={311} textAnchor="middle" fill="#50c8ff" fontSize={7} fontFamily="monospace" opacity={0.5}>CHIEF OF STAFF</text>
            <circle cx={300} cy={300} r={44} fill="none" stroke="#50c8ff" strokeWidth={0.5} opacity={0.15}>
              <animate attributeName="r" values="40;52;40" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.04;0.15" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* 11 remaining agents (skip iris, it's center) */}
          {AGENTS.filter(a => a.id !== "iris").map((agent, i) => (
            <AgentSeat key={agent.id} agent={agent} index={i} total={11}
              selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
          ))}
        </svg>

        {/* Header */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-[11px] font-mono tracking-[0.35em]" style={{ color: "rgba(80,200,255,0.4)", fontFamily: "'Orbitron', sans-serif" }}>
            THE COUNCIL — 12 OF 12 ONLINE
          </p>
        </div>

        {/* Banter ticker */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <AnimatePresence mode="wait">
            {banterVisible && (
              <motion.div key={banterIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="text-center">
                <span className="text-[9px] font-mono" style={{ color: "rgba(150,100,200,0.35)" }}>
                  {banter.from}
                  {banter.to ? <span style={{ color: "rgba(100,80,150,0.25)" }}> → {banter.to}:</span> : ":"}
                  &nbsp;"{banter.line}"
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden"
            style={{ background: "rgba(5,2,10,0.98)", borderLeft: `1px solid ${selectedAgent.color}25` }}>
            <div className="p-5 space-y-4 w-[260px]">
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: `${selectedAgent.color}12`, border: `1.5px solid ${selectedAgent.color}40` }}>
                  <span className="text-xl font-heading" style={{ color: selectedAgent.color, fontFamily: "'Orbitron', sans-serif" }}>
                    {selectedAgent.name.slice(0, 2)}
                  </span>
                </div>
                <h2 className="text-sm font-heading" style={{ color: selectedAgent.color, fontFamily: "'Orbitron', sans-serif" }}>
                  {selectedAgent.name}
                </h2>
                <p className="text-[9px] font-mono mt-0.5" style={{ color: `${selectedAgent.color}70` }}>
                  {selectedAgent.role}
                </p>
              </div>

              <p className="text-[11px] font-mono leading-relaxed" style={{ color: "rgba(200,180,255,0.55)" }}>
                {selectedAgent.desc}
              </p>

              <div className="space-y-1.5">
                <p className="text-[8px] font-mono tracking-widest" style={{ color: `${selectedAgent.color}50` }}>PERSONALITY</p>
                <p className="text-[10px] font-mono italic" style={{ color: "rgba(180,160,220,0.45)" }}>
                  {selectedAgent.personality}
                </p>
              </div>

              {selectedAgent.id === "atlas" && (
                <div className="p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[9px] font-mono" style={{ color: "rgba(200,200,200,0.4)" }}>
                    Atlas speaks rarely. Engage only when the decision is too important to gut-call. ATS ignition required.
                  </p>
                </div>
              )}

              <button onClick={handleChat}
                className="w-full py-2 rounded-xl text-[10px] font-mono font-bold tracking-wider transition-all hover:opacity-90"
                style={{ background: `${selectedAgent.color}20`, border: `1px solid ${selectedAgent.color}50`, color: selectedAgent.color }}>
                OPEN CHANNEL →
              </button>

              <button onClick={() => setSelected(null)}
                className="w-full py-1.5 rounded-xl text-[9px] font-mono"
                style={{ border: "1px solid rgba(200,100,200,0.1)", color: "rgba(180,100,180,0.35)" }}>
                DISMISS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}