const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import ChatInterface from "../components/chat/ChatInterface";
import VoiceControl from "../components/voice/VoiceControl";
import { MessageSquare, Plus, Pin, Search, PanelLeftOpen, PanelLeftClose, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const PERSISTENT_CONV_KEY = "jarvis-main-conv-id";

export default function Chat() {
  const navigate = useNavigate();
  const [activeConvId, setActiveConvId] = useState(
    () => localStorage.getItem(PERSISTENT_CONV_KEY) || null
  );
  const [forceNewConv, setForceNewConv] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);

  // Load from URL on mount only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setActiveConvId(id);
      localStorage.setItem(PERSISTENT_CONV_KEY, id);
    }
  }, []);

  const { data: conversations = [], refetch } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: () => db.agents.listConversations({ agent_name: "jarvis" }),
    initialData: [],
    refetchInterval: 15000,
  });

  const filteredConvs = conversations.filter(
    (c) => !searchQuery || c.metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    // Wipe persistent key, tell ChatInterface to start fresh
    localStorage.removeItem(PERSISTENT_CONV_KEY);
    setActiveConvId(null);
    setForceNewConv(true);
    setTimeout(() => setForceNewConv(false), 100);
  };

  const handleConversationCreated = (convId) => {
    setActiveConvId(convId);
    localStorage.setItem(PERSISTENT_CONV_KEY, convId);
    setTimeout(() => refetch(), 1200);
  };

  const handleSelectConv = (id) => {
    setActiveConvId(id);
    localStorage.setItem(PERSISTENT_CONV_KEY, id);
    setForceNewConv(false);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-r border-foreground/5 bg-background/60 flex flex-col overflow-hidden flex-shrink-0"
          >
            <div className="p-2.5 border-b border-foreground/5 space-y-2">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/10 hover:bg-primary/5 text-primary/60 hover:text-primary/80 text-xs font-mono transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Conversation
              </button>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/20" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-card/20 border border-foreground/5 rounded pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {filteredConvs.length === 0 && (
                <p className="text-[10px] font-mono text-foreground/20 text-center py-4">No conversations yet</p>
              )}
              {filteredConvs.map((conv) => {
                const name = conv.metadata?.name || conv.title || "Untitled";
                const isActive = activeConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/15 text-foreground/80"
                        : "hover:bg-foreground/4 text-foreground/40 hover:text-foreground/70"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {conv.status === "pinned" && <Pin className="w-2.5 h-2.5 text-primary/40 flex-shrink-0" />}
                      <span className="truncate font-mono">{name}</span>
                    </div>
                    {conv.updated_date && (
                      <p className="text-[9px] text-foreground/20 font-mono mt-0.5">
                        {formatDistanceToNow(new Date(conv.updated_date), { addSuffix: true })}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-2 top-3 z-10 p-1.5 rounded-lg text-foreground/20 hover:text-foreground/60 hover:bg-foreground/5 transition-all"
        title={sidebarOpen ? "Close sidebar" : "Conversations"}
      >
        {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
      </button>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Voice mode toggle */}
        <button
          onClick={() => setVoiceMode(v => !v)}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-mono transition-all"
          style={{
            background: voiceMode ? "rgba(200,16,46,0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${voiceMode ? "rgba(200,16,46,0.3)" : "rgba(255,255,255,0.06)"}`,
            color: voiceMode ? "rgba(255,0,51,0.8)" : "rgba(255,255,255,0.3)",
          }}
        >
          <Minimize2 className="w-3 h-3" />
          {voiceMode ? "CHAT" : "VOICE"}
        </button>

        {voiceMode ? (
          <div className="flex-1 flex items-center justify-center">
            <VoiceControl navigate={navigate} />
          </div>
        ) : (
          <ChatInterface
            conversationId={activeConvId}
            onConversationCreated={handleConversationCreated}
            forceNewConv={forceNewConv}
          />
        )}
      </div>
    </div>
  );
}