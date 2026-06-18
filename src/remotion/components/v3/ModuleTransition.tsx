import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";

interface ModuleTransitionProps {
  /** Direction the wipe travels */
  direction?: "left" | "right";
  /** Frame at which the transition starts */
  startFrame?: number;
  /** Total duration of the transition in frames */
  durationFrames?: number;
  /** Number of decorative particles to render in the wipe */
  particleCount?: number;
  /** Optional accent color for the leading edge */
  accentColor?: string;
}

/**
 * Full-screen module-to-module wipe transition. Renders a gradient mask
 * that sweeps across the canvas, accompanied by decorative particles that
 * trail along the leading edge for cinematic feel.
 */
export const ModuleTransition: React.FC<ModuleTransitionProps> = ({
  direction = "right",
  startFrame = 0,
  durationFrames = 30,
  particleCount = 24,
  accentColor = "#1E49E2",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // Progress 0..1 across the transition window
  const progress = interpolate(
    localFrame,
    [0, durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Wipe positions
  const sign = direction === "right" ? 1 : -1;
  // Mask travels from off-screen one side to off-screen the other side
  const wipeX = sign * (-width + progress * (width * 2));

  // Decorative particles seeded deterministically
  const particles = React.useMemo(() => {
    const list = [];
    let seed = 1337;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < particleCount; i++) {
      list.push({
        y: rand() * height,
        size: 2 + rand() * 5,
        offset: rand() * 0.4,
        opacity: 0.4 + rand() * 0.5,
      });
    }
    return list;
  }, [particleCount, height]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Trailing dim mask */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: wipeX - width,
          width: width * 2,
          height,
          background:
            direction === "right"
              ? `linear-gradient(90deg, rgba(6,11,26,0) 0%, rgba(6,11,26,0.95) 35%, rgba(6,11,26,0.95) 65%, rgba(6,11,26,0) 100%)`
              : `linear-gradient(270deg, rgba(6,11,26,0) 0%, rgba(6,11,26,0.95) 35%, rgba(6,11,26,0.95) 65%, rgba(6,11,26,0) 100%)`,
        }}
      />

      {/* Leading edge accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: wipeX + (direction === "right" ? 0 : -2),
          width: 2,
          height,
          background: accentColor,
          boxShadow: `0 0 24px ${accentColor}, 0 0 60px ${accentColor}`,
          opacity: progress > 0 && progress < 1 ? 1 : 0,
        }}
      />

      {/* Decorative particles riding the leading edge */}
      {particles.map((p, i) => {
        const particleX = wipeX + sign * (p.offset * width * 0.4 - 30);
        const particleOpacity =
          progress > 0 && progress < 1 ? p.opacity : 0;
        return (
          <div
            key={`p-${i}`}
            style={{
              position: "absolute",
              left: particleX,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: accentColor,
              boxShadow: `0 0 ${p.size * 3}px ${accentColor}`,
              opacity: particleOpacity,
            }}
          />
        );
      })}
    </div>
  );
};
