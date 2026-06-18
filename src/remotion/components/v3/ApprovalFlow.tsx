import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface ApprovalStep {
  label: string;
  status: "completed" | "active" | "pending";
}

interface ApprovalFlowProps {
  steps: ApprovalStep[];
  startFrame?: number;
  /** Frames between successive step reveals */
  stepDelay?: number;
  /** Diameter of step circles in pixels */
  circleSize?: number;
}

const palette = {
  completed: { ring: "#22c55e", fill: "rgba(34,197,94,0.18)", glow: "rgba(34,197,94,0.5)" },
  active: { ring: "#3b82f6", fill: "rgba(59,130,246,0.18)", glow: "rgba(59,130,246,0.6)" },
  pending: { ring: "rgba(255,255,255,0.25)", fill: "rgba(255,255,255,0.04)", glow: "rgba(255,255,255,0.0)" },
};

/**
 * Horizontal approval pipeline. Step circles light up sequentially while the
 * connecting line draws between them. Active steps pulse, completed steps
 * show a check mark, pending steps stay muted.
 */
export const ApprovalFlow: React.FC<ApprovalFlowProps> = ({
  steps,
  startFrame = 0,
  stepDelay = 12,
  circleSize = 56,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
      }}
    >
      {steps.map((step, i) => {
        const stepFrame = Math.max(0, localFrame - i * stepDelay);
        const enter = spring({
          frame: stepFrame,
          fps: 30,
          config: { damping: 14, stiffness: 130 },
          durationInFrames: 14,
        });
        const colors = palette[step.status];

        // Pulse for active steps
        const pulse =
          step.status === "active"
            ? 0.5 + 0.5 * Math.sin(localFrame * 0.16)
            : 0;

        // Connector line progress to next step
        const connectorFrame = Math.max(
          0,
          localFrame - i * stepDelay - 8
        );
        const connectorProgress = interpolate(
          connectorFrame,
          [0, stepDelay],
          [0, 1],
          { extrapolateRight: "clamp" }
        );

        const isLast = i === steps.length - 1;

        return (
          <div
            key={`step-${i}`}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              minWidth: 120,
            }}
          >
            {/* Connector line to next step (lives in same row as circles) */}
            {!isLast ? (
              <div
                style={{
                  position: "absolute",
                  top: circleSize / 2 - 1,
                  left: "50%",
                  width: "100%",
                  height: 2,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${connectorProgress * 100}%`,
                    height: "100%",
                    background:
                      step.status === "completed"
                        ? "linear-gradient(90deg, #22c55e, #3b82f6)"
                        : "linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.3))",
                    boxShadow: "0 0 6px rgba(59,130,246,0.4)",
                  }}
                />
              </div>
            ) : null}

            {/* Step circle */}
            <div
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: "50%",
                border: `2px solid ${colors.ring}`,
                background: colors.fill,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: step.status === "completed" ? 22 : 16,
                fontWeight: 700,
                opacity: enter,
                transform: `scale(${0.7 + 0.3 * enter})`,
                boxShadow:
                  step.status === "active"
                    ? `0 0 ${14 + pulse * 18}px ${colors.glow}`
                    : step.status === "completed"
                      ? `0 0 12px ${colors.glow}`
                      : "none",
                position: "relative",
                zIndex: 2,
              }}
            >
              {step.status === "completed" ? "✓" : i + 1}
            </div>

            {/* Step label */}
            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                fontWeight: 600,
                color:
                  step.status === "pending"
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(255,255,255,0.92)",
                textAlign: "center",
                opacity: enter,
                maxWidth: 160,
                lineHeight: 1.35,
              }}
            >
              {step.label}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colors.ring,
                opacity: enter * 0.85,
              }}
            >
              {step.status}
            </div>
          </div>
        );
      })}
    </div>
  );
};
