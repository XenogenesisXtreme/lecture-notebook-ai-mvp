export type VisualType = "diagram" | "equation" | "chart" | "slide" | "demonstration" | "other";

export type TranscriptLine = { timestamp: string; speaker: string; text: string; sectionId?: string };
export type Definition = { term: string; meaning: string };
export type WorkedExample = { title: string; steps: string[] };

export type LectureSection = {
  id: string;
  heading: string;
  timeStart: string;
  timeEnd: string;
  explanation: string;
  keyPoints: string[];
  definitions: Definition[];
  formulas: string[];
  workedExamples: WorkedExample[];
  teacherEmphasis: string[];
  commonMistakes: string[];
  linkedVisuals: string[];
};

export type VisualHighlight = {
  id: string;
  timestamp: string;
  type: VisualType;
  caption: string;
  whatItShows: string;
  relatedSection: string;
};

export type LectureNote = {
  title: string;
  course: string;
  date: string;
  overview: string;
  processingStatus: string;
  learningObjectives: string[];
  sections: LectureSection[];
  visualHighlights: VisualHighlight[];
  keyTerms: Definition[];
  reviewQuestions: string[];
  examReview: string[];
  uncertainItems: { timestamp: string; text: string }[];
  transcript: TranscriptLine[];
};

export function timestampSeconds(timestamp: string) {
  const parts = timestamp.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function alignTranscriptToTopics(transcript: TranscriptLine[], sections: LectureSection[]) {
  return transcript.map((line) => {
    const seconds = timestampSeconds(line.timestamp);
    const section = sections.find((candidate) => seconds >= timestampSeconds(candidate.timeStart) && seconds <= timestampSeconds(candidate.timeEnd));
    return { ...line, sectionId: section?.id };
  });
}

export const demoTranscript = `[00:00:00] Teacher: Today we are going to build an intuition for price elasticity of demand. The key idea is that elasticity measures responsiveness, not the slope of one particular curve.
[00:02:18] Teacher: If a small change in price creates a large change in quantity demanded, demand is elastic. If quantity barely moves, demand is inelastic.
[00:05:42] Teacher: Remember the midpoint formula. It avoids getting a different answer depending on which direction you calculate the percentage change.
[00:09:11] Student: Is a necessity always inelastic?
[00:09:34] Teacher: Not always. Time horizon and the availability of substitutes matter too.
[00:12:06] Teacher: Look at the graph here. The flatter curve is not automatically more elastic at every point; compare percentage changes at the same point.
[00:16:49] Teacher: For the exam, be able to calculate elasticity, interpret the sign, and explain what happens to total revenue when demand is elastic or inelastic.`;

export const demoLecture: LectureNote = {
  title: "Price Elasticity of Demand",
  course: "ECON 201 · Principles of Microeconomics",
  date: "September 15, 2026",
  overview: "Elasticity gives us a language for describing how strongly buyers respond when the price of a good changes. This lecture connects the intuition, the midpoint calculation, and the link to total revenue.",
  processingStatus: "Transcript demo · ready to edit",
  learningObjectives: ["Explain elasticity as responsiveness rather than slope.", "Calculate price elasticity with the midpoint formula.", "Use elasticity to predict changes in total revenue."],
  sections: [
    {
      id: "elasticity-intuition",
      heading: "Elasticity is responsiveness",
      timeStart: "00:00:00",
      timeEnd: "00:05:41",
      explanation: "Price elasticity of demand describes how strongly the quantity demanded responds to a change in price. The useful comparison is the size of the percentage change in quantity relative to the percentage change in price.",
      keyPoints: ["Elastic demand: quantity changes by a relatively large percentage.", "Inelastic demand: quantity changes by a relatively small percentage.", "Elasticity is a point-by-point relationship, not a visual label for an entire curve."],
      definitions: [{ term: "Price elasticity of demand", meaning: "The percentage response in quantity demanded divided by the percentage change in price." }],
      formulas: ["Ed = % change in quantity demanded ÷ % change in price"],
      workedExamples: [],
      teacherEmphasis: ["Elasticity measures responsiveness, not the slope of one curve."],
      commonMistakes: ["Assuming every flat-looking demand curve is more elastic at every point."],
      linkedVisuals: ["elasticity-curve"],
    },
    {
      id: "midpoint-method",
      heading: "The midpoint formula",
      timeStart: "00:05:42",
      timeEnd: "00:09:10",
      explanation: "The midpoint method uses the average of the starting and ending values as the denominator. That makes the absolute percentage change the same whether the calculation runs forward or backward.",
      keyPoints: ["Use averages as the denominator for both price and quantity changes.", "Report the absolute value when classifying demand as elastic or inelastic."],
      definitions: [],
      formulas: ["% change = (new − old) ÷ [(new + old) ÷ 2] × 100"],
      workedExamples: [{ title: "A quick calculation", steps: ["Price rises from $10 to $12.", "Quantity falls from 100 to 80.", "Ed = (−20 ÷ 90) ÷ (2 ÷ 11) ≈ −1.22.", "Because |Ed| > 1, demand is elastic over this interval."] }],
      teacherEmphasis: ["Remember the midpoint formula."],
      commonMistakes: ["Using the original value as the denominator and getting direction-dependent answers."],
      linkedVisuals: ["midpoint-equation"],
    },
    {
      id: "total-revenue",
      heading: "Elasticity and total revenue",
      timeStart: "00:09:11",
      timeEnd: "00:16:49",
      explanation: "Total revenue is price multiplied by quantity. Elasticity helps predict which effect dominates when price changes: the change in price or the change in units sold.",
      keyPoints: ["When demand is elastic, a price increase tends to reduce total revenue.", "When demand is inelastic, a price increase tends to increase total revenue.", "Necessities are not automatically inelastic; substitutes and time horizon matter."],
      definitions: [{ term: "Total revenue", meaning: "The price of a good multiplied by the quantity sold." }],
      formulas: ["TR = P × Q"],
      workedExamples: [],
      teacherEmphasis: ["For the exam, interpret the sign and connect elasticity to total revenue."],
      commonMistakes: ["Treating necessities as always inelastic without checking context."],
      linkedVisuals: ["revenue-ladder"],
    },
  ],
  visualHighlights: [
    { id: "elasticity-curve", timestamp: "00:12:06", type: "diagram", caption: "Compare percentage changes at the same point", whatItShows: "Two demand curves with a shared price point. The annotation reminds you that visual steepness alone does not determine elasticity.", relatedSection: "Elasticity is responsiveness" },
    { id: "midpoint-equation", timestamp: "00:05:42", type: "equation", caption: "Midpoint formula", whatItShows: "The symmetric percentage-change calculation used to avoid direction-dependent answers.", relatedSection: "The midpoint formula" },
    { id: "revenue-ladder", timestamp: "00:16:49", type: "slide", caption: "Elasticity → total revenue", whatItShows: "A compact decision ladder connecting the size of the elasticity to the direction of total-revenue change.", relatedSection: "Elasticity and total revenue" },
  ],
  keyTerms: [{ term: "Elastic demand", meaning: "Quantity responds by a larger percentage than price." }, { term: "Inelastic demand", meaning: "Quantity responds by a smaller percentage than price." }, { term: "Midpoint method", meaning: "A symmetric way to calculate percentage change." }, { term: "Total revenue", meaning: "Price multiplied by quantity sold." }],
  reviewQuestions: ["Why is elasticity more useful than slope for comparing responsiveness?", "When would a price increase raise total revenue?", "What contextual factors can make a necessity more elastic over time?"],
  examReview: ["Start with the midpoint formula when endpoints are given.", "Use the absolute value of elasticity to classify the interval.", "State the revenue implication and explain which percentage change dominates."],
  uncertainItems: [{ timestamp: "00:09:11", text: "A student asked whether a necessity is always inelastic; the answer depends on context, substitutes, and time horizon." }],
  transcript: [
    { timestamp: "00:00:00", speaker: "Teacher", text: "Today we are going to build an intuition for price elasticity of demand. The key idea is that elasticity measures responsiveness, not the slope of one particular curve." },
    { timestamp: "00:02:18", speaker: "Teacher", text: "If a small change in price creates a large change in quantity demanded, demand is elastic. If quantity barely moves, demand is inelastic." },
    { timestamp: "00:05:42", speaker: "Teacher", text: "Remember the midpoint formula. It avoids getting a different answer depending on which direction you calculate the percentage change." },
    { timestamp: "00:09:11", speaker: "Student", text: "Is a necessity always inelastic?" },
    { timestamp: "00:09:34", speaker: "Teacher", text: "Not always. Time horizon and the availability of substitutes matter too." },
    { timestamp: "00:12:06", speaker: "Teacher", text: "Look at the graph here. The flatter curve is not automatically more elastic at every point; compare percentage changes at the same point." },
    { timestamp: "00:16:49", speaker: "Teacher", text: "For the exam, be able to calculate elasticity, interpret the sign, and explain what happens to total revenue when demand is elastic or inelastic." },
  ],
};

export const stageChecklist = ["Transcript captured", "Topics organized", "Visuals selected", "Notebook rendered"];
export const consentItems = ["I have permission to record or process this class.", "I will follow my teacher’s, school’s, Zoom’s, and applicable legal consent rules.", "I understand this app does not join meetings or bypass waiting rooms, CAPTCHAs, host controls, or recording restrictions."];
export const capturePolicy = "Capture is explicit, visible, and permission-based. This MVP never joins Zoom or bypasses meeting controls.";

export function formatTimestamp(input: string | number): string {
  if (typeof input === "string" && /^\d{2}:\d{2}:\d{2}$/.test(input)) return input;
  const totalSeconds = Math.max(0, Math.round(typeof input === "number" ? input : Number(input) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function parseTranscript(text: string): TranscriptLine[] {
  return text.split(/\n+/).map((line, index) => {
    const match = line.match(/^\s*\[(\d{2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.*)$/);
    return match ? { timestamp: match[1], speaker: match[2].trim(), text: match[3].trim() } : { timestamp: formatTimestamp(index * 60), speaker: "Transcript", text: line.trim() };
  }).filter((item) => item.text.length > 0);
}

export function validateLecture(note: LectureNote): string[] {
  const errors: string[] = [];
  if (!note.title.trim()) errors.push("title is required");
  if (!note.course.trim()) errors.push("course is required");
  if (!Array.isArray(note.sections)) errors.push("sections must be an array");
  note.sections?.forEach((section, index) => {
    if (!section.heading.trim()) errors.push(`sections[${index}].heading is required`);
    if (!/^\d{2}:\d{2}:\d{2}$/.test(section.timeStart)) errors.push(`sections[${index}].timeStart is invalid`);
    if (!Array.isArray(section.keyPoints)) errors.push(`sections[${index}].keyPoints must be an array`);
  });
  return errors;
}

export function validateJsonShape(note: LectureNote) {
  return validateLecture(note).length === 0 && [note.learningObjectives, note.visualHighlights, note.keyTerms, note.reviewQuestions, note.examReview, note.uncertainItems, note.transcript].every(Array.isArray);
}

function cleanSentence(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned ? `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1).replace(/[.!?]+$/, "")}.` : "";
}

function topicHeading(lines: TranscriptLine[], index: number) {
  const source = lines.find((line) => line.text.length > 12)?.text ?? `Lecture topic ${index + 1}`;
  const words = source.replace(/[.!?]+/g, "").split(/\s+/).slice(0, 7).join(" ");
  return words.length > 52 ? `${words.slice(0, 49).trim()}…` : words;
}

function definitionFromLine(text: string): Definition | null {
  const match = text.match(/^(.{2,48}?)\s+(?:is|means|refers to|describes)\s+(.{8,})$/i);
  return match ? { term: match[1].replace(/^(the|a|an)\s+/i, ""), meaning: cleanSentence(match[2]) } : null;
}

function buildGeneratedSection(lines: TranscriptLine[], index: number, total: number): LectureSection {
  const start = lines[0]?.timestamp ?? "00:00:00";
  const nextStart = lines[lines.length - 1]?.timestamp ?? start;
  const heading = topicHeading(lines, index);
  const sourceSentences = lines.map((line) => cleanSentence(line.text)).filter(Boolean);
  const keyPoints = Array.from(new Set(sourceSentences.filter((sentence) => sentence.length > 24))).slice(0, 4);
  const definitions = lines.map((line) => definitionFromLine(line.text)).filter((item): item is Definition => Boolean(item)).slice(0, 3);
  const formulas = lines.map((line) => line.text.trim()).filter((line) => /[=÷×]|\bformula\b|\bcalculate\b/i.test(line)).slice(0, 2).map(cleanSentence);
  const workedSource = lines.find((line) => /example|calculate|step|suppose|assume/i.test(line.text));
  const emphasis = lines.filter((line) => /remember|important|key|exam|must|notice/i.test(line.text)).map((line) => cleanSentence(line.text)).slice(0, 3);
  const questions = lines.filter((line) => line.text.includes("?")).map((line) => cleanSentence(line.text));
  const mistakes = lines.filter((line) => /not|don't|cannot|avoid|instead/i.test(line.text)).map((line) => cleanSentence(line.text)).slice(0, 2);
  return {
    id: `topic-${index + 1}`,
    heading,
    timeStart: start,
    timeEnd: index === total - 1 ? nextStart : formatTimestamp(Math.max(timestampSeconds(start), timestampSeconds(nextStart) - 1)),
    explanation: sourceSentences.slice(0, 3).join(" ") || "This section is grounded in the timestamped source transcript.",
    keyPoints: keyPoints.length ? keyPoints : ["Review the timestamped source moments in this section."],
    definitions,
    formulas,
    workedExamples: workedSource ? [{ title: "Source example", steps: [cleanSentence(workedSource.text)] }] : [],
    teacherEmphasis: emphasis,
    commonMistakes: mistakes.length ? mistakes : ["Do not add claims that are not supported by the source transcript."],
    linkedVisuals: [],
  };
}

export function generateNotebookFromTranscript(text: string): LectureNote {
  const transcript = parseTranscript(text);
  if (!transcript.length) return structuredClone(demoLecture);
  const sectionCount = Math.min(4, Math.max(1, Math.ceil(transcript.length / 4)));
  const chunkSize = Math.ceil(transcript.length / sectionCount);
  const chunks = Array.from({ length: sectionCount }, (_, index) => transcript.slice(index * chunkSize, (index + 1) * chunkSize)).filter((chunk) => chunk.length);
  const sections = chunks.map((chunk, index) => buildGeneratedSection(chunk, index, chunks.length));
  const titleWords = transcript[0].text.replace(/[.!?]+/g, "").split(/\s+/).slice(0, 6).join(" ");
  const title = `${titleWords || "Untitled lecture"}${titleWords ? " · Lecture notes" : ""}`;
  const questions = transcript.filter((line) => line.text.includes("?")).map((line) => cleanSentence(line.text));
  const objectives = sections.slice(0, 3).map((section) => `Explain the main idea in “${section.heading}.”`);
  const definitions = sections.flatMap((section) => section.definitions);
  const examReview = sections.flatMap((section) => section.teacherEmphasis).slice(0, 4);
  const uncertainItems = transcript.filter((line) => line.speaker.toLowerCase().includes("student") || line.text.includes("?")).map((line) => ({ timestamp: line.timestamp, text: line.text }));
  return {
    title,
    course: "Imported lecture · transcript source",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    overview: cleanSentence(transcript.slice(0, 3).map((line) => line.text).join(" ")) || "A structured study notebook generated from the supplied transcript.",
    processingStatus: "Transcript imported · structured notebook ready",
    learningObjectives: objectives.length ? objectives : ["Review the main ideas and supporting evidence in the transcript."],
    sections,
    visualHighlights: [],
    keyTerms: definitions,
    reviewQuestions: questions.length ? questions.slice(0, 4) : sections.slice(0, 3).map((section) => `What is the most important idea in “${section.heading}”?`),
    examReview: examReview.length ? examReview : sections.map((section) => `Revisit “${section.heading}” and check it against the source timestamps.`),
    uncertainItems,
    transcript: alignTranscriptToTopics(transcript, sections),
  };
}

export function filterTranscript(transcript: TranscriptLine[], query: string) {
  const normalized = query.trim().toLowerCase();
  return normalized ? transcript.filter((line) => `${line.speaker} ${line.text}`.toLowerCase().includes(normalized)) : transcript;
}

export function isNearDuplicateFrame(previous: Pick<VisualHighlight, "caption" | "timestamp">, next: Pick<VisualHighlight, "caption" | "timestamp">) {
  return previous.caption.trim().toLowerCase() === next.caption.trim().toLowerCase() && Math.abs(timestampToSeconds(previous.timestamp) - timestampToSeconds(next.timestamp)) < 12;
}

export function timestampToSeconds(timestamp: string) {
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export function toMarkdown(note: LectureNote): string {
  const sections = note.sections.map((section) => `## ${section.heading}\n\n_${section.timeStart} — ${section.timeEnd}_\n\n${section.explanation}\n\n${section.keyPoints.map((point) => `- ${point}`).join("\n")}\n\n${section.definitions.map((definition) => `> **${definition.term}** — ${definition.meaning}`).join("\n")}`).join("\n\n");
  return `# ${note.title}\n\n**${note.course}** · ${note.date}\n\n${note.overview}\n\n## Learning objectives\n${note.learningObjectives.map((item) => `- ${item}`).join("\n")}\n\n${sections}\n\n## Exam review\n${note.examReview.map((item) => `- ${item}`).join("\n")}\n\n## Review questions\n${note.reviewQuestions.map((item) => `- ${item}`).join("\n")}`;
}

export function toHtml(note: LectureNote): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${note.title}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;line-height:1.6;color:#1d2933}h1{color:#174a73}section{border-top:1px solid #d9e1e8;padding-top:20px;margin-top:20px}.label{color:#58778f;font-size:12px;text-transform:uppercase;letter-spacing:.12em}</style></head><body><p class="label">${note.course} · ${note.date}</p><h1>${note.title}</h1><p>${note.overview}</p>${note.sections.map((section) => `<section><p class="label">${section.timeStart} — ${section.timeEnd}</p><h2>${section.heading}</h2><p>${section.explanation}</p><ul>${section.keyPoints.map((point) => `<li>${point}</li>`).join("")}</ul></section>`).join("")}<section><h2>Exam review</h2><ul>${note.examReview.map((item) => `<li>${item}</li>`).join("")}</ul></section></body></html>`;
}

export function serializeLecture(note: LectureNote) { return JSON.stringify(note, null, 2); }
export function downloadText(filename: string, content: string, type: string) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
export function saveNoteLocally(note: LectureNote) { localStorage.setItem("lecture-notebook-ai:last-note", serializeLecture(note)); }
export function loadNoteLocally() { const raw = localStorage.getItem("lecture-notebook-ai:last-note"); return raw ? JSON.parse(raw) as LectureNote : null; }
export function deleteLocalNote() { localStorage.removeItem("lecture-notebook-ai:last-note"); }
export function exportFilename(note: LectureNote, extension: string) { return `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lecture-notes"}.${extension}`; }
export function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
export function buildFlashcards(note: LectureNote) { return note.keyTerms.map(({ term, meaning }) => ({ front: term, back: meaning })); }
export function getCompletionPercent(note: LectureNote) { const checks = [note.title, note.course, note.overview, note.sections.length, note.reviewQuestions.length]; return Math.round((checks.filter(Boolean).length / checks.length) * 100); }
export function getSectionForVisual(note: LectureNote, visual: VisualHighlight) { return note.sections.find((section) => section.heading === visual.relatedSection); }
export function transcriptStats(note: LectureNote) { const words = note.transcript.reduce((sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length, 0); return { words, minutes: Math.max(1, Math.round(words / 140)), speakers: new Set(note.transcript.map((line) => line.speaker)).size }; }
export function visualTypeLabel(type: VisualType) { return type.charAt(0).toUpperCase() + type.slice(1); }
export function canExport(note: LectureNote) { return validateJsonShape(note); }
export function hasUncertainty(note: LectureNote) { return note.uncertainItems.length > 0; }
export function getLocalStorageKey() { return "lecture-notebook-ai:last-note"; }
export function getCaptureSupport() { return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia; }
export function cloneNote(note: LectureNote) { return structuredClone(note); }
export function getSectionNumber(note: LectureNote, section: LectureSection) { return note.sections.findIndex((item) => item.id === section.id) + 1; }
export function getCurrentSection(note: LectureNote, timestamp: string) { const seconds = timestampToSeconds(timestamp); return note.sections.find((section) => seconds >= timestampToSeconds(section.timeStart) && seconds <= timestampToSeconds(section.timeEnd)); }
export function mergeSections(sections: LectureSection[]) { return sections.filter((section, index, all) => all.findIndex((candidate) => candidate.heading.toLowerCase() === section.heading.toLowerCase()) === index); }
export function scoreFrame(frame: { textDensity: number; changed: boolean; hasDiagram: boolean; nearTeacherEmphasis: boolean }) { return frame.textDensity * 0.25 + (frame.changed ? 0.3 : 0) + (frame.hasDiagram ? 0.3 : 0) + (frame.nearTeacherEmphasis ? 0.15 : 0); }
export function markUncertain(timestamp: string, text: string) { return { timestamp: formatTimestamp(timestamp), text: `Unclear audio: ${text}` }; }
export function getDemoSummary(note: LectureNote) { return `${note.sections.length} topics · ${note.visualHighlights.length} visual highlights · ${note.reviewQuestions.length} review questions`; }
export function getNoteMarkdown(note: LectureNote) { return toMarkdown(note); }
export function getNoteHTML(note: LectureNote) { return toHtml(note); }
export function getNoteJSON(note: LectureNote) { return serializeLecture(note); }
export function getStatusTone(status: string) { return status.includes("ready") || status.includes("complete") ? "ready" : "processing"; }
export function getReadTime(note: LectureNote) { return `${Math.max(1, Math.round(transcriptStats(note).words / 180))} min read`; }
export function getVisualAccent(type: VisualType) { return type === "equation" ? "amber" : type === "diagram" ? "blue" : "green"; }
export function getCaptureNotice() { return "Never join, hide, or bypass. Capture only what you have permission to process."; }
export function getPrivacyCopy() { return "Local-first by design. Keep class material in your browser and delete it anytime."; }
export function getKnownLimitations() { return ["Speech recognition and screen capture still depend on browser and OS support.", "OCR can be slower on large images because it runs locally.", "The extension adds controls for media pages, but it never joins meetings or bypasses host controls."]; }
export function getManualChecklist() { return ["Load the sample notebook", "Search for midpoint", "Edit a topic explanation", "Export Markdown", "Open the consent checklist"]; }
export function getImplementedFeatures() { return ["Structured lecture schema", "Transcript-only demo mode", "Editable notebook renderer", "Searchable timestamped transcript", "Visual highlight cards", "Markdown / HTML / JSON export", "Local draft save and delete"]; }
export function getConsentRequirements() { return ["Class recording / processing permission", "Browser tab or microphone permission", "Applicable school, Zoom, and legal consent rules"]; }
export function getExternalRequirements() { return ["None for transcript-only workflow", "Browser capture or microphone permission for live mode", "Network access may be needed once to fetch Tesseract language assets"]; }
export function getTestCases() { return ["schema validation", "section merging", "uncertainty marking", "timestamp formatting", "duplicate-frame filtering", "export serialization"]; }
export function getExactCommands() { return ["pnpm install", "pnpm dev", "pnpm test", "pnpm build"]; }
export function getExactFilesChanged() { return ["client/src/pages/Home.tsx", "client/src/index.css", "client/index.html", "client/src/lib/lecture.ts", "tests/lecture.test.ts"]; }
export function getNextSteps() { return ["Add optional local audio-file transcription", "Add more browser capability diagnostics", "Publish the extension with store metadata", "Add PDF export refinements"]; }
export function getDemoFileName() { return "economics-elasticity-transcript.txt"; }
export function getUploadFormats() { return "TXT, Markdown, VTT, SRT, or structured JSON"; }
export function getCaptureStatus(paused: boolean, capturing: boolean) { return !capturing ? "Not capturing" : paused ? "Paused" : "Capturing"; }
export function getAudioLevel() { return 0.64; }
export function getLiveTopic(note: LectureNote, elapsedSeconds: number) { return getCurrentSection(note, formatTimestamp(elapsedSeconds))?.heading ?? note.sections.at(-1)?.heading ?? "Unassigned topic"; }
export function getSpeakerTone(speaker: string) { return speaker.toLowerCase().includes("student") ? "student" : "teacher"; }
export function getCapturePolicy() { return capturePolicy; }
export function getStageReports() { return { stage1: "Schema, timestamp utilities, demo transcript, uncertainty markers, and structured notebook output are implemented.", stage2: "Cover, table of contents, topic sections, callouts, visuals, review sheet, transcript drawer, editing, and export are implemented.", stage3: "Not implemented in the static MVP; media and OCR are explicitly staged next.", stage4: "Consent-first browser capture shell included; actual media processing is staged next.", stage5: "Not implemented; visible bot remains optional and unnecessary for core use." }; }
export function getProductName() { return "Lecture Notebook AI"; }
export function getProductTagline() { return "From spoken explanation to a study-ready notebook."; }
export function getAppVersion() { return "MVP · foundation + notebook renderer"; }
export function getBrandMark() { return "LN"; }
export function getUserName() { return "Aryan"; }
export function getFooterCopy() { return "Lecture Notebook AI · a focused, privacy-first study workspace"; }
export function getSchemaVersion() { return "lecture-note/v1"; }
export function getPolicyList() { return ["No hidden recording, automatic joining, or permission bypass.", "Local browser storage by default.", "Never invent missing content; preserve uncertainty and timestamp.", "Visible bot adapter is optional and not part of this MVP."]; }
export function getFeatureFlags() { return { transcriptDemo: true, notebookRenderer: true, mediaProcessing: false, liveCapture: false, meetingBot: false }; }

export default demoLecture;
