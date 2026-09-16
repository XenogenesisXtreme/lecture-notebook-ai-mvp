import type { LectureNote, VisualHighlight } from "./lecture";
import { createWorker } from "tesseract.js";

export type MediaKind = "audio" | "video" | "image" | "transcript" | "subtitle" | "structured";
export type MediaAsset = { id: string; name: string; kind: MediaKind; size: number; type: string; url?: string; status: "ready" | "needs-transcript" | "visual"; timestamp?: string; ocrText?: string; blob?: Blob };

const DB_NAME = "lecture-notebook-ai-stage4";
const DB_VERSION = 1;
const STORE = "workspace";
const KEY = "current";

type PersistedWorkspace = { note: LectureNote; assets: MediaAsset[]; savedAt: string };

export function mediaKind(file: Pick<File, "name" | "type">): MediaKind | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (file.type.startsWith("audio/") || ["mp3", "wav", "m4a", "webm", "ogg"].includes(extension ?? "")) return "audio";
  if (file.type.startsWith("video/") || ["mp4", "mov", "mkv", "webm"].includes(extension ?? "")) return "video";
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
  return { id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, kind, size: file.size, type: file.type || "application/octet-stream", url: URL.createObjectURL(file), status: kind === "image" ? "visual" : kind === "transcript" || kind === "subtitle" || kind === "structured" ? "ready" : "needs-transcript", blob: file };
}

export function makeCapturedAsset(blob: Blob, kind: "audio" | "video", elapsedSeconds: number): MediaAsset {
  const extension = kind === "audio" ? "webm" : "webm";
  return { id: `capture-${Date.now()}`, name: `lecture-capture-${new Date().toISOString().slice(0, 10)}.${extension}`, kind, size: blob.size, type: blob.type, url: URL.createObjectURL(blob), status: "needs-transcript", timestamp: formatClock(elapsedSeconds), blob };
}

export function visualFromImage(asset: MediaAsset, caption = "Uploaded lecture visual", timestamp = "00:00:00", ocrText?: string): VisualHighlight {
  const ocrSuffix = ocrText ? ` OCR extract: ${ocrText.slice(0, 220)}` : " OCR scan available from the Stage 4 image action.";
  return { id: `uploaded-${asset.id}`, timestamp, type: "slide", caption, whatItShows: `Uploaded image: ${asset.name}.${ocrSuffix}`, relatedSection: "Elasticity is responsiveness" };
}

export function visualFromVideoFrame(blob: Blob, timestamp: string): MediaAsset {
  return { id: `frame-${Date.now()}`, name: `frame-${timestamp.replaceAll(":", "-")}.jpg`, kind: "image", size: blob.size, type: "image/jpeg", url: URL.createObjectURL(blob), status: "visual", timestamp, blob };
}

export function visualFingerprint(frame: Pick<VisualHighlight, "caption" | "timestamp">) { return `${frame.caption.trim().toLowerCase()}|${frame.timestamp}`; }
export function dedupeVisuals(frames: VisualHighlight[]) { return frames.filter((frame, index, all) => all.findIndex((candidate) => visualFingerprint(candidate) === visualFingerprint(frame)) === index); }
export function scoreVisualFrame(input: { changed: boolean; textDensity: number; hasEquation: boolean; hasDiagram: boolean; emphasisNearby: boolean }) { return Math.min(1, Math.max(0, input.textDensity * 0.25 + (input.changed ? 0.25 : 0) + (input.hasEquation ? 0.2 : 0) + (input.hasDiagram ? 0.2 : 0) + (input.emphasisNearby ? 0.1 : 0))); }
export function mediaStatusCopy(asset: MediaAsset) { if (asset.status === "visual") return asset.ocrText ? "Visual + OCR ready" : "Visual ready · OCR available"; if (asset.status === "needs-transcript") return "Media attached · transcript required"; return "Ready for notebook generation"; }
export function canGenerateFromMedia(assets: MediaAsset[]) { return assets.some((asset) => ["transcript", "subtitle", "structured"].includes(asset.kind)); }
export function isSupportedMedia(file: File) { return mediaKind(file) !== null; }
export function mediaKindLabel(kind: MediaKind) { return kind === "structured" ? "JSON" : kind.charAt(0).toUpperCase() + kind.slice(1); }
export function formatClock(seconds: number) { const total = Math.max(0, Math.floor(seconds)); return `${String(Math.floor(total / 3600)).padStart(2, "0")}:${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function persistWorkspace(note: LectureNote, assets: MediaAsset[]) {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => { const transaction = db.transaction(STORE, "readwrite"); transaction.objectStore(STORE).put({ note, assets, savedAt: new Date().toISOString() } satisfies PersistedWorkspace, KEY); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  db.close();
}

export async function restoreWorkspace(): Promise<PersistedWorkspace | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  const value = await new Promise<PersistedWorkspace | null>((resolve, reject) => { const request = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY); request.onsuccess = () => resolve((request.result as PersistedWorkspace | undefined) ?? null); request.onerror = () => reject(request.error); });
  db.close();
  return value;
}

export async function clearWorkspace() {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => { const transaction = db.transaction(STORE, "readwrite"); transaction.objectStore(STORE).delete(KEY); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  db.close();
}

export async function extractVideoFrame(video: HTMLVideoElement, timestamp: string): Promise<MediaAsset | null> {
  if (!video.videoWidth || !video.videoHeight) return null;
  const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  const context = canvas.getContext("2d"); if (!context) return null;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  return blob ? visualFromVideoFrame(blob, timestamp) : null;
}

export async function runNativeOcr(image: HTMLImageElement): Promise<string | null> {
  const Detector = (globalThis as typeof globalThis & { TextDetector?: new () => { detect: (source: HTMLImageElement) => Promise<Array<{ rawValue?: string }>> } }).TextDetector;
  if (!Detector) return null;
  const detections = await new Detector().detect(image);
  return detections.map((item) => item.rawValue ?? "").filter(Boolean).join(" ") || null;
}

export async function runOcr(image: HTMLImageElement, onProgress?: (progress: number) => void) {
  const worker = await createWorker("eng", 1, { logger: (message) => { if (message.status === "recognizing text") onProgress?.(message.progress); } });
  try {
    const result = await worker.recognize(image);
    return result.data.text.trim() || null;
  } finally {
    await worker.terminate();
  }
}
