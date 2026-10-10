/**
 * TerraPulse site configuration.
 *
 * PROJECT VIDEO: paste your 4-minute presentation link into PROJECT_VIDEO_URL.
 * Supported: YouTube (watch / youtu.be / shorts / embed links), Vimeo, or a direct .mp4 URL.
 * Leave empty ("") to show the "video coming soon" placeholder.
 */
export const PROJECT_VIDEO_URL = "";

export const PROJECT_VIDEO_TITLE = "TerraPulse — Dancing with the SARs";
export const PROJECT_VIDEO_DESCRIPTION =
  "Our NASA Space Apps Challenge 2026 presentation: exploring how Rangpur, Bangladesh changes over time with satellite Earth observation.";

export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string }
  | { kind: "none" };

export function resolveVideo(url: string): VideoSource {
  const u = url.trim();
  if (!u) return { kind: "none" };
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` };
  const vm = u.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "embed", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (/\.(mp4|webm)(\?|$)/i.test(u)) return { kind: "file", src: u };
  return { kind: "none" };
}
