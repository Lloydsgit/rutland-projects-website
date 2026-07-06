import { useState, useEffect, useRef } from "react";
import { Cpu, Battery, Wifi, Monitor, Vibrate, Lock, Sun, RefreshCw, Maximize, Minimize } from "lucide-react";
import { motion } from "framer-motion";

function StatusBadge({ ok }) {
  return (
    <div className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? "rgba(80,255,120,0.7)" : "rgba(255,80,80,0.4)" }} />
  );
}

export default function HardwareControls() {
  const [battery, setBattery] = useState(null);
  const [network, setNetwork] = useState({ type: "unknown", downlink: 0, online: navigator.onLine });
  const [orientation, setOrientation] = useState(screen.orientation?.type || "unknown");
  const [wakeLock, setWakeLock] = useState(null);
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);
  const [vibrating, setVibrating] = useState(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    // Battery API
    navigator.getBattery?.().then(b => {
      const update = () => setBattery({ level: Math.round(b.level * 100), charging: b.charging });
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    }).catch(() => {});

    // Network
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const updateNet = () => setNetwork({ type: conn.effectiveType || conn.type, downlink: conn.downlink, online: navigator.onLine });
      updateNet();
      conn.addEventListener("change", updateNet);
    }
    window.addEventListener("online", () => setNetwork(n => ({ ...n, online: true })));
    window.addEventListener("offline", () => setNetwork(n => ({ ...n, online: false })));

    // Orientation
    screen.orientation?.addEventListener("change", () => setOrientation(screen.orientation.type));

    // Fullscreen
    document.addEventListener("fullscreenchange", () => setFullscreen(!!document.fullscreenElement));
  }, []);

  const toggleWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLock(null);
    } else {
      try {
        const wl = await navigator.wakeLock?.request("screen");
        wakeLockRef.current = wl;
        setWakeLock(wl);
        wl.addEventListener("release", () => { wakeLockRef.current = null; setWakeLock(null); });
      } catch (e) { alert("Wake Lock not supported in this browser."); }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const vibrate = (pattern) => {
    if (!navigator.vibrate) { alert("Vibration not supported."); return; }
    setVibrating(true);
    navigator.vibrate(pattern);
    setTimeout(() => setVibrating(false), 1000);
  };

  const sections = [
    {
      title: "BATTERY",
      icon: Battery,
      content: battery ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono" style={{ color: "rgba(200,120,120,0.6)" }}>Level</span>
            <span className="text-sm font-mono" style={{ color: battery.level > 30 ? "rgba(80,255,120,0.8)" : "rgba(255,100,100,0.8)" }}>{battery.level}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(200,30,30,0.1)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${battery.level}%`, background: battery.level > 30 ? "rgba(80,255,120,0.6)" : "rgba(255,80,80,0.7)" }} />
          </div>
          <div className="flex items-center gap-1.5">
            <StatusBadge ok={battery.charging} />
            <span className="text-[9px] font-mono" style={{ color: "rgba(180,100,100,0.5)" }}>{battery.charging ? "Charging" : "On Battery"}</span>
          </div>
        </div>
      ) : <p className="text-[10px] font-mono" style={{ color: "rgba(180,80,80,0.4)" }}>Battery API not available</p>,
    },
    {
      title: "NETWORK",
      icon: Wifi,
      content: (
        <div className="space-y-1.5">
          {[
            { label: "Status", value: network.online ? "Online" : "Offline", ok: network.online },
            { label: "Type", value: network.type || "Unknown" },
            { label: "Downlink", value: network.downlink ? `${network.downlink} Mbps` : "—" },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-[10px] font-mono" style={{ color: "rgba(180,100,100,0.5)" }}>{r.label}</span>
              <div className="flex items-center gap-1.5">
                {r.ok !== undefined && <StatusBadge ok={r.ok} />}
                <span className="text-[10px] font-mono" style={{ color: "rgba(220,160,160,0.7)" }}>{r.value}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "DISPLAY",
      icon: Monitor,
      content: (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span style={{ color: "rgba(180,100,100,0.5)" }}>Resolution</span>
            <span style={{ color: "rgba(220,160,160,0.7)" }}>{screen.width}×{screen.height}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span style={{ color: "rgba(180,100,100,0.5)" }}>Orientation</span>
            <span style={{ color: "rgba(220,160,160,0.7)" }}>{orientation.split("-")[0]}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span style={{ color: "rgba(180,100,100,0.5)" }}>Pixel Ratio</span>
            <span style={{ color: "rgba(220,160,160,0.7)" }}>{window.devicePixelRatio}x</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={toggleFullscreen}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-mono transition-all"
              style={{ background: fullscreen ? "rgba(200,30,30,0.2)" : "rgba(200,30,30,0.08)", border: "1px solid rgba(200,30,30,0.25)", color: "rgba(255,120,120,0.7)" }}>
              {fullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
              {fullscreen ? "EXIT FULL" : "FULLSCREEN"}
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "WAKE LOCK",
      icon: Sun,
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge ok={!!wakeLock} />
            <span className="text-[10px] font-mono" style={{ color: "rgba(180,100,100,0.5)" }}>{wakeLock ? "Screen will not sleep" : "Screen can sleep normally"}</span>
          </div>
          <button onClick={toggleWakeLock}
            className="w-full py-1.5 rounded-lg text-[9px] font-mono transition-all"
            style={{ background: wakeLock ? "rgba(200,30,30,0.25)" : "rgba(200,30,30,0.08)", border: `1px solid rgba(200,30,30,${wakeLock ? 0.4 : 0.2})`, color: "rgba(255,120,120,0.7)" }}>
            {wakeLock ? "RELEASE WAKE LOCK" : "ENABLE WAKE LOCK"}
          </button>
          <p className="text-[8px] font-mono" style={{ color: "rgba(160,80,80,0.35)" }}>Prevents screen from dimming during active operations.</p>
        </div>
      ),
    },
    {
      title: "VIBRATION",
      icon: Vibrate,
      content: (
        <div className="space-y-2">
          <p className="text-[9px] font-mono" style={{ color: "rgba(180,80,80,0.4)" }}>Mobile only. Confirm JARVIS is active.</p>
          <div className="flex gap-2">
            {[
              { label: "SHORT", pattern: [100] },
              { label: "DOUBLE", pattern: [100, 100, 100] },
              { label: "SOS", pattern: [100,100,100,200,200,200,200,100,100,100] },
            ].map(({ label, pattern }) => (
              <motion.button key={label} whileTap={{ scale: 0.92 }} onClick={() => vibrate(pattern)}
                className="flex-1 py-1.5 rounded-lg text-[8px] font-mono transition-all"
                style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,120,120,0.6)" }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "CLIPBOARD",
      icon: Lock,
      content: (
        <div className="space-y-2">
          <button onClick={async () => {
            const text = await navigator.clipboard.readText?.().catch(() => "");
            alert(`Clipboard: "${text?.slice(0, 200) || "(empty)"}"`);
          }}
            className="w-full py-1.5 rounded-lg text-[9px] font-mono"
            style={{ background: "rgba(200,30,30,0.08)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,120,120,0.6)" }}>
            READ CLIPBOARD
          </button>
          <p className="text-[8px] font-mono" style={{ color: "rgba(160,80,80,0.35)" }}>Browser may ask for permission.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-4 h-4" style={{ color: "rgba(255,80,80,0.6)" }} />
          <h1 className="text-xs font-heading tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: "rgba(255,100,100,0.7)", fontWeight: 700 }}>
            HARDWARE CONTROLS
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map(({ title, icon: Icon, content }) => (
            <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4"
              style={{ background: "rgba(12,4,4,0.9)", border: "1px solid rgba(200,30,30,0.12)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-3.5 h-3.5" style={{ color: "rgba(255,80,80,0.5)" }} />
                <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(200,80,80,0.5)" }}>{title}</span>
              </div>
              {content}
            </motion.div>
          ))}
        </div>

        <p className="text-[9px] font-mono text-center" style={{ color: "rgba(160,80,80,0.25)" }}>
          Browser-accessible hardware APIs only. Smart home, IoT, and OS-level controls require a local server (Raspberry Pi JARVIS Box).
        </p>
      </div>
    </div>
  );
}