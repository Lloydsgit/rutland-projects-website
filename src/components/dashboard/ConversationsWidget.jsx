const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import HudPanel from "../hud/HudPanel";
import { MessageSquare, ChevronRight, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function ConversationsWidget({ onSelectConversation }) {
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => db.entities.Conversation.list("-updated_date", 6),
    initialData: [],
  });

  return (
    <HudPanel title="Recent Threads">
      <div className="space-y-1.5">
        {conversations.length === 0 && (
          <p className="text-xs text-muted-foreground/50 font-mono">No conversations yet.</p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation && onSelectConversation(conv)}
            className="w-full text-left flex items-start gap-2 p-1.5 rounded hover:bg-primary/5 transition-colors group"
          >
            <MessageSquare className="w-3 h-3 text-primary/30 mt-0.5 flex-shrink-0 group-hover:text-primary/60" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {conv.status === "pinned" && <Pin className="w-2.5 h-2.5 text-primary/50" />}
                <p className="text-xs text-foreground/70 truncate group-hover:text-foreground/90">{conv.title}</p>
              </div>
              <p className="text-[10px] text-muted-foreground/30 font-mono">
                {conv.updated_date ? formatDistanceToNow(new Date(conv.updated_date), { addSuffix: true }) : ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    </HudPanel>
  );
}