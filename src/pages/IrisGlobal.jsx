const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Layers, Target, Eye, Bell, Radio, Newspaper, Camera, Satellite, Cloud, Plane, Ship, MapPin, X, Search, Globe, Clock, Play, Pause, SkipBack, AlertCircle } from "lucide-react";

const LAYERS = [
  { id: "targets",   icon: Target,    label: "Targets",     color: "#C8102E" },
  { id: "watchlist", icon: Eye,       label: "Watchlist",   color: "#8B0000" },
  { id: "alerts",    icon: Bell,      label: "Intel Alerts",color: "#FF0033" },
  { id: "feeds",     icon: Radio,     label: "OSINT Feeds", color: "#C8102E" },
  { id: "news",      icon: Newspaper, label: "Live News",   color: "#8B0000" },
  { id: "cams",      icon: Camera,    label: "Live Cams",   color: "#C8102E" },
  { id: "flights",   icon: Plane,     label: "Flights",     color: "#FF0033" },
  { id: "ships",     icon: Ship,      label: "Ships",       color: "#C8102E" },
  { id: "weather",   icon: Cloud,     label: "Weather",     color: "#8B0000" },
  { id: "personal",  icon: MapPin,    label: "Personal",    color: "#FF0033" },
];

const DEMO_PINS = [
  { lat: 35.6762, lng: 139.6503, label: "Tokyo", type: "targets",   color: "#C8102E", ts: 1700000100000 },
  { lat: 51.5074, lng: -0.1278,  label: "London", type: "watchlist",color: "#8B0000", ts: 1700000200000 },
  { lat: 40.7128, lng: -74.0060, label: "New York",type: "alerts",  color: "#FF0033", ts: 1700000300000 },
  { lat: 19.0760, lng: 72.8777,  label: "Mumbai", type: "targets",  color: "#C8102E", ts: 1700000400000 },
  { lat: 55.7558, lng: 37.6176,  label: "Moscow", type: "watchlist",color: "#8B0000", ts: 1700000500000 },
  { lat: 31.2304, lng: 121.4737, label: "Shanghai",type: "feeds",  color: "#C8102E", ts: 1700000600000 },
  { lat: -33.8688,lng: 151.2093, label: "Sydney", type: "personal", color: "#FF0033", ts: 1700000700000 },
  { lat: 48.8566, lng: 2.3522,   label: "Paris",  type: "news",    color: "#8B0000", ts: 1700000800000 },
  { lat: 25.2048, lng: 55.2708,  label: "Dubai",  type: "alerts",  color: "#FF0033", ts: 1700000900000 },
  { lat: 1.3521,  lng: 103.8198, label: "Singapore",type:"feeds",  color: "#C8102E", ts: 1700001000000 },
];

function geocode(query) {
  const DB = {
    tokyo: [35.6762, 139.6503], london: [51.5074, -0.1278],
    "new york": [40.7128, -74.0060], paris: [48.8566, 2.3522],
    moscow: [55.7558, 37.6176], beijing: [39.9042, 116.4074],
    sydney: [-33.8688, 151.2093], dubai: [25.2048, 55.2708],
    mumbai: [19.0760, 72.8777], berlin: [52.5200, 13.4050],
    singapore: [1.3521, 103.8198], chicago: [41.8781, -87.6298],
    toronto: [43.6532, -79.3832], seoul: [37.5665, 126.9780],
    bangkok: [13.7563, 100.5018], tehran: [35.6892, 51.3890],
    cairo: [30.0444, 31.2357], nairobi: [-1.2921, 36.8219],
    ukraine: [49.0275, 31.4826], kyiv: [50.4501, 30.5234],
    "los angeles": [34.0522, -118.2437], miami: [25.7617, -80.1918],
    istanbul: [41.0082, 28.9784], jakarta: [-6.2088, 106.8456],
    lagos: [6.5244, 3.3792], "cape town": [-33.9249, 18.4241],
    riyadh: [24.7136, 46.6753], karachi: [24.8607, 67.0011],
    delhi: [28.6139, 77.2090], hyderabad: [17.3850, 78.4867],
  };
  const key = query.toLowerCase().trim();
  for (const [k, v] of Object.entries(DB)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

export default function IrisGlobal() {
  const globeRef = useRef(null);
  const containerRef = useRef(null);
  const [GlobeComponent, setGlobeComponent] = useState(null);
  const [activeLayers, setActiveLayers] = useState(new Set(["targets", "watchlist", "alerts"]));
  const [selectedPin, setSelectedPin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [commandLog, setCommandLog] = useState([]);
  const [globeReady, setGlobeReady] = useState(false);

  // Timeline scrubber
  const [timelineActive, setTimelineActive] = useState(false);
  const [timelinePos, setTimelinePos] = useState(100); // 0-100 %
  const [timelinePlaying, setTimelinePlaying] = useState(false);
  const timelineTimer = useRef(null);

  // Alert pulse state
  const [alertPulses, setAlertPulses] = useState([]);

  const { data: targets = [] } = useQuery({ queryKey: ["targets"], queryFn: () => db.entities.Target.list(), initialData: [] });
  const { data: watchlist = [] } = useQuery({ queryKey: ["watchlist"], queryFn: () => db.entities.Watchlist.list(), initialData: [] });
  const { data: alerts = [] } = useQuery({ queryKey: ["intel-alerts"], queryFn: () => db.entities.IntelAlert.list("-created_date", 20), initialData: [], refetchInterval: 15000 });

  // Check for new unread alerts → generate pulses
  useEffect(() => {
    const unread = alerts.filter(a => !a.read);
    if (unread.length > 0) {
      const pulses = unread.slice(0, 3).map((a, i) => {
        const base = DEMO_PINS[i % DEMO_PINS.length];
        return { lat: base.lat + (Math.random() - 0.5) * 3, lng: base.lng + (Math.random() - 0.5) * 3, id: a.id, label: a.title };
      });
      setAlertPulses(pulses);
    }
  }, [alerts.length]);

  useEffect(() => {
    import("react-globe.gl").then(mod => setGlobeComponent(() => mod.default));
  }, []);

  const addLog = useCallback((msg) => {
    setCommandLog(prev => [{ msg, ts: Date.now() }, ...prev.slice(0, 4)]);
  }, []);

  // Timeline playback
  useEffect(() => {
    if (timelinePlaying) {
      timelineTimer.current = setInterval(() => {
        setTimelinePos(p => {
          if (p >= 100) { setTimelinePlaying(false); return 100; }
          return p + 0.5;
        });
      }, 100);
    } else {
      clearInterval(timelineTimer.current);
    }
    return () => clearInterval(timelineTimer.current);
  }, [timelinePlaying]);

  // All pins sorted by timestamp for timeline
  const allPins = useMemo(() => {
    const sorted = [...DEMO_PINS].sort((a, b) => a.ts - b.ts);
    const cutoff = sorted[0]?.ts + (timelinePos / 100) * (sorted[sorted.length - 1]?.ts - sorted[0]?.ts);
    return timelineActive ? sorted.filter(p => p.ts <= cutoff) : sorted;
  }, [timelineActive, timelinePos]);

  // Build points
  const points = useMemo(() => {
    const pts = [];
    if (activeLayers.has("targets")) {
      targets.forEach(t => {
        if (t.location) {
          const c = geocode(t.location);
          if (c) pts.push({ lat: c[0], lng: c[1], label: t.name, type: "targets", color: "#ff3333", altitude: 0.02, data: t });
        }
      });
    }
    if (activeLayers.has("watchlist")) {
      watchlist.forEach(w => {
        const c = geocode(w.name);
        if (c) pts.push({ lat: c[0], lng: c[1], label: w.name, type: "watchlist", color: "#ff6622", altitude: 0.02, data: w });
      });
    }
    if (activeLayers.has("alerts")) {
      alerts.slice(0, 8).forEach((a, i) => {
        const base = allPins[i % allPins.length];
        if (base) pts.push({ lat: base.lat + (Math.random() - 0.5), lng: base.lng + (Math.random() - 0.5), label: a.title, type: "alerts", color: "#ff2266", altitude: 0.03, data: a });
      });
    }
    allPins.forEach(p => {
      if (activeLayers.has(p.type) && !pts.find(pt => pt.label === p.label)) {
        pts.push({ ...p, altitude: 0.02 });
      }
    });
    if (searchResult) {
      pts.push({ lat: searchResult[0], lng: searchResult[1], label: searchQuery, type: "search", color: "#FF0033", altitude: 0.06 });
    }
    return pts;
  }, [targets, watchlist, alerts, activeLayers, allPins, searchResult, searchQuery]);

  // Alert pulse rings
  const rings = useMemo(() => {
    const r = [];
    if (searchResult) r.push({ lat: searchResult[0], lng: searchResult[1], maxR: 5, propagationSpeed: 2.5, repeatPeriod: 900, color: () => "rgba(255,0,51,0.7)" });
    alertPulses.forEach(p => r.push({ lat: p.lat, lng: p.lng, maxR: 4, propagationSpeed: 1.8, repeatPeriod: 1200, color: () => "rgba(200,16,46,0.6)" }));
    return r;
  }, [searchResult, alertPulses]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const coords = geocode(searchQuery);
    if (coords) {
      setSearchResult(coords);
      addLog(`IRIS → Navigating to ${searchQuery}`);
      if (globeRef.current) globeRef.current.pointOfView({ lat: coords[0], lng: coords[1], altitude: 1.4 }, 2000);
    } else {
      addLog(`IRIS → Location not found: ${searchQuery}`);
    }
    setTimeout(() => setIsSearching(false), 2000);
  };

  const toggleLayer = (id) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      addLog(`IRIS → Layer ${next.has(id) ? "ON" : "OFF"}: ${id.toUpperCase()}`);
      return next;
    });
  };

  const handlePinClick = (point) => {
    setSelectedPin(point);
    if (globeRef.current) globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.2 }, 1500);
    addLog(`IRIS → Focused: ${point.label}`);
  };

  const resetTimeline = () => { setTimelinePos(0); setTimelinePlaying(false); };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="h-full flex overflow-hidden relative" style={{ background: "#050000" }}>

      {/* Globe canvas */}
      <div ref={containerRef} className="flex-1 relative">
        {!GlobeComponent ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border border-red-500/30 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: "rgba(255,50,50,0.6)" }} />
              <p className="text-[11px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>INITIALIZING GLOBE ENGINE…</p>
            </div>
          </div>
        ) : (
          <GlobeComponent
            ref={globeRef}
            width={containerRef.current?.clientWidth || 800}
            height={containerRef.current?.clientHeight || 600}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            globeMaterial={
              typeof window !== "undefined" && window.THREE
                ? new window.THREE.MeshPhongMaterial({ color: 0x1a0000, emissive: 0x0a0000, specular: 0x330000, shininess: 5 })
                : undefined
            }
            atmosphereColor="rgba(255,0,51,0.22)"
            atmosphereAltitude={0.18}
            onGlobeReady={() => { setGlobeReady(true); addLog("IRIS → Globe online. All systems nominal."); }}
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude="altitude"
            pointRadius={0.55}
            pointResolution={14}
            pointLabel={d => `
              <div style="background:rgba(8,0,0,0.95);border:1px solid ${d.color};border-radius:8px;padding:8px 12px;font-family:monospace;color:${d.color};font-size:11px;min-width:130px">
                <div style="font-weight:bold;margin-bottom:2px">${d.label}</div>
                <div style="opacity:0.6;font-size:9px;text-transform:uppercase;letter-spacing:0.1em">${d.type}</div>
              </div>
            `}
            onPointClick={handlePinClick}
            pointsMerge={false}
            showAtmosphere={true}
            showGraticules={true}
            ringsData={rings}
            ringLat="lat"
            ringLng="lng"
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
            ringColor="color"
          />
        )}

        {/* Scan lines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,30,30,0.012) 2px,rgba(255,30,30,0.012) 4px)",
          zIndex: 2
        }} />

        {/* Corner brackets */}
        {[["top-3 left-3","border-t border-l"],["top-3 right-3","border-t border-r"],["bottom-20 left-3","border-b border-l"],["bottom-20 right-3","border-b border-r"]].map(([pos,brd],i) => (
          <div key={i} className={`absolute ${pos} w-6 h-6 ${brd} pointer-events-none`} style={{ borderColor: "rgba(255,60,60,0.3)", zIndex: 3 }} />
        ))}

        {/* Header */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="text-[9px] font-mono tracking-[0.4em]" style={{ color: "rgba(255,80,80,0.45)" }}>IRIS GLOBAL — HOLOGRAPHIC WORLD COMMAND</p>
          <p className="text-[8px] font-mono mt-0.5" style={{ color: "rgba(255,60,60,0.25)" }}>{points.length} PINS · {activeLayers.size} LAYERS ACTIVE</p>
        </div>

        {/* Alert indicator */}
        {unreadCount > 0 && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
            style={{ background: "rgba(8,0,0,0.9)", border: "1px solid rgba(255,40,40,0.4)" }}>
            <div className="w-2 h-2 rounded-full animate-ping" style={{ background: "rgba(255,60,60,0.8)" }} />
            <span className="text-[9px] font-mono" style={{ color: "rgba(255,100,100,0.8)" }}>
              {unreadCount} NEW {unreadCount === 1 ? "ALERT" : "ALERTS"}
            </span>
          </div>
        )}

        {/* Command log */}
        <div className="absolute bottom-24 left-4 z-10 space-y-1 pointer-events-none">
          {commandLog.map((l, i) => (
            <motion.p key={l.ts} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - i * 0.22, x: 0 }}
              className="text-[9px] font-mono" style={{ color: `rgba(255,80,80,${0.5 - i * 0.1})` }}>
              {l.msg}
            </motion.p>
          ))}
        </div>

        {/* Search bar */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(8,0,0,0.9)", border: "1px solid rgba(255,50,50,0.25)", backdropFilter: "blur(12px)" }}>
            <Globe className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,80,80,0.5)" }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="IRIS, zoom to…"
              className="w-48 text-[10px] font-mono bg-transparent focus:outline-none"
              style={{ color: "rgba(255,200,200,0.9)" }}
            />
            <button onClick={handleSearch}
              className="px-2 py-0.5 rounded text-[8px] font-mono"
              style={{ background: "rgba(255,50,50,0.15)", color: "rgba(255,100,100,0.8)", border: "1px solid rgba(255,50,50,0.25)" }}>
              {isSearching ? "…" : "GO"}
            </button>
            <button onClick={() => { setActiveLayers(new Set(LAYERS.map(l => l.id))); globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 2000); addLog("IRIS → All layers activated"); }}
              className="px-2 py-0.5 rounded text-[8px] font-mono"
              style={{ background: "rgba(255,30,30,0.12)", color: "rgba(255,80,80,0.6)", border: "1px solid rgba(255,30,30,0.2)" }}>
              ALL
            </button>
          </div>
        </div>

        {/* Timeline scrubber */}
        <div className="absolute bottom-4 left-4 right-40 z-10 flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(8,0,0,0.92)", border: "1px solid rgba(255,40,40,0.2)", backdropFilter: "blur(12px)" }}>
          <button onClick={() => setTimelineActive(v => !v)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-mono flex-shrink-0"
            style={{ background: timelineActive ? "rgba(255,30,30,0.2)" : "rgba(255,30,30,0.07)", border: `1px solid ${timelineActive ? "rgba(255,50,50,0.4)" : "rgba(255,30,30,0.15)"}`, color: timelineActive ? "rgba(255,100,100,0.9)" : "rgba(255,60,60,0.4)" }}>
            <Clock className="w-3 h-3" /> TIMELINE
          </button>
          {timelineActive && (
            <>
              <button onClick={resetTimeline} style={{ color: "rgba(255,80,80,0.5)" }}>
                <SkipBack className="w-3 h-3" />
              </button>
              <button onClick={() => setTimelinePlaying(v => !v)} style={{ color: "rgba(255,100,100,0.7)" }}>
                {timelinePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <input type="range" min={0} max={100} value={timelinePos}
                onChange={e => { setTimelinePos(Number(e.target.value)); setTimelinePlaying(false); }}
                className="flex-1 h-0.5 appearance-none rounded-full cursor-pointer"
                style={{ background: `linear-gradient(to right, rgba(255,60,60,0.7) ${timelinePos}%, rgba(255,30,30,0.15) ${timelinePos}%)` }}
              />
              <span className="text-[8px] font-mono flex-shrink-0" style={{ color: "rgba(255,80,80,0.5)" }}>
                {Math.round(timelinePos)}%
              </span>
              <span className="text-[8px] font-mono flex-shrink-0" style={{ color: "rgba(255,60,60,0.35)" }}>
                {points.length} PINS
              </span>
            </>
          )}
          {!timelineActive && (
            <span className="text-[8px] font-mono" style={{ color: "rgba(255,60,60,0.3)" }}>
              Enable timeline to replay OSINT discoveries chronologically
            </span>
          )}
        </div>
      </div>

      {/* Layer rail */}
      <div className="w-36 flex-shrink-0 flex flex-col gap-1 p-2 overflow-y-auto"
        style={{ background: "rgba(6,0,0,0.97)", borderLeft: "1px solid rgba(255,40,40,0.1)" }}>
        <p className="text-[8px] font-mono tracking-[0.3em] text-center py-1 mb-1" style={{ color: "rgba(255,80,80,0.35)" }}>LAYERS</p>
        {LAYERS.map(({ id, icon: Icon, label, color }) => {
          const on = activeLayers.has(id);
          return (
            <button key={id} onClick={() => toggleLayer(id)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg transition-all"
              style={{ background: on ? `rgba(255,40,40,0.12)` : "rgba(255,255,255,0.02)", border: `1px solid ${on ? "rgba(255,60,60,0.3)" : "rgba(255,255,255,0.05)"}` }}>
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color: on ? color : "rgba(255,255,255,0.2)" }} />
              <span className="text-[9px] font-mono" style={{ color: on ? "rgba(255,200,200,0.85)" : "rgba(255,255,255,0.3)" }}>{label}</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: on ? color : "rgba(255,255,255,0.08)" }} />
            </button>
          );
        })}
      </div>

      {/* Pin detail panel */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            className="absolute right-36 top-0 bottom-0 w-72 z-20 flex flex-col overflow-hidden"
            style={{ background: "rgba(6,0,0,0.97)", borderLeft: "1px solid rgba(255,50,50,0.2)" }}>
            <div className="flex items-center justify-between p-4"
              style={{ borderBottom: "1px solid rgba(255,40,40,0.1)" }}>
              <div>
                <p className="text-[8px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>INTEL FOCUS</p>
                <p className="text-sm font-mono mt-0.5" style={{ color: "rgba(255,220,220,0.9)" }}>{selectedPin.label}</p>
              </div>
              <button onClick={() => setSelectedPin(null)} style={{ color: "rgba(255,255,255,0.3)" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: "rgba(255,30,30,0.04)", border: "1px solid rgba(255,50,50,0.12)" }}>
                <p className="text-[9px] font-mono" style={{ color: "rgba(255,80,80,0.5)" }}>COORDINATES</p>
                <p className="text-[11px] font-mono mt-1" style={{ color: "rgba(255,200,200,0.8)" }}>
                  {selectedPin.lat?.toFixed(4)}°N · {selectedPin.lng?.toFixed(4)}°E
                </p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[9px] font-mono mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>TYPE</p>
                <div className="inline-flex px-2 py-0.5 rounded text-[9px] font-mono"
                  style={{ background: `${selectedPin.color}22`, color: selectedPin.color, border: `1px solid ${selectedPin.color}44` }}>
                  {selectedPin.type?.toUpperCase()}
                </div>
              </div>
              {selectedPin.data && (
                <div className="rounded-lg p-3 space-y-2"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>INTEL DATA</p>
                  {Object.entries(selectedPin.data).filter(([k]) => !["id","created_date","updated_date"].includes(k)).slice(0, 6).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[8px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{k.replace(/_/g," ").toUpperCase()}</p>
                      <p className="text-[10px] font-mono" style={{ color: "rgba(255,200,200,0.7)" }}>{String(v).slice(0, 80)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}