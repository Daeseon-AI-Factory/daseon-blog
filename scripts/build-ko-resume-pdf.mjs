/** Render the Korean Toss-style resume to PDF.
 *
 * Local preview remains the default. Set RESUME_BASE_URL to the public origin
 * that internal PDF links should use while still rendering the local page.
 *
 * Examples:
 *   node scripts/build-ko-resume-pdf.mjs
 *   node scripts/build-ko-resume-pdf.mjs --base-url https://daeseon.ai --target karrot
 *   node scripts/build-ko-resume-pdf.mjs --output ./resume.pdf --chrome-path "<browser-executable-path>"
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const DEFAULT_RENDER_ORIGIN = "http://localhost:3000";
const DEFAULT_FILENAME = "유대선_이력서_토스풍.pdf";

const HELP = `Usage:
  node scripts/build-ko-resume-pdf.mjs [outputPath] [options]

Options:
  -o, --output <path>         PDF output path (legacy positional path also works)
      --target <key>          Resume target query, for example: karrot
      --base-url <origin>     Public origin for links embedded in the PDF
      --render-url <origin>   Origin to render from (default: http://localhost:3000)
      --chrome-path <path>    Chrome/Chromium executable override
      --dry-run               Print resolved configuration without opening Chrome
  -h, --help                  Show this help

Environment:
  RESUME_OUTPUT, RESUME_TARGET, RESUME_BASE_URL, RESUME_RENDER_URL,
  CHROME_PATH, PUPPETEER_EXECUTABLE_PATH

Examples:
  node scripts/build-ko-resume-pdf.mjs
  node scripts/build-ko-resume-pdf.mjs --base-url https://daeseon.ai --target karrot
  node scripts/build-ko-resume-pdf.mjs --output ./resume.pdf --dry-run
`;

const VALUE_OPTIONS = new Map([
  ["-o", "output"],
  ["--output", "output"],
  ["--target", "target"],
  ["--base-url", "baseUrl"],
  ["--render-url", "renderUrl"],
  ["--chrome-path", "chromePath"],
]);

function parseArgs(argv) {
  const options = { dryRun: false, help: false };
  let positionalOutput;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "-h" || argument === "--help") {
      options.help = true;
      continue;
    }

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (!argument.startsWith("-")) {
      if (positionalOutput !== undefined) {
        throw new Error(`Only one positional output path is allowed: ${argument}`);
      }
      positionalOutput = argument;
      continue;
    }

    const equalsAt = argument.indexOf("=");
    const flag = equalsAt === -1 ? argument : argument.slice(0, equalsAt);
    const optionName = VALUE_OPTIONS.get(flag);
    if (!optionName) {
      throw new Error(`Unknown option: ${flag}`);
    }

    const inlineValue = equalsAt === -1 ? undefined : argument.slice(equalsAt + 1);
    const value = inlineValue ?? argv[index + 1];
    if (!value || (inlineValue === undefined && value.startsWith("-"))) {
      throw new Error(`Missing value for ${flag}`);
    }
    if (inlineValue === undefined) index += 1;
    if (options[optionName] !== undefined) {
      throw new Error(`Option supplied more than once: ${flag}`);
    }
    options[optionName] = value;
  }

  if (positionalOutput !== undefined && options.output !== undefined) {
    throw new Error("Use either a positional output path or --output, not both");
  }
  options.output ??= positionalOutput;

  return options;
}

function parseOrigin(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute http(s) origin: ${value}`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${label} must use http or https: ${value}`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} must not include credentials`);
  }
  if ((url.pathname && url.pathname !== "/") || url.search || url.hash) {
    throw new Error(`${label} must be an origin without a path, query, or fragment: ${value}`);
  }

  return url.origin;
}

function validateTarget(value) {
  if (!value) return undefined;
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value)) {
    throw new Error("Resume target must contain 1-64 letters, numbers, underscores, or hyphens");
  }
  return value;
}

function expandHome(value) {
  if (value === "~") return os.homedir();
  if (/^~[\\/]/.test(value)) return path.join(os.homedir(), value.slice(2));
  return value;
}

function resolveOutput(value) {
  if (value.includes("\0")) throw new Error("Output path must not contain a null byte");
  const output = path.resolve(expandHome(value));
  if (path.extname(output).toLowerCase() !== ".pdf") {
    throw new Error(`Output path must end in .pdf: ${output}`);
  }
  return output;
}

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function browserCandidates() {
  const candidates = [];

  if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      path.join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      path.join(os.homedir(), "Applications/Chromium.app/Contents/MacOS/Chromium"),
    );
  } else if (process.platform === "win32") {
    const programFiles = [
      process.env.PROGRAMFILES ?? process.env.ProgramFiles,
      process.env["PROGRAMFILES(X86)"] ?? process.env["ProgramFiles(x86)"],
      process.env.ProgramW6432,
      process.env.LOCALAPPDATA ?? process.env.LocalAppData,
    ].filter(Boolean);

    for (const root of programFiles) {
      candidates.push(
        path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(root, "Chromium", "Application", "chrome.exe"),
      );
    }
  } else {
    candidates.push(
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    );
  }

  const executableNames = process.platform === "win32"
    ? ["chrome.exe", "chromium.exe"]
    : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  const searchPath = process.env.PATH ?? process.env.Path ?? "";
  for (const directory of searchPath.split(path.delimiter).filter(Boolean)) {
    for (const executableName of executableNames) {
      candidates.push(path.join(directory, executableName));
    }
  }

  return [...new Set(candidates)];
}

function resolveBrowserExecutable(override) {
  if (override) {
    const executable = path.resolve(expandHome(override));
    if (!isFile(executable)) {
      throw new Error(`Browser executable does not exist: ${executable}`);
    }
    return executable;
  }

  const executable = browserCandidates().find(isFile);
  if (executable) return executable;

  throw new Error(
    `No Chrome/Chromium executable found for ${process.platform}. ` +
      "Set --chrome-path, CHROME_PATH, or PUPPETEER_EXECUTABLE_PATH.",
  );
}

function isLoopbackOrigin(origin) {
  const hostname = new URL(origin).hostname.toLowerCase();
  return hostname === "localhost" || hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "[::1]";
}

function resolveConfig(options) {
  const renderOrigin = parseOrigin(
    options.renderUrl ?? process.env.RESUME_RENDER_URL ?? DEFAULT_RENDER_ORIGIN,
    "Resume render URL",
  );
  const linkOrigin = parseOrigin(
    options.baseUrl ?? process.env.RESUME_BASE_URL ?? renderOrigin,
    "Resume base URL",
  );
  const target = validateTarget(options.target ?? process.env.RESUME_TARGET);
  const output = resolveOutput(
    options.output ?? process.env.RESUME_OUTPUT ?? path.join(os.homedir(), "Downloads", DEFAULT_FILENAME),
  );
  const browserExecutable = resolveBrowserExecutable(
    options.chromePath ?? process.env.CHROME_PATH ?? process.env.PUPPETEER_EXECUTABLE_PATH,
  );
  const renderUrl = new URL("/ko/resume/toss", `${renderOrigin}/`);
  renderUrl.searchParams.set("pdf", "1");
  if (target) renderUrl.searchParams.set("target", target);

  return { browserExecutable, linkOrigin, output, renderOrigin, renderUrl, target };
}

function printConfig(config) {
  console.log(`browser: ${config.browserExecutable}`);
  console.log(`render: ${config.renderUrl.href}`);
  console.log(`PDF link origin: ${config.linkOrigin}`);
  console.log(`output: ${config.output}`);
  if (isLoopbackOrigin(config.linkOrigin)) {
    console.warn("warning: PDF links will use localhost; set RESUME_BASE_URL to a public origin for submission");
  }
}

async function buildPdf(config) {
  fs.mkdirSync(path.dirname(config.output), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: config.browserExecutable,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto(config.renderUrl.href, { waitUntil: "networkidle2", timeout: 60_000 });
    await page.emulateMediaType("print");
    const imageCount = await page.evaluate(async () => {
      await document.fonts.ready;
      const images = [...document.querySelectorAll("img[data-pdf-image]")];
      await Promise.all(images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve, reject) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", () => reject(new Error(`Failed to load ${image.currentSrc || image.src}`)), { once: true });
          });
        }
        await image.decode();
      }));
      return images.length;
    });

    const rewrittenLinks = await page.evaluate(
      ({ linkOrigin, renderOrigin }) => {
        let count = 0;
        for (const anchor of document.querySelectorAll("a[href]")) {
          const href = anchor.getAttribute("href");
          if (!href) continue;

          let resolved;
          try {
            resolved = new URL(href, document.baseURI);
          } catch {
            continue;
          }

          if (!["http:", "https:"].includes(resolved.protocol) || resolved.origin !== renderOrigin) {
            continue;
          }

          const publicUrl = new URL(
            `${resolved.pathname}${resolved.search}${resolved.hash}`,
            `${linkOrigin}/`,
          );
          if (anchor.href !== publicUrl.href) {
            anchor.href = publicUrl.href;
            count += 1;
          }
        }
        return count;
      },
      { linkOrigin: config.linkOrigin, renderOrigin: config.renderOrigin },
    );

    await page.pdf({
      path: config.output,
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    console.log(`decoded PDF images: ${imageCount}`);
    console.log(`rewritten internal links: ${rewrittenLinks}`);
    console.log(`written: ${config.output}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(HELP);
    return;
  }

  const config = resolveConfig(options);
  printConfig(config);
  if (!options.dryRun) await buildPdf(config);
}

try {
  await main();
} catch (error) {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
