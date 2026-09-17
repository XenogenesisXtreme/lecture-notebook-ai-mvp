export default function Privacy() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 22px", lineHeight: 1.65 }}>
      <div style={{ color: "#16b9c9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em" }}>LECTURE NOTEBOOK AI · PRIVACY</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 42, lineHeight: 1.1 }}>Privacy policy</h1>
      <p>Lecture Notebook AI is designed as a local-first study workspace. This policy applies to the website and the Chrome extension.</p>
      <p><strong>Short version:</strong> the extension does not sell data, inject ads, read page content by default, or send notebook data to a remote server.</p>
      <h2>Data handled locally</h2>
      <p>The workspace may store notebooks, transcripts, media metadata, review decisions, and extension voice-note drafts in your browser&apos;s local storage or IndexedDB. You can delete this data from the workspace at any time.</p>
      <h2>Extension permissions</h2>
      <p>The extension uses storage for local voice-note drafts and active-tab access for its user-invoked page controls. Its content script adds a visible control dock on pages containing video or audio elements. It does not automatically record, transcribe, capture a tab, or upload page content.</p>
      <h2>Speech recognition and capture</h2>
      <p>Speech recognition, microphone capture, tab capture, and OCR are optional browser features. They run only after a user action and browser permission. Availability and processing behavior can vary by browser and operating system.</p>
      <h2>Contact</h2>
      <p>For project questions, visit the <a href="https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp">public repository</a>.</p>
      <p>Last updated: September 17, 2026.</p>
    </main>
  );
}
