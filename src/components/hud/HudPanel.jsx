import { motion } from "framer-motion";

export default function HudPanel({ title, children, className = "", glowing = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-card/50 backdrop-blur-sm border border-primary/10 rounded-lg overflow-hidden ${
        glowing ? "border-glow" : ""
      } ${className}`}
    >
      {title && (
        <div className="px-3 py-2 border-b border-primary/10 flex items-center justify-between">
          <h3 className="font-heading text-[10px] tracking-widest text-primary/70 uppercase">
            {title}
          </h3>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          </div>
        </div>
      )}
      <div className="p-3">{children}</div>
    </motion.div>
  );
}