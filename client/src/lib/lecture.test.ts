import { describe, expect, it } from "vitest";
import { alignTranscriptToTopics, demoLecture, formatTimestamp, generateNotebookFromTranscript, isNearDuplicateFrame, mergeSections, parseTranscript, timestampSeconds, toMarkdown, validateJsonShape, validateLecture } from "./lecture";

describe("lecture note foundation", () => {
  it("validates the sample note against the core schema", () => {
    expect(validateLecture(demoLecture)).toEqual([]);
    expect(validateJsonShape(demoLecture)).toBe(true);
  });

  it("formats timestamps consistently", () => {
    expect(formatTimestamp(0)).toBe("00:00:00");
    expect(formatTimestamp(138)).toBe("00:02:18");
    expect(formatTimestamp(3661)).toBe("01:01:01");
  });

  it("creates timestamped transcript sections without losing uncertain source lines", () => {
    const transcript = parseTranscript("[00:01:02] Teacher: Remember this.\n[00:02:00] Student: Is this always true?");
    const note = generateNotebookFromTranscript("[00:01:02] Teacher: Remember this.");
    expect(transcript[0]).toMatchObject({ timestamp: "00:01:02", speaker: "Teacher" });
    expect(note.transcript).toHaveLength(1);
    expect(demoLecture.uncertainItems[0].timestamp).toBe("00:09:11");
  });

  it("merges sections by normalized heading", () => {
    expect(mergeSections([demoLecture.sections[0], { ...demoLecture.sections[0], id: "copy", heading: "ELASTICITY IS RESPONSIVENESS" }])).toHaveLength(1);
  });

  it("filters near-identical visual frames", () => {
    expect(isNearDuplicateFrame({ caption: "Midpoint formula", timestamp: "00:05:42" }, { caption: "midpoint formula", timestamp: "00:05:50" })).toBe(true);
    expect(isNearDuplicateFrame({ caption: "Midpoint formula", timestamp: "00:05:42" }, { caption: "Revenue slide", timestamp: "00:16:49" })).toBe(false);
  });

  it("exports a readable Markdown notebook", () => {
    const markdown = toMarkdown(demoLecture);
    expect(markdown).toContain("# Price Elasticity of Demand");
    expect(markdown).toContain("## The midpoint formula");
    expect(markdown).toContain("Review questions");
  });

  it("aligns transcript moments to the matching topic by timestamp", () => {
    expect(timestampSeconds("00:05:42")).toBe(342);
    const aligned = alignTranscriptToTopics([{ timestamp: "00:05:42", speaker: "Teacher", text: "Midpoint" }, { timestamp: "00:20:00", speaker: "Teacher", text: "Outside" }], demoLecture.sections);
    expect(aligned[0].sectionId).toBe("midpoint-method");
    expect(aligned[1].sectionId).toBeUndefined();
  });
});
