import { describe, expect, it } from "vitest";
import { dedupeVisuals, isOcrLanguageCached, markOcrLanguageCached, mediaKind, mediaStatusCopy, scoreVisualFrame, visualFromImage, type MediaAsset } from "./media";

describe("media foundation", () => {
  it("classifies supported upload types", () => {
    expect(mediaKind({ name: "class.mp3", type: "audio/mpeg" })).toBe("audio");
    expect(mediaKind({ name: "slides.png", type: "image/png" })).toBe("image");
    expect(mediaKind({ name: "captions.vtt", type: "text/vtt" })).toBe("subtitle");
  });

  it("creates an editable visual highlight from an uploaded image", () => {
    const asset: MediaAsset = { id: "slides", name: "slides.png", kind: "image", size: 200, type: "image/png", status: "visual" };
    expect(visualFromImage(asset)).toMatchObject({ type: "slide", caption: "Uploaded lecture visual" });
  });

  it("deduplicates identical visual fingerprints", () => {
    const frames = [{ id: "a", timestamp: "00:00:00", type: "slide" as const, caption: "Graph", whatItShows: "", relatedSection: "" }, { id: "b", timestamp: "00:00:00", type: "slide" as const, caption: "Graph", whatItShows: "duplicate", relatedSection: "" }];
    expect(dedupeVisuals(frames)).toHaveLength(1);
  });

  it("scores changed, diagram-like frames higher", () => {
    expect(scoreVisualFrame({ changed: true, textDensity: 1, hasEquation: true, hasDiagram: true, emphasisNearby: true })).toBeGreaterThan(scoreVisualFrame({ changed: false, textDensity: 0, hasEquation: false, hasDiagram: false, emphasisNearby: false }));
  });

  it("labels pending and kept visual review states", () => {
    const pending: MediaAsset = { id: "pending", name: "slide.png", kind: "image", size: 10, type: "image/png", status: "visual", reviewStatus: "pending" };
    const kept = { ...pending, reviewStatus: "kept" as const, ocrText: "Elastic demand" };
    expect(mediaStatusCopy(pending)).toContain("Needs review");
    expect(mediaStatusCopy(kept)).toContain("Kept");
    expect(mediaStatusCopy(kept)).toContain("OCR ready");
  });

  it("exposes safe OCR cache helpers when browser storage is unavailable", () => {
    expect(isOcrLanguageCached("eng")).toBe(false);
    expect(() => markOcrLanguageCached("eng")).not.toThrow();
  });
});
