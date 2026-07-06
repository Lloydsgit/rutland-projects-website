const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Shield, FileText, Filter, Download, Search, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

const CONFIDENCE_COLOR = (c) => {
  if (c >= 8) return "rgba(80,255,80,0.8)";
  if (c >= 5) return "rgba(255,200,80,0.8)";
  return "rgba(255,80,80,0.7)";
};

const CONFIDENCE_LABEL = (c) => {
  if (c >= 8) return "HIGH";
  if (c >= 5) return "MEDIUM";
  return "LOW";
};

function exportPDF(targets, findings) {
  const doc = new jsPDF();
  const primaryRed = [200, 30, 30];

  // Header
  doc.setFillColor(...primaryRed);
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("JARVIS OSINT FINDINGS REPORT", 14, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 12);

  let y = 28;

  const grouped = {};
  findings.forEach(f => {
    if (!grouped[f.target_id]) grouped[f.target_id] = [];
    grouped[f.target_id].push(f);
  });

  Object.entries(grouped).forEach(([targetId, tFindings]) => {
    const target = targets.find(t => t.id === targetId);
    const targetName = target?.name || targetId;

    if (y > 260) { doc.addPage(); y = 20; }

    doc.setFillColor(40, 10, 10);
    doc.rect(10, y - 4, 190, 10, "F");
    doc.setTextColor(...primaryRed);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`TARGET: ${targetName.toUpperCase()}`, 14, y + 3);
    y += 12;

    tFindings.forEach((f) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(`[L${f.layer}] ${(f.data_point || "").toUpperCase()}`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9);
      const val = doc.splitTextToSize(f.value || "", 130);
      doc.text(val, 14, y + 4);
      if (f.source) {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.text(`Source: ${f.source}`, 14, y + 4 + val.length * 4);
      }
      // Confidence badge
      doc.setFillColor(f.confidence >= 8 ? 30 : f.confidence >= 5 ? 180 : 200, f.confidence >= 8 ? 160 : f.confidence >= 5 ? 140 : 30, 30);
      doc.rect(175, y - 1, 24, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(`${CONFIDENCE_LABEL(f.confidence)} ${f.confidence}/10`, 176, y + 4);
      y += 4 + val.length * 4 + 4;
    });
    y += 4;
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setTextColor(150, 100, 100);
    doc.setFontSize(7);
    doc.text(`JARVIS OSINT — CLASSIFIED — Page ${i} of ${pages}`, 14, 290);
  }

  doc.save(`JARVIS_OSINT_${Date.now()}.pdf`);
}

export default function OsintFindings() {
  const [search, setSearch] = useState("");
  const [filterTarget, setFilterTarget] = useState("all");
  const [filterConf, setFilterConf] = useState("all");

  const { data: findings = [] } = useQuery({ queryKey: ["dossier-findings"], queryFn: () => db.entities.DossierFinding.list("-created_date", 200), initialData: [] });
  const { data: targets = [] } = useQuery({ queryKey: ["targets"], queryFn: () => db.entities.Target.list(), initialData: [] });

  const filtered = findings.filter(f => {
    const matchSearch = !search || (f.data_point || "").toLowerCase().includes(search.toLowerCase()) || (f.value || "").toLowerCase().includes(search.toLowerCase());
    const matchTarget = filterTarget === "all" || f.target_id === filterTarget;
    const matchConf = filterConf === "all"
      || (filterConf === "high" && f.confidence >= 8)
      || (filterConf === "medium" && f.confidence >= 5 && f.confidence < 8)
      || (filterConf === "low" && f.confidence < 5);
    return matchSearch && matchTarget && matchConf;
  });

  const grouped = {};
  filtered.forEach(f => {
    if (!grouped[f.target_id]) grouped[f.target_id] = [];
    grouped[f.target_id].push(f);
  });

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#050103" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(200,30,30,0.12)", background: "rgba(8,2,4,0.98)" }}>
        <Shield className="w-4 h-4" style={{ color: "rgba(255,80,80,0.5)" }} />
        <span className="text-[10px] font-mono tracking-widest" style={{ color: "rgba(255,100,100,0.6)", fontFamily: "'Orbitron', sans-serif" }}>
          OSINT FINDINGS — {findings.length} RECORDS
        </span>
        <div className="flex-1 flex items-center gap-2 ml-2 max-w-xs px-3 py-1 rounded-xl"
          style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.12)" }}>
          <Search className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(180,60,60,0.4)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search findings…"
            className="flex-1 bg-transparent text-xs font-mono text-foreground/70 placeholder:text-foreground/20 focus:outline-none" />
        </div>
        <select value={filterTarget} onChange={e => setFilterTarget(e.target.value)}
          className="bg-transparent text-[10px] font-mono px-2 py-1 rounded-lg focus:outline-none"
          style={{ background: "rgba(12,4,4,0.8)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(200,100,100,0.6)" }}>
          <option value="all">All Targets</option>
          {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filterConf} onChange={e => setFilterConf(e.target.value)}
          className="bg-transparent text-[10px] font-mono px-2 py-1 rounded-lg focus:outline-none"
          style={{ background: "rgba(12,4,4,0.8)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(200,100,100,0.6)" }}>
          <option value="all">All Confidence</option>
          <option value="high">High (8-10)</option>
          <option value="medium">Medium (5-7)</option>
          <option value="low">Low (1-4)</option>
        </select>
        <button onClick={() => exportPDF(targets, filtered)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-mono"
          style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.7)" }}>
          <Download className="w-3 h-3" /> PDF
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-6 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(200,30,30,0.06)", background: "rgba(10,3,3,0.6)" }}>
        {[
          { label: "TOTAL", value: findings.length, color: "rgba(200,120,120,0.7)" },
          { label: "HIGH CONF", value: findings.filter(f => f.confidence >= 8).length, color: "rgba(80,255,80,0.7)" },
          { label: "VERIFIED", value: findings.filter(f => f.verified).length, color: "rgba(80,160,255,0.7)" },
          { label: "TARGETS", value: targets.length, color: "rgba(255,180,80,0.7)" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono tracking-widest" style={{ color: "rgba(180,80,80,0.4)" }}>{s.label}</span>
            <span className="text-sm font-mono" style={{ color: s.color, fontFamily: "'Orbitron', sans-serif" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Findings grouped by target */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Shield className="w-10 h-10 mb-3 opacity-10" style={{ color: "rgba(255,80,80,0.5)" }} />
            <p className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>No findings yet. Run a dossier sweep from the Dossier module.</p>
          </div>
        )}
        {Object.entries(grouped).map(([targetId, tFindings]) => {
          const target = targets.find(t => t.id === targetId);
          return (
            <motion.div key={targetId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(200,30,30,0.12)" }}>
              {/* Target header */}
              <div className="flex items-center gap-3 px-4 py-2.5"
                style={{ background: "rgba(20,5,5,0.95)", borderBottom: "1px solid rgba(200,30,30,0.1)" }}>
                <div className="w-2 h-2 rounded-full bg-red-600/60 animate-pulse" />
                <span className="text-[11px] font-mono font-bold" style={{ color: "rgba(255,140,140,0.8)", fontFamily: "'Orbitron', sans-serif" }}>
                  {target?.name || targetId}
                </span>
                <span className="text-[9px] font-mono" style={{ color: "rgba(180,80,80,0.4)" }}>{tFindings.length} findings</span>
                {target?.confidence_score > 0 && (
                  <span className="ml-auto text-[9px] font-mono" style={{ color: "rgba(255,180,80,0.6)" }}>
                    SCORE: {target.confidence_score}/10
                  </span>
                )}
              </div>
              <div className="divide-y" style={{ divideColor: "rgba(200,30,30,0.05)" }}>
                {tFindings.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-foreground/2 transition-colors"
                    style={{ background: "rgba(10,3,3,0.8)" }}>
                    <div className="flex-shrink-0 mt-0.5">
                      {f.verified
                        ? <CheckCircle className="w-3 h-3" style={{ color: "rgba(80,255,80,0.7)" }} />
                        : <AlertTriangle className="w-3 h-3" style={{ color: "rgba(255,180,80,0.5)" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono tracking-wider" style={{ color: "rgba(200,100,100,0.55)" }}>
                          [L{f.layer}] {f.data_point}
                        </span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: `${CONFIDENCE_COLOR(f.confidence)}15`, color: CONFIDENCE_COLOR(f.confidence), border: `1px solid ${CONFIDENCE_COLOR(f.confidence)}30` }}>
                          {CONFIDENCE_LABEL(f.confidence)} · {f.confidence}/10
                        </span>
                      </div>
                      <p className="text-[11px] font-mono mt-0.5 leading-relaxed" style={{ color: "rgba(240,200,200,0.7)" }}>{f.value}</p>
                      {f.source && <p className="text-[8px] font-mono mt-0.5" style={{ color: "rgba(160,80,80,0.35)" }}>⎘ {f.source}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}