import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactorCore from "./ReactorCore";

const BOOT_STEPS = [
  { text: "INITIALIZING IRIS CORE SYSTEMS...", delay: 0 },
  { text: "LOADING 14 INTELLIGENCE DOMAINS...", delay: 400 },
  { text: "OSINT | CYBER | HUMINT | RECON", delay: 700 },
  { text: "RESEARCH | GEOINT | SIGINT | CONTENT", delay: 1000 },
  { text: "SPY | STRATEGY | PERSONAL | ENTERTAINMENT", delay: 1300 },
  { text: "IRIS GLOBAL | COUNCIL ROOM | ATS ENGAGED", delay: 1600 },
  { text: "ALL SYSTEMS ONLINE. IRIS READY.", delay: 2100 },
];

export default function BootSequence({ onComplete }) {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const [reactorScale, setReactorScale] = useState(0);

  useEffect(() => {
    // Reactor ignites
    setTimeout(() => setReactorScale(1), 200);

    // Boot steps
    BOOT_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, step.text]);
      }, step.delay + 500);
    });

    // Greeting
    setTimeout(() => setShowGreeting(true), 3000);

    // Complete
    setTimeout(() => onComplete(), 4200);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center hud-grid"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Reactor */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: reactorScale, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <ReactorCore size={160} intensity={0.6} />
      </motion.div>

      {/* Boot log */}
      <div className="mt-8 space-y-1 text-center">
        {visibleSteps.map((step, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`font-mono text-xs ${
              i === visibleSteps.length - 1 && step.includes("ONLINE")
                ? "text-[#FF0033]"
                : "text-[#C8102E]/60"
            }`}
          >
            {step}
          </motion.p>
        ))}
      </div>

      {/* Greeting */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <p className="font-heading text-lg text-foreground tracking-wide">
              {greeting}, <span className="text-[#FF0033]">Sir</span>. IRIS online.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}