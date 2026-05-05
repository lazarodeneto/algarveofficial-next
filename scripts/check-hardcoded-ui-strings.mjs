#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const BASELINE_PATH = path.join(ROOT, "scripts", "hardcoded-ui-baseline.json");
const BASELINE = fs.existsSync(BASELINE_PATH)
  ? new Set(JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")).map((entry) => entry.id))
  : new Set();

const SAFE_ATTRIBUTES = new Set(["className", "href", "src", "id", "role", "type", "value", "name", "htmlFor", "data-testid"]);
const UI_ATTRIBUTES = ["placeholder", "aria-label", "alt", "title"];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "dist"].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (EXTENSIONS.has(path.extname(entry.name)) && !fullPath.includes(".test.") && !fullPath.includes(".spec.")) {
      files.push(fullPath);
    }
  }
  return files;
}

function lineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isProbablyVisibleText(value) {
  if (!value || value.length < 2) return false;
  if (value.includes("{") || value.includes("}")) return false;
  if (/^[\d\s.,:+/%#€$£-]+$/.test(value)) return false;
  if (/^(true|false|null|undefined)$/i.test(value)) return false;
  if (/^(https?:|mailto:|tel:|\/|#|\.)/.test(value)) return false;
  if (/^[A-Z0-9_-]+$/.test(value)) return false;
  return /[A-Za-zÀ-ÿ]/.test(value);
}

function findingId(finding) {
  return `${finding.file}:${finding.type}:${finding.text}`;
}

function scanFile(file) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(ROOT, file);
  const findings = [];

  const attrRegex = new RegExp(`\\b(${UI_ATTRIBUTES.join("|")})\\s*=\\s*(["'])([^"'{}][^"']*)\\2`, "g");
  for (const match of source.matchAll(attrRegex)) {
    const attr = match[1];
    if (SAFE_ATTRIBUTES.has(attr)) continue;
    const text = normalize(match[3]);
    if (!isProbablyVisibleText(text)) continue;
    findings.push({ file: relative, line: lineNumber(source, match.index), type: `attribute:${attr}`, text });
  }

  const textNodeRegex = /<(p|span|button|label|a|h[1-6]|option|li|dt|dd|strong|em)\b[^>]*>\s*([^<>{][^<>]*?)\s*<\/\1>/g;
  for (const match of source.matchAll(textNodeRegex)) {
    const text = normalize(match[2]);
    if (!isProbablyVisibleText(text)) continue;
    findings.push({ file: relative, line: lineNumber(source, match.index), type: "text-node", text });
  }

  return findings.map((finding) => ({ ...finding, id: findingId(finding) }));
}

const findings = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir))).flatMap(scanFile);
const newFindings = findings.filter((finding) => !BASELINE.has(finding.id));

if (newFindings.length > 0) {
  console.error(`Hardcoded UI string check failed: ${newFindings.length} new finding(s).`);
  for (const finding of newFindings.slice(0, 40)) {
    console.error(`- ${finding.file}:${finding.line} ${finding.type} "${finding.text}"`);
  }
  if (newFindings.length > 40) {
    console.error(`... and ${newFindings.length - 40} more`);
  }
  process.exit(1);
}

console.log(`Hardcoded UI string check passed. Baseline entries: ${BASELINE.size}. Current findings: ${findings.length}.`);
