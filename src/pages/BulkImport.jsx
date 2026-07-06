const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h.toLowerCase().replace(/\s+/g, "_"), vals[i] || ""]));
  }).filter(r => Object.values(r).some(v => v));
}

const IMPORT_TYPES = [
  {
    id: "targets",
    label: "Targets",
    color: "rgba(255,80,80,0.7)",
    fields: ["name", "location", "phone", "email", "notes", "status"],
    example: "name,location,email,phone,notes\nJohn Doe,New York,john@example.com,+1234567890,Person of interest",
  },
  {
    id: "watchlist",
    label: "Watchlist",
    color: "rgba(255,160,80,0.7)",
    fields: ["name", "type", "notes", "status"],
    example: "name,type,notes\nAcme Corp,company,Monitor for suspicious activity\ntechblog.io,domain,Track for content changes",
  },
];

export default function BulkImport() {
  const [importType, setImportType] = useState("targets");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const qc = useQueryClient();

  const config = IMPORT_TYPES.find(t => t.id === importType);

  const handleFile = (f) => {
    setError(""); setResults(null);
    if (!f) return;
    if (!f.name.match(/\.(csv|txt)$/i)) { setError("Only CSV files supported."); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => {
      const rows = parseCSV(e.target.result);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const runImport = async () => {
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async e => {
      const rows = parseCSV(e.target.result);
      let success = 0, failed = 0, errors = [];
      for (const row of rows) {
        if (!row.name) { failed++; continue; }
        try {
          if (importType === "targets") {
            await db.entities.Target.create({ name: row.name, location: row.location || "", email: row.email || "", phone: row.phone || "", notes: row.notes || "", status: row.status || "active" });
          } else {
            await db.entities.Watchlist.create({ name: row.name, type: row.type || "person", notes: row.notes || "", status: row.status || "active" });
          }
          success++;
        } catch (err) {
          failed++;
          errors.push(row.name);
        }
      }
      setResults({ total: rows.length, success, failed, errors });
      setImporting(false);
      qc.invalidateQueries({ queryKey: [importType] });
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const blob = new Blob([config.example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `iris-${importType}-template.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5" style={{ color: "rgba(240,200,200,0.85)" }}>
      <div className="flex items-center gap-3">
        <Upload className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
        <h1 className="text-xs font-heading tracking-[0.4em]"
          style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,100,100,0.7)", fontWeight: 700 }}>
          BULK IMPORT
        </h1>
      </div>

      {/* Type selector */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
        <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>IMPORT TYPE</p>
        <div className="grid grid-cols-2 gap-2">
          {IMPORT_TYPES.map(t => (
            <button key={t.id} onClick={() => { setImportType(t.id); setFile(null); setPreview([]); setResults(null); }}
              className="py-2.5 px-3 rounded-xl text-[10px] font-mono transition-all"
              style={{
                background: importType === t.id ? `${t.color.replace("0.7", "0.15")}` : "rgba(15,4,4,0.6)",
                border: `1px solid ${importType === t.id ? t.color.replace("0.7", "0.45") : "rgba(200,30,30,0.1)"}`,
                color: importType === t.id ? "rgba(255,200,200,0.9)" : "rgba(200,100,100,0.45)"
              }}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-[9px] font-mono"
          style={{ color: "rgba(80,180,255,0.5)" }}>
          <Download className="w-3 h-3" /> Download CSV template
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all"
        style={{ background: file ? "rgba(80,200,80,0.04)" : "rgba(10,3,3,0.6)", border: `2px dashed ${file ? "rgba(80,200,80,0.3)" : "rgba(200,30,30,0.2)"}` }}>
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            <FileSpreadsheet className="w-8 h-8" style={{ color: "rgba(80,200,80,0.6)" }} />
            <p className="text-[11px] font-mono" style={{ color: "rgba(200,255,200,0.7)" }}>{file.name}</p>
            <p className="text-[9px] font-mono" style={{ color: "rgba(180,200,180,0.4)" }}>{(file.size / 1024).toFixed(1)} KB · {preview.length}+ rows detected</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8" style={{ color: "rgba(200,80,80,0.3)" }} />
            <p className="text-[11px] font-mono" style={{ color: "rgba(200,120,120,0.5)" }}>Drop CSV file here or click to browse</p>
            <p className="text-[9px] font-mono" style={{ color: "rgba(180,80,80,0.3)" }}>Supports .csv format · Max 10,000 rows</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.2)" }}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,80,80,0.6)" }} />
          <p className="text-[10px] font-mono" style={{ color: "rgba(255,120,120,0.7)" }}>{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && !results && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
          <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>PREVIEW (first 5 rows)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px] font-mono">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(200,30,30,0.12)" }}>
                  {Object.keys(preview[0]).map(h => (
                    <th key={h} className="text-left pb-1.5 pr-3" style={{ color: "rgba(255,80,80,0.4)" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(200,30,30,0.06)" }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="py-1.5 pr-3 truncate max-w-24" style={{ color: "rgba(255,200,200,0.6)" }}>{v || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 space-y-2"
            style={{ background: results.failed === 0 ? "rgba(80,200,80,0.05)" : "rgba(200,150,30,0.06)", border: `1px solid ${results.failed === 0 ? "rgba(80,200,80,0.2)" : "rgba(200,150,30,0.2)"}` }}>
            <div className="flex items-center gap-2">
              {results.failed === 0
                ? <CheckCircle className="w-4 h-4" style={{ color: "rgba(80,200,80,0.7)" }} />
                : <AlertTriangle className="w-4 h-4" style={{ color: "rgba(200,150,30,0.7)" }} />
              }
              <p className="text-[11px] font-mono" style={{ color: results.failed === 0 ? "rgba(120,255,140,0.8)" : "rgba(255,200,80,0.8)" }}>
                Import complete: {results.success}/{results.total} rows imported
              </p>
            </div>
            {results.errors.length > 0 && (
              <p className="text-[9px] font-mono" style={{ color: "rgba(255,180,80,0.5)" }}>
                Failed: {results.errors.slice(0, 5).join(", ")}{results.errors.length > 5 ? ` +${results.errors.length - 5} more` : ""}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import button */}
      {file && !results && (
        <button onClick={runImport} disabled={importing}
          className="w-full py-3 rounded-xl text-[11px] font-mono tracking-wider transition-all disabled:opacity-40"
          style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.4)", color: "rgba(255,120,120,0.85)" }}>
          {importing ? "IMPORTING…" : `IMPORT ${importType.toUpperCase()} DATA`}
        </button>
      )}

      <p className="text-[8px] font-mono text-center" style={{ color: "rgba(180,80,80,0.25)" }}>
        CSV must include a "name" column. Extra columns are mapped to known fields automatically.
      </p>
    </div>
  );
}