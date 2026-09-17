const APP_URL = "https://lecturenoteb-hxgiwwjj.manus.space/";
const PRIVACY_URL = `${APP_URL}privacy.html`;
const status = document.querySelector("#status");

document.querySelector("#open").addEventListener("click", () => chrome.tabs.create({ url: APP_URL }));
document.querySelector("#privacy").addEventListener("click", () => chrome.tabs.create({ url: PRIVACY_URL }));

chrome.storage.local.get({ voiceDrafts: [] }, ({ voiceDrafts }) => {
  status.textContent = voiceDrafts.length ? `${voiceDrafts.length} local voice note${voiceDrafts.length === 1 ? "" : "s"} saved.` : "No local voice notes yet.";
});
