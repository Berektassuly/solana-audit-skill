#!/usr/bin/env npx tsx

import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const skillDir = join(repoRoot, "skill");
const skillPath = join(skillDir, "SKILL.md");
const commandsDir = join(repoRoot, "commands");
const maxCommandLines = 90;

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

function parseFrontmatter(content: string, label: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    fail(`${label} has YAML frontmatter`);
    return null;
  }

  const fields = new Map<string, string>();
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) {
      fail(`${label} frontmatter line is simple key/value: ${rawLine}`);
      continue;
    }
    fields.set(field[1], field[2].replace(/^["']|["']$/g, ""));
  }

  pass(`${label} has YAML frontmatter`);
  return fields;
}

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
}

function requireIncludes(content: string, needle: string, message: string) {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const normalizedNeedle = needle.replace(/\r\n/g, "\n");
  check(normalizedContent.includes(normalizedNeedle), message);
}

check(existsSync(skillPath), "skill/SKILL.md exists");

const requiredWorkflowRoutes = [
  "references/workflows/audit-engagement-workflow.md",
  "references/workflows/pre-audit-design-review.md",
  "references/workflows/finding-writeup-workflow.md",
  "references/workflows/report-to-taxonomy-workflow.md",
  "references/workflows/release-gate-workflow.md",
  "references/workflows/payment-audit-workflow.md",
  "references/workflows/transaction-safety-workflow.md",
  "references/workflows/token-2022-policy-workflow.md",
  "references/workflows/formal-verification-handoff.md",
  "references/workflows/final-audit-report-template.md",
];

if (existsSync(skillPath)) {
  const skill = readText(skillPath);

  for (const route of requiredWorkflowRoutes) {
    requireIncludes(skill, route, `skill/SKILL.md routes to ${route}`);
    check(existsSync(join(skillDir, route)), `workflow route exists under skill/: ${route}`);
  }

  const workflowRoutePattern = /\breferences\/workflows\/[A-Za-z0-9._/-]+\.md\b/g;
  const workflowRoutes = [...new Set(skill.match(workflowRoutePattern) ?? [])].sort();
  for (const route of workflowRoutes) {
    check(existsSync(join(skillDir, route)), `referenced skill workflow exists under skill/: ${route}`);
  }
}

check(existsSync(commandsDir), "commands/ exists");

const copiedSkillHeadings = [
  "## What this skill is for",
  "## Default audit posture",
  "## Safety guardrails",
  "## Operating procedure",
  "## Progressive disclosure",
];

const commandRouteExpectations: Record<string, string[]> = {
  "audit-solana.md": [
    "../skill/references/workflows/audit-engagement-workflow.md",
    "../skill/references/workflows/finding-writeup-workflow.md",
    "../skill/references/severity-triage.md",
  ],
  "audit-release-gate.md": [
    "../skill/references/workflows/release-gate-workflow.md",
  ],
  "audit-transaction-safety.md": [
    "../skill/references/workflows/transaction-safety-workflow.md",
  ],
  "audit-upgrade-migration.md": [
    "../skill/references/taxonomy/upgrade-admin-governance.md",
    "../skill/references/taxonomy/lifecycle-reinit-close-revival.md",
    "../skill/references/taxonomy/state-machine-invariants.md",
    "../skill/references/workflows/release-gate-workflow.md",
    "../skill/references/workflows/formal-verification-handoff.md",
  ],
};

if (existsSync(commandsDir)) {
  for (const fileName of markdownFiles(commandsDir)) {
    const commandPath = join(commandsDir, fileName);
    const command = readText(commandPath);
    const label = `commands/${fileName}`;

    requireIncludes(command, "../skill/SKILL.md", `${label} routes to ../skill/SKILL.md`);

    const frontmatter = parseFrontmatter(command, label);
    if (frontmatter) {
      check(Boolean(frontmatter.get("name")), `${label} frontmatter has non-empty name`);
      check(Boolean(frontmatter.get("description")), `${label} frontmatter has non-empty description`);
    }

    const lineCount = command.split(/\r?\n/).length;
    check(
      lineCount <= maxCommandLines,
      `${label} should route to skill/SKILL.md and focused references instead of duplicating the skill body`,
    );

    for (const heading of copiedSkillHeadings) {
      check(!command.includes(heading), `${label} does not copy skill heading: ${heading}`);
    }
  }

  for (const [fileName, expectedRoutes] of Object.entries(commandRouteExpectations)) {
    const commandPath = join(commandsDir, fileName);
    check(existsSync(commandPath), `commands/${fileName} exists`);
    if (!existsSync(commandPath)) continue;

    const command = readText(commandPath);
    for (const route of expectedRoutes) {
      requireIncludes(command, route, `${fileName} routes to ${route}`);
    }
  }
}

if (failures > 0) {
  console.error(`\nE2E skill routing validation failed: ${failures} issue(s).`);
  process.exit(1);
}

console.log("\nE2E skill routing validation passed.");
