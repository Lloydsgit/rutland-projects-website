const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import HudPanel from "../hud/HudPanel";
import { Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function GoalsWidget() {
  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: () => db.entities.Goal.filter({ status: "active" }, "-updated_date", 5),
    initialData: [],
  });

  return (
    <HudPanel title="Goal Trajectory">
      <div className="space-y-2">
        {goals.length === 0 && (
          <p className="text-xs text-muted-foreground/50 font-mono">No active goals tracked.</p>
        )}
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-2">
            <Target className="w-3 h-3 text-primary/50 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/80 truncate">{goal.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all"
                    style={{ width: `${goal.progress || 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-primary/60">{goal.progress || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/goals" className="flex items-center gap-1 mt-3 text-[10px] text-primary/40 hover:text-primary/70 transition-colors font-mono">
        View all <ChevronRight className="w-3 h-3" />
      </Link>
    </HudPanel>
  );
}