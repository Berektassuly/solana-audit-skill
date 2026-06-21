#!/usr/bin/env npx tsx

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, extname, join, relative, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const skillDir = join(repoRoot, "skill");
const skillPath = join(skillDir, "SKILL.md");
const incidentSkillDir = join(repoRoot, "skills", "solana-incident-response");
const incidentSkillPath = join(incidentSkillDir, "SKILL.md");
const readmePath = join(repoRoot, "README.md");

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

function localMarkdownLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /!?\[[^\]\n]*\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content))) {
    const rawTarget = match[1].trim();
    const target = rawTarget.split(/\s+/)[0].replace(/^<|>$/g, "");
    if (!target || target.startsWith("#")) continue;
    if (/^(https?:|mailto:)/i.test(target)) continue;
    links.push(target.replace(/#.*/, ""));
  }

  return links;
}

function walkFiles(dir: string, ignored = new Set([".git", "node_modules"])): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, ignored));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

check(existsSync(skillPath), "skill/SKILL.md exists");

if (existsSync(skillPath)) {
  const skill = readText(skillPath);
  const frontmatter = parseFrontmatter(skill, "skill/SKILL.md");

  if (frontmatter) {
    const allowed = new Set(["name", "description", "user-invocable"]);
    const keys = [...frontmatter.keys()];
    check(keys.every((key) => allowed.has(key)), "skill frontmatter uses only broadly compatible fields");
    check(frontmatter.get("name") === "solana-audit", "skill name is solana-audit");

    const description = frontmatter.get("description") ?? "";
    const triggerTerms = ["solana", "anchor", "audit", "signer", "pda", "cpi", "token-2022", "report", "remediation"];
    const matches = triggerTerms.filter((term) => description.toLowerCase().includes(term)).length;
    check(matches >= 6, "skill description is specific to Solana and Anchor audit tasks");
  }

  for (const link of localMarkdownLinks(skill)) {
    const targetPath = resolve(skillDir, decodeURIComponent(link));
    check(existsSync(targetPath), `SKILL.md local link resolves: ${link}`);
  }
}

const requiredReferences = [
  "references/resources.md",
  "references/methodology.md",
  "references/severity-triage.md",
  "references/report-ingestion.md",
  "references/common-false-positives.md",
  "references/workflows/audit-engagement-workflow.md",
  "references/workflows/finding-writeup-workflow.md",
  "references/workflows/report-to-taxonomy-workflow.md",
  "references/checklists/pre-audit-intake.md",
  "references/checklists/program-review-checklist.md",
  "references/checklists/client-review-checklist.md",
  "references/checklists/release-blocker-checklist.md",
  "references/reports/public-audit-corpus.md",
  "references/reports/notable-incidents.md",
  "references/reports/cross-report-patterns.md",
  "references/taxonomy/account-validation.md",
  "references/taxonomy/signer-authority.md",
  "references/taxonomy/pda-seeds-bumps.md",
  "references/taxonomy/cpi-trust-boundaries.md",
  "references/taxonomy/token-integration.md",
  "references/taxonomy/token-2022-transfer-hooks.md",
  "references/taxonomy/zk-proof-soundness.md",
  "references/taxonomy/arithmetic-precision.md",
  "references/taxonomy/state-machine-invariants.md",
  "references/taxonomy/lifecycle-reinit-close-revival.md",
  "references/taxonomy/duplicate-mutable-aliasing.md",
  "references/taxonomy/oracle-pricing-mev.md",
  "references/taxonomy/upgrade-admin-governance.md",
  "references/taxonomy/durable-nonce-governance.md",
  "references/taxonomy/dos-compute-budget.md",
  "references/taxonomy/client-wallet-ux.md",
];

for (const ref of requiredReferences) {
  check(existsSync(join(skillDir, ref)), `required reference exists: ${ref}`);
}

check(existsSync(incidentSkillPath), "skills/solana-incident-response/SKILL.md exists");
if (existsSync(incidentSkillPath)) {
  const incidentSkill = readText(incidentSkillPath);
  const frontmatter = parseFrontmatter(incidentSkill, "skills/solana-incident-response/SKILL.md");

  if (frontmatter) {
    const allowed = new Set(["name", "description"]);
    const keys = [...frontmatter.keys()];
    check(keys.every((key) => allowed.has(key)), "incident-response skill frontmatter uses only portable fields");
    check(frontmatter.get("name") === "solana-incident-response", "incident-response skill name is solana-incident-response");

    const description = frontmatter.get("description") ?? "";
    const triggerTerms = ["solana", "incident", "triage", "transaction", "timeline", "blast", "evidence", "containment"];
    const matches = triggerTerms.filter((term) => description.toLowerCase().includes(term)).length;
    check(matches >= 6, "incident-response skill description is specific to Solana incident work");
  }
}

const incidentRequiredReferences = [
  "references/evidence-preservation.md",
  "references/triage-workflow.md",
  "references/source-map.md",
  "references/report-template.md",
  "agents/openai.yaml",
];

for (const ref of incidentRequiredReferences) {
  check(existsSync(join(incidentSkillDir, ref)), `incident-response reference exists: ${ref}`);
}

if (existsSync(incidentSkillDir)) {
  for (const file of walkFiles(incidentSkillDir)) {
    if (extname(file) !== ".md") continue;
    const content = readText(file);
    for (const link of localMarkdownLinks(content)) {
      const targetPath = resolve(dirname(file), decodeURIComponent(link));
      check(existsSync(targetPath), `${relative(repoRoot, file)} local link resolves: ${link}`);
    }
  }

  const openaiYamlPath = join(incidentSkillDir, "agents", "openai.yaml");
  if (existsSync(openaiYamlPath)) {
    const openaiYaml = readText(openaiYamlPath);
    check(openaiYaml.includes("$solana-incident-response"), "incident-response default prompt names the skill");
    check(openaiYaml.includes("Triage Solana exploits and evidence"), "incident-response UI metadata is specific");
  }
}

check(existsSync(readmePath), "README.md exists");
if (existsSync(readmePath)) {
  const readme = readText(readmePath).toLowerCase();
  check(readme.includes("what problem this solves"), "README explains the problem solved");
  check(readme.includes("installation"), "README documents installation");
  check(readme.includes("solana ai kit integration"), "README documents Solana AI Kit integration");
  check(readme.includes("bounty fit"), "README maps bounty fit");
  check(readme.includes("skills cli compatibility"), "README documents Skills CLI compatibility");
  check(readme.includes("optional model-backed evaluator"), "README documents the optional model-backed evaluator");
  check(readme.includes("npx skills add berektassuly/solana-audit-skill --skill solana-audit"), "README includes Skills CLI add command");
  check(readme.includes(".claude/skills/ext/solana-audit/skill/skill.md"), "README includes AI Kit skill route");
  check(readme.includes("solana-incident-response"), "README documents the incident-response skill");
}

const installPath = join(repoRoot, "install.sh");
check(existsSync(installPath), "install.sh exists");
if (existsSync(installPath)) {
  check(statSync(installPath).size > 0, "install.sh is non-empty");
  const installer = readText(installPath);
  check(installer.includes("solana-audit"), "install.sh targets solana-audit");
  check(installer.includes("--agents"), "install.sh supports --agents mode");
}

const commandsDir = join(repoRoot, "commands");
const auditCommandPath = join(commandsDir, "audit-solana.md");
check(existsSync(auditCommandPath), "commands/audit-solana.md exists");
if (existsSync(auditCommandPath)) {
  const command = readText(auditCommandPath);
  check(command.includes("../skill/SKILL.md"), "audit-solana command routes to skill/SKILL.md");
  const commandFrontmatter = parseFrontmatter(command, "commands/audit-solana.md");
  check(Boolean(commandFrontmatter?.get("description")), "audit-solana command has description frontmatter");
}

const rootShimPath = join(repoRoot, "SKILL.md");
if (existsSync(rootShimPath)) {
  const shim = readText(rootShimPath);
  check(shim.includes("skill/SKILL.md"), "root SKILL.md shim routes to canonical skill/SKILL.md");
  check(shim.length < 2000, "root SKILL.md shim stays minimal");
} else {
  pass("no root SKILL.md shim is present");
}

const scanExtensions = new Set([".md", ".sh", ".json", ".yaml", ".yml"]);
const placeholderPattern = /\b(TODO|TBD|FIXME|CHANGEME|YOUR_ORG|YOUR_REPO)\b|lorem ipsum|\[insert/iu;
for (const file of walkFiles(repoRoot)) {
  if (!scanExtensions.has(extname(file))) continue;
  const content = readText(file);
  check(!placeholderPattern.test(content), `no obvious placeholder text in ${relative(repoRoot, file)}`);
}

if (failures > 0) {
  console.error(`\nStatic validation failed: ${failures} issue(s).`);
  process.exit(1);
}

console.log("\nStatic validation passed.");
