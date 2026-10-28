import { readFileSync } from "node:fs";

const tokens = readFileSync(new URL("../theme/tokens.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const start = "/* BEGIN theme/tokens.css */";
const end = "/* END theme/tokens.css */";
const startAt = html.indexOf(start);
const endAt = html.indexOf(end);

if (startAt < 0 || endAt < 0 || endAt < startAt) {
  console.error("index.html is missing the theme/tokens.css markers");
  process.exit(1);
}

const inlined = html.slice(startAt + start.length, endAt).replace(/^\n/, "").replace(/\s+$/, "");
const expected = tokens.replace(/\s+$/, "");

if (inlined !== expected) {
  console.error("Inlined theme block does not equal theme/tokens.css");
  const a = expected.split("\n");
  const b = inlined.split("\n");
  const lines = Math.max(a.length, b.length);
  for (let i = 0; i < lines; i += 1) {
    if (a[i] !== b[i]) {
      console.error(`first difference at line ${i + 1}`);
      console.error(`  file:    ${a[i] ?? "<missing>"}`);
      console.error(`  inlined: ${b[i] ?? "<missing>"}`);
      break;
    }
  }
  process.exit(1);
}

function block(css, selector) {
  const re = new RegExp(`${selector}\\s*\\{`);
  const match = css.match(re);
  if (!match) {
    throw new Error(`missing ${selector} block`);
  }
  let index = match.index + match[0].length;
  let depth = 1;
  while (index < css.length && depth > 0) {
    if (css[index] === "{") depth += 1;
    else if (css[index] === "}") depth -= 1;
    index += 1;
  }
  return css.slice(match.index, index);
}

const rootFile = block(tokens, ":root");
const rootInline = block(inlined, ":root");
if (rootFile !== rootInline) {
  console.error("Inlined :root block does not equal theme/tokens.css");
  process.exit(1);
}

const darkFile = block(tokens, "\\.dark");
const darkInline = block(inlined, "\\.dark");
if (darkFile !== darkInline) {
  console.error("Inlined .dark block does not equal theme/tokens.css");
  process.exit(1);
}

const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)];
if (styles.length === 0) {
  console.error("index.html has no stylesheet");
  process.exit(1);
}
const outside = styles.map((match) => match[1]).join("\n").replace(html.slice(startAt, endAt + end.length), "");
const hex = outside.match(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{8}\b|\brgba?\(|\bhsla?\(/g);
if (hex) {
  console.error("Raw color outside the inlined tokens block:", hex.join(", "));
  process.exit(1);
}

const preload = html.match(/<link\b[^>]*rel="preload"[^>]*>/);
if (!preload) {
  console.error("Missing font preload");
  process.exit(1);
}
const tag = preload[0];
if (!/\bas="font"/.test(tag) || !/font\/woff2/.test(tag) || !/\bcrossorigin\b/.test(tag) || !/instrument-sans-v1\.woff2/.test(tag)) {
  console.error("Font preload must be the versioned woff2 with as=font, type=font/woff2, and crossorigin");
  console.error(tag);
  process.exit(1);
}

if (/box-shadow\s*:\s*[^;]*\d+px\s+\d+px\s+0/.test(outside)) {
  console.error("Hard offset shadow found outside the token block");
  process.exit(1);
}

console.log("ok: inlined :root and .dark equal theme/tokens.css");
