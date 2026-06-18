import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface GlowBorderProps {
  /** Content inside the border */
  children: React.ReactNode;
  /** Border color */
  color?: string;
  /** Border radius */
  borderRadius?: number;
  /** Padding */
  padding?: number;
  /** Frame at which glow starts */
  startFrame?: number;
  /** Glow animation duration in frames */
  durationFrames?: number;
}

/**
 * Animated glowing border that cycles through a shimmer effect.
 * Wraps content in a container with a pulsing glow outline.
 */
export const GlowBorder: React.FC<GlowBorderProps> = ({
  children,
  color = "#3b82f6",
  borderRadius = 12,
  padding = 2,
  startFrame = 0,
  durationFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  // Pulsing glow intensity
  const glowAlpha = interpolate(
    localFrame % durationFrames,
    [0, durationFrames * 0.5, durationFrames],
    [0.3, 0.8, 0.3]
  );

  // Shimmer position
  const shimmerPos = interpolate(
    localFrame % durationFrames,
    [0, durationFrames],
    [-200, 200]
  );

  return (
    <div
      style={{
        position: "relative",
        borderRadius,
        padding,
        background: `rgba(255,255,255,0.04)`,
        border: `1.5px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 0 20px rgba(59,130,246,${glowAlpha}), inset 0 0 20px rgba(59,130,246,${glowAlpha * 0.3})`,
        overflow: "hidden",
      }}
    >
      {/* Shimmer sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${50 + shimmerPos}%`,
          width: 60,
          height: "100%",
          background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)`,
          transform: "skewX(-20deg)",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
};
