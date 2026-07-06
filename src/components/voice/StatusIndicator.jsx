import { motion, AnimatePresence } from "framer-motion";
import { Brain, Globe, Zap, Save, Shield } from "lucide-react";

const STATUS_CONFIGS = {
  idle: null,
  thinking: { label: "Processing", icon: Brain, color: "text-foreground/50" },
  saving: { label: "Saving to memory", icon: Save, color: "text-foreground/50" },
  searching: { label: "Searching the web", icon: Globe, color: "text-foreground/50" },
  ats: { label: "Activating ATS", icon: Zap, color: "text-foreground/60" },
  cyber: { label: "Running cyber scan", icon: Shield, color: "text-foreground/50" },
};

export default function StatusIndicator({ status = "idle" }) {
  const cfg = STATUS_CONFIGS[status];

  return (
    <AnimatePresence>
      {cfg && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/4 border border-foreground/8"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
          </motion.div>
          <span className="text-xs font-mono text-foreground/40 tracking-wide">{cfg.label}</span>
          <div className="flex gap-0.5 ml-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-foreground/30"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}