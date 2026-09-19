let recorder;
let stream;
let preview;
let chunks = [];

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "offscreen-start-recording") {
    begin(message.streamId).then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message.type === "offscreen-stop-recording") { stop(); sendResponse({ ok: true }); }
  if (message.type === "offscreen-pause-recording") { recorder?.pause(); sendResponse({ ok: true }); }
  if (message.type === "offscreen-resume-recording") { recorder?.resume(); sendResponse({ ok: true }); }
  if (message.type === "offscreen-save-recording-frame") {
    saveFrame().then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function begin(streamId) {
  if (recorder?.state === "recording") throw new Error("A recording is already active.");
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: streamId } }, video: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: streamId } } });
  } catch {
    stream = await navigator.mediaDevices.getUserMedia({ video: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: streamId } } });
  }
  preview = document.createElement("video");
  preview.muted = true;
  preview.srcObject = stream;
  await preview.play();
  chunks = [];
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
  recorder = new MediaRecorder(stream, { mimeType });
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = finish;
  recorder.start(1000);
  chrome.runtime.sendMessage({ type: "recording-started", startedAt: new Date().toISOString() });
}

function stop() {
  if (recorder?.state === "recording" || recorder?.state === "paused") recorder.stop();
}

async function saveFrame() {
  if (!preview?.videoWidth || !preview.videoHeight) throw new Error("The selected source has no capturable frame yet.");
  const canvas = document.createElement("canvas");
  canvas.width = preview.videoWidth;
  canvas.height = preview.videoHeight;
  canvas.getContext("2d")?.drawImage(preview, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not capture a frame.");
  const url = URL.createObjectURL(blob);
  await chrome.downloads.download({ url, filename: `lecture-frame-${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`, saveAs: true });
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function finish() {
  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const filename = `lecture-notebook-recording-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
  await chrome.downloads.download({ url, filename, saveAs: true });
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  stream?.getTracks().forEach((track) => track.stop());
  stream = undefined;
  preview = undefined;
  recorder = undefined;
  chunks = [];
  chrome.runtime.sendMessage({ type: "recording-finished", message: "Recording downloaded locally. Review notes in the workspace.", recording: { blob, name: filename, sourceTitle: "Recorded source" } });
}
