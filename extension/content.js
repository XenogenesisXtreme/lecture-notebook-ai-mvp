(() => {
  if (window.top !== window.self || window.__lectureNotebookBridgeReady) return;
  window.__lectureNotebookBridgeReady = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "deliver-recording" && message.recording?.blob) {
      window.postMessage({ type: "lecture-notebook-recording", blob: message.recording.blob, name: message.recording.name, sourceTitle: message.recording.sourceTitle }, "*");
    }
  });

  window.addEventListener("message", async (event) => {
    if (event.source !== window || event.data?.type !== "lecture-notebook-recording") return;
    const { blob, name, sourceTitle } = event.data;
    if (!(blob instanceof Blob)) return;
    const file = new File([blob], name || `lecture-recording-${Date.now()}.webm`, { type: blob.type || "video/webm" });
    window.dispatchEvent(new CustomEvent("lecture-notebook-recording-ready", { detail: { file, sourceTitle } }));
  });
})();
