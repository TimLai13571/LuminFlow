import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface SectionTitleProps {
  /** Main section title text */
  title: string;
  /** Optional subtitle / tagline rendered below the main title */
  subtitle?: string;
  /** Optional leading icon (emoji or single character) */
  icon?: string;
  /** Frame at which this title starts animating */
  startFrame?: number;
  /** Theme accent color */
  theme?: "blue" | "purple" | "amber" | "green";
}

const themeColors: Record<string, { accent: string; glow: string; chip: string }> = {
  blue: {
    accent: "#1E49E2",
    glow: "rgba(30,73,226,0.45)",
    chip: "rgba(30,73,226,0.12)",
  },
  purple: {
    accent: "#a855f7",
    glow: "rgba(168,85,247,0.45)",
    chip: "rgba(168,85,247,0.12)",
  },
  amber: {
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.45)",
    chip: "rgba(245,158,11,0.12)",
  },
  green: {
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.45)",
    chip: "rgba(34,197,94,0.12)",
  },
};

/**
 * Unified section heading with an animated accent bar, spring fade-in title,
 * and a delayed muted subtitle. Designed for left-aligned layouts.
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  icon,
  startFrame = 0,
  theme = "blue",
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);
  const palette = themeColors[theme];

  // Accent bar expands first
  const accentWidth = interpolate(localFrame, [0, 16], [0, 56], {
    extrapolateRight: "clamp",
  });

  // Title spring fade + translateY
  const titleSpring = spring({
    frame: Math.max(0, localFrame - 6),
    fps: 30,
    config: { damping: 18, stiffness: 110 },
    durationInFrames: 18,
  });
  const titleY = interpolate(titleSpring, [0, 1], [18, 0]);

  // Subtitle delayed fade in
  const subtitleOpacity = interpolate(localFrame, [18, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(localFrame, [18, 30], [10, 0], {
    extrapolateRight: "clamp",
  });

  // Icon chip pop
  const iconScale = spring({
    frame: Math.max(0, localFrame - 4),
    fps: 30,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 14,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 14,
        fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {icon ? (
          <div
            style={{
              transform: `scale(${iconScale})`,
              width: 44,
              height: 44,
              borderRadius: 12,
              background: palette.chip,
              border: `1px solid ${palette.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: `0 0 18px ${palette.glow}`,
            }}
          >
            {icon}
          </div>
        ) : null}
        <div
          style={{
            width: accentWidth,
            height: 4,
            background: `linear-gradient(90deg, ${palette.accent}, rgba(255,255,255,0))`,
            borderRadius: 2,
            boxShadow: `0 0 12px ${palette.glow}`,
          }}
        />
      </div>

      <div
        style={{
          opacity: titleSpring,
          transform: `translateY(${titleY}px)`,
          fontSize: 32,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontSize: 15,
            fontWeight: 400,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.01em",
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
