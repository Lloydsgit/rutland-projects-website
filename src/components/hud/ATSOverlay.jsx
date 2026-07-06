import { motion, AnimatePresence } from "framer-motion";
import ReactorCore from "./ReactorCore";

const ATS_LAYERS = [
  "DECONSTRUCTION",
  "CONTEXT MAPPING",
  "MULTI-PERSPECTIVE",
  "CONSEQUENCES",
  "PROBABILITY",
  "SYNTHESIS",
  "DELIVERY",
];

export default function ATSOverlay({ active, activeLayer = -1 }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-40 pointer-events-none"
        >
          {/* Darker overlay */}
          <div className="absolute inset-0 bg-background/60" />

          {/* ATS badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="font-heading text-sm tracking-[0.3em] text-cyan cyan-glow-strong">
              ATS MODE ACTIVATED
            </p>
            <p className="font-mono text-[10px] text-primary/50 mt-1">
              Advanced Thinking System — Engaged
            </p>
          </motion.div>

          {/* Layer indicators - right side */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
            {ATS_LAYERS.map((layer, i) => (
              <motion.div
                key={layer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all duration-500 ${
                  i <= activeLayer
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-primary/10 bg-card/30 text-muted-foreground/40"
                }`}
              >
                <span className="font-mono text-[10px] w-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] tracking-wider">{layer}</span>
                {i <= activeLayer && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary ml-auto"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}