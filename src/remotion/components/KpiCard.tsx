import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";
import { AnimatedCounter } from "./AnimatedCounter";

interface KpiCardProps {
  /** KPI metric name */
  label: string;
  /** Numeric value */
  value: number;
  /** Unit suffix */
  unit?: string;
  /** Trend direction */
  trend?: "up" | "down" | "stable";
  /** Status color override */
  status?: "good" | "warning" | "danger";
  /** Frame at which this card appears */
  startFrame?: number;
  /** Card index for staggered animation */
  index?: number;
}

const statusColors = {
  good: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const trendArrows: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

/**
 * KPI metric card with animated counter, trend indicator, and status color.
 * Cards stagger in with a delay based on their index.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit = "",
  trend = "stable",
  status = "good",
  startFrame = 0,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const staggerDelay = index * 5;
  const localFrame = Math.max(0, frame - startFrame - staggerDelay);

  // Card entrance animation
  const cardOpacity = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 15,
  });

  const cardY = interpolate(localFrame, [0, 15], [30, 0], {
    extrapolateRight: "clamp",
  });

  const accentColor = statusColors[status];
  const trendColor = trend === "up" ? statusColors.good : trend === "down" ? statusColors.danger : "rgba(255,255,255,0.5)";

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 10,
        padding: "18px 22px",
        minWidth: 200,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <AnimatedCounter
          value={value}
          unit={unit}
          startFrame={startFrame + staggerDelay + 8}
          fontSize={34}
          color="#ffffff"
        />
        <span
          style={{
            fontSize: 18,
            color: trendColor,
            fontWeight: 700,
          }}
        >
          {trendArrows[trend]}
        </span>
      </div>
    </div>
  );
};
