import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { ScreenSlide } from "../components/ScreenSlide";
import { TitleOverlay } from "../components/TitleOverlay";

export interface FeatureHighlightProps {
  /** Feature name displayed in the title overlay */
  title: string;
  /** Feature description */
  description: string;
  /** Screenshot filename (located under public/screenshots/) */
  screenshotFile: string;
}

/**
 * A short (~15 second) feature highlight video.
 *
 * Structure:
 *   0-3s   : Title card with feature name
 *   3-15s  : Annotated screenshot showcase
 *
 * Screenshots must be placed in public/screenshots/.
 * Pass only the filename (e.g. "luminflow-dashboard-zh.png").
 */
export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  title,
  description,
  screenshotFile,
}) => {
  const screenshotSrc = staticFile(`screenshots/${screenshotFile}`);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0e27" }}>
      {/* Title intro */}
      <Sequence from={0} durationInFrames={90}>
        <TitleOverlay title={title} subtitle={description} theme="blue" />
      </Sequence>

      {/* Screenshot showcase (starts slightly overlapping with title fade) */}
      <Sequence from={60} durationInFrames={390}>
        <ScreenSlide
          src={screenshotSrc}
          title={title}
          subtitle={description}
          startFrame={0}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
