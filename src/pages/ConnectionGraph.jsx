const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Network, Plus, Trash2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const NODE_COLORS = {
  person: "#ff5050",
  domain: "#50c8ff",
  company: "#ffa050",
  phone: "#a050ff",
  email: "#50ff80",
  location: "#ffff50",
};

function randomPos() {
  return { x: 200 + Math.random() * 500, y: 100 + Math.random() * 400 };
}

export default function ConnectionGraph() {
  const qc = useQueryClient();
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [nodeForm, setNodeForm] = useState({ label: "", type: "person" });
  const [edgeForm, setEdgeForm] = useState({ from: "", to: "", relation: "connected to" });

  const { data: targets = [] } = useQuery({ queryKey: ["targets"], queryFn: () => db.entities.Target.list() });

  // Auto-populate from targets
  useEffect(() => {
    if (!targets.length || nodes.length) return;
    const initial = targets.slice(0, 8).map(t => ({
      id: t.id, label: t.name, type: "person",
      ...randomPos(),
    }));
    setNodes(initial);
  }, [targets]);

  const addNode = () => {
    if (!nodeForm.label.trim()) return;
    setNodes(prev => [...prev, { id: Date.now().toString(), label: nodeForm.label, type: nodeForm.type, ...randomPos() }]);
    setNodeForm({ label: "", type: "person" });
    setShowAddNode(false);
  };

  const addEdge = () => {
    if (!edgeForm.from || !edgeForm.to) return;
    setEdges(prev => [...prev, { id: Date.now().toString(), ...edgeForm }]);
    setEdgeForm({ from: "", to: "", relation: "connected to" });
    setShowAddEdge(false);
  };

  const removeNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (selected === id) setSelected(null);
  };

  // Drag handlers
  const onMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    const node = nodes.find(n => n.id === nodeId);
    setDragging(nodeId);
    setOffset({ x: svgPt.x - node.x, y: svgPt.y - node.y });
    setSelected(nodeId);
  }, [nodes]);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: svgPt.x - offset.x, y: svgPt.y - offset.y } : n));
  }, [dragging, offset]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  const getNode = (id) => nodes.find(n => n.id === id);

  // Auto-cluster: group nodes by type, compute risk
  const clusters = Object.keys(NODE_COLORS).map(type => {
    const group = nodes.filter(n => n.type === type);
    if (group.length < 2) return null;
    const risk = group.length >= 4 ? "CRITICAL" : group.length >= 3 ? "HIGH" : "MEDIUM";
    const cx = group.reduce((s, n) => s + n.x, 0) / group.length;
    const cy = group.reduce((s, n) => s + n.y, 0) / group.length;
    const radius = Math.max(...group.map(n => Math.sqrt((n.x - cx) ** 2 + (n.y - cy) ** 2))) + 38;
    return { type, color: NODE_COLORS[type], count: group.length, risk, cx, cy, radius };
  }).filter(Boolean);
  const RISK_COLOR = { CRITICAL: "#ff3030", HIGH: "#ffaa30", MEDIUM: "#ffff30" };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(200,30,30,0.1)", background: "rgba(8,2,4,0.95)" }}>
        <Network className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
        <span className="text-[9px] font-mono tracking-widest mr-auto" style={{ color: "rgba(255,100,100,0.5)", fontFamily: "'Orbitron', sans-serif" }}>
          CONNECTION GRAPH — {nodes.length} NODES · {edges.length} EDGES
        </span>
        <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-1.5 text-foreground/25 hover:text-foreground/60"><ZoomIn className="w-3.5 h-3.5" /></button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.3))} className="p-1.5 text-foreground/25 hover:text-foreground/60"><ZoomOut className="w-3.5 h-3.5" /></button>
        <button onClick={() => setScale(1)} className="p-1.5 text-foreground/25 hover:text-foreground/60"><RotateCcw className="w-3.5 h-3.5" /></button>
        <button onClick={() => setShowAddEdge(s => !s)}
          className="px-2.5 py-1 rounded-lg text-[9px] font-mono"
          style={{ background: "rgba(80,200,255,0.1)", border: "1px solid rgba(80,200,255,0.2)", color: "rgba(80,200,255,0.7)" }}>
          + LINK
        </button>
        <button onClick={() => setShowAddNode(s => !s)}
          className="px-2.5 py-1 rounded-lg text-[9px] font-mono"
          style={{ background: "rgba(200,30,30,0.15)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.7)" }}>
          + NODE
        </button>
      </div>

      {/* Add forms */}
      {showAddNode && (
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
          style={{ background: "rgba(12,4,4,0.95)", borderBottom: "1px solid rgba(200,30,30,0.08)" }}>
          <input value={nodeForm.label} onChange={e => setNodeForm(f => ({ ...f, label: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addNode()}
            placeholder="Label…" className="bg-transparent border-b text-xs font-mono text-foreground/70 focus:outline-none pb-0.5 w-36"
            style={{ borderColor: "rgba(200,30,30,0.2)" }} />
          <select value={nodeForm.type} onChange={e => setNodeForm(f => ({ ...f, type: e.target.value }))}
            className="bg-transparent text-[10px] font-mono focus:outline-none"
            style={{ color: "rgba(200,120,120,0.6)", borderBottom: "1px solid rgba(200,30,30,0.2)" }}>
            {Object.keys(NODE_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={addNode} className="px-2 py-0.5 rounded text-[9px] font-mono"
            style={{ background: "rgba(200,30,30,0.2)", color: "rgba(255,120,120,0.7)" }}>ADD</button>
        </div>
      )}

      {showAddEdge && (
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0 flex-wrap"
          style={{ background: "rgba(12,4,4,0.95)", borderBottom: "1px solid rgba(200,30,30,0.08)" }}>
          <select value={edgeForm.from} onChange={e => setEdgeForm(f => ({ ...f, from: e.target.value }))}
            className="bg-transparent text-[10px] font-mono focus:outline-none"
            style={{ color: "rgba(200,120,120,0.6)", borderBottom: "1px solid rgba(80,200,255,0.2)" }}>
            <option value="">From node…</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <span className="text-foreground/20 text-xs">→</span>
          <input value={edgeForm.relation} onChange={e => setEdgeForm(f => ({ ...f, relation: e.target.value }))}
            className="bg-transparent border-b text-[10px] font-mono text-foreground/50 focus:outline-none pb-0.5 w-24"
            style={{ borderColor: "rgba(80,200,255,0.2)" }} />
          <span className="text-foreground/20 text-xs">→</span>
          <select value={edgeForm.to} onChange={e => setEdgeForm(f => ({ ...f, to: e.target.value }))}
            className="bg-transparent text-[10px] font-mono focus:outline-none"
            style={{ color: "rgba(200,120,120,0.6)", borderBottom: "1px solid rgba(80,200,255,0.2)" }}>
            <option value="">To node…</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <button onClick={addEdge} className="px-2 py-0.5 rounded text-[9px] font-mono"
            style={{ background: "rgba(80,200,255,0.1)", color: "rgba(80,200,255,0.7)" }}>LINK</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* SVG canvas */}
        <svg
          ref={svgRef}
          className="flex-1"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(200,30,30,0.04) 0%, #050103 70%)", cursor: dragging ? "grabbing" : "default" }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <g transform={`scale(${scale})`}>
            {/* Cluster hulls with risk labels */}
            {clusters.map(cl => (
              <g key={`cl-${cl.type}`}>
                <circle cx={cl.cx} cy={cl.cy} r={cl.radius}
                  fill={`${cl.color}05`} stroke={cl.color}
                  strokeWidth={1} strokeDasharray="6 4" opacity={0.35} />
                <rect x={cl.cx - 30} y={cl.cy - cl.radius - 20} width={60} height={14}
                  rx={4} fill={`${RISK_COLOR[cl.risk]}15`} stroke={`${RISK_COLOR[cl.risk]}50`} strokeWidth={0.6} />
                <text x={cl.cx} y={cl.cy - cl.radius - 9} textAnchor="middle"
                  fontSize={7} fontFamily="monospace" fill={RISK_COLOR[cl.risk]} fontWeight="bold">
                  {cl.risk} · {cl.count} nodes
                </text>
              </g>
            ))}
            {/* Edges */}
            {edges.map(edge => {
              const from = getNode(edge.from);
              const to = getNode(edge.to);
              if (!from || !to) return null;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={edge.id}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="rgba(200,80,80,0.25)" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={mx} y={my - 4} textAnchor="middle" fontSize={8} fill="rgba(200,100,100,0.45)" fontFamily="monospace">
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const color = NODE_COLORS[node.type] || NODE_COLORS.person;
              const isSelected = selected === node.id;
              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: "grab" }}
                  onMouseDown={e => onMouseDown(e, node.id)}>
                  {/* Glow */}
                  {isSelected && (
                    <circle r={26} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
                  )}
                  {/* Node circle */}
                  <circle r={18}
                    fill={`${color}18`}
                    stroke={color}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={0.9}
                  />
                  {/* Type initial */}
                  <text textAnchor="middle" dy={1} fontSize={9} fill={color} fontFamily="monospace" fontWeight="bold" pointerEvents="none">
                    {node.type[0].toUpperCase()}
                  </text>
                  {/* Label */}
                  <text textAnchor="middle" dy={30} fontSize={9} fill="rgba(240,200,200,0.7)" fontFamily="monospace" pointerEvents="none">
                    {node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Side panel */}
        {selected && (() => {
          const node = getNode(selected);
          if (!node) return null;
          const nodeEdges = edges.filter(e => e.from === selected || e.to === selected);
          return (
            <div className="w-52 flex-shrink-0 p-3 space-y-2 overflow-y-auto"
              style={{ background: "rgba(8,2,4,0.97)", borderLeft: "1px solid rgba(200,30,30,0.12)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(200,80,80,0.45)" }}>{node.type.toUpperCase()}</p>
                  <p className="text-sm font-mono mt-0.5" style={{ color: "rgba(255,200,200,0.85)" }}>{node.label}</p>
                </div>
                <button onClick={() => removeNode(selected)} className="text-foreground/20 hover:text-red-500/60 mt-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div style={{ borderTop: "1px solid rgba(200,30,30,0.1)" }} className="pt-2">
                <p className="text-[8px] font-mono tracking-widest mb-1.5" style={{ color: "rgba(200,80,80,0.35)" }}>CONNECTIONS ({nodeEdges.length})</p>
                {nodeEdges.map(e => {
                  const other = getNode(e.from === selected ? e.to : e.from);
                  return other ? (
                    <div key={e.id} className="text-[9px] font-mono py-1"
                      style={{ color: "rgba(200,140,140,0.6)", borderBottom: "1px solid rgba(200,30,30,0.05)" }}>
                      {e.from === selected ? "→" : "←"} {other.label} <span style={{ color: "rgba(160,80,80,0.4)" }}>({e.relation})</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0 flex-wrap"
        style={{ borderTop: "1px solid rgba(200,30,30,0.06)", background: "rgba(8,2,4,0.9)" }}>
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color, opacity: 0.7 }} />
            <span className="text-[8px] font-mono" style={{ color: "rgba(180,100,100,0.4)" }}>{type}</span>
          </div>
        ))}
        <span className="ml-auto text-[8px] font-mono" style={{ color: "rgba(180,80,80,0.25)" }}>Drag nodes to reposition</span>
      </div>
    </div>
  );
}