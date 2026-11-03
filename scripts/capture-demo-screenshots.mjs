// Captures 1280x800 screenshots of the live demos into public/projects/<id>/.
// Drives headless Edge or Chrome over the DevTools protocol, so it can click and fill forms first.
// Set BROWSER_PATH if Edge or Chrome is not found. Pass project ids to capture only those.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const WIDTH = 1280;
const HEIGHT = 800;

const BROWSERS = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

// Runs in the page before each step. Text goes in through insertText so the app sees real input events.
const PAGE_HELPERS = `
  window.__wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  window.__waitFor = async (selector, timeoutMs = 8000) => {
    for (let waited = 0; waited < timeoutMs; waited += 100) {
      if (document.querySelector(selector)) return;
      await window.__wait(100);
    }
    throw new Error("Timed out waiting for: " + selector);
  };
  window.__waitUntilGone = async (selector, timeoutMs = 8000) => {
    for (let waited = 0; waited < timeoutMs; waited += 100) {
      if (!document.querySelector(selector)) return;
      await window.__wait(100);
    }
    throw new Error("Still showing: " + selector);
  };
  window.__waitForText = async (text, timeoutMs = 8000) => {
    for (let waited = 0; waited < timeoutMs; waited += 100) {
      if (window.__byText(text)) return;
      await window.__wait(100);
    }
    throw new Error("Timed out waiting for text: " + text);
  };
  window.__byText = (text, selector = "*") =>
    [...document.querySelectorAll(selector)].reverse().find((el) => el.textContent.trim() === text);
  window.__click = async (text, selector) => {
    const el = window.__byText(text, selector);
    if (!el) throw new Error("Nothing to click with text: " + text);
    el.click();
    await window.__wait(600);
  };
  window.__fill = (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error("No field: " + selector);
    if (el.tagName === "SELECT") {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(el, value);
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    el.focus();
    el.select?.();
    document.execCommand("insertText", false, String(value));
  };
`;

const addCalTrackRecord = (category, details, calories) => `
  await __click("Track Food", "button");
  await __waitFor("#date");
  __fill("#category", "${category}");
  __fill("#details", "${details}");
  __fill("#calories", "${calories}");
  await __click("Add Record", "button");
  await __waitFor('[aria-label^="View details for ${details}"]');
  await __waitUntilGone("[role=dialog]");
`;

// Each shot runs its steps after the previous shot, in the same page.
const DEMOS = {
  kanban: {
    url: "https://flowban-app.netlify.app/",
    shots: [
      { file: "board.png", steps: 'await __waitForText("Platform Launch", 20000); await __wait(800);' },
      {
        file: "task-details.png",
        steps: `
          await __click("Build React Project");
          // The modal focuses and selects the title, which would show as a highlight.
          document.activeElement.blur();
          getSelection().removeAllRanges();
          await __wait(400);
        `,
      },
    ],
  },
  caltrack: {
    url: "https://clatrack.netlify.app/",
    shots: [
      {
        file: "tracker.png",
        steps: `
          await __waitFor('a[href="/track"]', 20000);
          // The demo has no SPA fallback, so /track 404s on a full page load. Route inside the app instead.
          history.pushState({}, "", "/track");
          dispatchEvent(new PopStateEvent("popstate"));
          await __waitForText("Track Food");
          ${addCalTrackRecord("Breakfast", "Oatmeal with banana", 350)}
          ${addCalTrackRecord("Lunch", "Grilled chicken salad", 520)}
          ${addCalTrackRecord("Sport", "Morning run", -300)}
          ${addCalTrackRecord("Dinner", "Lentil soup and bread", 610)}
        `,
      },
      {
        // The form checks input as you type: sport must burn calories, so a positive value shows a warning.
        file: "form-validation.png",
        steps: `
          await __click("Track Food", "button");
          await __waitFor("#category");
          __fill("#category", "Sport");
          __fill("#details", "Evening swim");
          __fill("#calories", "250");
          await __click("Add Record", "button");
          await __waitForText("Sport activities should burn calories,must be negative!");
          document.activeElement.blur();
          await __wait(400);
        `,
      },
    ],
  },
};

function connect(url) {
  const socket = new WebSocket(url);
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve({ send, close: () => socket.close() }));
    socket.addEventListener("error", reject);
  });
}

async function waitForPort(profile, timeoutMs = 20000) {
  const file = join(profile, "DevToolsActivePort");
  for (let waited = 0; waited < timeoutMs; waited += 200) {
    if (existsSync(file)) return Number(readFileSync(file, "utf8").split("\n")[0]);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("The browser did not start.");
}

async function run(page, steps) {
  const { exceptionDetails } = await page.send("Runtime.evaluate", {
    expression: `(async () => { ${PAGE_HELPERS} ${steps} })()`,
    awaitPromise: true,
  });
  if (exceptionDetails) {
    const { result } = await page.send("Runtime.evaluate", {
      expression: "location.href + ' | ' + document.body.innerText.slice(0, 200)",
    });
    console.error("Page was at:", result.value);
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  }
}

const browser = BROWSERS.find((path) => path && existsSync(path));
if (!browser) throw new Error("No browser found. Set BROWSER_PATH to Edge or Chrome.");

const only = process.argv.slice(2);
const profile = mkdtempSync(join(tmpdir(), "demo-shots-"));
const child = spawn(browser, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--remote-debugging-port=0",
  "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows",
  `--user-data-dir=${profile}`,
  `--window-size=${WIDTH},${HEIGHT}`,
  "about:blank",
]);

try {
  const port = await waitForPort(profile);
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((res) => res.json());
  const page = await connect(targets.find(({ type }) => type === "page").webSocketDebuggerUrl);
  await page.send("Page.bringToFront");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const [id, demo] of Object.entries(DEMOS)) {
    if (only.length && !only.includes(id)) continue;
    await page.send("Page.navigate", { url: demo.url });
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const dir = join(root, "public/projects", id);
    mkdirSync(dir, { recursive: true });
    for (const shot of demo.shots) {
      await run(page, shot.steps);
      const { data } = await page.send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(dir, shot.file), Buffer.from(data, "base64"));
      console.log(`Wrote public/projects/${id}/${shot.file}`);
    }
  }
  page.close();
} finally {
  child.kill();
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {}
}
