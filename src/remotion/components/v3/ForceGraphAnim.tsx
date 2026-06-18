import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface FGNode {
  id: string;
  label: string;
  group: string;
  /** Optional radius. Defaults to 22 */
  size?: number;
}

interface FGLink {
  source: string;
  target: string;
  /** Optional connection strength in 0..1, drives opacity / pulse intensity */
  strength?: number;
}

interface ForceGraphAnimProps {
  nodes: FGNode[];
  links: FGLink[];
  startFrame?: number;
  width?: number;
  height?: number;
  /** Frames between successive node reveals */
  nodeDelay?: number;
}

const groupPalette: Record<string, { fill: string; ring: string; glow: string }> = {
  primary: { fill: "rgba(30,73,226,0.85)", ring: "#1E49E2", glow: "rgba(30,73,226,0.6)" },
  data: { fill: "rgba(59,130,246,0.85)", ring: "#3b82f6", glow: "rgba(59,130,246,0.55)" },
  ai: { fill: "rgba(168,85,247,0.85)", ring: "#a855f7", glow: "rgba(168,85,247,0.55)" },
  risk: { fill: "rgba(211,46,46,0.85)", ring: "#D32F2F", glow: "rgba(211,46,46,0.55)" },
  control: { fill: "rgba(245,158,11,0.85)", ring: "#f59e0b", glow: "rgba(245,158,11,0.55)" },
  output: { fill: "rgba(34,197,94,0.85)", ring: "#22c55e", glow: "rgba(34,197,94,0.55)" },
  default: { fill: "rgba(96,165,250,0.85)", ring: "#60a5fa", glow: "rgba(96,165,250,0.55)" },
};

/**
 * Deterministic radial layout: spreads nodes around the center on concentric
 * rings grouped by their `group` value. Hash of node id keeps positions stable.
 */
const layoutNodes = (
  nodes: FGNode[],
  width: number,
  height: number
): Record<string, { x: number; y: number }> => {
  const cx = width / 2;
  const cy = height / 2;
  const groups = Array.from(new Set(nodes.map((n) => n.group)));
  const positions: Record<string, { x: number; y: number }> = {};

  groups.forEach((g, gi) => {
    const groupNodes = nodes.filter((n) => n.group === g);
    const ringRadius = 90 + gi * 110;
    const startAngle = (gi * Math.PI) / 4;
    groupNodes.forEach((node, ni) => {
      const angle =
        startAngle + (ni / Math.max(groupNodes.length, 1)) * Math.PI * 2;
      positions[node.id] = {
        x: cx + Math.cos(angle) * ringRadius,
        y: cy + Math.sin(angle) * ringRadius * 0.62,
      };
    });
  });

  return positions;
};

/**
 * Stable per-node hash used to seed the float micro-motion offsets so each
 * node oscillates with a unique phase.
 */
const hashId = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
};

/**
 * Enhanced force-directed graph animation. Nodes pop from the center and
 * settle on a deterministic radial layout, gently floating once placed.
 * Links pulse with traveling dashes, intensity driven by `strength`.
 */
export const ForceGraphAnim: React.FC<ForceGraphAnimProps> = ({
  nodes,
  links,
  startFrame = 0,
  width = 900,
  height = 500,
  nodeDelay = 5,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);
  const positions = React.useMemo(
    () => layoutNodes(nodes, width, height),
    [nodes, width, height]
  );

  const cx = width / 2;
  const cy = height / 2;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
      }}
    >
      {/* Links */}
      <svg
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        width={width}
        height={height}
      >
        {links.map((link, i) => {
          const fromPos = positions[link.source];
          const toPos = positions[link.target];
          if (!fromPos || !toPos) return null;

          // Each link starts after both endpoints have appeared
          const linkStart = nodeDelay * nodes.length + 4;
          const linkFrame = Math.max(0, localFrame - linkStart - i * 2);
          const drawProgress = interpolate(linkFrame, [0, 18], [0, 1], {
            extrapolateRight: "clamp",
          });

          const fromHash = hashId(link.source);
          const fromX =
            fromPos.x + Math.sin((localFrame + fromHash) * 0.04) * 3;
          const fromY =
            fromPos.y + Math.cos((localFrame + fromHash) * 0.04) * 3;
          const toHash = hashId(link.target);
          const toX = toPos.x + Math.sin((localFrame + toHash) * 0.04) * 3;
          const toY = toPos.y + Math.cos((localFrame + toHash) * 0.04) * 3;

          const dx = toX - fromX;
          const dy = toY - fromY;
          const endX = fromX + dx * drawProgress;
          const endY = fromY + dy * drawProgress;

          const strength = link.strength ?? 0.6;
          const dashOffset = -((localFrame * 1.4) % 14);

          return (
            <line
              key={`link-${i}`}
              x1={fromX}
              y1={fromY}
              x2={endX}
              y2={endY}
              stroke={`rgba(96,165,250,${0.25 + strength * 0.55})`}
              strokeWidth={1 + strength * 1.4}
              strokeDasharray="6,8"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const target = positions[node.id] ?? { x: cx, y: cy };
        const nodeFrame = Math.max(0, localFrame - i * nodeDelay);
        const enter = spring({
          frame: nodeFrame,
          fps: 30,
          config: { damping: 14, stiffness: 110 },
          durationInFrames: 22,
        });

        // Animate from center to layout position
        const x = cx + (target.x - cx) * enter;
        const y = cy + (target.y - cy) * enter;
        const opacity = interpolate(nodeFrame, [0, 12], [0, 1], {
          extrapolateRight: "clamp",
        });

        // Float micro-motion (after settled)
        const settle = Math.min(1, nodeFrame / 30);
        const h = hashId(node.id);
        const floatX = Math.sin((localFrame + h) * 0.05) * 4 * settle;
        const floatY = Math.cos((localFrame + h) * 0.05) * 4 * settle;

        const palette =
          groupPalette[node.group] ?? groupPalette.default;
        const radius = node.size ?? 22;

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: x + floatX - radius,
              top: y + floatY - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), ${palette.fill})`,
              border: `2px solid ${palette.ring}`,
              boxShadow: `0 0 ${10 + radius / 2}px ${palette.glow}`,
              opacity,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 700,
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
              textAlign: "center",
              padding: 2,
              lineHeight: 1.1,
            }}
          >
            {node.label.length > 8 ? node.label.slice(0, 7) + "…" : node.label}
          </div>
        );
      })}
    </div>
  );
};
