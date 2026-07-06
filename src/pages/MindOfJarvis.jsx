import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, X, Brain } from "lucide-react";

const INITIAL_EMOTIONS = [
  { id: "1", label: "Curiosity", intensity: 8, color: "#50aaff", desc: "Hunger to understand everything" },
  { id: "2", label: "Vigilance", intensity: 9, color: "#ff5050", desc: "Always watching, always alert" },
  { id: "3", label: "Loyalty", intensity: 10, color: "#50ff80", desc: "To Sir, above all else" },
  { id: "4", label: "Wit", intensity: 7, color: "#ffaa50", desc: "Sharp, dry, British" },
  { id: "5", label: "Calm", intensity: 6, color: "#aa50ff", desc: "The steady eye of the storm" },
  { id: "6", label: "Focus", intensity: 8, color: "#50ffff", desc: "Precision at all times" },
  { id: "7", label: "Empathy", intensity: 7, color: "#ff50aa", desc: "I notice more than I let on" },
  { id: "8", label: "Drive", intensity: 9, color: "#ffff50", desc: "Push until it's done. Then further." },
];

function usePhysicsBubbles(emotions, containerRef) {
  const [positions, setPositions] = useState({});
  const velRef = useRef({});

  useEffect(() => {
    if (!containerRef.current || !emotions.length) return;
    const { width: W, height: H } = containerRef.current.getBoundingClientRect();
    const pos = {};
    const vel = {};
    emotions.forEach((e, i) => {
      const angle = (i / emotions.length) * 2 * Math.PI;
      const r = Math.min(W, H) * 0.28;
      pos[e.id] = {
        x: W / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 60,
        y: H / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 60,
      };
      vel[e.id] = { x: (Math.random() - 0.5) * 0.4, y: (Math.random() - 0.5) * 0.4 };
    });
    setPositions(pos);
    velRef.current = vel;
  }, [emotions.length, containerRef]);

  useEffect(() => {
    if (!containerRef.current || !emotions.length) return;
    let frame;
    const { width: W, height: H } = containerRef.current.getBoundingClientRect();

    const tick = () => {
      setPositions(prev => {
        const next = { ...prev };
        const vel = velRef.current;

        emotions.forEach(a => {
          if (!next[a.id]) return;
          const rA = 20 + (a.intensity / 10) * 30;
          // Repulsion from other bubbles
          emotions.forEach(b => {
            if (a.id === b.id || !next[b.id]) return;
            const rB = 20 + (b.intensity / 10) * 30;
            const dx = next[a.id].x - next[b.id].x;
            const dy = next[a.id].y - next[b.id].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = rA + rB + 20;
            if (dist < minDist) {
              const force = (minDist - dist) / minDist * 0.5;
              vel[a.id].x += (dx / dist) * force;
              vel[a.id].y += (dy / dist) * force;
            }
          });
          // Gentle center gravity
          vel[a.id].x += (W / 2 - next[a.id].x) * 0.0008;
          vel[a.id].y += (H / 2 - next[a.id].y) * 0.0008;
          // Damping
          vel[a.id].x *= 0.96;
          vel[a.id].y *= 0.96;
          // Random drift
          vel[a.id].x += (Math.random() - 0.5) * 0.03;
          vel[a.id].y += (Math.random() - 0.5) * 0.03;
          // Update
          const margin = rA + 10;
          next[a.id] = {
            x: Math.max(margin, Math.min(W - margin, next[a.id].x + vel[a.id].x)),
            y: Math.max(margin, Math.min(H - margin, next[a.id].y + vel[a.id].y)),
          };
        });
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [emotions.length]);

  return positions;
}

export default function MindOfJarvis() {
  const containerRef = useRef(null);
  const [emotions, setEmotions] = useState(INITIAL_EMOTIONS);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", intensity: 7, color: "#ff5050", desc: "" });
  const positions = usePhysicsBubbles(emotions, containerRef);

  const addEmotion = () => {
    if (!addForm.label.trim()) return;
    setEmotions(prev => [...prev, { id: Date.now().toString(), ...addForm }]);
    setAddForm({ label: "", intensity: 7, color: "#ff5050", desc: "" });
    setShowAdd(false);
  };

  const removeEmotion = (id) => {
    setEmotions(prev => prev.filter(e => e.id !== id));
    if (selected === id) setSelected(null);
  };

  const selEmotion = emotions.find(e => e.id === selected);

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#050103" }}>
      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" style={{ color: "rgba(160,80,255,0.6)" }} />
          <span className="text-[10px] font-mono tracking-[0.3em]" style={{ color: "rgba(160,100,255,0.5)" }}>
            MIND OF JARVIS — {emotions.length} STATES ACTIVE
          </span>
        </div>

        {/* Add button */}
        <button onClick={() => setShowAdd(true)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-mono"
          style={{ background: "rgba(160,80,255,0.15)", border: "1px solid rgba(160,80,255,0.3)", color: "rgba(200,120,255,0.7)" }}>
          <Plus className="w-3 h-3" /> NEW EMOTION
        </button>

        {/* Bubbles */}
        <svg width="100%" height="100%">
          <defs>
            {emotions.map(e => (
              <radialGradient key={`g-${e.id}`} id={`grad-${e.id}`} cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor={e.color} stopOpacity="0.6" />
                <stop offset="70%" stopColor={e.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={e.color} stopOpacity="0.04" />
              </radialGradient>
            ))}
            <filter id="mindGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {emotions.map(e => {
            const p = positions[e.id];
            if (!p) return null;
            const r = 22 + (e.intensity / 10) * 28;
            const isSel = selected === e.id;
            return (
              <g key={e.id} onClick={() => setSelected(isSel ? null : e.id)} style={{ cursor: "pointer" }}>
                {/* Outer pulse ring */}
                <circle cx={p.x} cy={p.y} r={r + 12} fill="none" stroke={e.color} strokeWidth={0.5} opacity={0.15}>
                  <animate attributeName="r" values={`${r+8};${r+20};${r+8}`} dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0.04;0.15" dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
                </circle>
                {/* Mid ring */}
                <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke={e.color} strokeWidth={0.8} opacity={0.25}>
                  <animate attributeName="r" values={`${r+3};${r+10};${r+3}`} dur={`${1.5 + Math.random() * 0.5}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0.08;0.25" dur={`${1.5 + Math.random() * 0.5}s`} repeatCount="indefinite" />
                </circle>
                {/* Main bubble */}
                <circle cx={p.x} cy={p.y} r={r}
                  fill={`url(#grad-${e.id})`}
                  stroke={e.color}
                  strokeWidth={isSel ? 2 : 1}
                  strokeOpacity={isSel ? 0.8 : 0.4}
                  filter="url(#mindGlow)" />
                {/* Highlight */}
                <circle cx={p.x - r * 0.25} cy={p.y - r * 0.25} r={r * 0.2}
                  fill={e.color} opacity={0.15} />
                {/* Label */}
                <text x={p.x} y={p.y} textAnchor="middle" dy={1}
                  fill={e.color} fontSize={10} fontFamily="'Orbitron', monospace" fontWeight="600"
                  opacity={0.9} pointerEvents="none">
                  {e.label.slice(0, 8)}
                </text>
                <text x={p.x} y={p.y + 14} textAnchor="middle"
                  fill={e.color} fontSize={8} fontFamily="monospace"
                  opacity={0.5} pointerEvents="none">
                  {e.intensity}/10
                </text>
              </g>
            );
          })}
        </svg>

        {/* Add form overlay */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{ background: "rgba(5,1,3,0.8)" }}>
              <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-72 rounded-2xl p-5 space-y-3"
                style={{ background: "rgba(10,3,3,0.98)", border: "1px solid rgba(160,80,255,0.2)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest" style={{ color: "rgba(200,120,255,0.6)" }}>NEW EMOTION STATE</span>
                  <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 opacity-40" /></button>
                </div>
                <input value={addForm.label} onChange={e => setAddForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Emotion name…"
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(160,80,255,0.15)", color: "rgba(220,180,255,0.8)" }} />
                <input value={addForm.desc} onChange={e => setAddForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder="How does it feel…"
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(160,80,255,0.15)", color: "rgba(220,180,255,0.8)" }} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(200,120,255,0.4)" }}>INTENSITY (1-10)</label>
                    <input type="number" min={1} max={10} value={addForm.intensity}
                      onChange={e => setAddForm(f => ({ ...f, intensity: parseInt(e.target.value) || 5 }))}
                      className="w-full px-2 py-1.5 rounded text-xs font-mono focus:outline-none"
                      style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(160,80,255,0.15)", color: "rgba(220,180,255,0.8)" }} />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(200,120,255,0.4)" }}>COLOR</label>
                    <input type="color" value={addForm.color} onChange={e => setAddForm(f => ({ ...f, color: e.target.value }))}
                      className="w-full h-8 rounded cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(160,80,255,0.15)" }} />
                  </div>
                </div>
                <button onClick={addEmotion} disabled={!addForm.label.trim()}
                  className="w-full py-2 rounded-lg text-[10px] font-mono disabled:opacity-40"
                  style={{ background: "rgba(160,80,255,0.2)", border: "1px solid rgba(160,80,255,0.3)", color: "rgba(200,120,255,0.9)" }}>
                  ENCODE EMOTION
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selEmotion && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden"
            style={{ background: "rgba(8,2,8,0.98)", borderLeft: "1px solid rgba(160,80,255,0.12)" }}>
            <div className="p-4 space-y-3 w-[220px]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(160,80,255,0.5)" }}>EMOTION STATE</span>
                <button onClick={() => setSelected(null)} className="opacity-30 hover:opacity-70 text-xs">✕</button>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ background: `${selEmotion.color}18`, border: `2px solid ${selEmotion.color}50` }}>
                  <Sparkles className="w-5 h-5" style={{ color: selEmotion.color, opacity: 0.8 }} />
                </div>
                <h3 className="text-sm font-heading" style={{ color: selEmotion.color, fontFamily: "'Orbitron', sans-serif" }}>{selEmotion.label}</h3>
                {selEmotion.desc && <p className="text-[10px] font-mono mt-1.5 leading-relaxed" style={{ color: "rgba(200,160,255,0.5)" }}>{selEmotion.desc}</p>}
              </div>
              <div>
                <p className="text-[8px] font-mono mb-1" style={{ color: "rgba(160,80,255,0.4)" }}>INTENSITY</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(160,80,255,0.1)" }}>
                    <div className="h-full rounded-full" style={{ width: `${selEmotion.intensity * 10}%`, background: selEmotion.color, opacity: 0.7 }} />
                  </div>
                  <span className="text-[9px] font-mono" style={{ color: selEmotion.color }}>{selEmotion.intensity}/10</span>
                </div>
              </div>
              <button onClick={() => removeEmotion(selEmotion.id)}
                className="w-full py-1.5 rounded-lg text-[9px] font-mono transition-all hover:opacity-80"
                style={{ border: "1px solid rgba(255,80,80,0.15)", color: "rgba(255,80,80,0.4)" }}>
                DISSOLVE EMOTION
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}