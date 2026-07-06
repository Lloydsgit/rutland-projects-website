const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Loader2 } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { speak, stopSpeaking } from "@/lib/tts";

// Floating IRIS voice orb — 3D rotating, one-tap speech
// Real STT (Web Speech API) → LLM (InvokeLLM) → TTS (ElevenLabs, never browser)
export default function FloatingIris() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const mutedRef = useRef(localStorage.getItem("iris-voice-muted") !== "1");

  const supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const handleNavigation = useCallback((cmd) => {
    const lower = cmd.toLowerCase();
    const navMap = [
      { keys: ["dashboard", "home"], path: "/dashboard" },
      { keys: ["chat", "talk"], path: "/" },
      { keys: ["map", "world"], path: "/world-map" },
      { keys: ["camera", "vision"], path: "/camera" },
      { keys: ["music"], path: "/music" },
      { keys: ["goal"], path: "/goals" },
      { keys: ["decision"], path: "/decisions" },
      { keys: ["watchlist"], path: "/watchlist" },
      { keys: ["memory"], path: "/memory" },
      { keys: ["tool"], path: "/tools" },
      { keys: ["intel"], path: "/intel" },
      { keys: ["report"], path: "/reports" },
      { keys: ["automation"], path: "/automation" },
      { keys: ["setting"], path: "/settings" },
      { keys: ["workspace"], path: "/workspace" },
      { keys: ["dossier"], path: "/dossier" },
    ];
    for (const item of navMap) {
      if (item.keys.some(k => lower.includes(k))) {
        speak(`Navigating to ${item.path.replace("/", "") || "home"}`);
        navigate(item.path);
        setOpen(false);
        return true;
      }
    }
    return false;
  }, [navigate]);

  const processCommand = useCallback(async (cmd) => {
    setTranscript(cmd);
    setThinking(true);
    setError("");
    if (handleNavigation(cmd)) {
      setThinking(false);
      return;
    }
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `You are IRIS, a hyper-intelligent AI assistant. The user said: "${cmd}". Respond in maximum 3-4 lines, address as "Sir". Be direct and helpful.`,
      });
      const text = typeof res === "string" ? res : res?.response || JSON.stringify(res);
      setResponse(text);
      setThinking(false);
      setSpeaking(true);
      await speak(text);
      setSpeaking(false);
    } catch (e) {
      const msg = e?.message || "Connection failed";
      setError(msg.includes("limit of integrations") ? "Credits exhausted — resets soon." : msg);
      setThinking(false);
    }
  }, [handleNavigation]);

  // One-tap speech: tap orb → start listening immediately
  const oneTapListen = useCallback(() => {
    if (!supported) {
      setError("Voice recognition requires Chrome or Edge.");
      setOpen(true);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    setOpen(true);
    setError("");
    setResponse("");
    setTranscript("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      const txt = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(txt);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        processCommand(txt.trim());
      }
    };
    rec.onerror = (e) => {
      setListening(false);
      setThinking(false);
      if (e.error === "not-allowed") setError("Microphone permission denied.");
      else if (e.error !== "no-speech") setError(`Voice error: ${e.error}`);
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }, [supported, listening, processCommand]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    stopSpeaking();
  }, []);

  const isActive = listening || thinking || speaking;

  return (
    <>
      {/* 3D Rotating Voice Orb */}
      <div className="fixed bottom-5 right-5 z-[9999]" style={{ perspective: "200px" }}>
        {/* Ripple rings when active */}
        <AnimatePresence>
          {isActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                style={{ border: "2px solid rgba(255,0,51,0.4)" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                style={{ border: "1px solid rgba(200,16,46,0.3)" }}
              />
            </>
          )}
        </AnimatePresence>

        {/* 3D Rotating sphere */}
        <motion.button
          initial={{ scale: 0, rotateY: 0 }}
          animate={{ 
            scale: 1, 
            rotateY: isActive ? [0, 360] : [0, 360],
          }}
          transition={{ 
            scale: { duration: 0.5 },
            rotateY: { 
              duration: listening ? 2 : thinking ? 1.5 : speaking ? 3 : 8, 
              repeat: Infinity, 
              ease: "linear" 
            }
          }}
          onClick={oneTapListen}
          className="relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            transformStyle: "preserve-3d",
            background: listening 
              ? "radial-gradient(circle at 30% 30%, rgba(255,0,51,0.95), rgba(139,0,0,0.9))"
              : thinking
              ? "radial-gradient(circle at 30% 30%, rgba(255,80,80,0.9), rgba(160,20,20,0.85))"
              : speaking
              ? "radial-gradient(circle at 30% 30%, rgba(255,50,50,0.9), rgba(139,0,0,0.85))"
              : "radial-gradient(circle at 30% 30%, rgba(200,16,46,0.85), rgba(80,0,0,0.8))",
            border: "1.5px solid rgba(255,0,51,0.5)",
            boxShadow: listening 
              ? "0 0 40px rgba(255,0,51,0.8), inset 0 0 20px rgba(255,0,51,0.2)"
              : thinking
              ? "0 0 30px rgba(255,80,80,0.6), inset 0 0 15px rgba(255,80,80,0.15)"
              : speaking
              ? "0 0 35px rgba(255,50,50,0.7), inset 0 0 18px rgba(255,50,50,0.18)"
              : "0 0 15px rgba(200,16,46,0.4), inset 0 0 10px rgba(200,16,46,0.1)",
          }}
          title="Tap and speak — IRIS Voice"
        >
          {/* 3D depth layers */}
          <div 
            className="absolute inset-1 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 70% 70%, transparent 40%, rgba(0,0,0,0.3))",
              transform: "translateZ(2px)",
            }}
          />
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15), transparent 50%)",
              transform: "translateZ(3px)",
            }}
          />
          
          {/* Center icon */}
          <div style={{ transform: "translateZ(5px)" }}>
            {thinking ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : speaking ? (
              <div className="flex items-center gap-0.5 h-5" aria-label="speaking">
                {[4, 7, 5, 8, 4].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full bg-white"
                    animate={{ height: [h, h + 4, h] }}
                    transition={{ duration: 0.3, delay: i * 0.08, repeat: Infinity, repeatType: "reverse" }}
                    style={{ height: h }}
                  />
                ))}
              </div>
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Orbiting particle */}
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              background: "rgba(255,255,255,0.6)",
              top: "50%",
              left: "50%",
              marginLeft: "-3px",
              marginTop: "-3px",
            }}
            animate={{
              rotate: 360,
              x: [0, 22, 0, -22, 0],
              y: [0, 0, 22, 0, -22],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              x: { duration: 4, repeat: Infinity, ease: "linear" },
              y: { duration: 4, repeat: Infinity, ease: "linear" },
            }}
          />
        </motion.button>
      </div>

      {/* Voice panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-22 right-5 z-[9999] w-80 rounded-2xl p-4"
            style={{
              background: "rgba(8,2,2,0.97)",
              border: "1px solid rgba(200,16,46,0.3)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              bottom: "84px",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: listening ? "#FF0033" : thinking ? "#C8102E" : speaking ? "#FF3030" : "#8B0000" }} />
                <span className="text-[10px] font-mono tracking-widest text-white/60">
                  {listening ? "LISTENING" : thinking ? "PROCESSING" : speaking ? "SPEAKING" : "IRIS READY"}
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status */}
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="text-[9px] font-mono text-white/30 text-center">
                {listening ? "Listening… speak now" : thinking ? "IRIS is thinking…" : speaking ? "IRIS is speaking…" : "Tap the orb to speak"}
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mt-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-[9px] font-mono text-white/40 mb-0.5">YOU SAID:</p>
                <p className="text-[10px] font-mono text-white/80">{transcript}</p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="mt-2 p-2 rounded-lg" style={{ background: "rgba(200,16,46,0.08)" }}>
                <p className="text-[9px] font-mono text-white/40 mb-0.5">IRIS:</p>
                <p className="text-[10px] font-mono text-white/80">{response}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-2 p-2 rounded-lg" style={{ background: "rgba(200,16,46,0.1)" }}>
                <p className="text-[9px] font-mono" style={{ color: "rgba(255,100,100,0.7)" }}>{error}</p>
              </div>
            )}

            {/* Hints */}
            {!transcript && !response && !error && !isActive && (
              <div className="mt-2 space-y-1">
                <p className="text-[8px] font-mono text-white/20">Try: "Go to dashboard", "Go to London", "What's the weather?"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}