#!/usr/bin/env node

import fs from "fs";
import path from "path";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components", "hooks", "legacy-pages", "lib"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git" ||
      entry.name === "dist"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
    if (fullPath.includes(".test.") || fullPath.includes(".spec.")) continue;
    files.push(fullPath);
  }

  return files;
}

function isPlainStringLiteral(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function isDefaultValueOnlyObject(node) {
  if (!ts.isObjectLiteralExpression(node)) return false;
  if (node.properties.length !== 1) return false;

  const property = node.properties[0];
  if (!ts.isPropertyAssignment(property)) return false;

  const propertyName = property.name.getText();
  return propertyName === "defaultValue" && isPlainStringLiteral(property.initializer);
}

function collectEdits(sourceFile) {
  const edits = [];

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sourceFile);
      const args = node.arguments;
      if (
        (callee === "t" || callee === "tSafe") &&
        args.length === 2 &&
        isPlainStringLiteral(args[0]) &&
        (isPlainStringLiteral(args[1]) || isDefaultValueOnlyObject(args[1]))
      ) {
        edits.push({ start: args[0].end, end: args[1].end });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return edits.sort((a, b) => b.start - a.start);
}

const files = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
let changedCount = 0;

for (const file of files) {
  const sourceText = fs.readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx")
      ? ts.ScriptKind.TSX
      : file.endsWith(".jsx")
        ? ts.ScriptKind.JSX
        : ts.ScriptKind.TS,
  );

  const edits = collectEdits(sourceFile);
  if (edits.length === 0) continue;

  let nextText = sourceText;
  for (const edit of edits) {
    nextText = `${nextText.slice(0, edit.start)}${nextText.slice(edit.end)}`;
  }

  if (nextText !== sourceText) {
    fs.writeFileSync(file, nextText);
    changedCount += 1;
  }
}

console.log(`Updated ${changedCount} files.`);
