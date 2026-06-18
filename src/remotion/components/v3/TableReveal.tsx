import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface TableRevealProps {
  headers: string[];
  rows: string[][];
  startFrame?: number;
  /** Frames between successive row reveals */
  rowDelay?: number;
  /** Optional fixed widths for columns (in pixels) */
  columnWidths?: number[];
  /** Highlighted column indexes get an accent border */
  highlightColumns?: number[];
}

/**
 * Animated dark-themed table. Header reveals first, then each row slides in
 * from the left with staggered opacity. Alternating row backgrounds keep
 * dense data scannable on a 1920x1080 canvas.
 */
export const TableReveal: React.FC<TableRevealProps> = ({
  headers,
  rows,
  startFrame = 0,
  rowDelay = 6,
  columnWidths,
  highlightColumns = [],
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  const headerSpring = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 20, stiffness: 130 },
    durationInFrames: 14,
  });
  const headerY = interpolate(headerSpring, [0, 1], [-12, 0]);

  const colWidth = (i: number) =>
    columnWidths && columnWidths[i] ? `${columnWidths[i]}px` : "1fr";

  const gridTemplate = headers.map((_, i) => colWidth(i)).join(" ");

  const isHighlight = (ci: number) => highlightColumns.includes(ci);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        overflow: "hidden",
        backdropFilter: "blur(8px)",
        fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerSpring,
          transform: `translateY(${headerY}px)`,
          display: "grid",
          gridTemplateColumns: gridTemplate,
          background: "linear-gradient(180deg, rgba(30,73,226,0.22), rgba(30,73,226,0.08))",
          borderBottom: "1px solid rgba(30,73,226,0.4)",
        }}
      >
        {headers.map((h, ci) => (
          <div
            key={`h-${ci}`}
            style={{
              padding: "14px 18px",
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderLeft:
                ci === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
              borderTop: isHighlight(ci) ? "2px solid #1E49E2" : "none",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Body rows */}
      {rows.map((row, ri) => {
        const rowFrame = Math.max(0, localFrame - 10 - ri * rowDelay);
        const rowOpacity = interpolate(rowFrame, [0, 12], [0, 1], {
          extrapolateRight: "clamp",
        });
        const slideX = interpolate(rowFrame, [0, 14], [-40, 0], {
          extrapolateRight: "clamp",
        });
        const isOdd = ri % 2 === 1;

        return (
          <div
            key={`r-${ri}`}
            style={{
              opacity: rowOpacity,
              transform: `translateX(${slideX}px)`,
              display: "grid",
              gridTemplateColumns: gridTemplate,
              background: isOdd
                ? "rgba(255,255,255,0.025)"
                : "rgba(255,255,255,0.0)",
              borderBottom:
                ri === rows.length - 1
                  ? "none"
                  : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {row.map((cell, ci) => (
              <div
                key={`c-${ri}-${ci}`}
                style={{
                  padding: "13px 18px",
                  fontSize: 14,
                  fontWeight: ci === 0 ? 600 : 400,
                  color:
                    ci === 0
                      ? "#ffffff"
                      : isHighlight(ci)
                        ? "#60a5fa"
                        : "rgba(255,255,255,0.78)",
                  borderLeft:
                    ci === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
