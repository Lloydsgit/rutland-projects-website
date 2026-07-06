import { useEffect, useRef } from "react";

// Holographic dot matrix field — pure canvas, 60fps, zero DOM overhead
export default function HolographicField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const COLS = 40;
    const ROWS = 25;
    let W, H, cellW, cellH;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cellW = W / COLS;
      cellH = H / ROWS;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse proximity
    let mx = -9999, my = -9999;
    const onMouse = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      for (let c = 0; c <= COLS; c++) {
        for (let r = 0; r <= ROWS; r++) {
          const x = c * cellW;
          const y = r * cellH;

          // Wave distortion
          const wave = Math.sin(c * 0.3 + t) * Math.cos(r * 0.3 + t * 0.7);
          // Mouse proximity glow
          const dist = Math.hypot(x - mx, y - my);
          const proximity = Math.max(0, 1 - dist / 220);

          const baseOpacity = 0.12 + wave * 0.06;
          const opacity = Math.min(0.9, baseOpacity + proximity * 0.55);
          const radius = 1.0 + proximity * 2.5 + Math.abs(wave) * 0.5;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          // Color: base is sky-cyan (#7DD3FC), proximity shifts to white
          const r_val = Math.round(125 + proximity * 130);
          const g_val = Math.round(211 + proximity * 44);
          const b_val = Math.round(252);
          ctx.fillStyle = `rgba(${r_val},${g_val},${b_val},${opacity})`;
          ctx.fill();
        }
      }

      // Subtle connection lines near mouse
      if (mx > 0) {
        for (let c = 0; c <= COLS; c++) {
          for (let r = 0; r <= ROWS; r++) {
            const x = c * cellW;
            const y = r * cellH;
            const dist = Math.hypot(x - mx, y - my);
            if (dist < 120) {
              // Connect to adjacent dots
              [[c + 1, r], [c, r + 1]].forEach(([nc, nr]) => {
                if (nc > COLS || nr > ROWS) return;
                const nx = nc * cellW;
                const ny = nr * cellH;
                const opacity = (1 - dist / 120) * 0.18;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nx, ny);
                ctx.strokeStyle = `rgba(125,211,252,${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              });
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  );
}