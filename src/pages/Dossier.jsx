const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Search, Plus, Eye, Trash2, Star, Clock, Shield, User, AlertTriangle, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import DossierRunView from "@/components/dossier/DossierRunView";

const STATUS_COLOR = { active: "#44ffaa", archived: "rgba(200,200,200,0.4)", monitoring: "#44aaff" };

export default function Dossier() {
  const qc = useQueryClient();
  const [searchQ, setSearchQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", email: "", phone: "", known_data: "", notes: "" });

  const { data: targets = [] } = useQuery({
    queryKey: ["targets"],
    queryFn: () => db.entities.Target.list("-created_date"),
  });

  const createTarget = useMutation({
    mutationFn: (data) => db.entities.Target.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["targets"] }); setShowForm(false); setForm({ name: "", location: "", email: "", phone: "", known_data: "", notes: "" }); },
  });

  const deleteTarget = useMutation({
    mutationFn: (id) => db.entities.Target.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets"] }),
  });

  const toggleWatchlist = useMutation({
    mutationFn: ({ id, watchlist }) => db.entities.Target.update(id, { watchlist }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets"] }),
  });

  const exportTargetPDF = (target) => {
    const doc = new jsPDF();
    const W = 210; const m = 18; let y = m;
    doc.setFillColor(8, 2, 4);
    doc.rect(0, 0, W, 35, "F");
    doc.setTextColor(220, 60, 60);
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text(`DOSSIER — ${target.name}`, m, 16);
    doc.setFontSize(8); doc.setTextColor(160, 80, 80);
    doc.text(`Generated: ${new Date().toISOString().slice(0, 10)} | JARVIS Intelligence Platform`, m, 25);
    y = 45;
    const field = (label, val) => {
      if (!val) return;
      if (y > 270) { doc.addPage(); y = m; }
      doc.setTextColor(180, 80, 80); doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(label + ":", m, y);
      doc.setTextColor(210, 160, 160); doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(String(val), W - m * 2 - 30);
      doc.text(lines, m + 32, y);
      y += lines.length * 5 + 2;
    };
    field("Name", target.name); field("Location", target.location); field("Email", target.email);
    field("Phone", target.phone); field("Status", target.status); field("Confidence", target.confidence_score ? `${target.confidence_score}%` : undefined);
    field("Known Data", target.known_data); field("Notes", target.notes);
    doc.save(`Dossier_${target.name.replace(/\s+/g,'_')}_${Date.now()}.pdf`);
  };

  const filtered = targets.filter((t) =>
    !searchQ || t.name?.toLowerCase().includes(searchQ.toLowerCase()) || t.location?.toLowerCase().includes(searchQ.toLowerCase())
  );

  if (activeTarget) {
    return <DossierRunView target={activeTarget} onBack={() => setActiveTarget(null)} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#050103" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,80,80,0.08)" }}>
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
          <span className="text-[10px] font-mono tracking-[0.3em]" style={{ color: "rgba(255,120,120,0.5)" }}>
            DOSSIER SYSTEM — {targets.length} TARGETS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "rgba(255,80,80,0.3)" }} />
            <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search targets…"
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none w-52"
              style={{ background: "rgba(20,4,4,0.8)", border: "1px solid rgba(255,80,80,0.1)", color: "rgba(255,200,200,0.8)" }} />
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono"
            style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,100,100,0.8)" }}>
            <Plus className="w-3 h-3" /> NEW TARGET
          </button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden"
            style={{ borderBottom: "1px solid rgba(255,80,80,0.08)", background: "rgba(12,3,3,0.95)" }}>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: "name", label: "TARGET NAME *", full: false },
                { key: "location", label: "KNOWN LOCATION", full: false },
                { key: "email", label: "EMAIL", full: false },
                { key: "phone", label: "PHONE", full: false },
                { key: "known_data", label: "KNOWN DATA / SEED INFO", full: true },
                { key: "notes", label: "NOTES", full: false },
              ].map(({ key, label, full }) => (
                <div key={key} className={full ? "col-span-2 md:col-span-3" : ""}>
                  <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>{label}</label>
                  <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none"
                    style={{ background: "rgba(20,4,4,0.6)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(255,200,200,0.7)" }} />
                </div>
              ))}
              <div className="col-span-2 md:col-span-3 flex gap-2">
                <button onClick={() => createTarget.mutate(form)} disabled={!form.name.trim()}
                  className="px-4 py-1.5 rounded text-[10px] font-mono disabled:opacity-40"
                  style={{ background: "rgba(200,30,30,0.3)", border: "1px solid rgba(200,30,30,0.4)", color: "rgba(255,100,100,0.9)" }}>
                  CREATE TARGET
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-1.5 rounded text-[10px] font-mono"
                  style={{ border: "1px solid rgba(200,30,30,0.1)", color: "rgba(200,80,80,0.4)" }}>
                  CANCEL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target list */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,80,80,0.1)" }} />
              <p className="text-[11px] font-mono" style={{ color: "rgba(255,100,100,0.25)" }}>NO TARGETS LOGGED</p>
              <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,80,80,0.15)" }}>ADD A TARGET TO BEGIN DOSSIER COMPILATION</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((target) => (
            <motion.div key={target.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 relative group"
              style={{ background: "rgba(10,3,3,0.9)", border: "1px solid rgba(200,30,30,0.1)" }}>
              {/* Status dot */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {target.watchlist && <Star className="w-3 h-3" style={{ color: "rgba(255,180,80,0.7)" }} />}
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[target.status] || STATUS_COLOR.active }} />
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(200,30,30,0.12)", border: "1px solid rgba(200,30,30,0.15)" }}>
                  <User className="w-4 h-4" style={{ color: "rgba(255,80,80,0.5)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-mono" style={{ color: "rgba(255,200,200,0.85)" }}>{target.name}</h3>
                  {target.location && (
                    <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(200,100,100,0.4)" }}>📍 {target.location}</p>
                  )}
                </div>
              </div>

              {target.known_data && (
                <p className="text-[9px] font-mono mb-3 leading-relaxed" style={{ color: "rgba(200,120,120,0.45)" }}>
                  {target.known_data.slice(0, 100)}{target.known_data.length > 100 ? "…" : ""}
                </p>
              )}

              {target.confidence_score > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-mono" style={{ color: "rgba(255,80,80,0.3)" }}>CONFIDENCE</span>
                    <span className="text-[8px] font-mono" style={{ color: "rgba(255,100,100,0.5)" }}>{target.confidence_score}%</span>
                  </div>
                  <div className="h-0.5 rounded-full" style={{ background: "rgba(200,30,30,0.1)" }}>
                    <div className="h-full rounded-full" style={{ width: `${target.confidence_score}%`, background: "rgba(80,255,120,0.5)" }} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(200,30,30,0.06)" }}>
                <button onClick={() => exportTargetPDF(target)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.15)" }}
                  title="Export PDF">
                  <FileDown className="w-3 h-3" style={{ color: "rgba(255,120,120,0.5)" }} />
                </button>
                <button onClick={() => setActiveTarget(target)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-mono transition-all"
                  style={{ background: "rgba(200,30,30,0.15)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,100,100,0.7)" }}>
                  <Eye className="w-3 h-3" /> RUN DOSSIER
                </button>
                <button onClick={() => toggleWatchlist.mutate({ id: target.id, watchlist: !target.watchlist })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: target.watchlist ? "rgba(255,180,80,0.15)" : "transparent", border: "1px solid rgba(200,30,30,0.1)" }}>
                  <Star className="w-3 h-3" style={{ color: target.watchlist ? "rgba(255,180,80,0.8)" : "rgba(200,80,80,0.3)" }} />
                </button>
                <button onClick={() => deleteTarget.mutate(target.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  style={{ border: "1px solid rgba(200,30,30,0.1)" }}>
                  <Trash2 className="w-3 h-3" style={{ color: "rgba(255,80,80,0.4)" }} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}