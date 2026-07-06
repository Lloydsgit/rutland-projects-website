// Ambient aurora gradient layers — pure CSS, GPU composited
export default function AuroraField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Primary aurora blob */}
      <div
        className="aurora-field absolute"
        style={{
          width: "70vw",
          height: "60vh",
          top: "-20vh",
          left: "15vw",
          background: "radial-gradient(ellipse at center, hsl(201 96% 72% / 0.07) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      {/* Secondary aurora */}
      <div
        style={{
          position: "absolute",
          width: "50vw",
          height: "40vh",
          bottom: "-10vh",
          right: "-5vw",
          background: "radial-gradient(ellipse at center, hsl(270 60% 60% / 0.04) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "auroraShift 24s ease-in-out infinite reverse",
        }}
      />
      {/* Tertiary accent */}
      <div
        style={{
          position: "absolute",
          width: "30vw",
          height: "30vh",
          top: "40vh",
          left: "-5vw",
          background: "radial-gradient(ellipse at center, hsl(201 60% 50% / 0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "auroraShift 20s ease-in-out infinite",
          animationDelay: "-8s",
        }}
      />
      {/* Top vignette gradient */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(201 96% 72% / 0.15), transparent)" }}
      />
    </div>
  );
}