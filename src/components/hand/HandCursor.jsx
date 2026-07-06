import { useEffect, useRef, useState } from "react";

// MediaPipe Hands — real hand tracking cursor layer
// Cursor follows index fingertip. Pinch (thumb+index) = click/grip.
export default function HandCursor({ enabled = false }) {
  const videoRef = useRef(null);
  const cursorRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | active | error

  useEffect(() => {
    if (!enabled) return;
    let hands, camera, active = true;
    let posX = -200, posY = -200;
    let smoothX = -200, smoothY = -200;

    const lerp = (a, b, t) => a + (b - a) * t;

    const moveCursor = (x, y, grip) => {
      smoothX = lerp(smoothX, x, 0.35);
      smoothY = lerp(smoothY, y, 0.35);
      const el = cursorRef.current;
      if (!el) return;
      el.style.left = `${smoothX}px`;
      el.style.top = `${smoothY}px`;
      el.className = grip ? "grip" : "";

      if (grip) {
        // Simulate click at position
        const target = document.elementFromPoint(smoothX, smoothY);
        if (target && target !== el) {
          const evt = new MouseEvent("click", { bubbles: true, clientX: smoothX, clientY: smoothY });
          target.dispatchEvent(evt);
        }
      }
    };

    const initHands = async () => {
      setStatus("loading");
      try {
        const { Hands } = await import("@mediapipe/hands");
        const { Camera } = await import("@mediapipe/camera_utils");

        hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((results) => {
          if (!active) return;
          if (!results.multiHandLandmarks?.length) return;

          const lm = results.multiHandLandmarks[0];
          // Landmark 8 = index fingertip, landmark 4 = thumb tip
          const indexTip = lm[8];
          const thumbTip = lm[4];

          const x = (1 - indexTip.x) * window.innerWidth; // mirror
          const y = indexTip.y * window.innerHeight;

          // Pinch detection: distance between thumb and index tip
          const dx = indexTip.x - thumbTip.x;
          const dy = indexTip.y - thumbTip.y;
          const pinchDist = Math.sqrt(dx * dx + dy * dy);
          const grip = pinchDist < 0.06;

          moveCursor(x, y, grip);
        });

        const vid = videoRef.current;
        camera = new Camera(vid, {
          onFrame: async () => {
            if (hands && active) await hands.send({ image: vid });
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        if (active) setStatus("active");
      } catch (e) {
        console.warn("Hand tracking unavailable:", e);
        if (active) setStatus("error");
      }
    };

    initHands();

    return () => {
      active = false;
      camera?.stop?.();
      hands?.close?.();
      setStatus("idle");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Hidden video feed */}
      <video
        ref={videoRef}
        style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 1, height: 1, top: 0, left: 0, zIndex: -1 }}
        playsInline
        muted
      />

      {/* Hand cursor element */}
      <div
        id="hand-cursor"
        ref={cursorRef}
        style={{ position: "fixed", left: -200, top: -200 }}
      />

      {/* Status badge */}
      {status === "loading" && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 99998 }}
          className="glass px-3 py-1.5 rounded-full text-[10px] font-mono text-sky-cyan/60 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-cyan/40 animate-pulse" />
          HAND TRACK LOADING
        </div>
      )}
      {status === "active" && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 99998 }}
          className="glass px-3 py-1.5 rounded-full text-[10px] font-mono text-sky-cyan/50 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-cyan/60" />
          HAND TRACK ACTIVE
        </div>
      )}
    </>
  );
}