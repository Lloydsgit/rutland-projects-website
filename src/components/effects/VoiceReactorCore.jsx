import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function VoiceReactorCore({ isListening, isSpeaking, isThinking, size = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const S = size * window.devicePixelRatio;
    canvas.width = S;
    canvas.height = S;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const cx = S / 2, cy = S / 2;

    const draw = () => {
      phaseRef.current += isListening ? 0.06 : isThinking ? 0.04 : 0.018;
      const p = phaseRef.current;
      ctx.clearRect(0, 0, S, S);

      const intensity = isListening ? 1 : isThinking ? 0.7 : 0.35;
      const RINGS = isListening ? 5 : isThinking ? 4 : 3;

      for (let i = 0; i < RINGS; i++) {
        const phase = p - i * 0.4;
        const r = (cx * 0.25) + i * (cx * 0.14) + Math.sin(phase + i) * cx * 0.04 * intensity;
        const opacity = (0.6 - i * 0.1) * intensity;
        const lineW = (1.2 - i * 0.15) * (window.devicePixelRatio || 1);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
        ctx.lineWidth = lineW;
        ctx.stroke();
      }

      // Wave spokes when listening
      if (isListening || isSpeaking) {
        const spokes = 12;
        for (let i = 0; i < spokes; i++) {
          const angle = (i / spokes) * Math.PI * 2 + p * 0.5;
          const wave = Math.abs(Math.sin(p * 2 + i * 0.8));
          const r1 = cx * 0.28;
          const r2 = cx * (0.32 + wave * 0.22 * intensity);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
          ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
          ctx.strokeStyle = `rgba(125, 211, 252, ${0.5 * wave * intensity})`;
          ctx.lineWidth = 1 * (window.devicePixelRatio || 1);
          ctx.stroke();
        }
      }

      // Core dot
      const coreR = cx * 0.12 + Math.sin(p * 1.5) * cx * 0.03 * intensity;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.8);
      grad.addColorStop(0, `rgba(232, 236, 239, ${0.9 * intensity})`);
      grad.addColorStop(0.5, `rgba(125, 211, 252, ${0.6 * intensity})`);
      grad.addColorStop(1, "rgba(125, 211, 252, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Hard center
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * intensity})`;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isListening, isSpeaking, isThinking, size]);

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ scale: isListening ? 1.05 : 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer glow */}
      {(isListening || isThinking) && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 1.6,
            height: size * 1.6,
            background: "radial-gradient(circle, hsl(201 96% 72% / 0.08) 0%, transparent 70%)",
            filter: "blur(12px)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
      )}
      <canvas ref={canvasRef} style={{ position: "relative", zIndex: 1 }} />
    </motion.div>
  );
}