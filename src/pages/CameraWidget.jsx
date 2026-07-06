const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, Scan, X, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CameraWidget() {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = useCallback(async () => {
    setError("");
    // Try environment (back camera) first, then fall back to any available camera
    const constraints = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: true, audio: false },
    ];
    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays — some browsers need explicit play() + attributes
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play().catch(() => {});
        }
        setActive(true);
        return;
      } catch (e) {
        // Try next constraint
        if (constraint === constraints[constraints.length - 1]) {
          if (e.name === "NotAllowedError") setError("Camera permission denied. Allow camera access in browser settings.");
          else if (e.name === "NotFoundError") setError("No camera found. Connect a camera and try again.");
          else if (e.name === "NotReadableError") setError("Camera is in use by another app. Close it and retry.");
          else setError(`Camera error: ${e.message}`);
        }
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setActive(false);
    setSnapshot(null);
  }, []);

  const takeSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext("2d").drawImage(v, 0, 0);
    setSnapshot(c.toDataURL("image/jpeg", 0.85));
    setAnalysis("");
  }, []);

  // Real AI vision analysis — upload snapshot, send to LLM with vision
  const analyzeSnapshot = useCallback(async () => {
    if (!snapshot) return;
    setAnalyzing(true);
    setAnalysis("");
    setError("");
    try {
      // Convert data URL to blob and upload
      const blob = await (await fetch(snapshot)).blob();
      const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" });
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      const res = await db.integrations.Core.InvokeLLM({
        prompt: "You are IRIS Vision AI. Analyze this camera snapshot. Describe what you see: objects, text (OCR), scene, people count, colors, landmarks, any notable details. Be concise (max 4 lines). Address user as 'Sir'.",
        file_urls: [file_url],
      });
      setAnalysis(typeof res === "string" ? res : res?.response || JSON.stringify(res));
    } catch (e) {
      const msg = e?.message || "Analysis failed";
      setError(msg.includes("limit of integrations") ? "Integration credits exhausted — resets soon." : msg);
    }
    setAnalyzing(false);
  }, [snapshot]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="h-full flex flex-col p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Camera className="w-4 h-4 text-white" />
          <h1 className="text-xs font-heading tracking-widest text-white" style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>
            VISION MODULE
          </h1>
        </div>
        {active && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-mono text-white/60">LIVE</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center gap-4">
        {/* Camera viewport */}
        <div className="relative w-full max-w-2xl rounded-xl overflow-hidden" style={{ background: "#0a0202", border: "1px solid rgba(200,16,46,0.2)", aspectRatio: "16/9" }}>
          {active ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted loop className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 rounded border opacity-30" style={{ borderColor: "rgba(255,0,51,0.6)" }} />
                <motion.div
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-4 right-4 h-px"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,0,51,0.6),transparent)" }}
                />
              </div>
            </>
          ) : snapshot ? (
            <img src={snapshot} alt="Snapshot" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <CameraOff className="w-12 h-12 mx-auto text-white/30" />
                <p className="text-[11px] font-mono text-white/50">Camera offline</p>
                <p className="text-[9px] font-mono max-w-xs mx-auto text-white/30">
                  Activate camera to enable IRIS Vision. AI will analyze what you see — objects, text, scenes.
                </p>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-full max-w-2xl" style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.25)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-[10px] font-mono text-white/80">{error}</p>
          </div>
        )}

        {/* AI Analysis */}
        <AnimatePresence>
          {(analysis || analyzing) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full max-w-2xl rounded-xl p-4" style={{ background: "rgba(200,16,46,0.08)", border: "1px solid rgba(200,16,46,0.2)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-[9px] font-mono tracking-widest text-white/60">IRIS VISION ANALYSIS</span>
              </div>
              {analyzing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <p className="text-[10px] font-mono text-white/50">Analyzing snapshot...</p>
                </div>
              ) : (
                <p className="text-[10px] font-mono text-white/80 leading-relaxed">{analysis}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap justify-center">
          {!active ? (
            <motion.button whileTap={{ scale: 0.96 }} onClick={startCamera}
              className="px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider flex items-center gap-2 text-white"
              style={{ background: "rgba(200,16,46,0.25)", border: "1px solid rgba(200,16,46,0.4)" }}>
              <Camera className="w-3.5 h-3.5" /> ACTIVATE CAMERA
            </motion.button>
          ) : (
            <>
              <motion.button whileTap={{ scale: 0.96 }} onClick={takeSnapshot}
                className="px-4 py-2 rounded-xl text-xs font-mono tracking-wider flex items-center gap-2 text-white"
                style={{ background: "rgba(200,16,46,0.2)", border: "1px solid rgba(200,16,46,0.35)" }}>
                <Scan className="w-3.5 h-3.5" /> SNAPSHOT
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={stopCamera}
                className="px-4 py-2 rounded-xl text-xs font-mono tracking-wider flex items-center gap-2 text-white"
                style={{ background: "rgba(40,10,10,0.6)", border: "1px solid rgba(180,30,30,0.3)" }}>
                <X className="w-3.5 h-3.5" /> STOP
              </motion.button>
            </>
          )}
          {snapshot && !active && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={analyzeSnapshot} disabled={analyzing}
              className="px-4 py-2 rounded-xl text-xs font-mono tracking-wider flex items-center gap-2 text-white disabled:opacity-40"
              style={{ background: "rgba(200,16,46,0.2)", border: "1px solid rgba(200,16,46,0.35)" }}>
              {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              ANALYZE WITH IRIS
            </motion.button>
          )}
          {snapshot && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setSnapshot(null); setAnalysis(""); }}
              className="px-4 py-2 rounded-xl text-xs font-mono tracking-wider text-white/60"
              style={{ border: "1px solid rgba(200,16,46,0.15)" }}>
              CLEAR
            </motion.button>
          )}
        </div>

        {/* Feature hints */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-2xl mt-2">
          {[
            "Object Recognition",
            "OCR Text Reading",
            "Scene Description",
            "Landmark ID",
            "Color Detection",
            "Face Detection",
            "Barcode/QR Scan",
            "Document Analysis",
          ].map(feat => (
            <div key={feat} className="rounded-lg p-2 text-center" style={{ background: "rgba(10,3,3,0.7)", border: "1px solid rgba(200,16,46,0.1)" }}>
              <p className="text-[8px] font-mono text-white/40">{feat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}