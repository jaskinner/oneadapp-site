import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../theme/tokens.css", import.meta.url), "utf8");

function lin(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function lum(hex) {
  const h = hex.slice(1);
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}

function parseBlock(selector) {
  const re = new RegExp(`${selector}\\s*\\{`);
  const match = css.match(re);
  if (!match) throw new Error(`missing ${selector}`);
  let index = match.index + match[0].length;
  let depth = 1;
  const start = index;
  while (index < css.length && depth > 0) {
    if (css[index] === "{") depth += 1;
    else if (css[index] === "}") depth -= 1;
    index += 1;
  }
  const body = css.slice(start, index - 1);
  const vars = {};
  for (const found of body.matchAll(/--([A-Za-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})/g)) {
    vars[found[1]] = found[2].toUpperCase();
  }
  return vars;
}

const light = parseBlock(":root");
const dark = parseBlock("\\.dark");

const pairs = [
  ["light", "foreground on background", "foreground", "background", 4.5, "text"],
  ["light", "foreground on card", "foreground", "card", 4.5, "text"],
  ["light", "foreground on popover", "foreground", "popover", 4.5, "text"],
  ["light", "primary-foreground on primary", "primary-foreground", "primary", 4.5, "text"],
  ["light", "foreground on secondary", "foreground", "secondary", 4.5, "text"],
  ["light", "foreground on muted", "foreground", "muted", 4.5, "text"],
  ["light", "muted-foreground on muted", "muted-foreground", "muted", 4.5, "text"],
  ["light", "muted-foreground on background", "muted-foreground", "background", 4.5, "text"],
  ["light", "muted-foreground on card", "muted-foreground", "card", 4.5, "text"],
  ["light", "foreground on accent", "foreground", "accent", 4.5, "text"],
  ["light", "link on background", "link", "background", 4.5, "text"],
  ["light", "link on card", "link", "card", 4.5, "text"],
  ["light", "link on muted", "link", "muted", 4.5, "text"],
  ["light", "link on accent", "link", "accent", 4.5, "text"],
  ["light", "signal-foreground on signal", "signal-foreground", "signal", 4.5, "text"],
  ["light", "signal on foreground (hover)", "signal", "foreground", 4.5, "text"],
  ["light", "destructive-foreground on destructive", "destructive-foreground", "destructive", 4.5, "text"],
  ["light", "destructive on card", "destructive", "card", 4.5, "text"],
  ["light", "destructive on background", "destructive", "background", 4.5, "text"],
  ["light", "danger on danger-bg", "danger", "danger-bg", 4.5, "text"],
  ["light", "success on success-bg", "success", "success-bg", 4.5, "text"],
  ["light", "warning on warning-bg", "warning", "warning-bg", 4.5, "text"],
  ["light", "foreground on sidebar", "foreground", "sidebar", 4.5, "text"],
  ["light", "foreground on sidebar-accent", "foreground", "sidebar-accent", 4.5, "text"],
  ["light", "muted-foreground on sidebar", "muted-foreground", "sidebar", 4.5, "text"],
  ["light", "link on sidebar", "link", "sidebar", 4.5, "text"],
  ["light", "sidebar-primary-foreground on sidebar-primary", "sidebar-primary-foreground", "sidebar-primary", 4.5, "text"],
  ["light", "input on background", "input", "background", 3, "ui"],
  ["light", "input on card", "input", "card", 3, "ui"],
  ["dark", "foreground on background", "foreground", "background", 4.5, "text"],
  ["dark", "foreground on card", "foreground", "card", 4.5, "text"],
  ["dark", "foreground on popover", "foreground", "popover", 4.5, "text"],
  ["dark", "primary-foreground on primary", "primary-foreground", "primary", 4.5, "text"],
  ["dark", "foreground on secondary", "foreground", "secondary", 4.5, "text"],
  ["dark", "foreground on muted", "foreground", "muted", 4.5, "text"],
  ["dark", "muted-foreground on background", "muted-foreground", "background", 4.5, "text"],
  ["dark", "muted-foreground on card", "muted-foreground", "card", 4.5, "text"],
  ["dark", "muted-foreground on muted", "muted-foreground", "muted", 4.5, "text"],
  ["dark", "foreground on accent", "foreground", "accent", 4.5, "text"],
  ["dark", "muted-foreground on accent", "muted-foreground", "accent", 4.5, "text"],
  ["dark", "link on background", "link", "background", 4.5, "text"],
  ["dark", "link on card", "link", "card", 4.5, "text"],
  ["dark", "link on muted", "link", "muted", 4.5, "text"],
  ["dark", "link on accent", "link", "accent", 4.5, "text"],
  ["dark", "signal-foreground on signal", "signal-foreground", "signal", 4.5, "text"],
  ["dark", "destructive-foreground on destructive", "destructive-foreground", "destructive", 4.5, "text"],
  ["dark", "danger on danger-bg", "danger", "danger-bg", 4.5, "text"],
  ["dark", "danger on card", "danger", "card", 4.5, "text"],
  ["dark", "success on success-bg", "success", "success-bg", 4.5, "text"],
  ["dark", "warning on warning-bg", "warning", "warning-bg", 4.5, "text"],
  ["dark", "foreground on sidebar", "foreground", "sidebar", 4.5, "text"],
  ["dark", "foreground on sidebar-accent", "foreground", "sidebar-accent", 4.5, "text"],
  ["dark", "muted-foreground on sidebar", "muted-foreground", "sidebar", 4.5, "text"],
  ["dark", "muted-foreground on sidebar-accent", "muted-foreground", "sidebar-accent", 4.5, "text"],
  ["dark", "link on sidebar", "link", "sidebar", 4.5, "text"],
  ["dark", "sidebar-primary-foreground on sidebar-primary", "sidebar-primary-foreground", "sidebar-primary", 4.5, "text"],
  ["dark", "input on background", "input", "background", 3, "ui"],
  ["dark", "input on card", "input", "card", 3, "ui"],
];

const rows = [];
let failed = 0;
for (const [mode, label, fg, bg, min, kind] of pairs) {
  const palette = mode === "light" ? light : dark;
  const fgHex = palette[fg];
  const bgHex = palette[bg];
  if (!fgHex || !bgHex) {
    console.error(`missing token for ${mode} ${label}`);
    failed += 1;
    continue;
  }
  const ratio = contrast(fgHex, bgHex);
  const pass = ratio + 1e-9 >= min;
  if (!pass) failed += 1;
  rows.push({ mode, label, fgHex, bgHex, ratio, min, kind, pass });
}

console.log("| Theme | Pair | Foreground | Background | Ratio | Minimum | |");
console.log("|---|---|---|---|---:|---:|---|");
for (const row of rows) {
  console.log(`| ${row.mode} | ${row.label} | ${row.fgHex} | ${row.bgHex} | ${row.ratio.toFixed(2)} | ${row.min.toFixed(1)} | ${row.pass ? "pass" : "FAIL"} |`);
}

const mutedInput = contrast(dark.input, dark.muted);
console.log("");
console.log(`Note: dark --input on --muted is ${mutedInput.toFixed(2)}:1 (below 3:1). Field borders belong on background or card, which pass.`);
console.log(`Note: dark --destructive on --danger-bg is ${contrast(dark.destructive, dark["danger-bg"]).toFixed(2)}:1. Badge text uses --danger.`);

if (failed) {
  console.error(`${failed} contrast pair(s) failed`);
  process.exit(1);
}
console.log(`ok: ${rows.length} pairs meet AA`);
