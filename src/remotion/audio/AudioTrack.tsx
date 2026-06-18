/**
 * LuminFlow narration audio track for Remotion.
 *
 * Renders one <Audio> per narration segment, wrapped in <Sequence> so each
 * clip starts at the exact frame defined by the segment timeline. When the
 * underlying mp3 files have not been generated yet, pass `enabled={false}`
 * to skip rendering without breaking the composition.
 */
import React from "react";
import { Audio, Sequence, useVideoConfig } from "remotion";
import { narrationSegments, type AudioSegment } from "./narration-config";

export interface AudioTrackProps {
  /** Toggle the entire narration track. Defaults to true. */
  enabled?: boolean;
  /** Optional global volume multiplier applied to every segment. */
  masterVolume?: number;
}

/**
 * Convert an absolute time in seconds to a frame index for the current
 * Remotion composition fps.
 */
const toFrames = (seconds: number, fps: number): number =>
  Math.max(0, Math.round(seconds * fps));

export const AudioTrack: React.FC<AudioTrackProps> = ({
  enabled = true,
  masterVolume = 1.0,
}) => {
  const { fps } = useVideoConfig();

  if (!enabled) {
    return null;
  }

  return (
    <>
      {narrationSegments.map((segment: AudioSegment) => {
        const fromFrame = toFrames(segment.startSeconds, fps);
        const endFrame = toFrames(segment.endSeconds, fps);
        const durationInFrames = Math.max(1, endFrame - fromFrame);
        const segmentVolume = (segment.volume ?? 1.0) * masterVolume;

        return (
          <Sequence
            key={segment.id}
            from={fromFrame}
            durationInFrames={durationInFrames}
            name={`Narration:${segment.id}`}
          >
            <Audio src={segment.audioFile} volume={segmentVolume} />
          </Sequence>
        );
      })}
    </>
  );
};

export default AudioTrack;
