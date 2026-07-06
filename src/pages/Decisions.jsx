const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import HudPanel from "../components/hud/HudPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Scale, Plus, Trash2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function Decisions() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: decisions = [] } = useQuery({
    queryKey: ["all-decisions"],
    queryFn: () => db.entities.DecisionLog.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.DecisionLog.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["all-decisions"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.DecisionLog.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-decisions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.DecisionLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-decisions"] }),
  });

  const statusColor = {
    pending: "bg-alert-amber/10 text-alert-amber",
    validated: "bg-success-green/10 text-success-green",
    invalidated: "bg-alert-red/10 text-alert-red",
    mixed: "bg-primary/10 text-primary",
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-lg text-foreground tracking-wide">Decision Journal</h1>
            <p className="text-xs text-muted-foreground/50 font-mono">Decide. Track. Learn.</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-mono" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" /> Log Decision
          </Button>
        </div>

        <div className="space-y-3">
          {decisions.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <HudPanel>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Scale className="w-4 h-4 text-primary/50" />
                      <h3 className="text-sm font-heading text-foreground">{d.title}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${statusColor[d.status] || ""}`}>{d.status}</span>
                      {d.confidence && <span className="text-[10px] font-mono text-muted-foreground/40">Confidence: {d.confidence}/10</span>}
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-1 ml-6">{d.decision}</p>
                    {d.reasoning && <p className="text-[10px] text-muted-foreground/40 mt-1 ml-6 italic">{d.reasoning}</p>}
                    {d.expected_outcome && (
                      <p className="text-[10px] font-mono text-primary/40 mt-1 ml-6">Expected: {d.expected_outcome}</p>
                    )}
                    {d.actual_outcome && (
                      <p className="text-[10px] font-mono text-success-green/60 mt-0.5 ml-6">Actual: {d.actual_outcome}</p>
                    )}
                    {/* Quick status update */}
                    <div className="flex gap-1 mt-2 ml-6">
                      {["pending", "validated", "invalidated", "mixed"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateMutation.mutate({ id: d.id, data: { status: s } })}
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all capitalize ${
                            d.status === s ? statusColor[s] + " border-current/20" : "border-primary/5 text-muted-foreground/20 hover:text-muted-foreground/50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(d.id)} className="p-1.5 rounded hover:bg-alert-red/10 text-muted-foreground/30 hover:text-alert-red transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </HudPanel>
            </motion.div>
          ))}
          {decisions.length === 0 && (
            <div className="text-center py-12">
              <Scale className="w-8 h-8 text-primary/20 mx-auto" />
              <p className="text-xs text-muted-foreground/40 font-mono mt-2">No decisions logged yet.</p>
            </div>
          )}
        </div>

        <DecisionDialog open={showForm} onClose={() => setShowForm(false)} onSave={(data) => createMutation.mutate(data)} />
      </div>
    </div>
  );
}

function DecisionDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", decision: "", reasoning: "", confidence: 7, expected_outcome: "", domain: "business" });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm tracking-widest text-primary">LOG DECISION</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Decision title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-background/50 border-primary/10 text-sm" />
          <Textarea placeholder="What did you decide?" value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })} className="bg-background/50 border-primary/10 text-sm h-20" />
          <Textarea placeholder="Reasoning" value={form.reasoning} onChange={(e) => setForm({ ...form, reasoning: e.target.value })} className="bg-background/50 border-primary/10 text-xs h-16" />
          <Input placeholder="Expected outcome" value={form.expected_outcome} onChange={(e) => setForm({ ...form, expected_outcome: e.target.value })} className="bg-background/50 border-primary/10 text-xs" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
              <SelectTrigger className="bg-background/50 border-primary/10 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["business", "content", "personal", "finance", "strategy", "tech"].map((d) => (
                  <SelectItem key={d} value={d} className="text-xs capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-[10px] font-mono text-muted-foreground/50">Confidence: {form.confidence}/10</label>
              <Slider value={[form.confidence]} onValueChange={([v]) => setForm({ ...form, confidence: v })} min={1} max={10} step={1} className="py-2" />
            </div>
          </div>
          <Button onClick={() => onSave(form)} className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-mono" size="sm">
            <Check className="w-3.5 h-3.5 mr-1" /> Log Decision
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}