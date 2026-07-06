const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import HudPanel from "../hud/HudPanel";
import { Eye, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function WatchlistWidget() {
  const { data: items = [] } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => db.entities.Watchlist.filter({ status: "active" }, "-updated_date", 5),
    initialData: [],
  });

  const typeIcons = {
    person: "👤",
    company: "🏢",
    domain: "🌐",
    keyword: "🔑",
    social_handle: "📱",
  };

  return (
    <HudPanel title="Watchlist">
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground/50 font-mono">No active watchlist items.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-xs">{typeIcons[item.type] || "📌"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/80 truncate">{item.name}</p>
              <p className="text-[10px] text-muted-foreground/40 font-mono capitalize">{item.type}</p>
            </div>
            {item.findings?.length > 0 && (
              <AlertTriangle className="w-3 h-3 text-alert-amber flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
      <Link to="/watchlist" className="flex items-center gap-1 mt-3 text-[10px] text-primary/40 hover:text-primary/70 transition-colors font-mono">
        View all <ChevronRight className="w-3 h-3" />
      </Link>
    </HudPanel>
  );
}