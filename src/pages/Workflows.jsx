const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Play, Save, Zap, Search, Brain, Filter, Mail, AlertTriangle, Globe, Tag, ArrowRight, ChevronRight } from "lucide-react";

const NODE_TYPES = [
  { type: "research", label: "Research", icon: Search, color: "rgba(80,160,255,0.7)", desc: "Deep web research on topic" },
  { type: "osint", label: "OSINT Sweep", icon: Globe, color: "rgba(255,80,80,0.7)", desc: "Open-source intelligence gathering" },
  { type: "summarize", label: "Summarize", icon: Brain, color: "rgba(160,80,255,0.7)", desc: "Compress and synthesize data" },
  { type: "filter", label: "Filter", icon: Filter, color: "rgba(80,255,160,0.7)", desc: "Filter by keywords or criteria" },
  { type: "classify", label: "Classify", icon: Tag, color: "rgba(255,180,80,0.7)", desc: "Categorize and tag content" },
  { type: "alert", label: "Alert", icon: AlertTriangle, color: "rgba(255,140,60,0.7)", desc: "Trigger notification" },
  { type: "email", label: "Send Email", icon: Mail, color: "rgba(80,220,255,0.7)", desc: "Compose and dispatch email" },
  { type: "search", label: "Live Search", icon: Zap, color: "rgba(255,220,80,0.7)", desc: "Real-time search query" },
];

const NODE_MAP = Object.fromEntries(NODE_TYPES.map((n) => [n.type, n]));

function genId() { return Math.random().toString(36).slice(2, 8); }

export default function Workflows() {
  const qc = useQueryClient();
  const [activeWf, setActiveWf] = useState(null);
  const [canvasNodes, setCanvasNodes] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => db.entities.Workflow.list("-created_date"),
  });

  const save = useMutation({
    mutationFn: (data) => data.id
      ? db.entities.Workflow.update(data.id, data)
      : db.entities.Workflow.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const remove = useMutation({
    mutationFn: (id) => db.entities.Workflow.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workflows"] }); if (activeWf?.id === activeWf?.id) { setActiveWf(null); setCanvasNodes([]); } },
  });

  const loadWorkflow = (wf) => {
    setActiveWf(wf);
    setCanvasNodes(wf.nodes || []);
  };

  const addNodeToCanvas = (nodeType) => {
    const def = NODE_MAP[nodeType];
    setCanvasNodes((prev) => [...prev, { id: genId(), type: nodeType, label: def.label, position: prev.length }]);
  };

  const removeNode = (id) => setCanvasNodes((prev) => prev.filter((n) => n.id !== id));

  const handleDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const next = [...canvasNodes];
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setCanvasNodes(next.map((n, i) => ({ ...n, position: i })));
  };

  const saveWorkflow = () => {
    const connections = canvasNodes.slice(0, -1).map((n, i) => ({ from: n.id, to: canvasNodes[i + 1].id }));
    save.mutate({ ...(activeWf || {}), name: activeWf?.name || newName || "Untitled Workflow", nodes: canvasNodes, connections, status: "draft" });
  };

  const runWorkflow = () => {
    if (!canvasNodes.length) return;
    const tasks = canvasNodes.map((n) => n.label).join(" → ");
    // Execute: open search for first research/osint node
    const firstSearch = canvasNodes.find((n) => n.type === "research" || n.type === "osint" || n.type === "search");
    if (firstSearch) window.open(`https://google.com/search?q=${encodeURIComponent(activeWf?.name || "research")}`, "_blank");
    alert(`Workflow triggered: ${tasks}`);
  };

  const createNew = () => {
    setActiveWf({ name: newName || "New Workflow", nodes: [], connections: [] });
    setCanvasNodes([]);
    setShowNew(false);
    setNewName("");
  };

  return (
    <div className="h-full flex overflow-hidden" style={{ color: "rgba(240,200,200,0.8)" }}>
      {/* Sidebar — saved workflows */}
      <div className="w-52 flex-shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderRight: "1px solid rgba(200,30,30,0.12)", background: "rgba(8,2,2,0.6)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>WORKFLOWS</span>
          <button onClick={() => setShowNew(true)} style={{ color: "rgba(255,80,80,0.5)" }}><Plus className="w-3.5 h-3.5" /></button>
        </div>

        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="rounded-lg p-2 space-y-2" style={{ border: "1px solid rgba(200,40,40,0.2)", background: "rgba(15,4,4,0.8)" }}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Workflow name..."
                className="w-full bg-transparent text-[10px] font-mono focus:outline-none" style={{ color: "rgba(255,200,200,0.7)", borderBottom: "1px solid rgba(200,50,50,0.2)" }} />
              <div className="flex gap-1">
                <button onClick={createNew} className="px-2 py-0.5 rounded text-[9px] font-mono" style={{ background: "rgba(200,20,20,0.3)", color: "rgba(255,150,150,0.8)" }}>CREATE</button>
                <button onClick={() => setShowNew(false)} className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {workflows.map((wf) => (
          <div key={wf.id} onClick={() => loadWorkflow(wf)}
            className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all"
            style={{
              background: activeWf?.id === wf.id ? "rgba(200,30,30,0.15)" : "rgba(15,4,4,0.5)",
              border: `1px solid ${activeWf?.id === wf.id ? "rgba(200,40,40,0.3)" : "rgba(200,30,30,0.08)"}`,
            }}>
            <Zap className="w-3 h-3 flex-shrink-0" style={{ color: wf.status === "active" ? "rgba(80,255,160,0.6)" : "rgba(255,80,80,0.35)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono truncate" style={{ color: "rgba(255,200,200,0.6)" }}>{wf.name}</p>
              <p className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>{(wf.nodes || []).length} nodes</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); remove.mutate(wf.id); }} style={{ color: "rgba(200,60,60,0.3)" }}>
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        {workflows.length === 0 && !showNew && (
          <p className="text-center py-4 text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.2)" }}>NO WORKFLOWS</p>
        )}

        {/* Node palette */}
        <div className="pt-3" style={{ borderTop: "1px solid rgba(200,30,30,0.1)" }}>
          <p className="text-[9px] font-mono tracking-widest mb-2" style={{ color: "rgba(255,80,80,0.3)" }}>ADD NODE</p>
          <div className="space-y-1">
            {NODE_TYPES.map((nt) => {
              const Icon = nt.icon;
              return (
                <button key={nt.type} onClick={() => addNodeToCanvas(nt.type)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all"
                  style={{ background: "rgba(15,4,4,0.5)", border: "1px solid rgba(200,30,30,0.1)" }}
                  title={nt.desc}>
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: nt.color }} />
                  <span className="text-[10px] font-mono" style={{ color: "rgba(255,180,180,0.5)" }}>{nt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(200,30,30,0.1)", background: "rgba(8,2,2,0.5)" }}>
          <span className="text-[11px] font-mono" style={{ color: "rgba(255,150,150,0.6)", fontFamily: "'Orbitron', sans-serif" }}>
            {activeWf?.name || "SELECT OR CREATE A WORKFLOW"}
          </span>
          {activeWf && (
            <div className="flex gap-2">
              <button onClick={saveWorkflow} className="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono transition-all"
                style={{ border: "1px solid rgba(200,40,40,0.25)", color: "rgba(255,120,120,0.6)" }}>
                <Save className="w-3 h-3" /> SAVE
              </button>
              <button onClick={runWorkflow} disabled={canvasNodes.length === 0}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono transition-all"
                style={{ background: canvasNodes.length ? "rgba(200,20,20,0.3)" : "transparent", border: "1px solid rgba(200,40,40,0.3)", color: "rgba(255,100,100,0.7)" }}>
                <Play className="w-3 h-3" /> RUN
              </button>
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div className="flex-1 overflow-auto p-6">
          {!activeWf ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-[11px] font-mono text-center" style={{ color: "rgba(200,80,80,0.2)" }}>
                Select a workflow from the sidebar<br />or create a new one to start building
              </p>
            </div>
          ) : canvasNodes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-[11px] font-mono text-center" style={{ color: "rgba(200,80,80,0.2)" }}>
                Click nodes from the left panel<br />to add them to the canvas
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="canvas" direction="horizontal">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex items-center gap-2 flex-wrap min-h-32">
                    {canvasNodes.map((node, idx) => {
                      const def = NODE_MAP[node.type] || NODE_TYPES[0];
                      const Icon = def.icon;
                      return (
                        <Draggable key={node.id} draggableId={node.id} index={idx}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                              className="flex items-center gap-1 select-none cursor-grab active:cursor-grabbing">
                              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                className="relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl"
                                style={{ background: "rgba(12,3,3,0.9)", border: `1px solid ${def.color.replace("0.7", "0.3")}`, minWidth: "100px" }}>
                                <Icon className="w-5 h-5" style={{ color: def.color }} />
                                <span className="text-[10px] font-mono text-center" style={{ color: "rgba(255,200,200,0.7)" }}>{node.label}</span>
                                <span className="text-[8px] font-mono" style={{ color: def.color.replace("0.7", "0.5") }}>{def.desc}</span>
                                <button onClick={() => removeNode(node.id)}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                                  style={{ background: "rgba(200,20,20,0.5)", border: "1px solid rgba(255,60,60,0.3)", color: "rgba(255,150,150,0.8)" }}>✕</button>
                              </motion.div>
                              {idx < canvasNodes.length - 1 && (
                                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(200,60,60,0.4)" }} />
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Connection map */}
        {canvasNodes.length > 1 && (
          <div className="px-4 py-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(200,30,30,0.08)", background: "rgba(8,2,2,0.4)" }}>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>CHAIN: </span>
              {canvasNodes.map((n, i) => (
                <span key={n.id} className="flex items-center gap-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(200,30,30,0.1)", color: "rgba(255,150,150,0.5)" }}>{n.label}</span>
                  {i < canvasNodes.length - 1 && <ChevronRight className="w-2.5 h-2.5" style={{ color: "rgba(200,60,60,0.3)" }} />}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}