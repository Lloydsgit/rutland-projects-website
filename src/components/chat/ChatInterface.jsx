const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef, useCallback } from "react";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Volume2, VolumeX } from "lucide-react";
import { playATSPulse } from "@/lib/atsSound";
import { motion, AnimatePresence } from "framer-motion";
import { speak as irisSpeak, stopSpeaking } from "@/lib/tts";

// Persistent conversation key — always reuse same thread
const PERSISTENT_CONV_KEY = "jarvis-main-conv-id";

// Convert a blob/object URL file to base64 data URL
async function blobUrlToBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// ATS trigger words
const ATS_TRIGGERS = ["use ats", "activate ats", "run ats", "top priority mode", "run deep analysis", "think hard on this", "use the advanced thinking system", "ats engaged", "ats mode"];

// Tone detection — infers mood from message
function detectTone(text) {
  const t = text.toLowerCase();
  const len = text.length;
  const signals = [];
  if (len < 15) signals.push("short_message");
  if (/tired|exhausted|sleep|can't focus|not feeling/i.test(t)) signals.push("tired");
  if (/stressed|anxious|panic|overwhelmed|too much/i.test(t)) signals.push("stressed");
  if (/excited|amazing|awesome|love it|let's go|nailed|won/i.test(t)) signals.push("celebrating");
  if (/sad|down|bad day|not okay|struggling|depressed/i.test(t)) signals.push("down");
  if (/haha|lol|funny|joke|😂|😄|😁/i.test(t)) signals.push("playful");
  if (text.split("?").length > 3) signals.push("question_heavy");
  if (text.split("!").length > 2) signals.push("exclamation");
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) signals.push("late_night");

  let state = "neutral";
  if (signals.includes("celebrating")) state = "energized";
  else if (signals.includes("stressed")) state = "stressed";
  else if (signals.includes("tired")) state = "tired";
  else if (signals.includes("down")) state = "down";
  else if (signals.includes("playful")) state = "neutral"; // playful maps to neutral with humor flag
  else if (signals.includes("late_night")) state = "tired";

  return { state, signals };
}

const TONE_PREFIXES = {
  stressed: "[EMPATHY MODE] Sir, I sense some pressure in your message. I'll keep this focused and clear. ",
  tired: "[GENTLE MODE] You sound tired. I'll be brief. ",
  down: "[SUPPORT MODE] I'm here with you. ",
  energized: "[HIGH ENERGY] Let's move. ",
  playful: "[HUMOR MODE] ",
  neutral: "",
};

function detectATS(text) {
  const lower = text.toLowerCase();
  return ATS_TRIGGERS.some((t) => lower.includes(t));
}

export default function ChatInterface({ conversationId, onConversationCreated, forceNewConv }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [atsActive, setAtsActive] = useState(false);
  const [detectedTone, setDetectedTone] = useState(null);
  const [voiceMuted, setVoiceMuted] = useState(() => localStorage.getItem("iris-voice-muted") === "1");

  const toggleVoice = () => {
    const next = !voiceMuted;
    setVoiceMuted(next);
    localStorage.setItem("iris-voice-muted", next ? "1" : "0");
    if (next) {
      stopSpeaking();
    }
  };
  const messagesEndRef = useRef(null);
  const lastSpokenRef = useRef("");

  // ── Load or create persistent conversation ──────────────────────────────────
  useEffect(() => {
    if (forceNewConv) {
      // Explicit new chat — clear persistent key
      localStorage.removeItem(PERSISTENT_CONV_KEY);
      setCurrentConvId(null);
      setMessages([]);
      return;
    }

    const targetId = conversationId || localStorage.getItem(PERSISTENT_CONV_KEY);
    if (targetId) {
      setCurrentConvId(targetId);
      db.agents.getConversation(targetId).then((conv) => {
        if (conv?.messages) setMessages(conv.messages);
      }).catch(() => {
        // Conversation deleted — start fresh
        localStorage.removeItem(PERSISTENT_CONV_KEY);
        setCurrentConvId(null);
        setMessages([]);
      });
    }
  }, [conversationId, forceNewConv]);

  // ── Subscribe to conversation updates ──────────────────────────────────────
  useEffect(() => {
    if (!currentConvId) return;
    const unsubscribe = db.agents.subscribeToConversation(currentConvId, (data) => {
      const msgs = data.messages || [];
      setMessages(msgs);
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg?.role === "assistant" && lastMsg.content) {
        setIsLoading(false);
        // ATS detection from response
        if (detectATS(lastMsg.content) || lastMsg.content.includes("ATS Engaged")) {
          activateATS();
        }
        if (lastMsg.content.includes("ATS Disengaged") || lastMsg.content.includes("Returning to standard mode")) {
          deactivateATS();
        }
        // Speak response (deduplicate) — skip if muted
        if (lastMsg.content !== lastSpokenRef.current && localStorage.getItem("iris-voice-muted") !== "1") {
          lastSpokenRef.current = lastMsg.content;
          irisSpeak(lastMsg.content);
        }
      }
    });
    return () => unsubscribe();
  }, [currentConvId]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── ATS mode ────────────────────────────────────────────────────────────────
  const activateATS = useCallback(() => {
    setAtsActive(true);
    document.documentElement.classList.add("ats-active");
    playATSPulse();
  }, []);

  const deactivateATS = useCallback(() => {
    setAtsActive(false);
    document.documentElement.classList.remove("ats-active");
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async (content, fileUrls) => {
    setIsLoading(true);

    // ATS detection from user input
    if (detectATS(content)) activateATS();
    if (content.toLowerCase().includes("exit ats") || content.toLowerCase().includes("normal mode")) deactivateATS();

    // Tone detection
    const { state, signals } = detectTone(content);
    setDetectedTone(state !== "neutral" ? state : null);

    // Resolve attached files: always convert to base64, never pass blob URLs
    let resolvedFileUrls = [];
    let extraText = "";
    if (fileUrls?.length) {
      for (const f of fileUrls) {
        const url = f.url || f;
        const isImage = (f.type || "").startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.name || "");
        if (isImage && url) {
          try {
            const b64 = await blobUrlToBase64(url);
            resolvedFileUrls.push(b64);
          } catch { extraText += ` [file: ${f.name || url}]`; }
        } else {
          extraText += ` [file: ${f.name || url}]`;
        }
      }
    }
    // Safety guard: strip any blob URLs that slipped through
    resolvedFileUrls = resolvedFileUrls.filter((u) => !String(u).startsWith("blob:"));
    const finalContent = extraText ? content + extraText : content;

    let convId = currentConvId;

    if (!convId) {
      const conv = await db.agents.createConversation({
        agent_name: "jarvis",
        metadata: { name: content.slice(0, 50) },
      });
      convId = conv.id;
      localStorage.setItem(PERSISTENT_CONV_KEY, convId);
      setCurrentConvId(convId);
      if (onConversationCreated) onConversationCreated(convId);

      // Subscribe immediately for new conv
      db.agents.subscribeToConversation(convId, (data) => {
        const msgs = data.messages || [];
        setMessages(msgs);
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg?.role === "assistant" && lastMsg.content) {
          setIsLoading(false);
          if (detectATS(lastMsg.content) || lastMsg.content.includes("ATS Engaged")) activateATS();
          if (lastMsg.content.includes("ATS Disengaged")) deactivateATS();
          if (lastMsg.content !== lastSpokenRef.current && localStorage.getItem("iris-voice-muted") !== "1") {
            lastSpokenRef.current = lastMsg.content;
            irisSpeak(lastMsg.content);
          }
        }
      });
    }

    // Optimistic user message
    setMessages((prev) => [...prev, { role: "user", content: finalContent, file_urls: resolvedFileUrls.length ? resolvedFileUrls : undefined }]);

    const conv = await db.agents.getConversation(convId);
    await db.agents.addMessage(conv, {
      role: "user",
      content: finalContent,
      ...(resolvedFileUrls.length ? { file_urls: resolvedFileUrls } : {}),
    });
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-700 ${atsActive ? "bg-red-950/5" : "bg-transparent"}`}>
      {/* Voice kill bar */}
      <div className="flex items-center justify-end px-4 pt-2 pb-0 flex-shrink-0">
        <button onClick={toggleVoice} title={voiceMuted ? "Voice OFF — click to unmute" : "Voice ON — click to mute"}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-mono transition-all"
          style={{ background: voiceMuted ? "rgba(200,30,30,0.12)" : "rgba(80,200,80,0.08)", border: `1px solid ${voiceMuted ? "rgba(200,30,30,0.25)" : "rgba(80,200,80,0.2)"}`, color: voiceMuted ? "rgba(255,80,80,0.6)" : "rgba(80,220,80,0.6)" }}>
          {voiceMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          {voiceMuted ? "VOICE OFF" : "VOICE ON"}
        </button>
      </div>
      {/* ATS banner */}
      <AnimatePresence>
        {atsActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-3 py-1.5 border-b border-red-900/30 bg-red-950/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono text-red-500 tracking-widest">ATS ACTIVE — ADVANCED THINKING ENGAGED</span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      {/* Tone indicator */}
      {detectedTone && (
        <div className="flex items-center gap-2 px-4 py-1 flex-shrink-0"
          style={{ background: "rgba(160,80,255,0.06)", borderBottom: "1px solid rgba(160,80,255,0.1)" }}>
          <div className="w-1 h-1 rounded-full" style={{ background: "rgba(160,80,255,0.6)" }} />
          <span className="text-[9px] font-mono" style={{ color: "rgba(180,120,255,0.5)" }}>
            TONE: {detectedTone.toUpperCase()} — JARVIS ADAPTING PERSONA
          </span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className={`font-heading text-sm tracking-[0.4em] font-light ${atsActive ? "text-red-500/30" : "text-foreground/15"}`}>SHIROGANE</p>
              <p className="text-[10px] text-foreground/15 mt-3 font-mono tracking-widest">STANDING BY</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} atsActive={atsActive} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            {/* IRIS core */}
            <motion.div
              className="h-7 w-7 rounded-full border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: "rgba(200,16,46,0.35)", background: "rgba(200,16,46,0.06)" }}
              animate={{
                boxShadow: [
                  "0 0 8px rgba(255,0,51,0.2)",
                  "0 0 20px rgba(255,0,51,0.5)",
                  "0 0 8px rgba(255,0,51,0.2)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Rotating particles */}
              <motion.div
                className="relative w-4 h-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                {[0, 120, 240].map(deg => (
                  <motion.div
                    key={deg}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      background: "rgba(255,0,51,0.8)",
                      top: "50%",
                      left: "50%",
                      transform: `rotate(${deg}deg) translateY(-6px)`,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Typing indicator */}
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-2"
              style={{
                background: "rgba(200,16,46,0.04)",
                border: "1px solid rgba(200,16,46,0.1)",
              }}
            >
              <span
                className="text-[9px] font-mono tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                THINKING
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ background: "rgba(255,0,51,0.6)" }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} atsActive={atsActive} />
    </div>
  );
}