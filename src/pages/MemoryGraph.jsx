const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Brain, ZoomIn, ZoomOut, RotateCcw, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TYPE_COLOR = {
  goal: "#ff4444",
  research: "#44aaff",
  workflow: "#44ffaa",
  decision: "#ffaa44",
  preference: "#aa44ff",
  milestone: "#ff44aa",
  note: "rgba(200,200,200,0.6)",
};

// Simple force-directed graph using spring simulation
function useForceGraph(nodes, edges, width, height) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!nodes.length) return;
    // Initialize random positions
    const pos = {};
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const r = Math.min(width, height) * 0.3;
      pos[n.id] = {
        x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    });

    let current = { ...pos };
    let frame;
    let iter = 0;

    const tick = () => {
      iter++;
      const next = {};
      nodes.forEach((n) => {
        next[n.id] = { ...current[n.id] };
      });

      // Repulsion
      nodes.forEach((a) => {
        nodes.forEach((b) => {
          if (a.id === b.id) return;
          const dx = current[a.id].x - current[b.id].x;
          const dy = current[a.id].y - current[b.id].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1800 / (dist * dist);
          next[a.id].vx += (dx / dist) * force;
          next[a.id].vy += (dy / dist) * force;
        });
      });

      // Attraction along edges
      edges.forEach(({ source, target }) => {
        if (!current[source] || !current[target]) return;
        const dx = current[target].x - current[source].x;
        const dy = current[target].y - current[source].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.03;
        next[source].vx += (dx / dist) * force;
        next[source].vy += (dy / dist) * force;
        next[target].vx -= (dx / dist) * force;
        next[target].vy -= (dy / dist) * force;
      });

      // Center gravity
      nodes.forEach((n) => {
        next[n.id].vx += (width / 2 - current[n.id].x) * 0.005;
        next[n.id].vy += (height / 2 - current[n.id].y) * 0.005;
        next[n.id].vx *= 0.85;
        next[n.id].vy *= 0.85;
        next[n.id].x = Math.max(40, Math.min(width - 40, current[n.id].x + next[n.id].vx));
        next[n.id].y = Math.max(40, Math.min(height - 40, current[n.id].y + next[n.id].vy));
      });

      current = next;
      if (iter < 120) {
        frame = requestAnimationFrame(tick);
      }
      setPositions({ ...current });
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [nodes.length, width, height]);

  return positions;
}

export default function MemoryGraph() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", content: "", type: "note", tags: "", importance: 5 });
  const qc = useQueryClient();

  const addMemory = useMutation({
    mutationFn: (data) => db.entities.Memory.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      setShowAddForm(false);
      setAddForm({ title: "", content: "", type: "note", tags: "", importance: 5 });
    },
  });

  const { data: memories = [] } = useQuery({
    queryKey: ["memories"],
    queryFn: () => db.entities.Memory.list(),
    initialData: [],
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const filtered = filter === "all" ? memories : memories.filter((m) => m.type === filter);

  // Build graph nodes + edges from memories + tags
  const nodes = filtered.map((m) => ({
    id: m.id,
    label: m.title,
    type: m.type || "note",
    importance: m.importance || 5,
    tags: m.tags || [],
    content: m.content,
  }));

  // Edges: connect memories sharing tags
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const sharedTags = nodes[i].tags.filter((t) => nodes[j].tags.includes(t));
      if (sharedTags.length > 0) {
        edges.push({ source: nodes[i].id, target: nodes[j].id, label: sharedTags[0] });
      }
    }
  }

  const positions = useForceGraph(nodes, edges, dims.w, dims.h);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  };

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current) {
      setDragging({ startX: e.clientX - pan.x, startY: e.clientY - pan.y, isPan: true });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging?.isPan) {
      setPan({ x: e.clientX - dragging.startX, y: e.clientY - dragging.startY });
    }
  };

  const handleMouseUp = () => setDragging(null);

  const types = ["all", "goal", "research", "workflow", "decision", "preference", "note"];
  const selNode = selected ? nodes.find((n) => n.id === selected) : null;

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#050103" }}>
      {/* Graph area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Add node button */}
        <button onClick={() => setShowAddForm(true)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-mono"
          style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,100,100,0.7)" }}>
          <Plus className="w-3 h-3" /> ADD NODE
        </button>

        {/* Add node overlay */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{ background: "rgba(5,1,3,0.88)" }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="w-80 rounded-2xl p-5"
                style={{ background: "rgba(10,3,3,0.98)", border: "1px solid rgba(200,30,30,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.5)" }}>NEW MEMORY NODE</span>
                  <button onClick={() => setShowAddForm(false)}><X className="w-4 h-4" style={{ color: "rgba(200,80,80,0.4)" }} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>TITLE *</label>
                    <input value={addForm.title} onChange={(e) => setAddForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none"
                      style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.7)" }} />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>CONTENT / TOPIC</label>
                    <input value={addForm.content} onChange={(e) => setAddForm(f => ({ ...f, content: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none"
                      style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.7)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>TYPE</label>
                      <select value={addForm.type} onChange={(e) => setAddForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded text-xs font-mono focus:outline-none"
                        style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.7)" }}>
                        {["goal","research","workflow","decision","preference","note","milestone"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>IMPORTANCE</label>
                      <input type="number" min={1} max={10} value={addForm.importance}
                        onChange={(e) => setAddForm(f => ({ ...f, importance: parseInt(e.target.value) }))}
                        className="w-full px-2 py-1.5 rounded text-xs font-mono focus:outline-none"
                        style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.7)" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>TAGS (comma-separated)</label>
                    <input value={addForm.tags} onChange={(e) => setAddForm(f => ({ ...f, tags: e.target.value }))}
                      placeholder="ai, research, strategy"
                      className="w-full px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none"
                      style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.7)" }} />
                  </div>
                  <button
                    onClick={() => addMemory.mutate({ ...addForm, tags: addForm.tags.split(",").map(t => t.trim()).filter(Boolean), importance: Number(addForm.importance) })}
                    disabled={!addForm.title.trim()}
                    className="w-full py-2 rounded-lg text-[10px] font-mono disabled:opacity-40"
                    style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,100,100,0.8)" }}>
                    {addMemory.isPending ? "ADDING…" : "ADD TO MEMORY CORE"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="w-7 h-7 rounded-lg border border-foreground/10 bg-black/60 flex items-center justify-center text-foreground/40 hover:text-foreground/80">
            <ZoomIn className="w-3 h-3" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
            className="w-7 h-7 rounded-lg border border-foreground/10 bg-black/60 flex items-center justify-center text-foreground/40 hover:text-foreground/80">
            <ZoomOut className="w-3 h-3" />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="w-7 h-7 rounded-lg border border-foreground/10 bg-black/60 flex items-center justify-center text-foreground/40 hover:text-foreground/80">
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="absolute top-3 right-3 z-10 flex gap-1 flex-wrap justify-end max-w-xs">
          {types.map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all"
              style={{
                background: filter === t ? (TYPE_COLOR[t] || "rgba(255,80,80,0.3)") : "rgba(0,0,0,0.5)",
                border: `1px solid ${filter === t ? (TYPE_COLOR[t] || "rgba(255,80,80,0.5)") : "rgba(255,255,255,0.08)"}`,
                color: filter === t ? "#fff" : "rgba(255,255,255,0.3)",
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
          <span className="text-[10px] font-mono tracking-[0.3em]" style={{ color: "rgba(255,120,120,0.5)" }}>
            MEMORY CORE — {nodes.length} NODES · {edges.length} LINKS
          </span>
        </div>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,80,80,0.2)" }} />
              <p className="text-[11px] font-mono" style={{ color: "rgba(255,120,120,0.3)" }}>NO MEMORY NODES — ADD MEMORIES FIRST</p>
            </div>
          </div>
        )}

        <svg ref={svgRef} width="100%" height="100%"
          onWheel={handleWheel} onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          style={{ cursor: dragging ? "grabbing" : "grab" }}>
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,100,100,0.4)" />
              <stop offset="100%" stopColor="rgba(255,100,100,0)" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map((e, i) => {
              const s = positions[e.source];
              const t = positions[e.target];
              if (!s || !t) return null;
              return (
                <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke="rgba(255,80,80,0.12)" strokeWidth={1} strokeDasharray="3,4" />
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const p = positions[n.id];
              if (!p) return null;
              const r = 6 + (n.importance / 10) * 10;
              const color = TYPE_COLOR[n.type] || "rgba(200,200,200,0.6)";
              const isSelected = selected === n.id;
              return (
                <g key={n.id} onClick={() => setSelected(isSelected ? null : n.id)}
                  style={{ cursor: "pointer" }}>
                  {isSelected && (
                    <circle cx={p.x} cy={p.y} r={r + 8} fill="none"
                      stroke={color} strokeWidth={1} opacity={0.4} strokeDasharray="4,3" />
                  )}
                  <circle cx={p.x} cy={p.y} r={r + 4} fill={color} opacity={0.08}>
                    <animate attributeName="r" values={`${r+2};${r+10};${r+2}`} dur={`${1.8 + (n.importance % 3) * 0.4}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.08;0.03;0.08" dur={`${1.8 + (n.importance % 3) * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                    <circle cx={p.x} cy={p.y} r={r} fill={color} opacity={0.75}
                      filter="url(#glow)" stroke={isSelected ? "#fff" : color}
                      strokeWidth={isSelected ? 2 : 1} strokeOpacity={isSelected ? 0.8 : 0.5} />
                    <circle cx={p.x - r*0.25} cy={p.y - r*0.25} r={r*0.2} fill={color} opacity={0.2} />
                  <text x={p.x} y={p.y + r + 10} textAnchor="middle"
                    fill="rgba(255,220,220,0.55)" fontSize={9} fontFamily="monospace">
                    {n.label.slice(0, 18)}{n.label.length > 18 ? "…" : ""}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Detail panel */}
      {selNode && (
        <div className="w-64 border-l border-foreground/5 p-4 overflow-y-auto flex-shrink-0"
          style={{ background: "rgba(8,2,2,0.95)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>NODE DETAIL</span>
            <button onClick={() => setSelected(null)} className="text-foreground/20 hover:text-foreground/60 text-xs">✕</button>
          </div>
          <div className="space-y-2">
            <div className="inline-flex px-2 py-0.5 rounded text-[9px] font-mono"
              style={{ background: `${TYPE_COLOR[selNode.type]}20`, color: TYPE_COLOR[selNode.type], border: `1px solid ${TYPE_COLOR[selNode.type]}40` }}>
              {selNode.type?.toUpperCase()}
            </div>
            <h3 className="text-sm font-mono" style={{ color: "rgba(255,200,200,0.8)" }}>{selNode.label}</h3>
            {selNode.content && (
              <p className="text-[10px] font-mono leading-relaxed" style={{ color: "rgba(200,120,120,0.5)" }}>
                {selNode.content.slice(0, 200)}{selNode.content.length > 200 ? "…" : ""}
              </p>
            )}
            {selNode.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selNode.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-[8px] font-mono"
                    style={{ background: "rgba(200,30,30,0.1)", color: "rgba(255,100,100,0.5)", border: "1px solid rgba(200,30,30,0.15)" }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(200,30,30,0.08)" }}>
              <span className="text-[9px] font-mono" style={{ color: "rgba(255,80,80,0.3)" }}>
                IMPORTANCE: {selNode.importance}/10
              </span>
              <div className="mt-1 h-0.5 rounded-full" style={{ background: "rgba(200,30,30,0.1)" }}>
                <div className="h-full rounded-full" style={{ width: `${selNode.importance * 10}%`, background: TYPE_COLOR[selNode.type] }} />
              </div>
            </div>
            {/* Connections */}
            {(() => {
              const linked = edges.filter((e) => e.source === selNode.id || e.target === selNode.id);
              if (!linked.length) return null;
              return (
                <div className="mt-2">
                  <span className="text-[9px] font-mono" style={{ color: "rgba(255,80,80,0.3)" }}>LINKED TO</span>
                  <div className="mt-1 space-y-1">
                    {linked.slice(0, 5).map((e, i) => {
                      const otherId = e.source === selNode.id ? e.target : e.source;
                      const other = nodes.find((n) => n.id === otherId);
                      return (
                        <button key={i} onClick={() => setSelected(otherId)}
                          className="block text-left w-full text-[9px] font-mono truncate hover:underline"
                          style={{ color: "rgba(200,120,120,0.6)" }}>
                          → {other?.label} <span style={{ color: "rgba(200,80,80,0.3)" }}>#{e.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}