const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import HudPanel from "../components/hud/HudPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Plus, Trash2, AlertTriangle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function Watchlist() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["all-watchlist"],
    queryFn: () => db.entities.Watchlist.list("-updated_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Watchlist.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["all-watchlist"] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Watchlist.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-watchlist"] }),
  });

  const typeEmoji = { person: "👤", company: "🏢", domain: "🌐", keyword: "🔑", social_handle: "📱" };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-lg text-foreground tracking-wide">Watchlist</h1>
            <p className="text-xs text-muted-foreground/50 font-mono">Monitor. Track. Alert.</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-mono" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Target
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <HudPanel>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{typeEmoji[item.type] || "📌"}</span>
                      <h3 className="text-sm font-heading text-foreground">{item.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/5 text-primary/50 capitalize">{item.type}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                        item.status === "active" ? "bg-success-green/10 text-success-green" : "bg-muted text-muted-foreground"
                      }`}>{item.status}</span>
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground/60 mt-1 ml-6">{item.notes}</p>}
                    {item.alert_keywords?.length > 0 && (
                      <div className="flex gap-1 mt-1.5 ml-6 flex-wrap">
                        {item.alert_keywords.map((kw, j) => (
                          <span key={j} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-alert-amber/5 text-alert-amber/60 border border-alert-amber/10">{kw}</span>
                        ))}
                      </div>
                    )}
                    {item.findings?.length > 0 && (
                      <div className="mt-2 ml-6 space-y-1">
                        {item.findings.slice(-3).map((f, j) => (
                          <div key={j} className="flex items-start gap-1.5 text-[10px]">
                            <AlertTriangle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                              f.severity === "critical" ? "text-alert-red" : f.severity === "high" ? "text-alert-amber" : "text-primary/40"
                            }`} />
                            <span className="text-muted-foreground/60">{f.finding}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 rounded hover:bg-alert-red/10 text-muted-foreground/30 hover:text-alert-red transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </HudPanel>
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-12">
              <Eye className="w-8 h-8 text-primary/20 mx-auto" />
              <p className="text-xs text-muted-foreground/40 font-mono mt-2">No targets being monitored.</p>
            </div>
          )}
        </div>

        <WatchlistDialog open={showForm} onClose={() => setShowForm(false)} onSave={(data) => createMutation.mutate(data)} />
      </div>
    </div>
  );
}

function WatchlistDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", type: "person", notes: "", alert_keywords: "" });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm tracking-widest text-primary">NEW TARGET</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background/50 border-primary/10 text-sm" />
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger className="bg-background/50 border-primary/10 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["person", "company", "domain", "keyword", "social_handle"].map((t) => (
                <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background/50 border-primary/10 text-sm h-20" />
          <Input placeholder="Alert keywords (comma separated)" value={form.alert_keywords} onChange={(e) => setForm({ ...form, alert_keywords: e.target.value })} className="bg-background/50 border-primary/10 text-xs" />
          <Button
            onClick={() => onSave({ ...form, alert_keywords: form.alert_keywords ? form.alert_keywords.split(",").map((s) => s.trim()) : [] })}
            className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-mono" size="sm"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Add to Watchlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}