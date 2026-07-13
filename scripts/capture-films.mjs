/** Capture each case film's STAGE element from the live page into frames,
 *  headless Chrome (system binary) + element-screenshot loop.
 *  Output: frames/case0N/f-<elapsedMs>.jpg + meta.json (real fps for encode). */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000/portfolio";
const OUT = path.resolve("frames");
// scenes per case → capture duration (5.2s/scene + settle)
const CASES = [
  { n: 1, scenes: 7 },
  { n: 2, scenes: 7 },
  { n: 3, scenes: 6 },
  { n: 4, scenes: 6 },
  { n: 5, scenes: 7 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--force-device-scale-factor=2"],
});

for (const { n, scenes } of CASES) {
  const dir = path.join(OUT, `case0${n}`);
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 950, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(1500);

  const sel = `#case-0${n} figure > div.relative`;
  await page.waitForSelector(sel, { timeout: 15000 });
  // bring the film into view → IntersectionObserver starts autoplay from scene 0
  await page.evaluate((s) => {
    document.querySelector(s).scrollIntoView({ block: "center", behavior: "instant" });
  }, sel);
  const el = await page.$(sel);

  const durationMs = scenes * 5200 + 1800;
  const t0 = Date.now();
  let i = 0;
  const stamps = [];
  while (Date.now() - t0 < durationMs) {
    const elapsed = Date.now() - t0;
    try {
      await el.screenshot({
        path: path.join(dir, `f-${String(i).padStart(5, "0")}.jpg`),
        type: "jpeg",
        quality: 92,
      });
      stamps.push(elapsed);
      i++;
    } catch (e) {
      console.error(`case0${n} frame ${i} failed: ${e.message}`);
    }
  }
  const realSec = (stamps.at(-1) - stamps[0]) / 1000;
  const fps = ((stamps.length - 1) / realSec).toFixed(2);
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ frames: stamps.length, fps: Number(fps) }));
  console.log(`case0${n}: ${stamps.length} frames over ${realSec.toFixed(1)}s → ${fps} fps`);
  await page.close();
}

await browser.close();
console.log("done");
