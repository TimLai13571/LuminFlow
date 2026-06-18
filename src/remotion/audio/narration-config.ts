/**
 * LuminFlow narration audio configuration.
 *
 * Maps each narration script segment to a TTS-generated audio file
 * located under `public/audio/narration/{segmentId}.mp3`.
 *
 * Audio files are produced by `server/scripts/generate_narration_audio.py`.
 * If a file is missing at render time, the AudioTrack component can be
 * disabled via the `enabled` prop without breaking the composition.
 */
import { staticFile } from "remotion";
import { narrationScript, type NarrationSegment } from "../narration/script";

export interface AudioSegment {
  /** Stable identifier matching the storyboard segment. */
  id: string;
  /** Inclusive start time in seconds on the master timeline. */
  startSeconds: number;
  /** Exclusive end time in seconds on the master timeline. */
  endSeconds: number;
  /** Resolved staticFile path to the segment audio (mp3). */
  audioFile: string;
  /** Linear playback volume in [0, 1]. Defaults to 1.0. */
  volume?: number;
  /** Original module label, useful for debugging / overlays. */
  module: string;
}

/**
 * Build the runtime audio segment list from the narration script.
 *
 * Naming rule: `{segmentId}.mp3` placed under `public/audio/narration/`.
 * Volume is fixed at 1.0; per-segment ducking can be applied later if needed.
 */
export const narrationSegments: AudioSegment[] = narrationScript.map(
  (seg: NarrationSegment): AudioSegment => ({
    id: seg.id,
    startSeconds: seg.startSeconds,
    endSeconds: seg.endSeconds,
    audioFile: staticFile(`audio/narration/${seg.id}.mp3`),
    volume: 1.0,
    module: seg.module,
  }),
);

/** Convenience: total runtime in seconds covered by the audio segments. */
export const narrationAudioTotalSeconds: number =
  narrationSegments.length > 0
    ? narrationSegments[narrationSegments.length - 1].endSeconds
    : 0;
