import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";

const ALLOWED_EMAILS = ["tejasreddynukella@gmail.com", "blackrockpos.eu@gmail.com"];
const MASTER_PASSWORD = "Fortuner@9";

// Store access grant in sessionStorage
export function isAccessGranted(userEmail) {
  if (ALLOWED_EMAILS.includes(userEmail?.toLowerCase())) return true;
  return sessionStorage.getItem("iris-master-access") === "1";
}

export default function AccessGate({ userEmail, children }) {
  const [granted, setGranted] = useState(() => isAccessGranted(userEmail));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [checking, setChecking] = useState(false);

  if (granted) return children;

  const handleUnlock = () => {
    setChecking(true);
    setTimeout(() => {
      if (password === MASTER_PASSWORD) {
        sessionStorage.setItem("iris-master-access", "1");
        setGranted(true);
      } else {
        setError("ACCESS DENIED — Invalid credentials");
        setPassword("");
      }
      setChecking(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: "rgba(3,0,0,0.97)", backdropFilter: "blur(20px)" }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-80 rounded-2xl p-8 text-center space-y-6"
        style={{ background: "rgba(10,2,2,0.98)", border: "1px solid rgba(200,30,30,0.3)", boxShadow: "0 0 60px rgba(200,0,0,0.15)" }}>
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.3)" }}>
            <Shield className="w-7 h-7" style={{ color: "rgba(255,80,80,0.7)" }} />
          </div>
          <div>
            <p className="text-xs font-heading tracking-[0.4em]" style={{ fontFamily: "'Orbitron',sans-serif", color: "rgba(255,80,80,0.6)", fontWeight: 700 }}>IRIS SECURE ACCESS</p>
            <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,80,80,0.35)" }}>CLASSIFIED — AUTHORIZED PERSONNEL ONLY</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-mono" style={{ color: "rgba(200,100,100,0.5)" }}>
            This system is restricted to authorized operators.<br />Enter master password to proceed.
          </p>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "rgba(200,60,60,0.4)" }} />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleUnlock()}
              placeholder="Master password…"
              className="w-full pl-8 pr-8 py-2.5 rounded-lg text-xs font-mono focus:outline-none text-center tracking-widest"
              style={{ background: "rgba(20,4,4,0.8)", border: `1px solid ${error ? "rgba(255,60,60,0.5)" : "rgba(200,30,30,0.2)"}`, color: "rgba(255,200,200,0.8)" }}
            />
            <button onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(200,60,60,0.4)" }}>
              {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
          {error && <p className="text-[9px] font-mono" style={{ color: "rgba(255,80,80,0.7)" }}>{error}</p>}
          <button onClick={handleUnlock} disabled={!password || checking}
            className="w-full py-2.5 rounded-lg text-[10px] font-mono tracking-widest disabled:opacity-40 transition-all"
            style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(200,30,30,0.4)", color: "rgba(255,120,120,0.8)" }}>
            {checking ? "VERIFYING…" : "AUTHENTICATE"}
          </button>
        </div>

        <p className="text-[8px] font-mono" style={{ color: "rgba(180,60,60,0.25)" }}>
          IRIS v1.0 · EYES ONLY · BLACKROCK OPERATIONS
        </p>
      </motion.div>
    </div>
  );
}