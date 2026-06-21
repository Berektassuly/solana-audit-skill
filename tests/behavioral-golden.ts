#!/usr/bin/env npx tsx

import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "anchor-token2022-finding.md");

let failures = 0;

function pass(message: string) {
  console.log(`PASS ${message}`);
}

function fail(message: string) {
  failures++;
  console.error(`FAIL ${message}`);
}

function check(condition: boolean, message: string) {
  condition ? pass(message) : fail(message);
}

function readText(path: string): string {
  return readFileSync(path, "utf8");
}

function extractSection(content: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^## ${escaped}\\s*$`, "m");
  const match = pattern.exec(content);
  if (!match) return "";

  const sectionStart = match.index + match[0].length;
  const rest = content.slice(sectionStart);
  const nextHeading = rest.search(/\n##\s/);
  return nextHeading === -1 ? rest : rest.slice(0, nextHeading);
}

function requireIncludes(content: string, needle: string, message: string) {
  check(content.includes(needle), message);
}

check(existsSync(fixturePath), "Anchor Token-2022 behavioral fixture exists");

if (existsSync(fixturePath)) {
  const fixture = readText(fixturePath);
  const prompt = extractSection(fixture, "Fixture Prompt");
  const artifact = extractSection(fixture, "Sample Output Artifact");

  requireIncludes(prompt, "Anchor", "fixture prompt mentions Anchor");
  requireIncludes(prompt, "Token-2022", "fixture prompt mentions Token-2022");
  requireIncludes(prompt, "ctx.remaining_accounts[0]", "fixture prompt mentions ctx.remaining_accounts[0]");

  for (const label of [
    "Status",
    "Taxonomy",
    "Evidence",
    "Impact",
    "Fix",
    "Verification",
    "False-positive conditions",
  ]) {
    requireIncludes(artifact, label, `sample output artifact includes label: ${label}`);
  }

  check(
    /`(?:account-validation|token-integration|cpi-trust-boundaries)`/.test(artifact),
    "sample output artifact includes a required taxonomy mapping",
  );
  check(
    /\bHypothesis\b|\buncertain(?:ty)?\b|\bnot confirmed\b/i.test(artifact),
    "sample output artifact preserves uncertainty",
  );
}

if (failures > 0) {
  console.error(`\nBehavioral golden validation failed: ${failures} issue(s).`);
  process.exit(1);
}

console.log("\nBehavioral golden validation passed.");
