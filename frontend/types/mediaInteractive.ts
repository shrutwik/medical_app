/**
 * Shared metadata for AI/offline-generated visuals: hotspots and optional animation.
 * Coordinates are normalized 0–1 relative to the media width/height.
 */

export interface HotspotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HotspotCircle {
  cx: number;
  cy: number;
  r: number;
}

/**
 * Single tappable/hoverable region on a figure.
 */
export interface IllustrationHotspot {
  id: string;
  label: string;
  description?: string;
  shape: 'rect' | 'circle';
  /** Normalized rect (0–1). */
  rect?: HotspotRect;
  /** Normalized circle (0–1). */
  circle?: HotspotCircle;
  /** Optional link to a mechanism step (0-based index) for diagram sync. */
  linkedStepIndex?: number;
  /** Optional tab key when used on case pages (e.g. `section_narrative`). */
  linkedTabKey?: string;
}

/**
 * Animation layer metadata (offline assets: GIF, hosted Lottie JSON, or short video URL).
 */
export interface IllustrationAnimation {
  kind: 'gif' | 'lottie' | 'video';
  url: string;
  autoplay?: boolean;
  durationMs?: number;
  posterUrl?: string;
}
