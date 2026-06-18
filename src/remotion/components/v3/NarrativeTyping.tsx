import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface NarrativeTypingProps {
  text: string;
  startFrame?: number;
  /** Number of characters revealed per frame. Defaults to ~typing speed. */
  charsPerFrame?: number;
  /** Color of the blinking cursor */
  cursorColor?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Maximum width to wrap text inside */
  maxWidth?: number;
  /** Use monospace font */
  monospace?: boolean;
  /** Color of the typed text */
  color?: string;
}

/**
 * Typewriter effect that reveals text character by character with a blinking
 * cursor. Supports multi-line text via natural \n line breaks.
 */
export const NarrativeTyping: React.FC<NarrativeTypingProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 1.2,
  cursorColor = "#60a5fa",
  fontSize = 18,
  maxWidth = 720,
  monospace = true,
  color = "rgba(255,255,255,0.92)",
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  const totalChars = text.length;
  const revealedCount = Math.min(
    totalChars,
    Math.floor(localFrame * charsPerFrame)
  );
  const visible = text.slice(0, revealedCount);

  // Cursor blink ~2 Hz at 30 fps
  const cursorOpacity = Math.floor(localFrame / 15) % 2 === 0 ? 1 : 0;

  // Subtle initial fade-in for the whole block
  const blockOpacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const isComplete = revealedCount >= totalChars;
  // Show cursor unless typing has completed for >60 frames (then hide)
  const cursorVisible =
    !isComplete || localFrame - totalChars / charsPerFrame < 60;

  const fontFamily = monospace
    ? '"JetBrains Mono", "Menlo", "Consolas", "Courier New", monospace'
    : '"Inter", "system-ui", "-apple-system", "sans-serif"';

  return (
    <div
      style={{
        opacity: blockOpacity,
        maxWidth,
        fontFamily,
        fontSize,
        lineHeight: 1.6,
        color,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        letterSpacing: monospace ? "0.01em" : "normal",
      }}
    >
      {visible}
      {cursorVisible ? (
        <span
          style={{
            display: "inline-block",
            width: monospace ? "0.6em" : "0.5em",
            height: "1em",
            marginLeft: 2,
            verticalAlign: "text-bottom",
            background: cursorColor,
            opacity: cursorOpacity,
            boxShadow: `0 0 8px ${cursorColor}`,
            borderRadius: 1,
          }}
        />
      ) : null}
    </div>
  );
};
