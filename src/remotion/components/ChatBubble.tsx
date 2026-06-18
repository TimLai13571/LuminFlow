import React from "react";
import { useCurrentFrame, spring, interpolate } from "remotion";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ChatBubbleStackProps {
  messages: ChatMessage[];
  startFrame?: number;
  messageDelay?: number;
}

/**
 * Animated chat conversation with typing indicator and staggered bubble appearance.
 * Messages appear one by one from bottom, simulating a real chat interaction.
 */
export const ChatBubbleStack: React.FC<ChatBubbleStackProps> = ({
  messages,
  startFrame = 0,
  messageDelay = 25,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "20px 24px",
        maxWidth: 600,
      }}
    >
      {messages.map((msg, i) => {
        const msgFrame = Math.max(0, frame - startFrame - i * messageDelay);
        const opacity = spring({
          frame: msgFrame,
          fps: 30,
          config: { damping: 20, stiffness: 120 },
          durationInFrames: 12,
        });
        const xOffset = interpolate(msgFrame, [0, 12], [msg.role === "user" ? 30 : -30, 0], {
          extrapolateRight: "clamp",
        });

        const isUser = msg.role === "user";

        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateX(${xOffset}px)`,
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "12px 18px",
                borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isUser
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "rgba(255,255,255,0.08)",
                border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
                fontSize: 15,
                lineHeight: 1.5,
                color: "#ffffff",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
