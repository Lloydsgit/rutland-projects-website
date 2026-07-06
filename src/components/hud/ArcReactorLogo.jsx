import { motion } from "framer-motion";

export default function ArcReactorLogo({ size = 56, onClick }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  return (
    <motion.div
      onClick={onClick}
      className="cursor-pointer select-none relative"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
    >
      {/* Outer ambient glow blur */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
          filter: "blur(8px)",
          transform: "scale(1.4)",
        }}
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "relative", zIndex: 1 }}>
        <defs>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outermost breathing halo */}
        <motion.circle
          cx={cx} cy={cy} r={r * 0.97}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.4"
          strokeOpacity="0.15"
          animate={{ opacity: [0.1, 0.35, 0.1], r: [r * 0.95, r * 0.97, r * 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer dashed ring — slow clockwise */}
        <motion.circle
          cx={cx} cy={cy} r={r * 0.88}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.6"
          strokeOpacity="0.35"
          strokeDasharray="3 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Outer tick ring — medium clockwise */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={r * 0.82} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.25" />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const long = i % 2 === 0;
            const x1 = cx + Math.cos(angle) * r * (long ? 0.74 : 0.77);
            const y1 = cy + Math.sin(angle) * r * (long ? 0.74 : 0.77);
            const x2 = cx + Math.cos(angle) * r * 0.82;
            const y2 = cy + Math.sin(angle) * r * 0.82;
            return (
              <line
                key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(var(--primary))"
                strokeWidth={long ? "0.8" : "0.4"}
                strokeOpacity={long ? "0.6" : "0.35"}
              />
            );
          })}
        </motion.g>

        {/* Mid ring — counter-clockwise */}
        <motion.circle
          cx={cx} cy={cy} r={r * 0.63}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeOpacity="0.45"
          strokeDasharray="6 4"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* 6 mid-ring node dots */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 60 * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={cx + Math.cos(angle) * r * 0.63}
                cy={cy + Math.sin(angle) * r * 0.63}
                r="1.2"
                fill="hsl(var(--primary))"
                opacity="0.8"
              />
            );
          })}
        </motion.g>

        {/* Inner fast ring */}
        <motion.circle
          cx={cx} cy={cy} r={r * 0.43}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.8"
          strokeOpacity="0.5"
          animate={{ rotate: 360 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />

        {/* 3 energy spoke arcs */}
        {[0, 120, 240].map((deg) => {
          const angle = (deg * Math.PI) / 180;
          return (
            <motion.line
              key={deg}
              x1={cx + Math.cos(angle) * r * 0.15}
              y1={cy + Math.sin(angle) * r * 0.15}
              x2={cx + Math.cos(angle) * r * 0.40}
              y2={cy + Math.sin(angle) * r * 0.40}
              stroke="hsl(var(--primary))"
              strokeWidth="1.2"
              strokeOpacity="0.7"
              filter="url(#glow)"
              animate={{ opacity: [0.4, 1, 0.4], strokeWidth: ["0.8px", "1.6px", "0.8px"] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: deg / 400 }}
            />
          );
        })}

        {/* Pulsing core */}
        <motion.circle
          cx={cx} cy={cy} r={r * 0.22}
          fill="url(#coreGrad)"
          filter="url(#strongGlow)"
          animate={{ r: [r * 0.18, r * 0.25, r * 0.18], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bright center */}
        <motion.circle
          cx={cx} cy={cy} r={r * 0.09}
          fill="url(#innerGlow)"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Hard dot */}
        <circle cx={cx} cy={cy} r={r * 0.04} fill="white" opacity="0.95" />
      </svg>
    </motion.div>
  );
}