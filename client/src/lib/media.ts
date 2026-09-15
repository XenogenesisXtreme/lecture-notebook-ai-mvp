import type { VisualHighlight } from "./lecture";

export type MediaKind = "audio" | "video" | "image" | "transcript" | "subtitle" | "structured";
export type MediaAsset = { id: string; name: string; kind: MediaKind; size: number; type: string; url?: string; status: "ready" | "needs-transcript" | "visual"; timestamp?: string };

export function mediaKind(file: Pick<File, "name" | "type">): MediaKind | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (file.type.startsWith("audio/") || ["mp3", "wav", "m4a", "webm"].includes(extension ?? "")) return "audio";
  if (file.type.startsWith("video/") || ["mp4", "mov", "mkv"].includes(extension ?? "")) return "video";
  if (file.type.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(extension ?? "")) return "image";
  if (["txt", "md"].includes(extension ?? "")) return "transcript";
  if (["vtt", "srt"].includes(extension ?? "")) return "subtitle";
  if (extension === "json") return "structured";
  return null;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function makeMediaAsset(file: File): MediaAsset | null {
  const kind = mediaKind(file);
  if (!kind) return null;
  return { id: `${file.name}-${file.lastModified}`, name: file.name, kind, size: file.size, type: file.type || "application/octet-stream", url: kind === "image" ? URL.createObjectURL(file) : undefined, status: kind === "image" ? "visual" : kind === "transcript" || kind === "subtitle" || kind === "structured" ? "ready" : "needs-transcript" };
}

export function visualFromImage(asset: MediaAsset, caption = "Uploaded lecture visual", timestamp = "00:00:00"): VisualHighlight {
  return { id: `uploaded-${asset.id}`, timestamp, type: "slide", caption, whatItShows: `Uploaded image: ${asset.name}. OCR-ready visual placeholder; review and edit the caption before export.`, relatedSection: "Elasticity is responsiveness" };
}

export function visualFingerprint(frame: Pick<VisualHighlight, "caption" | "timestamp">) {
  return `${frame.caption.trim().toLowerCase()}|${frame.timestamp}`;
}

export function dedupeVisuals(frames: VisualHighlight[]) {
  return frames.filter((frame, index, all) => all.findIndex((candidate) => visualFingerprint(candidate) === visualFingerprint(frame)) === index);
}

export function scoreVisualFrame(input: { changed: boolean; textDensity: number; hasEquation: boolean; hasDiagram: boolean; emphasisNearby: boolean }) {
  return Math.min(1, Math.max(0, input.textDensity * 0.25 + (input.changed ? 0.25 : 0) + (input.hasEquation ? 0.2 : 0) + (input.hasDiagram ? 0.2 : 0) + (input.emphasisNearby ? 0.1 : 0)));
}

export function mediaStatusCopy(asset: MediaAsset) {
  if (asset.status === "visual") return "Visual ready · caption editable";
  if (asset.status === "needs-transcript") return "Media attached · transcript required";
  return "Ready for notebook generation";
}

export function canGenerateFromMedia(assets: MediaAsset[]) {
  return assets.some((asset) => ["transcript", "subtitle", "structured"].includes(asset.kind));
}

export function isSupportedMedia(file: File) {
  return mediaKind(file) !== null;
}

export function mediaKindLabel(kind: MediaKind) {
  return kind === "structured" ? "JSON" : kind.charAt(0).toUpperCase() + kind.slice(1);
}
