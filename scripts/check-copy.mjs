import { readFileSync, writeFileSync } from "node:fs";

const htmlUrl = new URL("../index.html", import.meta.url);
const baselineUrl = new URL("./copy-baseline.txt", import.meta.url);

function decode(text) {
  return text
    .replace(/&copy;/g, "©")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function visibleText(fragment) {
  const withoutCode = fragment
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");
  return decode(withoutCode.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function inner(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match) throw new Error(`missing <${tag}>`);
  return match[1];
}

function headings(html) {
  return [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => {
    return `h${match[1]}:${visibleText(match[2])}`;
  });
}

function ids(html) {
  return [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
}

function nav(html) {
  const match = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i);
  if (!match) throw new Error("missing nav");
  return [...match[1].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((link) => {
    return `${link[1]} ${visibleText(link[2])}`;
  });
}

function metas(html) {
  const head = inner(html, "head");
  const title = visibleText((head.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const tags = [...head.matchAll(/<meta\b[^>]*>/gi)].map((tag) => {
    const name = (tag[0].match(/\b(?:name|property)="([^"]+)"/) || [])[1] || "";
    const content = (tag[0].match(/\bcontent="([^"]*)"/) || [])[1] || "";
    return `${name}=${content}`;
  }).filter((line) => line !== "=");
  const canonical = (head.match(/<link\b[^>]*rel="canonical"[^>]*>/i) || [""])[0];
  const icon = (head.match(/<link\b[^>]*rel="icon"[^>]*>/i) || [""])[0];
  const json = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((block) => {
    return JSON.stringify(JSON.parse(block[1]));
  });
  return { title, tags, canonical, icon, json };
}

function snapshot(html) {
  const meta = metas(html);
  return {
    header: visibleText(inner(html, "header")),
    main: visibleText(inner(html, "main")),
    dialog: visibleText(inner(html, "dialog")),
    footer: visibleText(inner(html, "footer")),
    headings: headings(html),
    ids: ids(html),
    nav: nav(html),
    title: meta.title,
    meta: meta.tags,
    canonical: meta.canonical,
    icon: meta.icon,
    "json-ld": meta.json,
  };
}

const sectionOrder = ["header", "main", "dialog", "footer", "headings", "ids", "nav", "title", "meta", "canonical", "icon", "json-ld"];

function serialize(snap) {
  const lines = [
    "# Visible copy in DOM order, from index.html at 222d9fe (PR #3).",
    "# Refresh after an intentional copy change: node scripts/check-copy.mjs --write",
    "",
  ];
  for (const name of sectionOrder) {
    lines.push(`== ${name}`);
    const value = snap[name];
    if (Array.isArray(value)) lines.push(...value);
    else lines.push(value);
    lines.push("");
  }
  return `${lines.join("\n").replace(/\n+$/, "\n")}`;
}

function parseBaseline(text) {
  const snap = {};
  let name = "";
  const buckets = {};
  for (const line of text.split("\n")) {
    if (line.startsWith("# ") || line.trim() === "") continue;
    if (line.startsWith("== ")) {
      name = line.slice(3).trim();
      buckets[name] = [];
      continue;
    }
    if (!name) throw new Error(`baseline line outside a section: ${line}`);
    buckets[name].push(line);
  }
  for (const key of sectionOrder) {
    const rows = buckets[key];
    if (!rows) throw new Error(`baseline missing section ${key}`);
    snap[key] = ["header", "main", "dialog", "footer", "title", "canonical", "icon"].includes(key) ? rows.join("\n") : rows;
  }
  return snap;
}

function tokensInOrder(baselineText, currentText) {
  const want = baselineText.split(/\s+/).filter(Boolean);
  const have = currentText.split(/\s+/).filter(Boolean);
  let index = 0;
  for (const token of have) {
    if (token === want[index]) index += 1;
    if (index === want.length) return true;
  }
  return index === want.length;
}

const current = readFileSync(htmlUrl, "utf8");

if (process.argv.includes("--write")) {
  const sourceFlag = process.argv.indexOf("--write");
  const sourcePath = process.argv[sourceFlag + 1];
  const sourceHtml = sourcePath && !sourcePath.startsWith("-")
    ? readFileSync(sourcePath, "utf8")
    : current;
  writeFileSync(baselineUrl, serialize(snapshot(sourceHtml)));
  console.log("wrote scripts/copy-baseline.txt");
  process.exit(0);
}

const expected = parseBaseline(readFileSync(baselineUrl, "utf8"));
const actual = snapshot(current);

function same(label, a, b) {
  const left = JSON.stringify(a);
  const right = JSON.stringify(b);
  if (left !== right) {
    console.error(`CHANGED ${label}`);
    console.error(`  baseline: ${left}`);
    console.error(`  current:  ${right}`);
    return false;
  }
  return true;
}

let ok = true;
if (!tokensInOrder(expected.header, actual.header)) {
  console.error("CHANGED header");
  console.error(`  baseline: ${expected.header}`);
  console.error(`  current:  ${actual.header}`);
  ok = false;
}
ok = same("main", expected.main, actual.main) && ok;
ok = same("dialog", expected.dialog, actual.dialog) && ok;
ok = same("footer", expected.footer, actual.footer) && ok;
ok = same("headings", expected.headings, actual.headings) && ok;
ok = same("ids", expected.ids, actual.ids) && ok;
ok = same("nav", expected.nav, actual.nav) && ok;
ok = same("title", expected.title, actual.title) && ok;
ok = same("meta", expected.meta, actual.meta) && ok;
ok = same("canonical", expected.canonical, actual.canonical) && ok;
ok = same("icon", expected.icon, actual.icon) && ok;
ok = same("json-ld", expected["json-ld"], actual["json-ld"]) && ok;

const form = (current.match(/<form\b[^>]*>/i) || [""])[0];
for (const required of ['name="beta-access"', 'method="POST"', 'data-netlify="true"', 'data-netlify-honeypot="bot-field"']) {
  if (!form.includes(required)) {
    console.error(`form missing ${required}`);
    ok = false;
  }
}
if (!/name="bot-field"[\s\S]*tabindex="-1"/.test(current) || !/class="hp"[^>]*aria-hidden="true"/.test(current)) {
  console.error("honeypot attributes changed");
  ok = false;
}
if (!/name="form-name" value="beta-access"/.test(current)) {
  console.error("hidden form-name changed");
  ok = false;
}
for (const field of [
  'id="beta-name" name="name" type="text" required maxlength="200" autocomplete="name"',
  'id="beta-email" name="email" type="email" required maxlength="200" autocomplete="email"',
  'id="beta-production-type" name="production-type" type="text" required maxlength="200" autocomplete="off"',
]) {
  if (!current.includes(field)) {
    console.error(`field changed: ${field}`);
    ok = false;
  }
}
if (!current.includes("fetch('/',") && !current.includes('fetch("/",')) {
  console.error("form submit no longer posts with fetch('/')");
  ok = false;
}
for (const sentence of [
  "Thanks. Your request has been sent.",
  "That request did not send. Check the form and try again.",
]) {
  if (!current.includes(sentence)) {
    console.error(`status copy changed: ${sentence}`);
    ok = false;
  }
}
if (!/#beta-dialog\s*\{[\s\S]*display:\s*block/.test(current) || !/#beta-cancel\s*\{[\s\S]*display:\s*none/.test(current)) {
  console.error("noscript dialog fallback changed");
  ok = false;
}
if (!/aria-label="oneAD"/.test(current)) {
  console.error('wordmark is missing aria-label="oneAD"');
  ok = false;
}
if (!/<summary>Menu<\/summary>/.test(current)) {
  console.error('menu summary accessible name is not "Menu"');
  ok = false;
}

const publicFiles = ["index.html", "README.md", "THEME.md", "theme/tokens.css", "netlify.toml"];
for (const file of publicFiles) {
  const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  if (/\bJon\b/.test(text)) {
    console.error(`${file} contains "Jon"`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("ok: copy matches scripts/copy-baseline.txt");
