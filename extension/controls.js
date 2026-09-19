(() => {
  if (window.__lectureNotebookRecordingControls) return;
  window.__lectureNotebookRecordingControls = true;

  const host = document.createElement("div");
  host.id = "lecture-notebook-recording-controls";
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .bar { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 2147483647; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid #2e796d; border-radius: 13px; color: #e8f7f5; background: #08111bf5; box-shadow: 0 12px 40px #0009; font: 700 12px system-ui, sans-serif; }
      .dot { width: 9px; height: 9px; border-radius: 50%; background: #ff8090; box-shadow: 0 0 12px #ff8090; }
      .timer { min-width: 48px; color: #c8eee4; font-variant-numeric: tabular-nums; }
      button { border: 1px solid #356b63; border-radius: 7px; padding: 7px 9px; color: #b8dfd0; background: #153a3b; cursor: pointer; font: 700 11px system-ui, sans-serif; }
      button:hover { background: #225a59; } button.stop { color: #190c10; border-color: #ff8090; background: #ff8090; } button:disabled { opacity: .55; cursor: wait; }
      .status { max-width: 170px; color: #9ab4b5; font-size: 10px; font-weight: 500; }
    </style>
    <div class="bar" role="region" aria-label="Lecture Notebook AI recording controls">
      <span class="dot"></span><strong>Recording</strong><span class="timer">00:00</span>
      <button data-action="pause">Pause</button><button data-action="frame">Save frame</button><button class="stop" data-action="stop">Stop and save</button><span class="status" role="status"></span>
    </div>
  `;
  document.documentElement.appendChild(host);

  const timer = shadow.querySelector(".timer");
  const status = shadow.querySelector(".status");
  const pause = shadow.querySelector('[data-action="pause"]');
  const frame = shadow.querySelector('[data-action="frame"]');
  const stop = shadow.querySelector('[data-action="stop"]');
  const startedAt = Date.now();
  let paused = false;

  const tick = () => {
    if (!paused) {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      timer.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    }
  };
  const interval = window.setInterval(tick, 500);
  pause.addEventListener("click", () => {
    paused = !paused;
    pause.textContent = paused ? "Resume" : "Pause";
    chrome.runtime.sendMessage({ type: paused ? "pause-recording" : "resume-recording" });
    status.textContent = paused ? "Recording paused" : "Recording resumed";
  });
  frame.addEventListener("click", () => {
    frame.disabled = true;
    chrome.runtime.sendMessage({ type: "save-recording-frame" }).then((response) => { status.textContent = response?.ok ? "Frame saved locally" : (response?.error || "Frame unavailable"); }).finally(() => { frame.disabled = false; });
  });
  stop.addEventListener("click", () => {
    stop.disabled = true;
    status.textContent = "Saving recording…";
    chrome.runtime.sendMessage({ type: "stop-recording" });
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "recording-finished" || message.type === "recording-error") {
      clearInterval(interval);
      host.remove();
    }
  });
})();
