import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status?: "active" | "completed" | "pending" | "warning";
}

interface FlowEdge {
  from: string;
  to: string;
}

interface DataFlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  width?: number;
  height?: number;
  startFrame?: number;
  nodeDelay?: number;
}

const statusColors: Record<string, string> = {
  active: "#3b82f6",
  completed: "#22c55e",
  pending: "rgba(255,255,255,0.2)",
  warning: "#f59e0b",
};

const statusGlow: Record<string, string> = {
  active: "0 0 12px rgba(59,130,246,0.5)",
  completed: "0 0 8px rgba(34,197,94,0.4)",
  pending: "none",
  warning: "0 0 10px rgba(245,158,11,0.5)",
};

/**
 * Animated data flow diagram with connected nodes.
 * Nodes appear staggered, edges draw progressively.
 */
export const DataFlowDiagram: React.FC<DataFlowDiagramProps> = ({
  nodes,
  edges,
  width = 900,
  height = 400,
  startFrame = 0,
  nodeDelay = 8,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Draw edges */}
      <svg
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        width={width}
        height={height}
      >
        {edges.map((edge, i) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const edgeProgress = interpolate(
            localFrame,
            [nodeDelay * nodes.length + i * 10, nodeDelay * nodes.length + i * 10 + 20],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={fromNode.x + (toNode.x - fromNode.x) * edgeProgress}
              y2={fromNode.y + (toNode.y - fromNode.y) * edgeProgress}
              stroke="rgba(59,130,246,0.4)"
              strokeWidth={2}
              strokeDasharray="6,4"
            />
          );
        })}
      </svg>

      {/* Draw nodes */}
      {nodes.map((node, i) => {
        const nodeFrame = Math.max(0, localFrame - i * nodeDelay);
        const scale = spring({
          frame: nodeFrame,
          fps: 30,
          config: { damping: 12, stiffness: 120 },
          durationInFrames: 15,
        });
        const opacity = interpolate(nodeFrame, [0, 10], [0, 1], {
          extrapolateRight: "clamp",
        });

        const color = statusColors[node.status || "active"];
        const glow = statusGlow[node.status || "active"];

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x - 60,
              top: node.y - 22,
              opacity,
              transform: `scale(${scale})`,
              padding: "8px 16px",
              borderRadius: 20,
              background: `rgba(255,255,255,0.06)`,
              border: `1.5px solid ${color}`,
              boxShadow: glow,
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              whiteSpace: "nowrap",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </div>
  );
};
