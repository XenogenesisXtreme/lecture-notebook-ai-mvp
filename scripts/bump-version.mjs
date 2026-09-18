#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requested = process.argv[2];

function normalizeVersion(input) {
  const match = String(input ?? "").trim().match(/^(?:v)?(\d+)\.(\d+)(?:\.(\d+))?$/i);
  if (!match) throw new Error("Version must look like 1.03, v1.03, or 1.3.0");
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3] ?? 0);
  if (major < 0 || minor < 0 || patch < 0) throw new Error("Version numbers cannot be negative");
  return { display: `${major}.${String(minor).padStart(2, "0")}`, extension: `${major}.${minor}.${patch}`, major, minor, patch };
}

const version = normalizeVersion(requested);
const today = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date());

async function replaceIn(file, replacements) {
  const filePath = path.join(root, file);
  let content = await readFile(filePath, "utf8");
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(content)) throw new Error(`Could not find expected version marker in ${file}`);
    content = content.replace(pattern, replacement);
  }
  await writeFile(filePath, content);
}

await replaceIn("package.json", [[/(\"version\"\s*:\s*\")[^"]+(\")/, `$1${version.extension}$2`]]);
await replaceIn("extension/manifest.json", [[/(\"version\"\s*:\s*\")[^"]+(\")/, `$1${version.extension}$2`]]);
await replaceIn("extension/popup.html", [[/LOCAL-FIRST · V[0-9.]+/g, `LOCAL-FIRST · V${version.display}`]]);
await replaceIn("README.md", [[/Beta · Version \d+\.\d+/g, `Beta · Version ${version.display}`]]);
await replaceIn("client/src/pages/Home.tsx", [[/v[0-9.]+ · local-first/g, `v${version.display} · local-first`]]);
await replaceIn("RELEASE_NOTES.md", [[/^# Lecture Notebook AI · v[^\n]+/m, `# Lecture Notebook AI · v${version.display} Beta`], [/^\*\*Release date:\*\*[^\n]+/m, `**Release date:** ${today}`]]);

console.log(`Synchronized website and extension version to ${version.display} (manifest/package: ${version.extension}).`);
console.log("Updated: package.json, extension/manifest.json, extension/popup.html, README.md, Home.tsx, RELEASE_NOTES.md");
