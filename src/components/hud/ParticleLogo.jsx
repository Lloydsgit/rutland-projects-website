import { useEffect, useRef } from "react";

export default function ParticleLogo({ size = 80, onClick }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.36;
    const PARTICLE_COUNT = 120;
    let t = 0;

    // Generate particles on sphere surface
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
      return { phi, theta, size: Math.random() * 1.2 + 0.4 };
    });

    const tick = () => {
      ctx.clearRect(0, 0, size, size);
      t += 0.008;

      // Sort by z for depth
      const projected = particles.map((p) => {
        const x3 = R * Math.sin(p.phi) * Math.cos(p.theta + t);
        const y3 = R * Math.cos(p.phi);
        const z3 = R * Math.sin(p.phi) * Math.sin(p.theta + t);
        const scale = (z3 + R * 1.4) / (R * 2.4);
        return { sx: cx + x3, sy: cy + y3, scale, size: p.size };
      }).sort((a, b) => a.scale - b.scale);

      // Draw connecting lines between close particles
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].sx - projected[j].sx;
          const dy = projected[i].sy - projected[j].sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 14) {
            const alpha = (1 - dist / 14) * 0.18 * projected[i].scale;
            ctx.beginPath();
            ctx.moveTo(projected[i].sx, projected[i].sy);
            ctx.lineTo(projected[j].sx, projected[j].sy);
            ctx.strokeStyle = `rgba(255,30,30,${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      projected.forEach(({ sx, sy, scale, size: ps }) => {
        const alpha = 0.3 + scale * 0.7;
        const r = ps * scale;

        // Glow
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
        grd.addColorStop(0, `rgba(255,50,50,${alpha * 0.5})`);
        grd.addColorStop(1, "rgba(255,0,0,0)");
        ctx.beginPath();
        ctx.arc(sx, sy, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${80 + scale * 120},${60 + scale * 60},${alpha})`;
        ctx.fill();
      });

      // Center pulse
      const pulse = 0.7 + 0.3 * Math.sin(t * 3);
      const grd2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10 * pulse);
      grd2.addColorStop(0, `rgba(255,80,80,${0.6 * pulse})`);
      grd2.addColorStop(0.5, `rgba(200,20,20,${0.2 * pulse})`);
      grd2.addColorStop(1, "rgba(255,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grd2;
      ctx.fill();

      frameRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frameRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      style={{ width: size, height: size, cursor: "pointer" }}
    />
  );
}