/** Generate the resume PDF from /resume?pdf=1 — the PDF is an OUTPUT.
 *  Usage:  RESUME_PHONE="+1 ..." node scripts/build-resume-pdf.mjs [outPath]
 *  Phone comes from the env var only (never stored in this public repo).
 *  Requires: dev server on :3000, puppeteer-core, system Chrome. */
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.resolve(process.argv[2] ?? `${process.env.HOME}/Downloads/DaeseonYoo_Resume_generated.pdf`);
const PHONE = process.env.RESUME_PHONE ?? "";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
await page.goto("http://localhost:3000/resume?pdf=1", { waitUntil: "networkidle2", timeout: 60000 });

if (PHONE) {
  await page.evaluate((phone) => {
    const slot = document.getElementById("phone-slot");
    if (slot) slot.textContent = ` · ${phone}`;
  }, PHONE);
}

await page.pdf({
  path: OUT,
  format: "Letter",
  printBackground: true,
  margin: { top: "8mm", bottom: "8mm", left: "10mm", right: "10mm" },
});
await browser.close();
console.log(`written: ${OUT}${PHONE ? " (phone included)" : " (NO phone — set RESUME_PHONE)"}`);
