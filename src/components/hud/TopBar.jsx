import { useState, useEffect } from "react";
import { Shield, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopBar({ activeMode = "operator", atsActive = false }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour12: false });
  const formatDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-primary/10 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="font-heading text-primary text-sm tracking-widest cyan-glow">
          JARVIS
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(time)}
        </span>
        <span className="text-xs text-primary font-mono">
          {formatTime(time)}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span>{greeting()}, Sir.</span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {atsActive && (
          <span className="text-xs font-heading text-cyan tracking-widest animate-pulse">
            ATS ACTIVE
          </span>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Activity className="w-3 h-3 text-success-green" />
          <span className="font-mono text-success-green">ONLINE</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Shield className="w-3 h-3 text-primary/60" />
          <span className="font-mono text-primary/60 uppercase">{activeMode}</span>
        </div>
      </div>
    </div>
  );
}