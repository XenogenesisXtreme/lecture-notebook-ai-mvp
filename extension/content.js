(() => {
  if (window.top !== window.self || document.getElementById("lecture-notebook-ai-launcher")) return;
  const launcher = document.createElement("button");
  launcher.id = "lecture-notebook-ai-launcher";
  launcher.textContent = "LN";
  launcher.title = "Open Lecture Notebook AI";
  Object.assign(launcher.style, { position: "fixed", right: "18px", bottom: "18px", zIndex: "2147483647", width: "38px", height: "38px", border: "1px solid #5be7ff", borderRadius: "50%", background: "#08111b", color: "#5be7ff", font: "800 12px system-ui", cursor: "pointer", boxShadow: "0 0 20px rgba(91,231,255,.28)" });
  launcher.addEventListener("click", () => window.open("https://lecturenoteb-hxgiwwjj.manus.space/", "_blank", "noopener"));
  document.documentElement.appendChild(launcher);
})();
