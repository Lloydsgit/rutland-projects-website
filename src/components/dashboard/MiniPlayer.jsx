import { useState, useRef } from "react";
import { Music, Play, Pause, Radio } from "lucide-react";
import { motion } from "framer-motion";

const STATIONS = [
  { id: "s1", label: "Drone Zone", url: "https://ice1.somafm.com/dronezone-128-mp3" },
  { id: "s2", label: "Deep Space", url: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { id: "s3", label: "Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { id: "s4", label: "Secret Agent", url: "https://ice1.somafm.com/secretagent-128-mp3" },
];

export default function MiniPlayer() {
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const play = (station) => {
    if (active?.id === station.id) {
      if (playing) { audioRef.current?.pause(); setPlaying(false); }
      else { audioRef.current?.play().catch(() => {}); setPlaying(true); }
      return;
    }
    setActive(station);
    setPlaying(true);
    setTimeout(() => {
      if (audioRef.current) { audioRef.current.src = station.url; audioRef.current.play().catch(() => {}); }
    }, 50);
  };

  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(10,3,3,0.85)", border: "1px solid rgba(200,30,30,0.1)" }}>
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.35)" }}>AMBIENT AUDIO</p>
        {active && playing && (
          <div className="flex gap-0.5 items-end h-3">
            {[2,4,3,5,2].map((h, i) => (
              <motion.div key={i} className="w-0.5 rounded-full" style={{ background: "rgba(255,80,80,0.5)" }}
                animate={{ height: [h, h+4, h] }}
                transition={{ duration: 0.4, delay: i*0.08, repeat: Infinity, repeatType: "reverse" }} />
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {STATIONS.map(s => (
          <button key={s.id} onClick={() => play(s)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all"
            style={{ background: active?.id === s.id ? "rgba(200,30,30,0.15)" : "rgba(15,4,4,0.6)", border: `1px solid ${active?.id === s.id ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.07)"}` }}>
            {active?.id === s.id && playing
              ? <Pause className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "rgba(255,100,100,0.7)" }} />
              : <Play className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "rgba(180,80,80,0.4)" }} />}
            <span className="text-[9px] font-mono truncate" style={{ color: active?.id === s.id ? "rgba(255,160,160,0.8)" : "rgba(200,100,100,0.45)" }}>{s.label}</span>
          </button>
        ))}
      </div>
      {active && (
        <p className="text-[8px] font-mono mt-2 text-center" style={{ color: "rgba(160,60,60,0.35)" }}>
          {playing ? `▶ ${active.label} — LIVE` : `⏸ ${active.label}`}
        </p>
      )}
    </div>
  );
}