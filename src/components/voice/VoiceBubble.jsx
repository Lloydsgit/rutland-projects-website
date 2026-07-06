import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MessageSquare, Phone, MessageCircle, Grid3X3 } from "lucide-react";

const ACTION_PILLS = [
  { id: "voice", icon: Mic, label: "Voice" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "call", icon: Phone, label: "Call" },
  { id: "msg", icon: MessageCircle, label: "Message" },
  { id: "modules", icon: Grid3X3, label: "Modules" },
];

export default function VoiceBubble({ state = "idle", onAction, onVoiceToggle, listening = false }) {
  const [bubbleState, setBubbleState] = useState(state);

  useEffect(() => { setBubbleState(state); }, [state]);

  const bubbleSize = "w-[280px] h-[280px] md:w-[280px] md:h-[280px]";

  const stateVisuals = {
    idle: {
      ringClass: "voice-bubble-idle",
      innerGlow: "rgba(200,16,46,0.15)",
      corePulse: false,
    },
    listening: {
      ringClass: "voice-bubble-listening",
      innerGlow: "rgba(255,0,51,0.35)",
      corePulse: true,
    },
    speaking: {
      ringClass: "",
      innerGlow: "rgba(200,16,46,0.25)",
      corePulse: true,
    },
    thinking: {
      ringClass: "",
      innerGlow: "rgba(200,16,46,0.2)",
      corePulse: false,
    },
    alert: {
      ringClass: "voice-bubble-alert",
      innerGlow: "rgba(255,0,51,0.5)",
      corePulse: true,
    },
  };

  const vis = stateVisuals[bubbleState] || stateVisuals.idle;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Center bubble */}
      <div className="relative flex items-center justify-center">
        {/* Outer ripple rings (listening/alert) */}
        <AnimatePresence>
          {(bubbleState === "listening" || bubbleState === "alert") && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full ${bubbleSize}`}
                  style={{
                    border: `1.5px solid rgba(255,0,51,${0.3 - i * 0.08})`,
                    background: "transparent",
                  }}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{
                    scale: [1, 1.6 + i * 0.3],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main bubble */}
        <motion.div
          className={`${bubbleSize} rounded-full flex items-center justify-center relative cursor-pointer ${vis.ringClass}`}
          style={{
            background: `radial-gradient(circle at 45% 40%, rgba(200,16,46,0.08) 0%, rgba(0,0,0,0.95) 70%)`,
            border: `2px solid rgba(200,16,46,${bubbleState === "alert" ? "0.5" : "0.25"})`,
            boxShadow: `0 0 80px ${vis.innerGlow}, inset 0 0 60px rgba(0,0,0,0.6)`,
          }}
          animate={{
            scale: bubbleState === "alert" ? [1, 1.03, 1] : bubbleState === "listening" ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: bubbleState === "alert" ? 0.5 : bubbleState === "listening" ? 1.5 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={onVoiceToggle}
        >
          {/* Grid lines across bubble */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-[0.04]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${12.5 + i * 12.5}%` }} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${12.5 + i * 12.5}%` }} />
            ))}
          </div>

          {/* Core */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            {/* Reactor core */}
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, rgba(200,16,46,0.2) 0%, rgba(139,0,0,0.08) 50%, transparent 70%)`,
                border: `1.5px solid rgba(200,16,46,${bubbleState === "alert" ? "0.6" : "0.35"})`,
              }}
              animate={{
                scale: vis.corePulse ? [1, 1.08, 1] : [1, 1.03, 1],
                boxShadow: vis.corePulse
                  ? [
                      "0 0 30px rgba(255,0,51,0.3)",
                      "0 0 50px rgba(255,0,51,0.6)",
                      "0 0 30px rgba(255,0,51,0.3)",
                    ]
                  : "0 0 20px rgba(200,16,46,0.15)",
              }}
              transition={{
                duration: vis.corePulse ? 1.2 : 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Particle field (thinking state) */}
              {bubbleState === "thinking" && (
                <motion.div
                  className="absolute w-14 h-14"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  {[0, 90, 180, 270].map((deg) => (
                    <div
                      key={deg}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "rgba(255,0,51,0.7)",
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${deg}deg) translateY(-16px)`,
                        boxShadow: "0 0 6px rgba(255,0,51,0.5)",
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* State icon */}
              {bubbleState === "idle" && (
                <div className="w-3 h-3 rounded-full" style={{ background: "rgba(200,16,46,0.4)", boxShadow: "0 0 8px rgba(200,16,46,0.3)" }} />
              )}
              {bubbleState === "listening" && (
                <motion.div className="flex items-end gap-0.5" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  {[8, 14, 10, 16, 9].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full"
                      style={{ background: "rgba(255,0,51,0.8)" }}
                      animate={{ height: [h * 0.5, h, h * 0.7] }}
                      transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, delay: i * 0.08 }}
                    />
                  ))}
                </motion.div>
              )}
              {bubbleState === "speaking" && (
                <motion.div className="flex items-end gap-0.5">
                  {[12, 18, 8, 20, 14, 10].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full"
                      style={{ background: "rgba(200,16,46,0.9)" }}
                      animate={{ height: [h * 0.3, h, h * 0.5] }}
                      transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }}
                    />
                  ))}
                </motion.div>
              )}
              {bubbleState === "alert" && (
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "rgba(255,0,51,0.9)" }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Label */}
            <span
              className="text-[9px] font-mono tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {bubbleState === "idle" && "IRIS ONLINE"}
              {bubbleState === "listening" && "LISTENING..."}
              {bubbleState === "speaking" && "SPEAKING"}
              {bubbleState === "thinking" && "THINKING..."}
              {bubbleState === "alert" && "ALERT"}
            </span>
          </div>

          {/* Scan line (idle/searching) */}
          {bubbleState === "idle" && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div
                className="absolute w-full h-0.5"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(200,16,46,0.3), transparent)",
                  animation: "scanLine 3s ease-in-out infinite",
                }}
              />
            </div>
          )}

          {/* Holographic crosshair */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: "1px solid rgba(200,16,46,0.06)" }}>
            <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: "rgba(200,16,46,0.04)" }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: "rgba(200,16,46,0.04)" }} />
          </div>
        </motion.div>
      </div>

      {/* Action pills */}
      <div className="flex gap-2">
        {ACTION_PILLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onAction?.(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
            style={{
              background: "rgba(200,16,46,0.08)",
              border: "1px solid rgba(200,16,46,0.15)",
              color: "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(200,16,46,0.15)";
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(200,16,46,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <Icon className="w-3 h-3" />
            <span className="text-[9px] font-mono tracking-wider">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}