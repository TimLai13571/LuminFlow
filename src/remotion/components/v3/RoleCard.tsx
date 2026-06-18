import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface RoleCardProps {
  role: string;
  permissions: string[];
  /** Accent color for the side bar / badges */
  color: string;
  /** Optional avatar (emoji or single character) shown in the header */
  avatar?: string;
  startFrame?: number;
  /** Card index used for staggered card reveal */
  index?: number;
  /** Optional caption / role description below the role title */
  caption?: string;
}

/**
 * Role identity card with a colored side bar, role title, optional avatar,
 * and a staggered list of permission badges. Designed to sit in a horizontal
 * row of three on a 1920x1080 canvas.
 */
export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  permissions,
  color,
  avatar,
  startFrame = 0,
  index = 0,
  caption,
}) => {
  const frame = useCurrentFrame();
  const stagger = index * 8;
  const localFrame = Math.max(0, frame - startFrame - stagger);

  // Card spring entrance
  const cardSpring = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 16, stiffness: 120 },
    durationInFrames: 18,
  });
  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);

  // Avatar pop
  const avatarScale = spring({
    frame: Math.max(0, localFrame - 6),
    fps: 30,
    config: { damping: 13, stiffness: 150 },
    durationInFrames: 14,
  });

  return (
    <div
      style={{
        opacity: cardSpring,
        transform: `translateY(${cardY}px)`,
        position: "relative",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "22px 24px 22px 32px",
        minWidth: 280,
        maxWidth: 360,
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 32px rgba(0,0,0,0.35)",
        fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: `linear-gradient(180deg, ${color}, rgba(255,255,255,0.05))`,
          boxShadow: `0 0 14px ${color}`,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 16,
        }}
      >
        {avatar ? (
          <div
            style={{
              transform: `scale(${avatarScale})`,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `${color}26`,
              border: `1.5px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#ffffff",
              boxShadow: `0 0 14px ${color}66`,
              flexShrink: 0,
            }}
          >
            {avatar}
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color,
            }}
          >
            ROLE
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
            }}
          >
            {role}
          </div>
        </div>
      </div>

      {caption ? (
        <div
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          {caption}
        </div>
      ) : null}

      {/* Section label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          marginBottom: 10,
        }}
      >
        Permissions
      </div>

      {/* Permission badge list */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {permissions.map((perm, i) => {
          const badgeFrame = Math.max(0, localFrame - 14 - i * 4);
          const badgeSpring = spring({
            frame: badgeFrame,
            fps: 30,
            config: { damping: 18, stiffness: 140 },
            durationInFrames: 12,
          });
          const badgeY = interpolate(badgeSpring, [0, 1], [10, 0]);

          return (
            <div
              key={`perm-${i}`}
              style={{
                opacity: badgeSpring,
                transform: `translateY(${badgeY}px)`,
                padding: "6px 12px",
                borderRadius: 999,
                background: `${color}1A`,
                border: `1px solid ${color}80`,
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {perm}
            </div>
          );
        })}
      </div>
    </div>
  );
};
