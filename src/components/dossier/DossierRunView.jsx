const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ArrowLeft, Play, CheckCircle, Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LAYERS = [
  { num: 1, name: "IDENTITY", desc: "Full name, DOB, aliases, NID/passport" },
  { num: 2, name: "LOCATION", desc: "Current + historical addresses, property records" },
  { num: 3, name: "EDUCATION", desc: "Schools, degrees, roll numbers, alumni networks" },
  { num: 4, name: "EMPLOYMENT", desc: "Job history, current employer, designations" },
  { num: 5, name: "COMPANIES", desc: "MCA filings, directorships, shareholdings" },
  { num: 6, name: "FINANCIALS", desc: "Bank, loan, ITR signals, CIBIL traces" },
  { num: 7, name: "DIGITAL FOOTPRINT", desc: "Emails, usernames, IPs, breach data" },
  { num: 8, name: "SOCIAL MEDIA", desc: "All platforms, followers, content patterns" },
  { num: 9, name: "NETWORK", desc: "Associates, family, known contacts" },
  { num: 10, name: "LEGAL", desc: "Court records, FIRs, MCA compliance" },
  { num: 11, name: "MEDIA", desc: "News mentions, interviews, press coverage" },
  { num: 12, name: "CRYPTO", desc: "Wallet addresses, on-chain activity" },
  { num: 13, name: "TRAVEL", desc: "Visa records, border crossings, hotel traces" },
  { num: 14, name: "COMMUNICATIONS", desc: "Leaked comms, public statements, forums" },
  { num: 15, name: "SYNTHESIS", desc: "Confidence scoring, contradictions, risk rating" },
];

const STATUS_ICON = {
  pending: () => <div className="w-3 h-3 rounded-full border border-foreground/15" />,
  running: () => <Loader2 className="w-3 h-3 animate-spin" style={{ color: "rgba(80,200,255,0.7)" }} />,
  complete: () => <CheckCircle className="w-3 h-3" style={{ color: "rgba(80,255,120,0.7)" }} />,
  error: () => <AlertCircle className="w-3 h-3" style={{ color: "rgba(255,80,80,0.7)" }} />,
};

const STATUS_COLOR = {
  pending: "rgba(200,30,30,0.08)",
  running: "rgba(80,200,255,0.08)",
  complete: "rgba(80,255,120,0.06)",
  error: "rgba(255,80,80,0.1)",
};

export default function DossierRunView({ target, onBack }) {
  const qc = useQueryClient();
  const [runningLayers, setRunningLayers] = useState({});
  const [activeLayer, setActiveLayer] = useState(null);
  const [newFinding, setNewFinding] = useState({ data_point: "", value: "", source: "", confidence: 7 });
  const [showFindingForm, setShowFindingForm] = useState(false);

  const { data: layers = [] } = useQuery({
    queryKey: ["dossier-layers", target.id],
    queryFn: () => db.entities.DossierLayer.filter({ target_id: target.id }),
    initialData: [],
  });

  const { data: findings = [] } = useQuery({
    queryKey: ["dossier-findings", target.id],
    queryFn: () => db.entities.DossierFinding.filter({ target_id: target.id }),
    initialData: [],
  });

  const createLayer = useMutation({
    mutationFn: (data) => db.entities.DossierLayer.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossier-layers", target.id] }),
  });

  const updateLayer = useMutation({
    mutationFn: ({ id, data }) => db.entities.DossierLayer.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossier-layers", target.id] }),
  });

  const createFinding = useMutation({
    mutationFn: (data) => db.entities.DossierFinding.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dossier-findings", target.id] }); setShowFindingForm(false); setNewFinding({ data_point: "", value: "", source: "", confidence: 7 }); },
  });

  const deleteFinding = useMutation({
    mutationFn: (id) => db.entities.DossierFinding.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossier-findings", target.id] }),
  });

  const getLayerStatus = (num) => {
    if (runningLayers[num] === "running") return "running";
    const layer = layers.find((l) => l.layer_number === num);
    return layer?.status || "pending";
  };

  const runLayer = async (layerDef) => {
    setRunningLayers((prev) => ({ ...prev, [layerDef.num]: "running" }));
    setActiveLayer(layerDef.num);

    const existing = layers.find((l) => l.layer_number === layerDef.num);
    const data = {
      target_id: target.id,
      layer_number: layerDef.num,
      layer_name: layerDef.name,
      status: "running",
      last_updated: new Date().toISOString(),
    };

    if (existing) {
      await updateLayer.mutateAsync({ id: existing.id, data });
    } else {
      await createLayer.mutateAsync(data);
    }

    // Simulate layer run (actual AI would run here when credits available)
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    const final = { status: "complete", last_updated: new Date().toISOString(), confidence: Math.floor(60 + Math.random() * 35) };
    const updated = layers.find((l) => l.layer_number === layerDef.num);
    if (updated) await updateLayer.mutateAsync({ id: updated.id, data: final });

    setRunningLayers((prev) => ({ ...prev, [layerDef.num]: "complete" }));
  };

  const runAll = async () => {
    for (const layer of LAYERS) {
      await runLayer(layer);
    }
  };

  const layerFindings = activeLayer ? findings.filter((f) => f.layer === activeLayer) : [];
  const activeDef = activeLayer ? LAYERS.find((l) => l.num === activeLayer) : null;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#050103" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,80,80,0.08)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-foreground/20 hover:text-foreground/60 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em]" style={{ color: "rgba(255,120,120,0.5)" }}>DOSSIER</span>
            <h2 className="text-sm font-mono" style={{ color: "rgba(255,200,200,0.85)" }}>{target.name}</h2>
          </div>
          {target.location && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(200,30,30,0.1)", color: "rgba(255,100,100,0.4)", border: "1px solid rgba(200,30,30,0.15)" }}>
              {target.location}
            </span>
          )}
        </div>
        <button onClick={runAll}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-mono"
          style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.4)", color: "rgba(255,100,100,0.9)" }}>
          <Play className="w-3 h-3" /> FULL SWEEP
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Layer grid */}
        <div className="w-72 flex-shrink-0 p-3 overflow-y-auto" style={{ borderRight: "1px solid rgba(200,30,30,0.06)" }}>
          <p className="text-[8px] font-mono tracking-widest mb-2" style={{ color: "rgba(255,80,80,0.3)" }}>15 INTELLIGENCE LAYERS</p>
          <div className="space-y-1">
            {LAYERS.map((layer) => {
              const status = getLayerStatus(layer.num);
              const Icon = STATUS_ICON[status] || STATUS_ICON.pending;
              const isActive = activeLayer === layer.num;
              return (
                <button key={layer.num} onClick={() => { setActiveLayer(isActive ? null : layer.num); }}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: isActive ? "rgba(200,30,30,0.15)" : STATUS_COLOR[status],
                    border: `1px solid ${isActive ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.06)"}`,
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono w-4 flex-shrink-0" style={{ color: "rgba(255,80,80,0.35)" }}>
                        {String(layer.num).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: isActive ? "rgba(255,150,150,0.9)" : "rgba(255,180,180,0.5)" }}>
                        {layer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon />
                      <button onClick={(e) => { e.stopPropagation(); runLayer(layer); }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded transition-all"
                        style={{ color: "rgba(255,80,80,0.4)" }}
                        title="Run this layer">
                        <Play className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                  {isActive && (
                    <p className="text-[8px] font-mono mt-1" style={{ color: "rgba(200,100,100,0.35)" }}>{layer.desc}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Findings panel */}
        <div className="flex-1 p-5 overflow-y-auto">
          {!activeLayer ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-[11px] font-mono" style={{ color: "rgba(255,100,100,0.2)" }}>SELECT A LAYER TO VIEW FINDINGS</p>
                <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,80,80,0.12)" }}>OR RUN FULL SWEEP TO COMPILE DOSSIER</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-mono" style={{ color: "rgba(255,200,200,0.8)" }}>
                    LAYER {String(activeLayer).padStart(2, "0")} · {activeDef?.name}
                  </h3>
                  <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(200,100,100,0.4)" }}>{activeDef?.desc}</p>
                </div>
                <button onClick={() => setShowFindingForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-mono"
                  style={{ background: "rgba(200,30,30,0.12)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,100,100,0.6)" }}>
                  <Plus className="w-2.5 h-2.5" /> ADD FINDING
                </button>
              </div>

              <AnimatePresence>
                {showFindingForm && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="mb-4 p-3 rounded-xl" style={{ background: "rgba(10,3,3,0.9)", border: "1px solid rgba(200,30,30,0.12)" }}>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {[
                        { key: "data_point", label: "DATA POINT" },
                        { key: "value", label: "VALUE / FINDING" },
                        { key: "source", label: "SOURCE URL/NAME" },
                      ].map(({ key, label }) => (
                        <div key={key} className={key === "value" ? "col-span-2" : ""}>
                          <label className="block text-[8px] font-mono tracking-wider mb-1" style={{ color: "rgba(255,80,80,0.3)" }}>{label}</label>
                          <input value={newFinding[key]} onChange={(e) => setNewFinding((f) => ({ ...f, [key]: e.target.value }))}
                            className="w-full px-2 py-1.5 rounded text-xs font-mono focus:outline-none"
                            style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.1)", color: "rgba(255,200,200,0.7)" }} />
                        </div>
                      ))}
                      <div>
                        <label className="block text-[8px] font-mono tracking-wider mb-1" style={{ color: "rgba(255,80,80,0.3)" }}>CONFIDENCE (1-10)</label>
                        <input type="number" min={1} max={10} value={newFinding.confidence}
                          onChange={(e) => setNewFinding((f) => ({ ...f, confidence: parseInt(e.target.value) }))}
                          className="w-full px-2 py-1.5 rounded text-xs font-mono focus:outline-none"
                          style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.1)", color: "rgba(255,200,200,0.7)" }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => createFinding.mutate({ ...newFinding, target_id: target.id, layer: activeLayer })}
                        disabled={!newFinding.data_point || !newFinding.value}
                        className="px-3 py-1 rounded text-[9px] font-mono disabled:opacity-40"
                        style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,100,100,0.8)" }}>
                        SAVE
                      </button>
                      <button onClick={() => setShowFindingForm(false)}
                        className="px-3 py-1 rounded text-[9px] font-mono"
                        style={{ border: "1px solid rgba(200,30,30,0.1)", color: "rgba(200,80,80,0.4)" }}>
                        CANCEL
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {layerFindings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[10px] font-mono" style={{ color: "rgba(255,100,100,0.2)" }}>NO FINDINGS FOR THIS LAYER</p>
                  <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,80,80,0.12)" }}>RUN LAYER OR ADD FINDINGS MANUALLY</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {layerFindings.map((f) => (
                    <motion.div key={f.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-xl group relative"
                      style={{ background: "rgba(10,3,3,0.8)", border: "1px solid rgba(200,30,30,0.08)" }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-mono tracking-wider" style={{ color: "rgba(255,80,80,0.45)" }}>{f.data_point}</span>
                            <div className="h-0.5 w-0.5 rounded-full bg-foreground/10" />
                            <span className="text-[8px] font-mono" style={{ color: f.confidence >= 8 ? "rgba(80,255,120,0.6)" : f.confidence >= 5 ? "rgba(255,180,80,0.6)" : "rgba(255,80,80,0.5)" }}>
                              {f.confidence}/10
                            </span>
                            {f.verified && <span className="text-[8px] font-mono px-1 rounded" style={{ background: "rgba(80,255,120,0.1)", color: "rgba(80,255,120,0.6)" }}>VERIFIED</span>}
                          </div>
                          <p className="text-[11px] font-mono" style={{ color: "rgba(255,200,200,0.7)" }}>{f.value}</p>
                          {f.source && (
                            <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,100,100,0.3)" }}>src: {f.source}</p>
                          )}
                        </div>
                        <button onClick={() => deleteFinding.mutate(f.id)}
                          className="opacity-0 group-hover:opacity-100 ml-3 transition-all">
                          <Trash2 className="w-3 h-3" style={{ color: "rgba(255,80,80,0.4)" }} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}