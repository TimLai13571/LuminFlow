import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface TitleOverlayProps {
  /** Main title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Frame at which to start the animation */
  startFrame?: number;
  /** Color theme: "blue" (default) or "dark" */
  theme?: "blue" | "dark";
}

/**
 * Full-screen title card with animated text entrance.
 * Used for section dividers and brand reveals within the demo video.
 */
export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  title,
  subtitle,
  startFrame = 0,
  theme = "blue",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  const titleOpacity = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 15, stiffness: 80 },
    durationInFrames: 25,
  });

  const titleY = interpolate(localFrame, [0, 25], [40, 0], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(localFrame, [10, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bgColors = {
    blue: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
    dark: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
  };

  const accentColors = {
    blue: "rgba(59,130,246,0.6)",
    dark: "rgba(255,255,255,0.15)",
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: bgColors[theme],
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: interpolate(localFrame, [0, 20], [0, 120], {
            extrapolateRight: "clamp",
          }),
          height: 3,
          backgroundColor: accentColors[theme],
          borderRadius: 2,
          marginBottom: 30,
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 52,
          fontWeight: 800,
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          letterSpacing: "-1px",
          maxWidth: width * 0.8,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            opacity: subtitleOpacity,
            marginTop: 20,
            fontSize: 24,
            fontWeight: 400,
            color: "rgba(255,255,255,0.65)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            maxWidth: width * 0.6,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
