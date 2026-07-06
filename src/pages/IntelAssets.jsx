const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Archive, Plus, Search, Tag, Pin, Trash2, ExternalLink, FileText, User, Link, Image, StickyNote, Key, File } from "lucide-react";

const TYPE_CONFIG = {
  document: { label: "Document", icon: FileText, color: "rgba(80,160,255,0.7)" },
  profile: { label: "Profile", icon: User, color: "rgba(255,120,80,0.7)" },
  finding: { label: "Finding", icon: Search, color: "rgba(255,80,80,0.7)" },
  image: { label: "Image", icon: Image, color: "rgba(160,80,255,0.7)" },
  link: { label: "Link", icon: Link, color: "rgba(80,255,160,0.7)" },
  note: { label: "Note", icon: StickyNote, color: "rgba(255,200,80,0.7)" },
  credential: { label: "Credential", icon: Key, color: "rgba(255,60,60,0.9)" },
};

const CLASS_COLOR = {
  unclassified: "rgba(200,200,200,0.5)",
  confidential: "rgba(255,200,80,0.7)",
  secret: "rgba(255,120,60,0.8)",
  top_secret: "rgba(255,60,60,0.9)",
};

export default function IntelAssets() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [newAsset, setNewAsset] = useState({
    title: "", type: "note", content: "", url: "", tags: "", source: "",
    classification: "confidential", pinned: false
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["intel-assets"],
    queryFn: () => db.entities.IntelAsset.list("-created_date"),
    initialData: []
  });

  const create = useMutation({
    mutationFn: (data) => db.entities.IntelAsset.create({
      ...data,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : []
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["intel-assets"] }); setShowNew(false); setNewAsset({ title: "", type: "note", content: "", url: "", tags: "", source: "", classification: "confidential", pinned: false }); }
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => db.entities.IntelAsset.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intel-assets"] })
  });

  const remove = useMutation({
    mutationFn: (id) => db.entities.IntelAsset.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intel-assets"] })
  });

  const filtered = assets.filter(a => {
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase()) || a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === "all" || a.type === filterType;
    return matchSearch && matchType;
  });

  const pinned = filtered.filter(a => a.pinned);
  const unpinned = filtered.filter(a => !a.pinned);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list");
    if (text) {
      const isUrl = text.startsWith("http");
      setNewAsset(a => ({ ...a, [isUrl ? "url" : "content"]: text, type: isUrl ? "link" : "note" }));
      setShowNew(true);
    }
  };

  return (
    <div
      className="h-full overflow-y-auto p-5 space-y-5"
      style={{ color: "rgba(240,200,200,0.85)" }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(200,30,30,0.08)", border: "2px dashed rgba(200,30,30,0.4)" }}>
          <p className="text-lg font-mono" style={{ color: "rgba(255,100,100,0.7)" }}>DROP TO CREATE ASSET</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Archive className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
          <h1 className="text-xs font-heading tracking-[0.4em]"
            style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,100,100,0.7)", fontWeight: 700 }}>
            INTEL ASSETS
          </h1>
          <span className="text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>— drag anything here to capture</span>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono"
          style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.25)", color: "rgba(255,100,100,0.7)" }}>
          <Plus className="w-3 h-3" /> NEW ASSET
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(15,4,4,0.8)", border: "1px solid rgba(200,30,30,0.15)" }}>
          <Search className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(200,80,80,0.4)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search assets, tags, content…"
            className="flex-1 bg-transparent text-[10px] font-mono text-foreground/70 placeholder:text-foreground/20 focus:outline-none" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", ...Object.keys(TYPE_CONFIG)].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-2 py-1 rounded text-[8px] font-mono transition-all"
              style={{ background: filterType === t ? "rgba(200,30,30,0.2)" : "transparent", border: `1px solid ${filterType === t ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.08)"}`, color: filterType === t ? "rgba(255,120,120,0.8)" : "rgba(180,80,80,0.35)" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* New asset form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 space-y-3 overflow-hidden"
            style={{ background: "rgba(15,4,4,0.95)", border: "1px solid rgba(200,40,40,0.25)" }}>
            <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>CAPTURE INTEL ASSET</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={newAsset.title} onChange={e => setNewAsset(a => ({ ...a, title: e.target.value }))}
                placeholder="Asset title"
                className="col-span-2 px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>TYPE</label>
                <select value={newAsset.type} onChange={e => setNewAsset(a => ({ ...a, type: e.target.value }))}
                  className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-mono tracking-widest mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>CLASSIFICATION</label>
                <select value={newAsset.classification} onChange={e => setNewAsset(a => ({ ...a, classification: e.target.value }))}
                  className="w-full px-2 py-2 rounded-lg text-[9px] font-mono focus:outline-none"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.7)" }}>
                  <option value="unclassified">Unclassified</option>
                  <option value="confidential">Confidential</option>
                  <option value="secret">Secret</option>
                  <option value="top_secret">Top Secret</option>
                </select>
              </div>
              <textarea value={newAsset.content} onChange={e => setNewAsset(a => ({ ...a, content: e.target.value }))}
                placeholder="Content / findings / notes…"
                rows={3}
                className="col-span-2 px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none resize-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
              <input value={newAsset.url} onChange={e => setNewAsset(a => ({ ...a, url: e.target.value }))}
                placeholder="URL (optional)"
                className="px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
              <input value={newAsset.source} onChange={e => setNewAsset(a => ({ ...a, source: e.target.value }))}
                placeholder="Source (e.g. Shodan, HIBP)"
                className="px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
              <input value={newAsset.tags} onChange={e => setNewAsset(a => ({ ...a, tags: e.target.value }))}
                placeholder="Tags (comma separated)"
                className="col-span-2 px-3 py-2 rounded-lg text-[10px] font-mono focus:outline-none"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => create.mutate(newAsset)} disabled={!newAsset.title}
                className="flex-1 py-2 rounded-lg text-[9px] font-mono disabled:opacity-40"
                style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.8)" }}>
                SAVE ASSET
              </button>
              <button onClick={() => setShowNew(false)}
                className="px-3 py-2 rounded-lg text-[9px] font-mono"
                style={{ border: "1px solid rgba(200,30,30,0.15)", color: "rgba(200,80,80,0.4)" }}>
                CANCEL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div>
          <p className="text-[8px] font-mono tracking-widest mb-2" style={{ color: "rgba(255,200,80,0.5)" }}>📌 PINNED ASSETS</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {pinned.map(asset => <AssetCard key={asset.id} asset={asset} onPin={() => update.mutate({ id: asset.id, data: { pinned: !asset.pinned } })} onDelete={() => remove.mutate(asset.id)} />)}
          </div>
        </div>
      )}

      {/* All assets */}
      <div>
        {pinned.length > 0 && <p className="text-[8px] font-mono tracking-widest mb-2" style={{ color: "rgba(200,80,80,0.35)" }}>ALL ASSETS</p>}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Archive className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(200,60,60,0.15)" }} />
            <p className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>No assets yet. Drag URLs or text here, or click NEW ASSET.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {unpinned.map(asset => (
            <AssetCard key={asset.id} asset={asset} onPin={() => update.mutate({ id: asset.id, data: { pinned: !asset.pinned } })} onDelete={() => remove.mutate(asset.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetCard({ asset, onPin, onDelete }) {
  const { icon: Icon, color } = TYPE_CONFIG[asset.type] || TYPE_CONFIG.note;
  const classColor = CLASS_COLOR[asset.classification] || CLASS_COLOR.confidential;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group p-3 rounded-xl relative"
      style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}
      draggable
      onDragStart={e => e.dataTransfer.setData("text/plain", JSON.stringify({ assetId: asset.id, title: asset.title, type: asset.type }))}>
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color.replace("0.7", "0.1"), border: `1px solid ${color.replace("0.7", "0.2")}` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono truncate" style={{ color: "rgba(255,200,200,0.8)" }}>{asset.title}</span>
            <span className="text-[7px] font-mono flex-shrink-0" style={{ color: classColor }}>{asset.classification?.replace("_", " ").toUpperCase()}</span>
          </div>
          {asset.content && (
            <p className="text-[9px] font-mono line-clamp-2" style={{ color: "rgba(200,120,120,0.45)" }}>{asset.content}</p>
          )}
          {asset.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {asset.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-[7px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(200,30,30,0.08)", color: "rgba(200,100,100,0.5)", border: "1px solid rgba(200,30,30,0.1)" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onPin} title={asset.pinned ? "Unpin" : "Pin"}
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ color: asset.pinned ? "rgba(255,200,80,0.8)" : "rgba(200,80,80,0.35)" }}>
            <Pin className="w-3 h-3" />
          </button>
          {asset.url && (
            <a href={asset.url} target="_blank" rel="noopener noreferrer"
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ color: "rgba(80,200,255,0.5)" }}>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button onClick={onDelete}
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ color: "rgba(200,60,60,0.4)" }}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {asset.source && (
        <p className="text-[8px] font-mono mt-1.5 pl-9" style={{ color: "rgba(180,80,80,0.3)" }}>src: {asset.source}</p>
      )}
    </motion.div>
  );
}