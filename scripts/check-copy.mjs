import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const current = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const base = execFileSync("git", ["show", "main:index.html"], { encoding: "utf8", cwd: root });

function decode(text) {
  return text
    .replace(/&copy;/g, "©")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function visibleText(fragment) {
  return decode(fragment.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
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

function same(label, a, b) {
  const left = JSON.stringify(a);
  const right = JSON.stringify(b);
  if (left !== right) {
    console.error(`CHANGED ${label}`);
    console.error(`  main:    ${left}`);
    console.error(`  current: ${right}`);
    return false;
  }
  return true;
}

let ok = true;
ok = same("main text", visibleText(inner(base, "main")), visibleText(inner(current, "main"))) && ok;
ok = same("footer text", visibleText(inner(base, "footer")), visibleText(inner(current, "footer"))) && ok;
ok = same("dialog text", visibleText(inner(base, "dialog")), visibleText(inner(current, "dialog"))) && ok;
ok = same("headings", headings(base), headings(current)) && ok;
ok = same("ids", ids(base), ids(current)) && ok;
ok = same("nav", nav(base), nav(current)) && ok;

const baseMeta = metas(base);
const currentMeta = metas(current);
ok = same("title", baseMeta.title, currentMeta.title) && ok;
ok = same("meta", baseMeta.tags, currentMeta.tags) && ok;
ok = same("canonical", baseMeta.canonical, currentMeta.canonical) && ok;
ok = same("icon", baseMeta.icon, currentMeta.icon) && ok;
ok = same("json-ld", baseMeta.json, currentMeta.json) && ok;

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
console.log("ok: copy, headings, ids, nav, head, and form match main");
