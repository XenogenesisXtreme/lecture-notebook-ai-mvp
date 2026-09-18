let recorder;
let stream;
let chunks = [];

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "offscreen-start-recording") {
    begin(message.streamId).then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message.type === "offscreen-stop-recording") stop();
});

async function begin(streamId) {
  if (recorder?.state === "recording") throw new Error("A recording is already active.");
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: streamId } }, video: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: streamId } } });
  } catch {
    stream = await navigator.mediaDevices.getUserMedia({ video: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: streamId } } });
  }
  chunks = [];
  recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = finish;
  recorder.start(1000);
  chrome.runtime.sendMessage({ type: "recording-started", startedAt: new Date().toISOString() });
}

function stop() {
  if (recorder?.state === "recording") recorder.stop();
}

async function finish() {
  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const filename = `lecture-notebook-recording-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
  await chrome.downloads.download({ url, filename, saveAs: true });
  stream?.getTracks().forEach((track) => track.stop());
  stream = undefined;
  recorder = undefined;
  chunks = [];
  chrome.runtime.sendMessage({ type: "recording-finished", message: "Recording downloaded locally." });
}
