import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface AnimatedCounterProps {
  /** Target value to count to */
  value: number;
  /** Optional unit suffix */
  unit?: string;
  /** Frame at which animation starts */
  startFrame?: number;
  /** Duration of the counting animation in frames */
  durationFrames?: number;
  /** Font size in px */
  fontSize?: number;
  /** Text color */
  color?: string;
}

/**
 * Animated number counter that counts up from 0 to the target value
 * using smooth easing, suitable for KPI metrics display.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  unit = "",
  startFrame = 0,
  durationFrames = 30,
  fontSize = 48,
  color = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  const progress = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: durationFrames,
  });

  const displayValue = interpolate(progress, [0, 1], [0, value]);

  const formattedValue = Number.isInteger(value)
    ? Math.round(displayValue).toLocaleString()
    : displayValue.toFixed(1);

  return (
    <span
      style={{
        fontSize,
        fontWeight: 800,
        color,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {formattedValue}
      {unit && (
        <span style={{ fontSize: fontSize * 0.5, fontWeight: 600, opacity: 0.7, marginLeft: 4 }}>
          {unit}
        </span>
      )}
    </span>
  );
};
