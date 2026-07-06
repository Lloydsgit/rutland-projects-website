import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Mic, Sliders, Play, Zap, Brain, Shield, Coffee, Rocket } from "lucide-react";

const VOICE_PROFILES = [
  { id: "operator", label: "Operator", icon: Shield, desc: "Crisp, military precision. Minimal warmth.", pitch: 0.85, rate: 1.05, intensity: 7 },
  { id: "mentor", label: "Mentor", icon: Brain, desc: "Calm, thoughtful. Measured pace.", pitch: 0.9, rate: 0.88, intensity: 5 },
  { id: "companion", label: "Companion", icon: Coffee, desc: "Warm, conversational, slightly witty.", pitch: 0.95, rate: 0.95, intensity: 6 },
  { id: "combat", label: "Combat", icon: Zap, desc: "Fast, decisive. No pleasantries.", pitch: 0.8, rate: 1.15, intensity: 9 },
  { id: "analyst", label: "Analyst", icon: Rocket, desc: "Precise, data-driven, slightly formal.", pitch: 0.88, rate: 0.98, intensity: 6 },
];

const EL_VOICES = [
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", label: "Adam — Natural Male" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", label: "Rachel — Natural Female" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", label: "Domi — Energetic" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", label: "Arnold — Crisp" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", label: "Josh — Deep" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", label: "Sam — Casual" },
];

export default function VoiceSettings() {
  const [activeProfile, setActiveProfile] = useState(() => localStorage.getItem("iris-voice-profile") || "operator");
  const [intensity, setIntensity] = useState(() => parseInt(localStorage.getItem("iris-voice-intensity") || "7"));
  const [elVoice, setElVoice] = useState(() => localStorage.getItem("jarvis-el-voice") || "pNInz6obpgDQGcFmaJgB");
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  const profile = VOICE_PROFILES.find(p => p.id === activeProfile) || VOICE_PROFILES[0];

  const applyProfile = (p) => {
    setActiveProfile(p.id);
    setIntensity(p.intensity);
  };

  const save = () => {
    localStorage.setItem("iris-voice-profile", activeProfile);
    localStorage.setItem("iris-voice-intensity", String(intensity));
    localStorage.setItem("jarvis-el-voice", elVoice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testVoice = () => {
    setTesting(true);
    const phrases = {
      operator: "IRIS online. All systems nominal. Standing by for orders, Sir.",
      mentor: "Good thinking on that approach. Let me walk you through the implications.",
      companion: "Got it, Sir — also, you've been at this for three hours. Maybe hydrate?",
      combat: "Target acquired. Executing now. Results in 4 seconds.",
      analyst: "Cross-referencing 47 data points. Confidence interval at 94.2 percent.",
    };
    const utter = new SpeechSynthesisUtterance(phrases[activeProfile] || phrases.operator);
    utter.pitch = profile.pitch * (0.8 + intensity * 0.025);
    utter.rate = profile.rate * (0.85 + intensity * 0.02);
    utter.volume = 0.9;
    utter.onend = () => setTesting(false);
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utter);
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5" style={{ color: "rgba(240,200,200,0.85)" }}>
      <div className="flex items-center gap-3">
        <Mic className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
        <h1 className="text-xs font-heading tracking-[0.4em]"
          style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,100,100,0.7)", fontWeight: 700 }}>
          VOICE CONFIGURATION
        </h1>
      </div>

      {/* Voice Profiles */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
        <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>VOICE PROFILES</p>
        <div className="grid grid-cols-1 gap-2">
          {VOICE_PROFILES.map(p => {
            const Icon = p.icon;
            const isActive = activeProfile === p.id;
            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyProfile(p)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                style={{
                  background: isActive ? "rgba(200,30,30,0.18)" : "rgba(15,4,4,0.6)",
                  border: `1px solid ${isActive ? "rgba(200,40,40,0.4)" : "rgba(200,30,30,0.1)"}`,
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isActive ? "rgba(200,30,30,0.25)" : "rgba(200,30,30,0.08)" }}>
                  <Icon className="w-4 h-4" style={{ color: isActive ? "rgba(255,100,100,0.9)" : "rgba(200,80,80,0.4)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-mono" style={{ color: isActive ? "rgba(255,200,200,0.9)" : "rgba(200,120,120,0.55)" }}>
                    {p.label}
                  </p>
                  <p className="text-[9px] font-mono" style={{ color: "rgba(200,100,100,0.35)" }}>{p.desc}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "rgba(255,100,100,0.7)" }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="rounded-xl p-4 space-y-4"
        style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>EXPRESSIVENESS INTENSITY</p>
          <span className="text-sm font-heading" style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,120,120,0.8)", fontWeight: 700 }}>
            {intensity}<span className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.4)" }}>/10</span>
          </span>
        </div>
        <input
          type="range" min={1} max={10} value={intensity}
          onChange={e => setIntensity(parseInt(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, rgba(200,30,30,0.7) ${intensity * 10}%, rgba(200,30,30,0.1) ${intensity * 10}%)` }}
        />
        <div className="flex justify-between text-[8px] font-mono" style={{ color: "rgba(200,80,80,0.35)" }}>
          <span>MINIMAL</span>
          <span>BALANCED</span>
          <span>MAXIMUM</span>
        </div>
        <p className="text-[9px] font-mono" style={{ color: "rgba(200,100,100,0.4)" }}>
          Controls how dramatically IRIS adjusts pitch, pacing, and tone based on your input energy.
          Higher values = more reactive, emotionally-mirroring voice.
        </p>
      </div>

      {/* ElevenLabs Voice */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.12)" }}>
        <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>ELEVENLABS VOICE ENGINE</p>
        <p className="text-[9px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>
          Ultra-realistic voices powered by ElevenLabs. API key required (set in System Settings).
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EL_VOICES.map(v => (
            <button key={v.id} onClick={() => setElVoice(v.id)}
              className="px-2.5 py-2 rounded-lg text-left text-[9px] font-mono transition-all"
              style={{
                background: elVoice === v.id ? "rgba(200,30,30,0.2)" : "rgba(12,4,4,0.6)",
                border: `1px solid ${elVoice === v.id ? "rgba(200,30,30,0.4)" : "rgba(200,30,30,0.08)"}`,
                color: elVoice === v.id ? "rgba(255,140,140,0.9)" : "rgba(200,100,100,0.5)"
              }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={testVoice} disabled={testing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-mono tracking-wider transition-all disabled:opacity-40"
          style={{ background: "rgba(80,80,200,0.15)", border: "1px solid rgba(80,80,255,0.2)", color: "rgba(120,140,255,0.7)" }}>
          <Play className="w-3.5 h-3.5" />
          {testing ? "TESTING…" : "TEST VOICE"}
        </button>
        <button onClick={save}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-mono tracking-wider transition-all"
          style={{ background: saved ? "rgba(80,200,80,0.15)" : "rgba(200,30,30,0.2)", border: `1px solid ${saved ? "rgba(80,200,80,0.3)" : "rgba(200,30,30,0.3)"}`, color: saved ? "rgba(120,255,140,0.8)" : "rgba(255,120,120,0.8)" }}>
          <Sliders className="w-3.5 h-3.5" />
          {saved ? "SAVED ✓" : "SAVE CONFIGURATION"}
        </button>
      </div>
    </div>
  );
}