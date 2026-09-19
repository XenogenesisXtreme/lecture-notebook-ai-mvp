const OFFSCREEN_URL = "offscreen.html";
const APP_URL = "https://lecturenoteb-hxgiwwjj.manus.space/?review=recording";
let creatingOffscreen;
let recordingTabId;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "start-recording") {
    recordingTabId = message.tabId;
    startRecording(message.streamId).then(async () => {
      if (recordingTabId !== undefined) {
        try { await chrome.scripting.executeScript({ target: { tabId: recordingTabId }, files: ["controls.js"] }); } catch { /* chrome:// pages cannot be injected; popup remains available */ }
      }
      sendResponse({ ok: true });
    }).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (["stop-recording", "pause-recording", "resume-recording", "save-recording-frame"].includes(message.type)) {
    chrome.runtime.sendMessage({ type: `offscreen-${message.type}` }).then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function ensureOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"], documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)] });
  if (contexts.length) return;
  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen.createDocument({ url: OFFSCREEN_URL, reasons: ["USER_MEDIA"], justification: "Record a tab, window, or screen only after the user selects it in Chrome's picker." });
  }
  await creatingOffscreen;
  creatingOffscreen = undefined;
}

async function startRecording(streamId) {
  await ensureOffscreenDocument();
  const response = await chrome.runtime.sendMessage({ type: "offscreen-start-recording", streamId });
  if (!response?.ok) throw new Error(response?.error || "Could not start recording.");
  await chrome.storage.local.set({ recordingState: { active: true, startedAt: new Date().toISOString() } });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "recording-started") chrome.storage.local.set({ recordingState: { active: true, startedAt: message.startedAt } });
  if (message.type === "recording-finished") {
    chrome.storage.local.set({ recordingState: { active: false } });
    if (recordingTabId !== undefined) chrome.tabs.sendMessage(recordingTabId, { type: "recording-finished" }).catch(() => undefined);
    chrome.tabs.create({ url: APP_URL }).then((tab) => {
      if (tab.id === undefined) return;
      const deliver = () => chrome.tabs.sendMessage(tab.id, { type: "deliver-recording", recording: message.recording }).catch(() => undefined);
      chrome.tabs.onUpdated.addListener(function ready(tabId, info) {
        if (tabId !== tab.id || info.status !== "complete") return;
        chrome.tabs.onUpdated.removeListener(ready);
        deliver();
      });
      chrome.storage.local.set({ reviewTabId: tab.id });
    }).catch(() => undefined);
    recordingTabId = undefined;
  }
  if (message.type === "recording-error") {
    chrome.storage.local.set({ recordingState: { active: false } });
    if (recordingTabId !== undefined) chrome.tabs.sendMessage(recordingTabId, { type: "recording-error" }).catch(() => undefined);
    recordingTabId = undefined;
  }
});
