import { useState, useRef, useCallback } from "react";
import { Music, Search, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Radio, Loader2, Heart, Shuffle, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JAMENDO_CLIENT = "b6747d04";

const STATIONS = [
  { id: "s1", label: "Drone Zone", url: "https://ice1.somafm.com/dronezone-128-mp3", genre: "Ambient" },
  { id: "s2", label: "Deep Space", url: "https://ice1.somafm.com/deepspaceone-128-mp3", genre: "Electronic" },
  { id: "s3", label: "Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3", genre: "Chill" },
  { id: "s4", label: "Secret Agent", url: "https://ice1.somafm.com/secretagent-128-mp3", genre: "Jazz" },
  { id: "s5", label: "Illinois Street Lounge", url: "https://ice1.somafm.com/illstreet-128-mp3", genre: "Lounge" },
  { id: "s6", label: "Lush", url: "https://ice1.somafm.com/lush-128-mp3", genre: "Dream" },
];

const QUICK_SEARCHES = ["lofi", "jazz", "cyberpunk", "ambient", "cinematic", "electronic", "acoustic", "dark"];

function fmtTime(secs) {
  if (!secs) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicWidget() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [current, setCurrent] = useState(null); // { type: "track"|"radio", data }
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(new Set());
  const [tab, setTab] = useState("search"); // "search" | "radio"
  const audioRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    setTab("search");
    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT}&format=json&limit=30&namesearch=${encodeURIComponent(q)}&audioformat=mp32&include=musicinfo&order=popularity_total`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, []);

  const playTrack = (track) => {
    if (current?.type === "radio") {
      audioRef.current?.pause();
    }
    if (current?.type === "track" && current.data.id === track.id) {
      if (playing) {
        audioRef.current?.pause();
        setPlaying(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setPlaying(true);
      }
      return;
    }
    setCurrent({ type: "track", data: track });
    setPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = track.audio;
        audioRef.current.play().catch(() => {});
      }
    }, 50);
  };

  const playStation = (station) => {
    if (current?.type === "radio" && current.data.id === station.id) {
      audioRef.current?.pause();
      setCurrent(null);
      setPlaying(false);
      return;
    }
    setCurrent({ type: "radio", data: station });
    setPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current.play().catch(() => {});
      }
    }, 50);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !muted;
    setMuted(m => !m);
  };

  const seek = (e) => {
    if (!audioRef.current || current?.type === "radio") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const isPlaying = (id) => playing && current?.data?.id === id;

  return (
    <div className="h-full flex flex-col" style={{ background: "#050103" }}>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Top bar — JARVIS branding */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(200,30,30,0.12)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, rgba(255,80,80,0.4), rgba(200,30,30,0.1))", border: "1px solid rgba(255,80,80,0.3)" }}>
            <Music className="w-3.5 h-3.5" style={{ color: "rgba(255,100,100,0.9)" }} />
          </div>
          <div>
            <p className="text-[11px] font-heading tracking-[0.3em]" style={{ color: "rgba(255,100,100,0.7)", fontFamily: "'Orbitron', sans-serif" }}>JARVIS AUDIO</p>
            <p className="text-[8px] font-mono" style={{ color: "rgba(180,80,80,0.4)" }}>Powered by Jamendo · SomaFM</p>
          </div>
        </div>
        <div className="ml-auto flex gap-1.5">
          {["search", "radio"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider transition-all"
              style={{ background: tab === t ? "rgba(200,30,30,0.2)" : "transparent", border: `1px solid ${tab === t ? "rgba(200,30,30,0.35)" : "rgba(200,30,30,0.1)"}`, color: tab === t ? "rgba(255,120,120,0.8)" : "rgba(180,80,80,0.4)" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      {tab === "search" && (
        <div className="px-4 py-2 flex-shrink-0 space-y-2" style={{ borderBottom: "1px solid rgba(200,30,30,0.08)" }}>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(20,4,4,0.8)", border: "1px solid rgba(200,30,30,0.15)" }}>
              <Search className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(200,80,80,0.4)" }} />
              <input value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && search(query)}
                placeholder="Search millions of songs…"
                className="flex-1 bg-transparent text-xs font-mono text-foreground/70 placeholder:text-foreground/20 focus:outline-none" />
              {searching && <Loader2 className="w-3 h-3 animate-spin" style={{ color: "rgba(200,80,80,0.5)" }} />}
            </div>
            <button onClick={() => search(query)} className="px-3 py-1.5 rounded-xl text-[9px] font-mono"
              style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.7)" }}>
              GO
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_SEARCHES.map(q => (
              <button key={q} onClick={() => { setQuery(q); search(q); }}
                className="px-2 py-0.5 rounded-full text-[8px] font-mono transition-all hover:opacity-80"
                style={{ background: "rgba(200,30,30,0.08)", border: "1px solid rgba(200,30,30,0.12)", color: "rgba(200,100,100,0.5)" }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "radio" ? (
          <div className="p-4 space-y-2">
            <p className="text-[9px] font-mono tracking-widest mb-3" style={{ color: "rgba(200,80,80,0.4)" }}>LIVE RADIO STATIONS — 24/7</p>
            {STATIONS.map(s => (
              <motion.button key={s.id} onClick={() => playStation(s)}
                whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{ background: isPlaying(s.id) ? "rgba(200,30,30,0.15)" : "rgba(12,4,4,0.8)", border: `1px solid ${isPlaying(s.id) ? "rgba(200,30,30,0.35)" : "rgba(200,30,30,0.08)"}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,30,30,0.12)" }}>
                  {isPlaying(s.id) ? (
                    <div className="flex gap-0.5 items-end h-5">
                      {[3,5,4,6,3].map((h, i) => (
                        <motion.div key={i} className="w-0.5 rounded-full bg-red-500/70"
                          animate={{ height: [h, h+5, h] }}
                          transition={{ duration: 0.4, delay: i*0.08, repeat: Infinity, repeatType: "reverse" }} />
                      ))}
                    </div>
                  ) : <Radio className="w-4 h-4" style={{ color: "rgba(200,80,80,0.5)" }} />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-mono" style={{ color: isPlaying(s.id) ? "rgba(255,160,160,0.9)" : "rgba(220,140,140,0.6)" }}>{s.label}</p>
                  <p className="text-[9px] font-mono" style={{ color: "rgba(160,80,80,0.4)" }}>{s.genre} · Live</p>
                </div>
                {isPlaying(s.id) && (
                  <div className="w-5 h-5 rounded-full bg-red-600/30 flex items-center justify-center">
                    <Pause className="w-2.5 h-2.5" style={{ color: "rgba(255,100,100,0.8)" }} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Music className="w-12 h-12 mx-auto mb-3 opacity-10" style={{ color: "rgba(255,80,80,0.5)" }} />
              <p className="text-[10px] font-mono" style={{ color: "rgba(200,80,80,0.3)" }}>Search for music above</p>
              <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(180,60,60,0.2)" }}>Millions of free tracks via Jamendo</p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            <p className="text-[9px] font-mono tracking-widest px-1 pb-2" style={{ color: "rgba(200,80,80,0.4)" }}>{results.length} TRACKS FOUND</p>
            {results.map((track, i) => (
              <motion.div key={track.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-all"
                style={{ background: isPlaying(track.id) ? "rgba(200,30,30,0.15)" : "rgba(12,4,4,0.6)", border: `1px solid ${isPlaying(track.id) ? "rgba(200,30,30,0.3)" : "rgba(200,30,30,0.06)"}` }}
                onClick={() => playTrack(track)}>
                {/* Cover */}
                <div className="w-10 h-10 rounded-lg flex-shrink-0 relative overflow-hidden" style={{ background: "rgba(40,10,10,0.8)" }}>
                  {track.image ? (
                    <img src={track.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-4 h-4" style={{ color: "rgba(180,80,80,0.4)" }} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
                    {isPlaying(track.id)
                      ? <Pause className="w-3.5 h-3.5 text-white" />
                      : <Play className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono truncate" style={{ color: isPlaying(track.id) ? "rgba(255,160,160,0.9)" : "rgba(220,160,160,0.7)" }}>{track.name}</p>
                  <p className="text-[9px] font-mono truncate" style={{ color: "rgba(160,80,80,0.4)" }}>{track.artist_name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[8px] font-mono" style={{ color: "rgba(160,80,80,0.3)" }}>{fmtTime(track.duration)}</span>
                  <button onClick={e => { e.stopPropagation(); setLiked(l => { const n = new Set(l); n.has(track.id) ? n.delete(track.id) : n.add(track.id); return n; }); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-3 h-3" style={{ color: liked.has(track.id) ? "rgba(255,80,80,0.8)" : "rgba(180,80,80,0.3)", fill: liked.has(track.id) ? "rgba(255,80,80,0.8)" : "none" }} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Player bar */}
      <div className="flex-shrink-0 px-4 py-3 space-y-2" style={{ borderTop: "1px solid rgba(200,30,30,0.12)", background: "rgba(8,2,4,0.98)" }}>
        {current ? (
          <>
            {/* Track info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "rgba(40,10,10,0.8)" }}>
                {current.type === "track" && current.data.image
                  ? <img src={current.data.image} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      {current.type === "radio" ? <Radio className="w-3.5 h-3.5" style={{ color: "rgba(200,80,80,0.5)" }} /> : <Music className="w-3.5 h-3.5" style={{ color: "rgba(200,80,80,0.5)" }} />}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono truncate" style={{ color: "rgba(255,180,180,0.8)" }}>
                  {current.type === "track" ? current.data.name : current.data.label}
                </p>
                <p className="text-[8px] font-mono truncate" style={{ color: "rgba(180,80,80,0.4)" }}>
                  {current.type === "track" ? current.data.artist_name : "Live Radio"}
                </p>
              </div>
              <button onClick={toggleMute} className="text-foreground/30 hover:text-foreground/70">
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Progress (tracks only) */}
            {current.type === "track" && (
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono w-7 text-right" style={{ color: "rgba(160,80,80,0.4)" }}>{fmtTime(progress)}</span>
                <div className="flex-1 h-1 rounded-full cursor-pointer relative" style={{ background: "rgba(200,30,30,0.12)" }} onClick={seek}>
                  <div className="h-full rounded-full" style={{ width: duration ? `${(progress / duration) * 100}%` : "0%", background: "rgba(255,80,80,0.6)" }} />
                </div>
                <span className="text-[8px] font-mono w-7" style={{ color: "rgba(160,80,80,0.4)" }}>{fmtTime(duration)}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button className="text-foreground/20 hover:text-foreground/60"><Shuffle className="w-3 h-3" /></button>
              <button className="text-foreground/20 hover:text-foreground/60"><SkipBack className="w-4 h-4" /></button>
              <button onClick={togglePlay}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(200,30,30,0.3)", border: "1px solid rgba(200,30,30,0.5)" }}>
                {playing ? <Pause className="w-4 h-4" style={{ color: "rgba(255,120,120,0.9)" }} /> : <Play className="w-4 h-4 ml-0.5" style={{ color: "rgba(255,120,120,0.9)" }} />}
              </button>
              <button className="text-foreground/20 hover:text-foreground/60"><SkipForward className="w-4 h-4" /></button>
              <button className="text-foreground/20 hover:text-foreground/60"><Repeat className="w-3 h-3" /></button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(200,30,30,0.3)" }} />
            <span className="text-[9px] font-mono" style={{ color: "rgba(180,80,80,0.3)" }}>Search a song or pick a radio station</span>
          </div>
        )}
      </div>
    </div>
  );
}