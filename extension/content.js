(() => {
  if (window.top !== window.self || document.getElementById("lecture-notebook-ai-dock")) return;

  const APP_URL = "https://lecturenoteb-hxgiwwjj.manus.space/";
  const hasMedia = document.querySelector("video, audio");
  if (!hasMedia) return;

  const dock = document.createElement("aside");
  dock.id = "lecture-notebook-ai-dock";
  dock.setAttribute("aria-label", "Lecture Notebook AI controls");
  dock.innerHTML = `
    <div class="ln-head"><img src="${chrome.runtime.getURL("icons/icon32.png")}" alt=""><strong>Lecture Notebook AI</strong><button class="ln-close" aria-label="Hide controls">×</button></div>
    <p class="ln-copy">Permission-based controls for this media page. Nothing starts automatically.</p>
    <div class="ln-actions"><button class="ln-open">Open workspace</button><button class="ln-note">Start voice note</button></div>
    <div class="ln-status" role="status">Ready when you are.</div>
  `;
  const style = document.createElement("style");
  style.textContent = `
    #lecture-notebook-ai-dock{position:fixed;right:18px;bottom:18px;z-index:2147483647;width:260px;padding:13px;border:1px solid #2e6670;border-radius:14px;background:#08111bf2;color:#e8f7f5;box-shadow:0 12px 34px #0008;font:12px system-ui,sans-serif}
    #lecture-notebook-ai-dock *{box-sizing:border-box}.ln-head{display:flex;align-items:center;gap:8px}.ln-head img{width:24px;height:24px;border-radius:6px}.ln-head strong{font:700 13px Georgia,serif}.ln-close{margin-left:auto;border:0;background:transparent;color:#89a8b2;font-size:18px;cursor:pointer}.ln-copy{margin:9px 0;color:#89a8b2;line-height:1.4;font-size:11px}.ln-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.ln-actions button{border:0;border-radius:7px;padding:8px 6px;background:#5be7ff;color:#061019;font-size:11px;font-weight:800;cursor:pointer}.ln-actions .ln-note{background:#b9ded1}.ln-actions button:disabled{opacity:.55;cursor:wait}.ln-status{margin-top:9px;min-height:15px;color:#9dd8c7;font-size:10px}
  `;
  document.documentElement.append(style, dock);

  const status = dock.querySelector(".ln-status");
  const noteButton = dock.querySelector(".ln-note");
  let recognition;
  let transcript = "";

  dock.querySelector(".ln-close").addEventListener("click", () => dock.remove());
  dock.querySelector(".ln-open").addEventListener("click", () => window.open(APP_URL, "_blank", "noopener,noreferrer"));

  noteButton.addEventListener("click", () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      status.textContent = "Speech recognition is unavailable in this browser.";
      return;
    }
    if (recognition) {
      recognition.stop();
      return;
    }

    transcript = "";
    recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = document.documentElement.lang || "en-US";
    recognition.onstart = () => {
      noteButton.textContent = "Stop voice note";
      status.textContent = "Listening after browser permission…";
    };
    recognition.onresult = (event) => {
      transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ").trim();
      status.textContent = transcript ? `${transcript.slice(-96)}${transcript.length > 96 ? "…" : ""}` : "Listening…";
    };
    recognition.onerror = (event) => {
      status.textContent = event.error === "not-allowed" ? "Microphone permission was not granted." : `Voice note error: ${event.error}.`;
    };
    recognition.onend = () => {
      const draft = { text: transcript, source: location.href, title: document.title, createdAt: new Date().toISOString() };
      if (draft.text) {
        chrome.storage.local.get({ voiceDrafts: [] }, ({ voiceDrafts }) => {
          chrome.storage.local.set({ voiceDrafts: [...voiceDrafts, draft].slice(-25) });
        });
        status.textContent = "Voice note saved locally. Open the workspace to continue.";
      } else if (!status.textContent.includes("permission")) {
        status.textContent = "No words captured; nothing was saved.";
      }
      recognition = undefined;
      noteButton.textContent = "Start voice note";
    };
    recognition.start();
  });
})();
