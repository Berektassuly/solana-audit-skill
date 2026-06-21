#!/usr/bin/env npx tsx

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, extname, isAbsolute, join, relative, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const skillDir = join(repoRoot, "skill");
const skillPath = join(skillDir, "SKILL.md");
const skillsDir = join(repoRoot, "skills");
const incidentSkillDir = join(repoRoot, "skills", "solana-incident-response");
const incidentSkillPath = join(incidentSkillDir, "SKILL.md");
const readmePath = join(repoRoot, "README.md");
const skillFrontmatterFields = new Set([
  "name",
  "description",
  "license",
  "allowed-tools",
  "metadata",
  "compatibility",
  "user-invocable",
]);
const skillNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const maxSkillNameLength = 64;
const maxDescriptionLength = 1024;
const maxCompatibilityLength = 500;

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

function checkSkillFrontmatter(fields: Map<string, string>, label: string, expectedName: string) {
  const keys = [...fields.keys()];
  check(keys.every((key) => skillFrontmatterFields.has(key)), `${label} frontmatter uses only spec-compatible fields`);

  const name = fields.get("name") ?? "";
  check(Boolean(name), `${label} frontmatter has name`);
  check(name === expectedName, `${label} name matches expected skill name`);
  check(name.length <= maxSkillNameLength, `${label} name is at most ${maxSkillNameLength} characters`);
  check(skillNamePattern.test(name), `${label} name is kebab-case without empty hyphen segments`);

  const description = fields.get("description") ?? "";
  check(Boolean(description), `${label} frontmatter has description`);
  check(description.length <= maxDescriptionLength, `${label} description is at most ${maxDescriptionLength} characters`);
  check(!/[<>]/.test(description), `${label} description does not contain angle brackets`);

  const compatibility = fields.get("compatibility");
  if (compatibility !== undefined) {
    check(compatibility.length <= maxCompatibilityLength, `${label} compatibility is at most ${maxCompatibilityLength} characters`);
  }
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

function markdownLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /!?\[[^\]\n]*\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content))) {
    const rawTarget = match[1].trim();
    const target = rawTarget.split(/\s+/)[0].replace(/^<|>$/g, "");
    if (!target || target.startsWith("#")) continue;
    links.push(target.replace(/#.*/, ""));
  }

  const referenceRegex = /^\s{0,3}\[[^\]\r\n]+\]:\s*(\S+)/gm;
  while ((match = referenceRegex.exec(content))) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (!target || target.startsWith("#")) continue;
    links.push(target.replace(/#.*/, ""));
  }

  return links;
}

function isAllowedExternalLink(target: string): boolean {
  return /^(https?:|mailto:)/i.test(target);
}

function isPathInside(targetPath: string, rootPath: string): boolean {
  const rel = relative(rootPath, targetPath);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function checkPackagedSkillLinks(skillRoot: string, label: string) {
  for (const file of walkFiles(skillRoot)) {
    if (extname(file) !== ".md") continue;
    const content = readText(file);
    const fileLabel = relative(repoRoot, file);

    for (const link of markdownLinks(content)) {
      if (isAllowedExternalLink(link)) continue;

      if (/^[A-Za-z][A-Za-z0-9+.-]*:/i.test(link)) {
        fail(`${fileLabel} uses unsupported markdown link scheme: ${link}`);
        continue;
      }

      const targetPath = resolve(dirname(file), decodeURIComponent(link));
      check(isPathInside(targetPath, skillRoot), `${fileLabel} local link stays inside ${label}: ${link}`);
      check(existsSync(targetPath), `${fileLabel} packaged local link resolves: ${link}`);
    }
  }
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

function toBashFriendlyPath(path: string): string {
  return path.replace(/\\/g, "/");
}

function runInstaller(args: string[]) {
  return spawnSync("bash", ["install.sh", ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function checkProcessSucceeded(result: ReturnType<typeof spawnSync>, message: string): boolean {
  if (result.status === 0) {
    pass(message);
    return true;
  }

  const detail = [result.error?.message, result.stderr, result.stdout].filter(Boolean).join(" ").trim();
  fail(detail ? `${message}: ${detail}` : message);
  return false;
}

function isSafeTempRoot(path: string): boolean {
  const resolved = resolve(path);
  const rel = relative(resolve(tmpdir()), resolved);
  return !rel.startsWith("..") && !isAbsolute(rel) && resolved.includes("solana-audit-install-");
}

function checkInstallerSmokeTest() {
  const bashCheck = spawnSync("bash", ["--version"], { encoding: "utf8" });
  if (bashCheck.error || bashCheck.status !== 0) {
    fail("bash is available for install.sh smoke validation");
    return;
  }
  pass("bash is available for install.sh smoke validation");

  const tempRoot = mkdtempSync(join(tmpdir(), "solana-audit-install-"));
  if (!isSafeTempRoot(tempRoot)) {
    fail(`installer smoke temp root is safely scoped: ${tempRoot}`);
    return;
  }
  pass("installer smoke temp root is safely scoped");

  try {
    const target = join(tempRoot, "solana-audit");
    const targetArg = toBashFriendlyPath(target);

    const firstInstall = runInstaller(["--path", targetArg]);
    if (!checkProcessSucceeded(firstInstall, "install.sh --path installs into a temp target")) {
      return;
    }
    if (!existsSync(join(target, "SKILL.md"))) {
      fail("install.sh temp target contains SKILL.md");
      return;
    }
    pass("install.sh temp target contains SKILL.md");

    const extraFile = join(target, "extra-user-file.txt");
    writeFileSync(extraFile, "preserve me\n", "utf8");

    const secondInstall = runInstaller(["--path", targetArg]);
    if (!checkProcessSucceeded(secondInstall, "install.sh rerun succeeds")) {
      return;
    }
    check(existsSync(extraFile), "install.sh rerun preserves unrelated files");

    const otherSkill = join(tempRoot, "different-skill");
    mkdirSync(otherSkill, { recursive: true });
    writeFileSync(
      join(otherSkill, "SKILL.md"),
      "---\nname: different-skill\ndescription: Existing different skill.\n---\n",
      "utf8",
    );

    const differentSkillInstall = runInstaller(["--path", toBashFriendlyPath(otherSkill)]);
    check(differentSkillInstall.status !== 0, "install.sh refuses to overwrite a different skill");
  } finally {
    if (isSafeTempRoot(tempRoot)) {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  }
}

check(existsSync(skillPath), "skill/SKILL.md exists");

if (existsSync(skillPath)) {
  const skill = readText(skillPath);
  const frontmatter = parseFrontmatter(skill, "skill/SKILL.md");

  if (frontmatter) {
    checkSkillFrontmatter(frontmatter, "skill/SKILL.md", "solana-audit");

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

checkPackagedSkillLinks(skillDir, "skill/");

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
    checkSkillFrontmatter(frontmatter, "skills/solana-incident-response/SKILL.md", "solana-incident-response");

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
  checkPackagedSkillLinks(incidentSkillDir, "skills/solana-incident-response");

  const openaiYamlPath = join(incidentSkillDir, "agents", "openai.yaml");
  if (existsSync(openaiYamlPath)) {
    const openaiYaml = readText(openaiYamlPath);
    check(openaiYaml.includes("$solana-incident-response"), "incident-response default prompt names the skill");
    check(openaiYaml.includes("Triage Solana exploits and evidence"), "incident-response UI metadata is specific");
  }
}

if (existsSync(skillsDir)) {
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const installableSkillDir = join(skillsDir, entry.name);
    if (installableSkillDir === incidentSkillDir) continue;
    const installableSkillPath = join(installableSkillDir, "SKILL.md");
    check(existsSync(installableSkillPath), `skills/${entry.name}/SKILL.md exists`);
    if (existsSync(installableSkillPath)) {
      const frontmatter = parseFrontmatter(readText(installableSkillPath), `skills/${entry.name}/SKILL.md`);
      if (frontmatter) {
        checkSkillFrontmatter(frontmatter, `skills/${entry.name}/SKILL.md`, entry.name);
      }
    }
    checkPackagedSkillLinks(installableSkillDir, `skills/${entry.name}`);
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
  check(readme.includes("npm.cmd test"), "README documents npm.cmd test for Windows PowerShell");
  check(readme.includes("/mnt/c/") && readme.includes("c:/users/"), "README documents Windows-friendly install.sh path forms");
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
  checkInstallerSmokeTest();
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
