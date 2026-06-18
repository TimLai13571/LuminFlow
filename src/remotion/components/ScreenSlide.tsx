import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img } from "remotion";

interface ScreenSlideProps {
  /** Path to the screenshot image (relative to project root or absolute URL) */
  src: string;
  /** Title displayed above the screenshot */
  title?: string;
  /** Subtitle / description displayed below title */
  subtitle?: string;
  /** Frame at which this slide starts appearing (for sequencing) */
  startFrame?: number;
  /** How many frames the entrance animation lasts */
  animationFrames?: number;
}

/**
 * A reusable animated slide that displays a LuminFlow platform screenshot
 * with a title and optional subtitle. Uses spring physics for smooth
 * scale-in and fade-in entrance animations.
 */
export const ScreenSlide: React.FC<ScreenSlideProps> = ({
  src,
  title,
  subtitle,
  startFrame = 0,
  animationFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  // Spring animation for the screenshot scale
  const scale = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 12, stiffness: 100 },
    durationInFrames: animationFrames,
  });

  // Fade in for the overlay text
  const textOpacity = interpolate(
    localFrame,
    [animationFrames * 0.5, animationFrames],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // Screenshot container dimensions (16:9 laptop mockup style)
  const screenshotWidth = width * 0.75;
  const screenshotHeight = screenshotWidth * (9 / 16);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      }}
    >
      {/* Screenshot container with subtle shadow/border */}
      <div
        style={{
          width: screenshotWidth,
          height: screenshotHeight,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 2px rgba(59,130,246,0.3)",
          transform: `scale(${scale})`,
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Title overlay */}
      {title && (
        <div
          style={{
            marginTop: 40,
            opacity: textOpacity,
            fontSize: 36,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            marginTop: 12,
            opacity: textOpacity,
            fontSize: 20,
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            maxWidth: screenshotWidth,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
