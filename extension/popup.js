const APP_URL = "https://lecturenoteb-hxgiwwjj.manus.space/";
document.querySelector("#open").addEventListener("click", () => chrome.tabs.create({ url: APP_URL }));
