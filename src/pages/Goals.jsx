const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import HudPanel from "../components/hud/HudPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Target, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ["all-goals"],
    queryFn: () => db.entities.Goal.list("-updated_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Goal.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["all-goals"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Goal.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["all-goals"] }); setEditGoal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-goals"] }),
  });

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-lg text-foreground tracking-wide">Goal Trajectory</h1>
            <p className="text-xs text-muted-foreground/50 font-mono">Track. Measure. Execute.</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-mono"
            size="sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Goal
          </Button>
        </div>

        <div className="space-y-3">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <HudPanel>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary/50" />
                      <h3 className="text-sm font-heading text-foreground">{goal.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/5 text-primary/50 capitalize">
                        {goal.category}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                        goal.status === "completed" ? "bg-success-green/10 text-success-green" :
                        goal.status === "paused" ? "bg-alert-amber/10 text-alert-amber" :
                        "bg-primary/5 text-primary/50"
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground/60 mt-1 ml-6">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 ml-6">
                      <div className="flex-1 max-w-xs h-1.5 bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${goal.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-mono text-primary/60">{goal.progress || 0}%</span>
                      {goal.deadline && (
                        <span className="text-[10px] font-mono text-muted-foreground/40">Due: {goal.deadline}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => setEditGoal(goal)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground/30 hover:text-primary transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(goal.id)} className="p-1.5 rounded hover:bg-alert-red/10 text-muted-foreground/30 hover:text-alert-red transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </HudPanel>
            </motion.div>
          ))}
          {goals.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-8 h-8 text-primary/20 mx-auto" />
              <p className="text-xs text-muted-foreground/40 font-mono mt-2">No goals tracked. Add one to begin.</p>
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <GoalDialog
          open={showForm || !!editGoal}
          onClose={() => { setShowForm(false); setEditGoal(null); }}
          goal={editGoal}
          onSave={(data) => {
            if (editGoal) {
              updateMutation.mutate({ id: editGoal.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      </div>
    </div>
  );
}

function GoalDialog({ open, onClose, goal, onSave }) {
  const [form, setForm] = useState(goal || { title: "", description: "", category: "personal", deadline: "", progress: 0 });

  useState(() => {
    if (goal) setForm(goal);
    else setForm({ title: "", description: "", category: "personal", deadline: "", progress: 0 });
  }, [goal]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm tracking-widest text-primary">{goal ? "EDIT GOAL" : "NEW GOAL"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-background/50 border-primary/10 text-sm" />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background/50 border-primary/10 text-sm h-20" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-background/50 border-primary/10 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["business", "content", "learning", "health", "personal", "finance"].map((c) => (
                  <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="bg-background/50 border-primary/10 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground/50">Progress: {form.progress || 0}%</label>
            <Slider value={[form.progress || 0]} onValueChange={([v]) => setForm({ ...form, progress: v })} max={100} step={5} className="py-2" />
          </div>
          <Button onClick={() => onSave(form)} className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-mono" size="sm">
            <Check className="w-3.5 h-3.5 mr-1" /> {goal ? "Update" : "Create"} Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}