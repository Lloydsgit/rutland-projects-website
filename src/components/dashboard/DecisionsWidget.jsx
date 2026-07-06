const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import HudPanel from "../hud/HudPanel";
import { Scale, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function DecisionsWidget() {
  const { data: decisions = [] } = useQuery({
    queryKey: ["decisions"],
    queryFn: () => db.entities.DecisionLog.list("-created_date", 4),
    initialData: [],
  });

  const statusColor = {
    pending: "text-alert-amber",
    validated: "text-success-green",
    invalidated: "text-alert-red",
    mixed: "text-primary",
  };

  return (
    <HudPanel title="Decision Journal">
      <div className="space-y-2">
        {decisions.length === 0 && (
          <p className="text-xs text-muted-foreground/50 font-mono">No decisions logged.</p>
        )}
        {decisions.map((d) => (
          <div key={d.id} className="flex items-start gap-2">
            <Scale className="w-3 h-3 text-primary/40 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/80 truncate">{d.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-mono capitalize ${statusColor[d.status] || "text-muted-foreground"}`}>
                  {d.status}
                </span>
                {d.confidence && (
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    conf: {d.confidence}/10
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/decisions" className="flex items-center gap-1 mt-3 text-[10px] text-primary/40 hover:text-primary/70 transition-colors font-mono">
        View all <ChevronRight className="w-3 h-3" />
      </Link>
    </HudPanel>
  );
}