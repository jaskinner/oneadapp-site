// Renders scripts/og/og-image.html to og-image.png (1200x630) with headless Chrome.
// Usage: node scripts/render-og-image.mjs  (set CHROME=/path/to/chrome if needed)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = pathToFileURL(path.join(root, "scripts/og/og-image.html")).href;
const out = path.join(root, "og-image.png");
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
    "--force-device-scale-factor=1", "--window-size=1200,630",
    "--virtual-time-budget=3000", `--screenshot=${out}`, src,
], { stdio: "inherit" });

const png = readFileSync(out);
const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
if (w !== 1200 || h !== 630) throw new Error(`og-image.png is ${w}x${h}, expected 1200x630`);
console.log(`Wrote ${out} (${w}x${h}, ${(png.length / 1024).toFixed(0)} KB)`);
