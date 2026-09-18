const APP_URL = "https://lecturenoteb-hxgiwwjj.manus.space/";
const status = document.querySelector("#status");
const openButton = document.querySelector("#open");
const recordButton = document.querySelector("#record");

openButton.addEventListener("click", () => chrome.tabs.create({ url: APP_URL }));
recordButton.addEventListener("click", startRecording);

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "recording-error") setStatus(message.message);
  if (message.type === "recording-started") setRecordingState(true);
  if (message.type === "recording-finished") setRecordingState(false, message.message);
});

chrome.storage.local.get({ recordingState: { active: false } }, ({ recordingState }) => setRecordingState(recordingState.active));

function setStatus(message) { status.textContent = message; }

function setRecordingState(active, message) {
  recordButton.classList.toggle("stop", active);
  recordButton.classList.toggle("secondary", !active);
  recordButton.querySelector(".option-title").textContent = active ? "Stop recording" : "Start recording";
  recordButton.querySelector(".option-copy").textContent = active ? "Save the local WebM file" : "Choose a tab, window, or screen";
  if (message) setStatus(message);
  else if (active) setStatus("Recording in progress. Open this widget to stop it.");
  else setStatus("Ready when you are.");
}

async function startRecording() {
  const { recordingState } = await chrome.storage.local.get({ recordingState: { active: false } });
  if (recordingState.active) {
    chrome.runtime.sendMessage({ type: "stop-recording" });
    setStatus("Finishing recording and preparing the download…");
    return;
  }

  recordButton.disabled = true;
  setStatus("Choose a tab, window, or screen in Chrome&apos;s picker…");
  chrome.desktopCapture.chooseDesktopMedia(["screen", "window", "tab", "audio"], async (streamId) => {
    recordButton.disabled = false;
    if (!streamId) {
      setStatus("Recording cancelled. Nothing was captured.");
      return;
    }
    try {
      await chrome.runtime.sendMessage({ type: "start-recording", streamId });
      setRecordingState(true);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not start recording.");
    }
  });
}
