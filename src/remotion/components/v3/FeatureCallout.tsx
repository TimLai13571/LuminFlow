import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface FeatureCalloutProps {
  title: string;
  description: string;
  /** Tag describing the callout intent */
  type?: "assumption" | "rationale" | "feature";
  /** Anchor point on screen (callout expands from here) */
  position?: { x: number; y: number };
  startFrame?: number;
  /** Maximum bubble width in pixels */
  maxWidth?: number;
  /** Side that the bubble extends toward */
  side?: "right" | "left" | "top" | "bottom";
}

const typePalette = {
  assumption: {
    accent: "#a855f7",
    glow: "rgba(168,85,247,0.45)",
    bg: "rgba(168,85,247,0.10)",
    label: "ASSUMPTION",
  },
  rationale: {
    accent: "#1E49E2",
    glow: "rgba(30,73,226,0.45)",
    bg: "rgba(30,73,226,0.10)",
    label: "RATIONALE",
  },
  feature: {
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.45)",
    bg: "rgba(34,197,94,0.10)",
    label: "FEATURE",
  },
};

/**
 * Annotation bubble that expands outward from an anchor point with a
 * connecting line back to the anchor. Three variants visually distinguish
 * design assumptions, rationales, and shipped features.
 */
export const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  title,
  description,
  type = "feature",
  position = { x: 100, y: 100 },
  startFrame = 0,
  maxWidth = 320,
  side = "right",
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);
  const palette = typePalette[type];

  // Dot pop
  const dotScale = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 12, stiffness: 160 },
    durationInFrames: 12,
  });

  // Connector line draw
  const lineProgress = interpolate(localFrame, [4, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Bubble enter
  const bubbleSpring = spring({
    frame: Math.max(0, localFrame - 14),
    fps: 30,
    config: { damping: 16, stiffness: 130 },
    durationInFrames: 16,
  });

  // Side-based offset for the bubble end of the connector
  const offset = 90;
  let bubbleLeft = position.x;
  let bubbleTop = position.y;
  let lineX = 0;
  let lineY = 0;
  switch (side) {
    case "right":
      bubbleLeft = position.x + offset;
      bubbleTop = position.y - 40;
      lineX = offset;
      lineY = 0;
      break;
    case "left":
      bubbleLeft = position.x - offset - maxWidth;
      bubbleTop = position.y - 40;
      lineX = -offset;
      lineY = 0;
      break;
    case "top":
      bubbleLeft = position.x - maxWidth / 2;
      bubbleTop = position.y - offset - 100;
      lineX = 0;
      lineY = -offset;
      break;
    case "bottom":
      bubbleLeft = position.x - maxWidth / 2;
      bubbleTop = position.y + offset;
      lineX = 0;
      lineY = offset;
      break;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
      }}
    >
      {/* Anchor dot */}
      <div
        style={{
          position: "absolute",
          left: position.x - 8,
          top: position.y - 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: palette.accent,
          boxShadow: `0 0 14px ${palette.glow}, 0 0 4px #ffffff`,
          transform: `scale(${dotScale})`,
        }}
      />

      {/* Connector line (SVG so we can animate stroke length) */}
      <svg
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: Math.abs(lineX) + 4,
          height: Math.abs(lineY) + 4,
          overflow: "visible",
        }}
      >
        <line
          x1={0}
          y1={0}
          x2={lineX * lineProgress}
          y2={lineY * lineProgress}
          stroke={palette.accent}
          strokeWidth={1.5}
          strokeDasharray="5,4"
          opacity={0.85}
        />
      </svg>

      {/* Bubble */}
      <div
        style={{
          position: "absolute",
          left: bubbleLeft,
          top: bubbleTop,
          maxWidth,
          opacity: bubbleSpring,
          transform: `scale(${0.85 + 0.15 * bubbleSpring})`,
          transformOrigin: side === "left" ? "right center" : "left center",
          background: palette.bg,
          border: `1px solid ${palette.accent}`,
          borderLeft: `3px solid ${palette.accent}`,
          borderRadius: 10,
          padding: "12px 16px",
          backdropFilter: "blur(8px)",
          boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 18px ${palette.glow}`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: palette.accent,
            marginBottom: 6,
          }}
        >
          {palette.label}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};
