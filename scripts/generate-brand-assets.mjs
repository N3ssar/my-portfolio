// Renders app/apple-icon.png and public/og.png with a headless Chromium browser.
// Inter comes from the Next.js build output, so run `pnpm build` first.
// Set BROWSER_PATH if Edge or Chrome is not found.
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { site } from "../content/site.ts";

const root = join(import.meta.dirname, "..");
const messages = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));

const BROWSERS = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const COLORS = {
  bg: "#0B0B0C",
  surface: "#1A1A1D",
  text: "#F4F4F1",
  textSoft: "#C8C8C4",
  textMuted: "#8A8A90",
  accent: "#2EC4B6",
};

const mark = (size, background = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" style="display:block;flex:none">${background}<path d="M11 7H7V25H11M21 7H25V25H21M7.41 7.41L24.59 24.59" fill="none" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;

const appleIcon = `<!doctype html><body style="margin:0;background:${COLORS.surface}">${mark(180)}</body>`;

const ogImage = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(inter.woff2) format("woff2"); font-weight: 100 900; }
body { margin: 0; width: 1200px; height: 630px; box-sizing: border-box; padding: 0 96px; display: flex; align-items: center; gap: 56px; background: ${COLORS.bg}; font-family: Inter; }
h1 { margin: 0; color: ${COLORS.text}; font-size: 72px; font-weight: 500; line-height: 1.1; }
p { margin: 16px 0 0; color: ${COLORS.textSoft}; font-size: 36px; }
p + p { margin-top: 12px; color: ${COLORS.textMuted}; font-size: 28px; }
</style><body>${mark(200, `<rect width="32" height="32" rx="7" fill="${COLORS.surface}"/>`)}
<div><h1>${site.name}</h1><p>${messages.hero.id.roleValue}</p><p>${messages.hero.id.basedValue}</p></div></body>`;

function findInter() {
  // Inter is the only preloaded font, and Next.js marks preloaded files with ".p.".
  const media = join(root, ".next/static/media");
  const file = existsSync(media)
    ? readdirSync(media).find((name) => /-s\.p\..*\.woff2$/.test(name))
    : undefined;
  if (!file) throw new Error("Inter not found in .next/static/media. Run `pnpm build` first.");
  return join(media, file);
}

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// On Windows the browser's launcher can exit before the screenshot is written.
function waitForFile(path, timeoutMs = 20000) {
  for (let waited = 0; waited < timeoutMs; waited += 200) {
    if (existsSync(path) && statSync(path).size > 0) {
      sleep(200);
      return true;
    }
    sleep(200);
  }
  return false;
}

const browser = BROWSERS.find((path) => path && existsSync(path));
if (!browser) throw new Error("No browser found. Set BROWSER_PATH to Edge or Chrome.");

const workDir = mkdtempSync(join(tmpdir(), "brand-assets-"));
try {
  copyFileSync(findInter(), join(workDir, "inter.woff2"));

  function render(html, width, height, output) {
    const page = join(workDir, "page.html");
    const screenshot = join(workDir, "screenshot.png");
    writeFileSync(page, html);
    rmSync(screenshot, { force: true });
    const { error, stderr } = spawnSync(browser, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--user-data-dir=${join(workDir, "profile")}`,
      `--window-size=${width},${height}`,
      "--virtual-time-budget=3000",
      `--screenshot=${screenshot}`,
      pathToFileURL(page).href,
    ]);
    if (error || !waitForFile(screenshot)) {
      throw new Error(`Could not render ${output}: ${error ?? stderr}`);
    }
    copyFileSync(screenshot, join(root, output));
    console.log(`Wrote ${output}`);
  }

  render(appleIcon, 180, 180, "app/apple-icon.png");
  render(ogImage, 1200, 630, "public/og.png");
} finally {
  // The browser may still hold its profile for a moment. The OS cleans up temp files anyway.
  try {
    rmSync(workDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {}
}
