import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  History,
  Image as ImageIcon,
  Layers3,
  Menu,
  FileVideo,
  Mic2,
  Pencil,
  Plus,
  Radio,
  ScanText,
  Search,
  ShieldCheck,
  Trash2,
  Sparkles,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  capturePolicy,
  consentItems,
  demoLecture,
  demoTranscript,
  deleteLocalNote,
  downloadText,
  exportFilename,
  filterTranscript,
  formatTimestamp,
  generateNotebookFromTranscript,
  getCompletionPercent,
  getDemoSummary,
  getKnownLimitations,
  getManualChecklist,
  getStageReports,
  getTestCases,
  loadNoteLocally,
  saveNoteLocally,
  toHtml,
  toMarkdown,
  type LectureNote,
  type LectureSection,
  type VisualHighlight,
} from "@/lib/lecture";
import { canGenerateFromMedia, clearWorkspace, extractVideoFrame, formatFileSize, makeCapturedAsset, makeMediaAsset, mediaKindLabel, mediaStatusCopy, persistWorkspace, restoreWorkspace, runNativeOcr, runOcr, visualFromImage, type MediaAsset } from "@/lib/media";

const navItems = [
  { label: "Notebook", icon: BookOpen, count: (note: LectureNote) => note.sections.length },
  { label: "Transcript", icon: AlignLeft, count: (note: LectureNote) => note.transcript.length },
  { label: "Visuals", icon: ImageIcon, count: (note: LectureNote) => note.visualHighlights.length },
  { label: "Audio", icon: Volume2, count: (note: LectureNote) => note.transcript.filter((line) => line.speaker.toLowerCase().includes("captured")).length },
  { label: "Review", icon: BookOpenCheck, count: (note: LectureNote) => note.reviewQuestions.length },
];

type ModalMode = "new" | "consent" | "import" | "about" | null;

type Toastish = (message: string) => void;

export default function Home() {
  const [note, setNote] = useState<LectureNote>(() => loadNoteLocally() ?? structuredClone(demoLecture));
  const [activeNav, setActiveNav] = useState("Notebook");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [consent, setConsent] = useState<boolean[]>([false, false, false]);
  const [capturing, setCapturing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [frames, setFrames] = useState<VisualHighlight[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [stage4Ready, setStage4Ready] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipPersistRef = useRef(false);

  const filteredTranscript = useMemo(() => filterTranscript(note.transcript, query), [note.transcript, query]);
  const progress = getCompletionPercent(note);
  const stageReports = getStageReports();
  const allConsent = consent.every(Boolean);
  const groundingValue = note.uncertainItems.length ? "1 review" : "Clear";

  useEffect(() => {
    restoreWorkspace().then((saved) => { if (saved) { setNote(saved.note); setMediaAssets(saved.assets); setStage4Ready(true); } });
  }, []);

  useEffect(() => {
    if (skipPersistRef.current) { skipPersistRef.current = false; return; }
    const timer = window.setTimeout(() => { persistWorkspace(note, mediaAssets).then(() => setStage4Ready(true)).catch(() => undefined); }, 600);
    return () => window.clearTimeout(timer);
  }, [note, mediaAssets]);

  useEffect(() => {
    if (capturing && videoRef.current && streamRef.current?.getVideoTracks().length) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => undefined);
    }
  }, [capturing]);

  const notify: Toastish = (message) => toast(message);

  function handleNav(label: string) {
    setActiveNav(label);
    setMobileOpen(false);
    const target = label === "Notebook" ? "notebook-top" : label === "Transcript" ? "transcript" : label === "Visuals" ? "visuals" : label === "Audio" ? "audio" : "review";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateNote(patch: Partial<LectureNote>) {
    setNote((current) => ({ ...current, ...patch }));
  }

  function updateSection(sectionId: string, patch: Partial<LectureSection>) {
    setNote((current) => ({ ...current, sections: current.sections.map((section) => section.id === sectionId ? { ...section, ...patch } : section) }));
  }

  function saveDraft() {
    saveNoteLocally(note);
    notify("Saved locally — your edits stay in this browser.");
  }

  function exportNote(kind: "markdown" | "html" | "json") {
    if (kind === "markdown") downloadText(exportFilename(note, "md"), toMarkdown(note), "text/markdown");
    if (kind === "html") downloadText(exportFilename(note, "html"), toHtml(note), "text/html");
    if (kind === "json") downloadText(exportFilename(note, "json"), JSON.stringify(note, null, 2), "application/json");
    notify(`${kind.toUpperCase()} export downloaded.`);
  }

  function resetToDemo() {
    setNote(structuredClone(demoLecture));
    setQuery("");
    setEditing(false);
    notify("Reset to the sample notebook.");
  }

  function handleFile(file?: File) {
    if (!file) return;
    if (!/\.(txt|md|vtt|srt|json)$/i.test(file.name)) {
      notify("Please choose a text, subtitle, or JSON transcript file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      const imported = file.name.toLowerCase().endsWith(".json") ? tryParseJson(value) : generateNotebookFromTranscript(value);
      setNote(imported ?? generateNotebookFromTranscript(value));
      setModal(null);
      notify("Transcript imported — review the generated structure before exporting.");
    };
    reader.readAsText(file);
  }

  function tryParseJson(value: string): LectureNote | null {
    try {
      const parsed = JSON.parse(value) as LectureNote;
      return parsed.title && parsed.sections && parsed.transcript ? parsed : null;
    } catch {
      return null;
    }
  }

  function handleMediaFiles(files: FileList | null) {
    if (!files) return;
    const nextAssets = Array.from(files).map(makeMediaAsset).filter(Boolean) as MediaAsset[];
    if (!nextAssets.length) { notify("No supported media files selected."); return; }
    setMediaAssets((current) => [...current, ...nextAssets]);
    const imageVisuals = nextAssets.filter((asset) => asset.kind === "image").map((asset) => visualFromImage(asset));
    if (imageVisuals.length) updateNote({ visualHighlights: [...note.visualHighlights, ...imageVisuals] });
    notify(`${nextAssets.length} media asset${nextAssets.length === 1 ? "" : "s"} added. Browser-local persistence is active.`);
  }

  async function analyzeImage(asset: MediaAsset) {
    if (!asset.url || asset.kind !== "image") return;
    setOcrBusy(true);
    try {
      const image = new Image(); image.src = asset.url; await image.decode();
      const text = await runNativeOcr(image) ?? await runOcr(image, (progress) => { if (progress > 0.1 && progress < 1) notify(`OCR scan ${Math.round(progress * 100)}% complete…`); });
      setMediaAssets((current) => current.map((item) => item.id === asset.id ? { ...item, ocrText: text ?? "No native OCR detector available in this browser." } : item));
      if (text) updateNote({ visualHighlights: note.visualHighlights.map((visual) => visual.id === `uploaded-${asset.id}` ? { ...visual, whatItShows: `${visual.whatItShows} OCR extract: ${text}` } : visual) });
      notify(text ? "OCR extracted text from the visual and synced it to the notebook." : "OCR found no readable text in this visual.");
    } catch { notify("OCR scan could not read this image."); } finally { setOcrBusy(false); }
  }

  function removeMediaAsset(id: string) {
    setMediaAssets((current) => current.filter((asset) => asset.id !== id));
  }

  function printNotebook() {
    notify("Opening print dialog — choose Save to PDF.");
    window.setTimeout(() => window.print(), 120);
  }

  async function beginCapture() {
    if (!allConsent) {
      notify("Complete the consent checklist before starting capture.");
      return;
    }
    setModal(null);
    try {
      const stream = await (navigator.mediaDevices?.getDisplayMedia ? navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) : navigator.mediaDevices.getUserMedia({ audio: true }));
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder; chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => { const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" }); const kind = stream.getVideoTracks().length ? "video" : "audio"; setMediaAssets((current) => [...current, makeCapturedAsset(blob, kind, elapsed)]); notify("Capture saved locally. Add or import a transcript to generate grounded notes."); };
      recorder.start(500);
      const speechWindow = window as typeof window & { SpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void }; webkitSpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void } };
      const Speech = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
      if (Speech) { const recognition = new Speech(); recognition.continuous = true; recognition.interimResults = true; recognition.onresult = (event) => { const text = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" "); setTranscriptDraft(text); }; recognition.onend = () => undefined; recognition.start(); recognitionRef.current = recognition; }
      setCapturing(true);
    setPaused(false);
    setElapsed(0);
      notify("Capture started with browser permission and a visible indicator.");
    } catch { notify("Capture permission was denied or unavailable; nothing was recorded."); }
  }

  function stopCapture() {
    recorderRef.current?.stop(); recorderRef.current = null; recognitionRef.current?.stop(); recognitionRef.current = null; streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null;
    setCapturing(false);
    setPaused(false);
    if (transcriptDraft.trim()) updateNote({ transcript: [...note.transcript, { timestamp: formatTimestamp(elapsed), speaker: "Captured audio", text: transcriptDraft.trim() }] });
    notify("Capture stopped. Review the notebook before export.");
  }

  async function saveFrame() {
    const frame: VisualHighlight = { id: `manual-${Date.now()}`, timestamp: formatTimestamp(elapsed), type: "other", caption: "Manual snapshot", whatItShows: "A frame marked important by the student during capture.", relatedSection: note.sections[0]?.heading ?? "Unassigned" };
    if (videoRef.current) { const asset = await extractVideoFrame(videoRef.current, frame.timestamp); if (asset) setMediaAssets((current) => [...current, asset]); }
    setFrames((current) => [...current, frame]);
    updateNote({ visualHighlights: [...note.visualHighlights, frame] });
    notify("Frame added to visual highlights.");
  }

  const nav = (
    <div className="space-y-1">
      {navItems.map(({ label, icon: Icon, count }) => (
        <button key={label} onClick={() => handleNav(label)} className={`nav-item ${activeNav === label ? "active" : ""}`}>
          <Icon size={17} strokeWidth={1.7} />
          <span>{label}</span>
          <span className="nav-count">{String(count(note)).padStart(2, "0")}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: 14, border: "1px solid #d9e4e5", background: "#fffdf8", color: "#22323a" } }} />
    <div className="app-shell" id="notebook-top">
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark">LN</div>
          <div>
            <div className="brand-name">Lecture Notebook</div>
            <div className="brand-submark">STUDY SYSTEM</div>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="sidebar-rule" />
        <div className="sidebar-section-label">Workspace</div>
        {nav}
        <div className="sidebar-section-label second">Build stages</div>
        <div className="stage-list">
          <StageRow number="01" label="Foundation" detail="Transcript demo" complete />
          <StageRow number="02" label="Notebook" detail="Renderer + export" complete />
          <StageRow number="03" label="Media" detail="Upload + OCR" complete />
          <StageRow number="04" label="Live capture" detail="Browser-local" complete />
        </div>
        <div className="sidebar-bottom">
          <div className="local-card">
            <ShieldCheck size={17} />
            <div><strong>Private by default</strong><span>No hidden recording</span></div>
          </div>
          <div className="sidebar-user"><div className="avatar">A</div><div><strong>Aryan</strong><span>Student workspace</span></div><ChevronRight size={15} className="muted-icon" /></div>
        </div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><span className="crumb-muted">Notebooks</span><ChevronRight size={14} className="crumb-chevron" /><span className="crumb-current">{note.title}</span></div>
          <div className="topbar-actions">
            <span className="status-pill"><span className="status-dot" /> {capturing ? "Capturing" : "Ready for review"}</span>
            <button className="icon-button" onClick={() => setModal("about")} aria-label="Open privacy and build notes"><ShieldCheck size={17} /></button>
            <button className="new-button" onClick={() => setModal("new")}><Plus size={16} /> New lecture</button>
          </div>
        </header>

        <div className="workspace-content">
          <section className="welcome-row">
            <div><div className="eyebrow">NOTEBOOK WORKSPACE · {note.processingStatus.includes("demo") ? "SAMPLE LOADED" : "LOCAL DRAFT"}</div><h1>Make every lecture <em>easier</em> to revisit.</h1><p className="hero-copy">{getDemoSummary(note)}. Keep the important idea, the supporting visual, and the timestamp that lets you find it again.</p></div>
            <div className="progress-card"><div className="progress-top"><span>Notebook progress</span><strong>{progress}%</strong></div><div className="progress-track"><div style={{ width: `${progress}%` }} /></div><span className="progress-caption">Structured JSON → readable study page</span></div>
          </section>

          <section className="mode-strip">
            <div className="mode-copy"><div className="eyebrow">CHOOSE YOUR SOURCE</div><h2>Start with the safest path for this class.</h2><p>Transcript-only works without live Zoom access. Capture is explicit and visible when you are ready.</p></div>
            <button className="mode-card" onClick={() => setModal("consent")}><span className="mode-icon live"><Radio size={18} /></span><span><strong>Live browser capture</strong><small>Permission-first tab or mic capture</small></span><ArrowRight size={16} /></button>
            <button className="mode-card featured" onClick={() => setModal("import")}><span className="mode-icon upload"><Upload size={18} /></span><span><strong>Transcript-only demo</strong><small>Paste or upload text · works offline</small></span><ArrowRight size={16} /></button>
            <button className="mode-card" onClick={() => { const draft = loadNoteLocally(); if (draft) { setNote(draft); notify("Previous local notebook opened."); } else notify("No saved draft yet — the sample notebook is still open."); }}><span className="mode-icon previous"><History size={18} /></span><span><strong>Open previous notebook</strong><small>Restore a local browser draft</small></span><ArrowRight size={16} /></button>
          </section>

          <div className="content-grid">
            <section className="notebook-column">
              <div className="content-toolbar"><div><div className="eyebrow">CURRENT NOTEBOOK</div><div className="notebook-title-line"><h2>{note.title}</h2><span className="source-chip"><CheckCircle2 size={13} /> Grounded</span></div></div><div className="toolbar-actions"><button className={`ghost-button ${editing ? "selected" : ""}`} onClick={() => setEditing((value) => !value)}><Pencil size={15} /> {editing ? "Preview" : "Edit notebook"}</button><button className="primary-button" onClick={printNotebook}><Download size={15} /> PDF / Print</button></div></div>
              <div className="notebook-card">
                <div className="notebook-cover"><div className="cover-side-label">LECTURE NOTEBOOK <span>·</span> 01</div><div className="cover-content"><div className="cover-kicker">{note.course}</div>{editing ? <input value={note.title} onChange={(event) => updateNote({ title: event.target.value })} className="cover-input" /> : <h2>{note.title}</h2>}<div className="cover-meta"><span><Clock3 size={14} /> {note.date}</span><span><FileText size={14} /> {note.processingStatus.split("·")[0].trim()}</span></div></div><div className="cover-footer"><span>LECTURE NOTEBOOK AI</span><span>LOCAL-FIRST / V0.1</span></div></div>
                <div className="notebook-body">
                  <div className="toc-row"><div><div className="section-label">01 / ORIENTATION</div><h3>At a glance</h3></div><span className="page-mark">p. 01</span></div>
                  {editing ? <textarea value={note.overview} onChange={(event) => updateNote({ overview: event.target.value })} className="overview-editor" /> : <p className="overview-text">{note.overview}</p>}
                  <div className="objective-grid"><div className="objective-title"><Sparkles size={16} /> <span>Learning objectives</span></div>{note.learningObjectives.map((objective, index) => <div key={objective} className="objective-item"><span>0{index + 1}</span>{objective}</div>)}</div>
                  <div className="section-divider" />
                  <div className="toc-row topics-head"><div><div className="section-label">02 / TOPICS</div><h3>What to keep</h3></div><span className="page-mark">{note.sections.length} sections</span></div>
                  <div className="toc-list">{note.sections.map((section, index) => <button key={section.id} onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })}><span className="toc-number">0{index + 1}</span><span>{section.heading}</span><span className="toc-time">{section.timeStart}</span><ChevronRight size={14} /></button>)}</div>
                  {note.sections.map((section, index) => <TopicSection key={section.id} section={section} index={index} editing={editing} onChange={(explanation) => updateSection(section.id, { explanation })} />)}
                  <RevisionSheet note={note} />
                </div>
              </div>
              <div className="notebook-footer"><span>Built for focused study · no invented content</span><span>{note.date}</span></div>
            </section>

            <aside className="context-rail">
              <div className="rail-card status-card" id="audio"><div className="rail-card-header"><span className="section-label">NOTEBOOK STATUS · AUDIO</span><CheckCircle2 size={18} className="green-icon" /></div><div className="status-title">Ready to study</div><p>{note.sections.length} topics organized from {note.transcript.length} timestamped source moments.</p><div className="status-list"><StatusLine label="Schema validation" value="Passed" /><StatusLine label="Source grounding" value={groundingValue} warn={note.uncertainItems.length > 0} /><StatusLine label="Audio source" value="Transcript" /></div><button className="rail-action" onClick={saveDraft}>Save changes <ArrowRight size={15} /></button></div>
              <div className="rail-card" id="visuals"><div className="rail-card-header"><span className="section-label">SELECTED VISUALS</span><ImageIcon size={17} className="blue-icon" /></div><div className="visual-stack">{note.visualHighlights.map((visual) => <VisualCard key={visual.id} visual={visual} />)}</div><p className="rail-note">Illustrative cards in the foundation build. Frame extraction arrives in Stage 3.</p></div>
              <div className="rail-card media-card"><div className="rail-card-header"><span className="section-label">STAGE 4 · MEDIA LAB</span><ScanText size={17} className="blue-icon" /></div><p>Browser-local capture, image OCR hooks, video frame extraction, and persistent workspace storage are now active.</p><button className="rail-action" onClick={() => mediaRef.current?.click()}>Add media <Upload size={15} /></button>{mediaAssets.length > 0 && <div className="media-assets">{mediaAssets.map((asset) => <div className="media-asset" key={asset.id}><span className="media-asset-icon">{asset.kind === "audio" ? <Mic2 size={13} /> : asset.kind === "video" ? <FileVideo size={13} /> : asset.kind === "image" ? <ImageIcon size={13} /> : <FileText size={13} />}</span><div><strong>{asset.name}</strong><small>{mediaKindLabel(asset.kind)} · {formatFileSize(asset.size)}</small><em>{mediaStatusCopy(asset)}</em></div>{asset.kind === "image" && <button onClick={() => analyzeImage(asset)} disabled={ocrBusy} aria-label={`Run OCR on ${asset.name}`}><ScanText size={13} /></button>}<button onClick={() => removeMediaAsset(asset.id)} aria-label={`Remove ${asset.name}`}><Trash2 size={13} /></button></div>)}</div>}<span className="stage3-badge">{stage4Ready ? "IndexedDB workspace synced" : canGenerateFromMedia(mediaAssets) ? "Transcript source ready" : "Local workspace initializing"}</span></div>
              <div className="rail-card privacy-card"><div className="rail-card-header"><span className="section-label">PRIVACY + CONSENT</span><ShieldCheck size={17} className="blue-icon" /></div><p>{capturePolicy}</p><button className="text-button" onClick={() => setModal("consent")}>Review permissions <ArrowRight size={14} /></button></div>
              <div className="rail-card quick-card"><div className="rail-card-header"><span className="section-label">QUICK ACTIONS</span><Layers3 size={17} className="warm-icon" /></div><button onClick={() => setActiveNav("Transcript")}><Search size={15} /> Search transcript <span>/</span></button><button onClick={() => exportNote("html")}><Download size={15} /> Export HTML <span>↗</span></button><a className="rail-action" href="/lecture-notebook-ai-extension.zip" download><Download size={15} /> Chrome extension <span>ZIP</span></a><button onClick={saveDraft}><Check size={15} /> Save locally <span>⌘S</span></button><button onClick={() => { skipPersistRef.current = true; deleteLocalNote(); clearWorkspace().catch(() => undefined); setMediaAssets([]); setNote(structuredClone(demoLecture)); notify("Notebook and media cleared from this browser."); }}><X size={15} /> Delete local data <span>×</span></button></div>
            </aside>
          </div>

          <section className={`transcript-drawer ${activeNav === "Transcript" ? "focused" : ""}`} id="transcript"><div className="drawer-header"><div><div className="section-label">03 / SOURCE TRANSCRIPT</div><h2>Searchable transcript</h2><p>Every generated note stays close to its timestamped source.</p></div><div className="drawer-tools"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search terms, speakers, timestamps" /><kbd>/</kbd></div><span className="result-count">{filteredTranscript.length} results</span></div></div><div className="transcript-list">{filteredTranscript.map((line) => <div className="transcript-line" id={`transcript-${line.timestamp.replaceAll(":", "-")}`} key={`${line.timestamp}-${line.text}`}><a className="timestamp" href={`#${note.sections.find((section) => section.timeStart <= line.timestamp && section.timeEnd >= line.timestamp)?.id ?? "transcript"}`}>{line.timestamp}</a><div className={`speaker-dot ${line.speaker.toLowerCase().includes("student") ? "student" : ""}`} /><div><strong>{line.speaker}</strong><p>{line.text}</p></div></div>)}</div></section>

          <section className="build-notes" id="build-notes"><div><div className="section-label">BUILD NOTES</div><h2>Reliable before ambitious.</h2><p>Stages 1–2 are working in this MVP. The experience is designed to earn trust before adding media processing or live capture.</p></div><div className="build-report-grid"><ReportItem label="Stage 01" detail={stageReports.stage1} complete /><ReportItem label="Stage 02" detail={stageReports.stage2} complete /><ReportItem label="Tests" detail={`${getTestCases().length} core utility cases planned and covered`} complete /><ReportItem label="Next" detail="Media + OCR + browser capture" /></div><div className="limitations"><strong>Known limitations</strong>{getKnownLimitations().map((item) => <span key={item}>{item}</span>)}</div></section>
          <footer className="site-footer"><span>Lecture Notebook AI · a focused, privacy-first study workspace</span><span>v0.1 · local-first</span></footer>
        </div>
      </main>

      {capturing && <div className="capture-bar"><video ref={videoRef} className="capture-preview" muted playsInline /><div className="capture-live"><span className="recording-dot" /> Recording indicator on</div><div className="capture-timer">{formatTimestamp(elapsed)}</div><div className="capture-topic">Current topic <strong>{note.sections[0]?.heading}</strong></div><div className="audio-meter"><Volume2 size={15} /><span><i style={{ width: "64%" }} /></span><small>64%</small></div><button onClick={() => setPaused((value) => !value)}>{paused ? "Resume" : "Pause"}</button><button onClick={saveFrame}><ImageIcon size={14} /> Save frame</button><button className="stop-capture" onClick={stopCapture}>Stop and save</button></div>}

      {modal && <Modal mode={modal} note={note} consent={consent} setConsent={setConsent} allConsent={allConsent} onClose={() => setModal(null)} onCapture={beginCapture} onImport={() => uploadRef.current?.click()} onDemo={() => { setNote(structuredClone(demoLecture)); setModal(null); notify("Sample transcript loaded."); }} onOpenPrevious={() => { const draft = loadNoteLocally(); if (draft) setNote(draft); setModal(null); notify(draft ? "Previous local notebook opened." : "No saved draft yet — loading the sample notebook instead."); }} />}
      <input ref={uploadRef} type="file" accept=".txt,.md,.vtt,.srt,.json" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
      <input ref={mediaRef} type="file" accept="audio/*,video/*,image/*,.txt,.md,.vtt,.srt,.json" multiple hidden onChange={(event) => handleMediaFiles(event.target.files)} />
    </div>
    </>
  );
}

function StageRow({ number, label, detail, complete = false }: { number: string; label: string; detail: string; complete?: boolean }) {
  return <div className="stage-row"><span className={`stage-number ${complete ? "complete" : ""}`}>{complete ? <Check size={12} /> : number}</span><div><strong>{label}</strong><span>{detail}</span></div>{complete && <CheckCircle2 size={14} className="stage-check" />}</div>;
}

function StatusLine({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return <div className="status-line"><span><i className={warn ? "dot-warn" : "dot-ok"} /> {label}</span><strong className={warn ? "warn-text" : ""}>{value}</strong></div>;
}

function TopicSection({ section, index, editing, onChange }: { section: LectureSection; index: number; editing: boolean; onChange: (value: string) => void }) {
  return <article className="topic-section" id={section.id}><div className="topic-heading"><div className="topic-index">0{index + 1}</div><div><div className="topic-meta"><span>{section.timeStart} — {section.timeEnd}</span><span className="topic-tag">{section.teacherEmphasis.length ? "Remember this" : "Key idea"}</span></div><h3>{section.heading}</h3></div></div>{editing ? <textarea className="explanation-editor" value={section.explanation} onChange={(event) => onChange(event.target.value)} /> : <p className="topic-explanation">{section.explanation}</p>}<div className="key-points"><div className="mini-label">KEY POINTS</div>{section.keyPoints.map((point) => <div className="bullet-point" key={point}><span />{point}</div>)}</div><div className="callout-row">{section.definitions.map((definition) => <div className="callout definition" key={definition.term}><div className="callout-label"><BookOpen size={14} /> Definition</div><strong>{definition.term}</strong><p>{definition.meaning}</p></div>)}{section.formulas.map((formula) => <div className="callout formula" key={formula}><div className="callout-label"><span className="formula-symbol">∑</span> Formula</div><strong>{formula}</strong></div>)}{section.commonMistakes.map((mistake) => <div className="callout mistake" key={mistake}><div className="callout-label"><Sparkles size={14} /> Common mistake</div><p>{mistake}</p></div>)}</div>{section.workedExamples.map((example) => <div className="worked-example" key={example.title}><div className="mini-label"><span>WORKED EXAMPLE</span><span>01</span></div><strong>{example.title}</strong><ol>{example.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>)}</article>;
}

function RevisionSheet({ note }: { note: LectureNote }) {
  return <section className="revision-sheet" id="review"><div className="revision-top"><div><div className="section-label">04 / REVISION SHEET</div><h3>One page before the exam.</h3></div><BookOpenCheck size={22} /></div><div className="revision-grid"><div><div className="mini-label">REMEMBER</div>{note.examReview.map((item) => <p key={item}><Check size={14} />{item}</p>)}</div><div><div className="mini-label">REVIEW QUESTIONS</div>{note.reviewQuestions.map((question, index) => <p key={question}><span>0{index + 1}</span>{question}</p>)}</div></div></section>;
}

function VisualCard({ visual }: { visual: VisualHighlight }) {
  return <div className={`visual-card ${visual.type}`}><div className="visual-art"><span>{visual.type === "equation" ? "Ed = ΔQ / ΔP" : visual.type === "diagram" ? "Q ↕   P ↕" : "P × Q = TR"}</span><small>{visual.timestamp}</small></div><div className="visual-card-copy"><span>{visual.type}</span><strong>{visual.caption}</strong></div></div>;
}

function ReportItem({ label, detail, complete = false }: { label: string; detail: string; complete?: boolean }) {
  return <div className="report-item"><div><span>{label}</span><strong>{complete ? "Implemented" : "Planned next"}</strong></div><p>{detail}</p></div>;
}

function Modal({ mode, note, consent, setConsent, allConsent, onClose, onCapture, onImport, onDemo, onOpenPrevious }: { mode: ModalMode; note: LectureNote; consent: boolean[]; setConsent: (value: boolean[]) => void; allConsent: boolean; onClose: () => void; onCapture: () => void; onImport: () => void; onDemo: () => void; onOpenPrevious: () => void }) {
  const title = mode === "consent" ? "Before you capture" : mode === "import" ? "Start with a transcript" : mode === "about" ? "Privacy + build notes" : "Start a new lecture notebook";
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal-card"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button><div className="modal-kicker">LECTURE NOTEBOOK AI · CONSENT-FIRST</div><h2>{title}</h2>{mode === "consent" && <><p className="modal-intro">This tool is explicit and visible by design. Confirm the checklist before opening the browser permission dialog.</p><div className="consent-list">{consentItems.map((item, index) => <label key={item} className={`consent-item ${consent[index] ? "checked" : ""}`}><input type="checkbox" checked={consent[index]} onChange={(event) => { const next = [...consent]; next[index] = event.target.checked; setConsent(next); }} /><span className="check-box">{consent[index] && <Check size={13} />}</span><span>{item}</span></label>)}</div><div className="modal-note"><ShieldCheck size={16} /> If permission is denied, no capture starts and nothing is uploaded.</div><button className="modal-primary" disabled={!allConsent} onClick={onCapture}>I confirm — continue <ArrowRight size={16} /></button></>}{mode === "import" && <><p className="modal-intro">Generate a grounded notebook from text without live Zoom access. Use the sample or bring your own timestamped transcript.</p><div className="import-options"><button onClick={onDemo}><span className="modal-option-icon"><Sparkles size={18} /></span><span><strong>Use sample transcript</strong><small>ECON 201 · {demoTranscript.split("\n").length} timestamped moments</small></span><ArrowRight size={16} /></button><button onClick={onImport}><span className="modal-option-icon"><Upload size={18} /></span><span><strong>Choose a transcript file</strong><small>TXT, Markdown, VTT, SRT, or JSON</small></span><ArrowRight size={16} /></button></div><div className="modal-note"><FileText size={16} /> {note.title === demoLecture.title ? "The sample notebook is currently loaded." : "Your imported transcript stays in this browser in the demo."}</div></>}{mode === "new" && <><p className="modal-intro">Choose how you want to create the next notebook. Start with the transcript-only path when you do not have live class access.</p><div className="import-options"><button onClick={onDemo}><span className="modal-option-icon"><FileText size={18} /></span><span><strong>Transcript-only demo</strong><small>Reliable foundation · works offline</small></span><ArrowRight size={16} /></button><button onClick={onClose}><span className="modal-option-icon"><Radio size={18} /></span><span><strong>Live browser capture</strong><small>Review the consent checklist first</small></span><ArrowRight size={16} /></button></div></>}{mode === "about" && <><p className="modal-intro">A reliable transcript-first foundation before media capture. Stage 1 and Stage 2 are implemented here; media and live capture are deliberately next.</p><div className="about-grid"><div><strong>Local-first</strong><span>Drafts stay in browser storage.</span></div><div><strong>Grounded</strong><span>Unclear items remain timestamped.</span></div><div><strong>No auto-join</strong><span>Zoom is never joined or bypassed.</span></div><div><strong>Structured</strong><span>JSON first, notebook second.</span></div></div><button className="modal-primary" onClick={onClose}>Back to notebook <ArrowRight size={16} /></button></>}</div></div>;
}
