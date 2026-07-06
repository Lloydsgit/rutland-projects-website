const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Settings } from "lucide-react";
import VoiceBubble from "./VoiceBubble";

import { useNavigate } from "react-router-dom";
import { speak, stopSpeaking } from "@/lib/tts";

const VOICE_PROFILES = [
  { id: "operator", label: "Operator", desc: "Professional & sharp", pitch: 0.95, rate: 1.0, intensity: 0.6 },
  { id: "mentor", label: "Mentor", desc: "Calm & wise", pitch: 0.85, rate: 0.85, intensity: 0.4 },
  { id: "companion", label: "Companion", desc: "Warm & friendly", pitch: 1.0, rate: 0.95, intensity: 0.5 },
  { id: "combat", label: "Combat", desc: "Direct & intense", pitch: 0.9, rate: 1.1, intensity: 0.9 },
  { id: "analyst", label: "Analyst", desc: "Precise & neutral", pitch: 0.95, rate: 0.9, intensity: 0.3 },
];

export default function VoiceControl({ navigate }) {
  const nav = useNavigate();
  const [bubbleState, setBubbleState] = useState("idle");
  const [voiceMuted, setVoiceMuted] = useState(() => localStorage.getItem("iris-voice-muted") === "1");
  const [activeProfile, setActiveProfile] = useState(() => localStorage.getItem("iris-voice-profile") || "operator");
  const [intensity, setIntensity] = useState(() => Number(localStorage.getItem("iris-voice-intensity") || 0.6));
  const [panelOpen, setPanelOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const profile = VOICE_PROFILES.find((p) => p.id === activeProfile) || VOICE_PROFILES[0];

  const doSpeak = useCallback((text) => {
    if (voiceMuted) return;
    speak(text);
  }, [voiceMuted]);

  const handleNavigation = useCallback((cmd) => {
    const lower = cmd.toLowerCase();
    const navMap = [
      { keys: ["dashboard"], path: "/dashboard" },
      { keys: ["map", "world"], path: "/world-map" },
      { keys: ["camera", "vision"], path: "/camera" },
      { keys: ["music"], path: "/music" },
      { keys: ["goal"], path: "/goals" },
      { keys: ["decision"], path: "/decisions" },
      { keys: ["watchlist"], path: "/watchlist" },
      { keys: ["memory"], path: "/memory" },
      { keys: ["tool"], path: "/tools" },
      { keys: ["intel"], path: "/intel" },
      { keys: ["automation"], path: "/automation" },
      { keys: ["setting"], path: "/settings" },
    ];
    for (const item of navMap) {
      if (lower.includes("go to") && item.keys.some(k => lower.includes(k))) {
        doSpeak(`Navigating to ${item.path.replace("/", "")}`);
        nav(item.path);
        return true;
      }
    }
    return false;
  }, [nav, doSpeak]);

  const processCommand = useCallback(async (cmd) => {
    setBubbleState("thinking");
    setError("");
    // Check navigation first
    if (handleNavigation(cmd)) {
      setBubbleState("idle");
      return;
    }
    // Send to IRIS LLM
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `You are IRIS, a hyper-intelligent AI assistant. The user said: "${cmd}". Respond in maximum 3-4 lines. Address user as "Sir". Be direct and helpful.`,
      });
      const text = typeof res === "string" ? res : res?.response || JSON.stringify(res);
      setBubbleState("speaking");
      doSpeak(text);
      // Return to idle after speaking
      setTimeout(() => {
        setBubbleState("idle");
      }, Math.min(text.length * 80, 10000));
    } catch (e) {
      const msg = e?.message || "Connection failed";
      setError(msg.includes("limit of integrations") ? "Credits exhausted." : msg);
      setBubbleState("alert");
      setTimeout(() => setBubbleState("idle"), 2000);
    }
  }, [handleNavigation, doSpeak]);

  const toggleVoice = useCallback(() => {
    const next = !voiceMuted;
    setVoiceMuted(next);
    localStorage.setItem("iris-voice-muted", next ? "1" : "0");
    if (next) {
      setBubbleState("idle");
      stopSpeaking();
    }
  }, [voiceMuted]);

  const supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const toggleListening = useCallback(() => {
    if (!supported) {
      setError("Voice recognition requires Chrome or Edge browser.");
      setBubbleState("alert");
      setTimeout(() => setBubbleState("idle"), 2000);
      return;
    }
    if (voiceMuted) {
      setVoiceMuted(false);
      localStorage.setItem("iris-voice-muted", "0");
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    setError("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    recognitionRef.current = rec;
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      setListening(false);
      processCommand(txt);
    };
    rec.onerror = (e) => {
      setListening(false);
      setBubbleState("idle");
      if (e.error === "not-allowed") setError("Microphone permission denied.");
    };
    rec.onend = () => {
      setListening(false);
      if (bubbleState === "listening") setBubbleState("idle");
    };
    rec.start();
    setListening(true);
    setBubbleState("listening");
  }, [supported, voiceMuted, listening, processCommand, bubbleState]);

  const handleAction = useCallback(
    (action) => {
      switch (action) {
        case "voice":
          toggleListening();
          break;
        case "chat":
          nav("/");
          break;
        case "modules":
          setPanelOpen((p) => !p);
          break;
        case "call":
        case "msg":
          nav("/");
          break;
      }
    },
    [toggleListening, nav]
  );

  const selectProfile = (pid) => {
    setActiveProfile(pid);
    localStorage.setItem("iris-voice-profile", pid);
    setBubbleState("thinking");
    setTimeout(() => setBubbleState("idle"), 800);
  };

  const updateIntensity = (val) => {
    setIntensity(val);
    localStorage.setItem("iris-voice-intensity", String(val));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {error && (
        <div className="px-3 py-1.5 rounded-lg text-[9px] font-mono" style={{ background: "rgba(255,0,51,0.1)", border: "1px solid rgba(255,0,51,0.2)", color: "rgba(255,100,100,0.8)" }}>
          {error}
        </div>
      )}
      <VoiceBubble
        state={bubbleState}
        onAction={handleAction}
        onVoiceToggle={toggleListening}
        listening={listening}
      />
      <button
        onClick={toggleVoice}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono transition-all text-white"
        style={{
          background: voiceMuted ? "rgba(200,16,46,0.12)" : "rgba(200,16,46,0.06)",
          border: `1px solid ${voiceMuted ? "rgba(200,16,46,0.35)" : "rgba(200,16,46,0.1)"}`,
        }}
      >
        {voiceMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        {voiceMuted ? "VOICE OFF" : "VOICE ON"}
      </button>

      {panelOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs rounded-xl p-4 space-y-3"
          style={{ background: "rgba(10,0,0,0.95)", border: "1px solid rgba(200,16,46,0.2)", backdropFilter: "blur(20px)" }}
        >
          <p className="text-[9px] font-mono tracking-[0.3em] text-white/50">VOICE PROFILE</p>
          <div className="grid grid-cols-2 gap-1.5">
            {VOICE_PROFILES.map((p) => (
              <button key={p.id} onClick={() => selectProfile(p.id)}
                className="text-left px-3 py-2 rounded-lg transition-all"
                style={{
                  background: activeProfile === p.id ? "rgba(200,16,46,0.15)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeProfile === p.id ? "rgba(200,16,46,0.3)" : "rgba(255,255,255,0.05)"}`,
                }}>
                <p className="text-[10px] font-mono text-white">{p.label}</p>
                <p className="text-[8px] font-mono mt-0.5 text-white/40">{p.desc}</p>
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-mono text-white/50">EXPRESSION INTENSITY</p>
              <span className="text-[9px] font-mono text-white/60">{Math.round(intensity * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.05} value={intensity}
              onChange={(e) => updateIntensity(Number(e.target.value))}
              className="w-full h-1 appearance-none rounded-full cursor-pointer"
              style={{ background: `linear-gradient(to right, rgba(200,16,46,0.8) ${intensity * 100}%, rgba(200,16,46,0.1) ${intensity * 100}%)` }} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "rgba(200,16,46,0.6)" }} />
            <span className="text-[8px] font-mono text-white/50">ACTIVE: {profile.label.toUpperCase()} · {Math.round(intensity * 100)}%</span>
            <button onClick={() => nav("/voice-settings")} className="ml-auto text-white/40">
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}