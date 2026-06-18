import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface ProgressRingProps {
  /** Progress value 0-100 */
  progress: number;
  /** Ring size in px */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Color of the progress arc */
  color?: string;
  /** Background color of the track */
  trackColor?: string;
  /** Label text shown in center */
  label?: string;
  /** Frame at which animation starts */
  startFrame?: number;
}

/**
 * Animated circular progress ring.
 * The arc draws clockwise from top, with the percentage shown in center.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#60a5fa",
  trackColor = "rgba(255,255,255,0.1)",
  label,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  const animProgress = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 15, stiffness: 60 },
    durationInFrames: 40,
  });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - animProgress * progress * 0.01 * circumference;

  const center = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "stroke-dashoffset 0.1s ease",
          }}
        />
      </svg>
      {/* Center label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.22,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {Math.round(animProgress * progress)}%
        </span>
        {label && (
          <span
            style={{
              fontSize: size * 0.1,
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "system-ui, -apple-system, sans-serif",
              marginTop: 2,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
