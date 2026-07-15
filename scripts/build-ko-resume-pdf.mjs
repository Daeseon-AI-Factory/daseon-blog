/** 한국 토스풍 이력서(/ko/resume/toss)를 그대로 PDF로 렌더 —
 *  "웹 디자인 = 제출 PDF"의 증명. 링크 제출 채널과 문서 제출 채널이
 *  같은 소스에서 나온다. Requires: dev server on :3000, puppeteer-core. */
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.resolve(process.argv[2] ?? `${process.env.HOME}/Downloads/유대선_이력서_토스풍.pdf`);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
await page.goto("http://localhost:3000/ko/resume/toss", { waitUntil: "networkidle2", timeout: 60000 });
// Pretendard가 CDN에서 완전히 로드될 시간
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  margin: { top: "0", bottom: "0", left: "0", right: "0" },
});
await browser.close();
console.log(`written: ${OUT}`);
