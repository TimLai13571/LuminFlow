import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface HeatmapCell {
  row: string;
  col: string;
  /** Risk value in 0..1 range */
  value: number;
}

interface HeatmapGridProps {
  data: HeatmapCell[];
  rows: string[];
  cols: string[];
  startFrame?: number;
  /** Width of the grid area in pixels (without axis labels) */
  cellSize?: number;
  /** Threshold above which a cell is considered "high" and pulses */
  highlightThreshold?: number;
}

/**
 * Map a 0..1 value to a green → amber → red gradient color.
 */
const valueToColor = (v: number): string => {
  const clamped = Math.max(0, Math.min(1, v));
  // 0..0.5 green→amber, 0.5..1 amber→red
  if (clamped < 0.5) {
    const t = clamped / 0.5;
    const r = Math.round(34 + (245 - 34) * t);
    const g = Math.round(197 + (158 - 197) * t);
    const b = Math.round(94 + (11 - 94) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const t = (clamped - 0.5) / 0.5;
  const r = Math.round(245 + (211 - 245) * t);
  const g = Math.round(158 + (46 - 158) * t);
  const b = Math.round(11 + (46 - 11) * t);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Animated risk heatmap. Cells fade in row by row, value drives green→amber→red
 * gradient color. High-risk cells (value >= threshold) emit a soft pulse.
 */
export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  data,
  rows,
  cols,
  startFrame = 0,
  cellSize = 70,
  highlightThreshold = 0.7,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  const labelGutter = 110;
  const headerGutter = 36;
  const gridWidth = cols.length * cellSize;
  const gridHeight = rows.length * cellSize;

  const cellMap = new Map<string, number>();
  data.forEach((d) => cellMap.set(`${d.row}|${d.col}`, d.value));

  const rowDelay = 6;
  const colDelay = 2;

  return (
    <div
      style={{
        position: "relative",
        width: labelGutter + gridWidth + 20,
        height: headerGutter + gridHeight + 20,
        fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
      }}
    >
      {/* Column headers */}
      {cols.map((col, ci) => {
        const opacity = interpolate(localFrame, [0, 12], [0, 1], {
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={`col-${col}`}
            style={{
              position: "absolute",
              left: labelGutter + ci * cellSize,
              top: 0,
              width: cellSize,
              height: headerGutter,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              opacity,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {col}
          </div>
        );
      })}

      {/* Row labels */}
      {rows.map((row, ri) => {
        const opacity = interpolate(
          localFrame,
          [ri * rowDelay, ri * rowDelay + 10],
          [0, 1],
          { extrapolateRight: "clamp" }
        );
        return (
          <div
            key={`row-${row}`}
            style={{
              position: "absolute",
              left: 0,
              top: headerGutter + ri * cellSize,
              width: labelGutter - 12,
              height: cellSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 12,
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.78)",
              opacity,
            }}
          >
            {row}
          </div>
        );
      })}

      {/* Cells */}
      {rows.map((row, ri) =>
        cols.map((col, ci) => {
          const value = cellMap.get(`${row}|${col}`) ?? 0;
          const cellStart = ri * rowDelay + ci * colDelay;
          const cellFrame = Math.max(0, localFrame - cellStart);

          const enter = spring({
            frame: cellFrame,
            fps: 30,
            config: { damping: 18, stiffness: 130 },
            durationInFrames: 14,
          });

          const baseColor = valueToColor(value);
          const isHigh = value >= highlightThreshold;
          const pulse = isHigh
            ? 0.5 + 0.5 * Math.sin((localFrame - cellStart) * 0.18)
            : 0;

          return (
            <div
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                left: labelGutter + ci * cellSize + 4,
                top: headerGutter + ri * cellSize + 4,
                width: cellSize - 8,
                height: cellSize - 8,
                borderRadius: 8,
                opacity: enter,
                transform: `scale(${0.8 + 0.2 * enter})`,
                background: baseColor,
                border: isHigh
                  ? `1.5px solid rgba(255,255,255,${0.3 + 0.4 * pulse})`
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isHigh
                  ? `0 0 ${10 + pulse * 14}px rgba(211,46,46,${0.35 + 0.35 * pulse})`
                  : "0 2px 8px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.95)",
                fontSize: 13,
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              {(value * 100).toFixed(0)}
            </div>
          );
        })
      )}
    </div>
  );
};
