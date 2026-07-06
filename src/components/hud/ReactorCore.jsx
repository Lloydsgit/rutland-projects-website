import { motion } from "framer-motion";

export default function ReactorCore({ size = 120, intensity = 0.4, atsMode = false }) {
  const cyanColor = atsMode ? "rgba(0, 255, 255, " : "rgba(0, 184, 255, ";
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: size, height: size }}
        animate={{
          boxShadow: [
            `0 0 ${size * 0.3}px ${cyanColor}${intensity * 0.3})`,
            `0 0 ${size * 0.5}px ${cyanColor}${intensity * 0.5})`,
            `0 0 ${size * 0.3}px ${cyanColor}${intensity * 0.3})`,
          ],
        }}
        transition={{ duration: atsMode ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full border border-primary/30"
        style={{ width: size * 0.95, height: size * 0.95 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full border-2 border-primary/50"
        style={{ width: size * 0.7, height: size * 0.7 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full border border-primary/60"
        style={{ width: size * 0.45, height: size * 0.45 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Core */}
      <motion.div
        className="absolute rounded-full bg-primary/20"
        style={{ width: size * 0.25, height: size * 0.25 }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{ duration: atsMode ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core center dot */}
      <div
        className="absolute rounded-full bg-primary"
        style={{ width: size * 0.08, height: size * 0.08 }}
      />

      {/* Tick marks on outer ring */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-primary/40"
          style={{
            width: 1,
            height: size * 0.06,
            top: size * 0.02,
            left: "50%",
            transformOrigin: `0 ${size * 0.48}px`,
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}
    </div>
  );
}