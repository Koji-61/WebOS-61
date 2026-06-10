const folders = {
  desktop: {
    title: "Desktop",
    path: "/Users/koji/Desktop",
    items: [
      { name: "Terminal", type: "app", app: "terminal", icon: "terminal-icon" },
      { name: "Chrome", type: "app", app: "chrome", icon: "chrome-icon" },
      { name: "About.md", type: "file" },
      { name: "WebOS Notes", type: "folder", color: "blue" }
    ]
  },
  downloads: {
    title: "Downloads",
    path: "/Users/koji/Downloads",
    items: [
      { name: "demo-recording.mov", type: "file" },
      { name: "wallpaper-pack.zip", type: "file" },
      { name: "github-readme.md", type: "file" }
    ]
  },
  applications: {
    title: "Programme",
    path: "/Applications",
    items: [
      { name: "Finder", type: "app", app: "finder", icon: "finder-icon" },
      { name: "Terminal", type: "app", app: "terminal", icon: "terminal-icon" },
      { name: "Chrome", type: "app", app: "chrome", icon: "chrome-icon" },
      { name: "About", type: "app", app: "about", icon: "about-icon" }
    ]
  },
  documents: {
    title: "Dokumente",
    path: "/Users/koji/Documents",
    items: [
      { name: "Portfolio Plan.pages", type: "file" },
      { name: "WebOS-61 README.md", type: "file" },
      { name: "Ideas", type: "folder", color: "violet" }
    ]
  },
  pictures: {
    title: "Bilder",
    path: "/Users/koji/Pictures",
    items: [
      { name: "desktop-preview.png", type: "file" },
      { name: "chrome-concept.png", type: "file" },
      { name: "wallpapers", type: "folder", color: "green" }
    ]
  }
};

const windows = [...document.querySelectorAll(".window")];
const desktop = document.querySelector("#desktop");
let topZ = 30;
let dragState = null;

const terminalOutput = document.querySelector("#terminal-output");
const terminalInput = document.querySelector("#terminal-input");
const terminalForm = document.querySelector("#terminal-form");
const finderGrid = document.querySelector("#finder-grid");
const finderTitle = document.querySelector("#finder-title");
const finderCount = document.querySelector("#finder-count");
const finderPath = document.querySelector("#finder-path");
const chromeInput = document.querySelector("#chrome-input");
const chromeHomeInput = document.querySelector("#chrome-home-input");
const chromePage = document.querySelector("#chrome-page");
const chromeWebview = document.querySelector("#chrome-webview");
const chromeFrame = document.querySelector("#chrome-frame");
const chromeStatusText = document.querySelector("#chrome-status-text");
const chromeExternalLink = document.querySelector("#chrome-external-link");
const chromeBack = document.querySelector("#chrome-back");
const chromeForward = document.querySelector("#chrome-forward");
const chromeReload = document.querySelector("#chrome-reload");
const chromeHomeSubmit = document.querySelector("#chrome-home-submit");
let chromeHistory = [];
let chromeHistoryIndex = -1;

function setClock() {
  const now = new Date();
  document.querySelector("#clock").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function focusWindow(app) {
  const win = document.querySelector(`[data-app="${app}"]`);
  if (!win) return;
  win.classList.remove("minimized");
  win.classList.add("open", "focused");
  win.style.zIndex = String(++topZ);
  windows.forEach((item) => {
    if (item !== win) item.classList.remove("focused");
  });
  updateDockState();
  requestAnimationFrame(() => keepWindowVisible(win));
  if (app === "terminal") {
    setTimeout(() => terminalInput.focus(), 80);
  }
}

function closeWindow(app) {
  const win = document.querySelector(`[data-app="${app}"]`);
  if (!win) return;
  win.classList.remove("open", "active", "focused", "minimized", "maximized");
  updateFullscreenState();
  updateDockState();
}

function minimizeWindow(win) {
  win.classList.add("minimized");
  win.classList.remove("focused");
  updateFullscreenState();
  updateDockState();
}

function toggleMaximize(win) {
  const shouldMaximize = !win.classList.contains("maximized");
  ["top", "left", "height"].forEach((property) => win.style.removeProperty(property));
  win.classList.toggle("maximized", shouldMaximize);
  focusWindow(win.dataset.app);
  updateFullscreenState();
}

function updateDockState() {
  document.querySelectorAll(".dock [data-open-app]").forEach((button) => {
    const app = button.dataset.openApp;
    const win = document.querySelector(`[data-app="${app}"]`);
    button.classList.toggle("running", Boolean(win?.classList.contains("open")));
  });
}

function updateFullscreenState() {
  const hasFullscreen = windows.some((win) =>
    win.classList.contains("open") &&
    !win.classList.contains("minimized") &&
    win.classList.contains("maximized")
  );
  desktop.classList.toggle("fullscreen-active", hasFullscreen);
}

function keepWindowVisible(win) {
  if (win.classList.contains("maximized") || win.classList.contains("minimized")) return;
  const rect = win.getBoundingClientRect();
  const dock = document.querySelector(".dock").getBoundingClientRect();
  const safeTop = 46;
  const safeBottom = Math.min(window.innerHeight - 106, dock.top - 14);
  const safeRight = window.innerWidth - 12;

  if (rect.top < safeTop) {
    win.style.setProperty("top", `${safeTop}px`, "important");
  }

  if (rect.left < 12) {
    win.style.setProperty("left", "12px", "important");
  }

  if (rect.right > safeRight) {
    win.style.setProperty("left", `${Math.max(12, safeRight - rect.width)}px`, "important");
  }

  if (rect.bottom > safeBottom) {
    const nextHeight = Math.max(240, safeBottom - Math.max(rect.top, safeTop));
    win.style.setProperty("height", `${nextHeight}px`, "important");
    if (rect.top < safeTop) {
      win.style.setProperty("top", `${safeTop}px`, "important");
    }
  }
}

document.querySelectorAll("[data-open-app]").forEach((button) => {
  button.addEventListener("click", () => focusWindow(button.dataset.openApp));
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    closeWindow(button.dataset.close);
  });
});

windows.forEach((win) => {
  win.addEventListener("pointerdown", () => focusWindow(win.dataset.app));
  const chrome = win.querySelector(".window-chrome");
  const minimize = win.querySelector(".minimize");
  const maximize = win.querySelector(".maximize");

  minimize.addEventListener("click", (event) => {
    event.stopPropagation();
    minimizeWindow(win);
  });

  maximize.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMaximize(win);
  });

  chrome.addEventListener("pointerdown", (event) => {
    if (event.target.matches("button")) return;
    if (win.classList.contains("maximized")) return;
    const rect = win.getBoundingClientRect();
    dragState = {
      win,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top
    };
    chrome.setPointerCapture(event.pointerId);
  });
});

window.addEventListener("pointermove", (event) => {
  if (!dragState) return;
  const left = dragState.left + event.clientX - dragState.startX;
  const top = dragState.top + event.clientY - dragState.startY;
  dragState.win.style.left = `${Math.max(8, Math.min(left, window.innerWidth - 180))}px`;
  dragState.win.style.top = `${Math.max(42, Math.min(top, window.innerHeight - 120))}px`;
});

window.addEventListener("pointerup", () => {
  dragState = null;
});

function renderFinder(folderKey) {
  const folder = folders[folderKey];
  if (!folder) return;
  document.querySelectorAll(".finder-place").forEach((place) => {
    place.classList.toggle("active", place.dataset.folder === folderKey);
  });
  finderTitle.textContent = folder.title;
  finderPath.textContent = folder.path;
  finderCount.textContent = `${folder.items.length} items`;
  finderGrid.innerHTML = folder.items.map((item) => {
    const visual =
      item.type === "folder"
        ? `<span class="folder ${item.color || "blue"}"></span>`
        : item.type === "app"
          ? `<span class="app-icon-large ${item.icon}"></span>`
          : `<span class="file-icon"></span>`;
    const appAttr = item.app ? ` data-open-app="${item.app}"` : "";
    return `<button class="finder-item"${appAttr}>${visual}<span>${item.name}</span></button>`;
  }).join("");
  finderGrid.querySelectorAll("[data-open-app]").forEach((button) => {
    button.addEventListener("click", () => focusWindow(button.dataset.openApp));
  });
}

document.querySelectorAll(".finder-place").forEach((place) => {
  place.addEventListener("click", () => renderFinder(place.dataset.folder));
});

function getChromeTarget(query) {
  const value = query.trim();
  if (!value) return null;
  const looksLikeUrl = value.startsWith("http://") || value.startsWith("https://") || /^[\w-]+\.[\w.-]+/.test(value);
  const url = looksLikeUrl
    ? value.replace(/^(?!https?:\/\/)/, "https://")
    : `https://www.google.com/search?igu=1&q=${encodeURIComponent(value)}`;
  return { value, url };
}

function updateChromeButtons() {
  chromeBack.disabled = chromeHistoryIndex <= 0;
  chromeForward.disabled = chromeHistoryIndex >= chromeHistory.length - 1;
}

function loadChromeUrl(url, label = url, pushHistory = true) {
  chromePage.hidden = true;
  chromeWebview.hidden = false;
  chromeInput.value = label;
  chromeStatusText.textContent = `Loading ${label}`;
  chromeExternalLink.href = url;
  chromeFrame.src = url;

  if (pushHistory) {
    chromeHistory = chromeHistory.slice(0, chromeHistoryIndex + 1);
    chromeHistory.push({ url, label });
    chromeHistoryIndex = chromeHistory.length - 1;
  }
  updateChromeButtons();
}

function runChromeSearch(query) {
  const target = getChromeTarget(query);
  if (!target) return;
  loadChromeUrl(target.url, target.value);
}

chromeFrame.addEventListener("load", () => {
  chromeStatusText.textContent = "Loaded";
});

chromeBack.addEventListener("click", () => {
  if (chromeHistoryIndex <= 0) return;
  chromeHistoryIndex -= 1;
  const item = chromeHistory[chromeHistoryIndex];
  loadChromeUrl(item.url, item.label, false);
});

chromeForward.addEventListener("click", () => {
  if (chromeHistoryIndex >= chromeHistory.length - 1) return;
  chromeHistoryIndex += 1;
  const item = chromeHistory[chromeHistoryIndex];
  loadChromeUrl(item.url, item.label, false);
});

chromeReload.addEventListener("click", () => {
  if (chromeWebview.hidden || chromeHistoryIndex < 0) return;
  chromeStatusText.textContent = "Reloading...";
  chromeFrame.src = chromeHistory[chromeHistoryIndex].url;
});

function showChromeHome() {
  chromeWebview.hidden = true;
  chromePage.hidden = false;
  chromeInput.value = "";
  chromeHomeInput.value = "";
  chromeStatusText.textContent = "Ready";
}

document.querySelector(".chrome-bar button[aria-label='Reload']").addEventListener("dblclick", showChromeHome);

/*
  This app runs inside a normal webpage, so it cannot become a full native browser engine.
  The iframe webview loads real embeddable pages and Google's embeddable search variant.
  Sites that block iframe embedding can still be opened through the external link.
*/
function explainChromeLimit() {
  return "Some sites block being shown inside another website. Use the Open in new tab button when that happens.";
}

window.webOSChrome = { runChromeSearch, loadChromeUrl, explainChromeLimit };

document.querySelector("#chrome-form").addEventListener("submit", (event) => {
  event.preventDefault();
  runChromeSearch(chromeInput.value);
});

document.querySelector("#chrome-home-form").addEventListener("submit", (event) => {
  event.preventDefault();
  runChromeSearch(chromeHomeInput.value);
});

chromeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    runChromeSearch(chromeInput.value);
  }
});

chromeHomeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    runChromeSearch(chromeHomeInput.value);
  }
});

chromeHomeSubmit.addEventListener("click", (event) => {
  event.preventDefault();
  runChromeSearch(chromeHomeInput.value);
});

document.querySelectorAll("[data-search]").forEach((button) => {
  button.addEventListener("click", () => runChromeSearch(button.dataset.search));
});

function printTerminal(html, className = "") {
  const line = document.createElement("p");
  line.className = className;
  line.innerHTML = html;
  terminalOutput.append(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

const commands = {
  help() {
    printTerminal("Commands: <strong>about</strong>, <strong>skills</strong>, <strong>open finder</strong>, <strong>open chrome</strong>, <strong>open terminal</strong>, <strong>clear</strong>");
  },
  about() {
    printTerminal("WebOS-61 is a browser-based mini operating system built to make a GitHub profile feel interactive and engineered.");
  },
  skills() {
    printTerminal("Window manager · Finder filesystem mock · terminal parser · Chrome search app · responsive desktop UI");
  },
  clear() {
    terminalOutput.innerHTML = "";
  }
};

function runTerminalCommand(event) {
  event.preventDefault();
  const value = terminalInput.value.trim();
  if (!value) return;
  printTerminal(`<span class="muted">koji@WebOS-61 %</span> ${value}`);
  terminalInput.value = "";

  if (value === "open finder") {
    focusWindow("finder");
    printTerminal("Opening Finder...");
    return;
  }

  if (value === "open chrome") {
    focusWindow("chrome");
    printTerminal("Opening Chrome...");
    return;
  }

  if (value === "open terminal") {
    focusWindow("terminal");
    printTerminal("Terminal is already active.");
    return;
  }

  const command = commands[value];
  if (command) {
    command();
  } else {
    printTerminal(`Command not found: ${value}. Type <strong>help</strong>.`);
  }
}

terminalForm.addEventListener("submit", runTerminalCommand);

terminalInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runTerminalCommand(event);
  }
});

setClock();
setInterval(setClock, 1000);
renderFinder("desktop");
printTerminal("Welcome to WebOS-61. Type <strong>help</strong> to start.");
