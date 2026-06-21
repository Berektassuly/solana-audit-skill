#!/usr/bin/env npx tsx

import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const skillPath = join(repoRoot, "skill", "SKILL.md");
const readmePath = join(repoRoot, "README.md");
const demoPath = join(repoRoot, "DEMO.md");
const examplesDir = join(repoRoot, "examples");
const agentsDir = join(repoRoot, "agents");
const rulesDir = join(repoRoot, "rules");
const commandsDir = join(repoRoot, "commands");

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

function requireFile(path: string, label: string): boolean {
  const exists = existsSync(path);
  check(exists, `${label} exists`);
  return exists;
}

function requireIncludes(content: string, needle: string, message: string) {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const normalizedNeedle = needle.replace(/\r\n/g, "\n");
  check(normalizedContent.includes(normalizedNeedle), message);
}

function requireHeading(content: string, fileLabel: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^#{2,3}\\s+${escaped}\\s*$`, "m");
  if (pattern.test(content)) {
    pass(`required heading present in ${fileLabel}: ${heading}`);
  } else {
    fail(`missing required heading in ${fileLabel}: ${heading}`);
  }
}

function requireTerms(content: string, fileLabel: string, terms: string[]) {
  for (const term of terms) {
    const pattern = new RegExp(`\\b${term}\\b`, "i");
    if (pattern.test(content)) {
      pass(`output-contract term present in ${fileLabel}: ${term}`);
    } else {
      fail(`missing output-contract term in ${fileLabel}: ${term}`);
    }
  }
}

function forbidPlaceholders(content: string, fileLabel: string) {
  const forbidden = [
    "TODO",
    "TBD",
    "FIXME",
    "Expected output: a good audit report",
    "check all vulnerabilities",
  ];

  for (const term of forbidden) {
    check(!content.includes(term), `placeholder text not present in ${fileLabel}: ${term}`);
  }
}

function forbidSecretMaterial(content: string, fileLabel: string) {
  const forbiddenPatterns = [
    { pattern: /"secretKey"\s*:/i, label: "keypair secretKey JSON" },
    { pattern: /\bseed phrase\b/i, label: "seed phrase request or content" },
    { pattern: /\bprivate key\b/i, label: "private key request or content" },
    { pattern: /\bwallet export\b/i, label: "wallet export request or content" },
    { pattern: /\bkeypair file contents\b/i, label: "keypair file contents request" },
    { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, label: "PEM private key block" },
  ];

  for (const { pattern, label } of forbiddenPatterns) {
    check(!pattern.test(content), `secret material not present in ${fileLabel}: ${label}`);
  }
}

if (requireFile(skillPath, "skill/SKILL.md")) {
  const skill = readText(skillPath);
  requireIncludes(skill, "user-invocable: true", "skill/SKILL.md contains user-invocable: true");
  requireIncludes(
    skill,
    "references/workflows/formal-verification-handoff.md",
    "skill/SKILL.md links formal verification handoff workflow",
  );
  requireIncludes(
    skill,
    "references/workflows/final-audit-report-template.md",
    "skill/SKILL.md links final audit report template workflow",
  );
  requireIncludes(
    skill,
    "references/workflows/release-gate-workflow.md",
    "skill/SKILL.md links release gate workflow",
  );
  requireIncludes(
    skill,
    "references/workflows/payment-audit-workflow.md",
    "skill/SKILL.md links payment audit workflow",
  );
  requireIncludes(
    skill,
    "references/workflows/transaction-safety-workflow.md",
    "skill/SKILL.md links transaction safety workflow",
  );
  requireIncludes(
    skill,
    "references/workflows/token-2022-policy-workflow.md",
    "skill/SKILL.md links Token-2022 policy workflow",
  );
  requireIncludes(
    skill,
    "references/workflows/pre-audit-design-review.md",
    "skill/SKILL.md links pre-audit design review workflow",
  );
  requireIncludes(skill.toLowerCase(), "private keys", "skill/SKILL.md keeps private-key safety guardrail");
  requireIncludes(skill.toLowerCase(), "seed phrases", "skill/SKILL.md keeps seed-phrase safety guardrail");
}

const formalWorkflow = join(repoRoot, "skill", "references", "workflows", "formal-verification-handoff.md");
const reportWorkflow = join(repoRoot, "skill", "references", "workflows", "final-audit-report-template.md");
const releaseGateWorkflow = join(repoRoot, "skill", "references", "workflows", "release-gate-workflow.md");
const paymentAuditWorkflow = join(repoRoot, "skill", "references", "workflows", "payment-audit-workflow.md");
const transactionSafetyWorkflow = join(repoRoot, "skill", "references", "workflows", "transaction-safety-workflow.md");
const tokenPolicyWorkflow = join(repoRoot, "skill", "references", "workflows", "token-2022-policy-workflow.md");
const preAuditDesignWorkflow = join(repoRoot, "skill", "references", "workflows", "pre-audit-design-review.md");
requireFile(formalWorkflow, "formal-verification-handoff.md");
if (requireFile(reportWorkflow, "final-audit-report-template.md")) {
  const content = readText(reportWorkflow);
  for (const status of ["Confirmed", "Hypothesis", "Residual Risk"]) {
    requireIncludes(content, status, `final-audit-report-template.md separates status: ${status}`);
  }
}
if (requireFile(releaseGateWorkflow, "release-gate-workflow.md")) {
  const content = readText(releaseGateWorkflow);
  for (const term of ["PASS", "FAIL", "SKIP", "authority", "build", "compute", "migration"]) {
    requireIncludes(content, term, `release-gate-workflow.md includes ${term}`);
  }
  check(
    /missing evidence[\s\S]*mark it `FAIL`/i.test(content) || /missing required release evidence[\s\S]*`FAIL`/i.test(content),
    "release-gate-workflow.md treats missing required release evidence as FAIL",
  );
}
if (requireFile(paymentAuditWorkflow, "payment-audit-workflow.md")) {
  const content = readText(paymentAuditWorkflow);
  for (const term of ["server-side", "reference", "idempotent", "finality", "Token-2022", "reconciliation"]) {
    requireIncludes(content, term, `payment-audit-workflow.md includes ${term}`);
  }
}
if (requireFile(transactionSafetyWorkflow, "transaction-safety-workflow.md")) {
  const content = readText(transactionSafetyWorkflow);
  for (const term of ["AUTONOMOUS_OK", "CONFIRM_REQUIRED", "NEVER_AUTO_SIGN", "NEEDS_MORE_INFO", "simulation", "backend signer"]) {
    requireIncludes(content, term, `transaction-safety-workflow.md includes ${term}`);
  }
  requireIncludes(
    content,
    "Decision: AUTONOMOUS_OK | CONFIRM_REQUIRED | NEVER_AUTO_SIGN | NEEDS_MORE_INFO",
    "transaction-safety-workflow.md emits one of the four transaction labels",
  );
}
if (requireFile(tokenPolicyWorkflow, "token-2022-policy-workflow.md")) {
  const content = readText(tokenPolicyWorkflow);
  for (const term of ["supported", "rejected", "residual risk", "gross", "net", "withheld fees", "compatibility"]) {
    requireIncludes(content, term, `token-2022-policy-workflow.md includes ${term}`);
  }
}
if (requireFile(preAuditDesignWorkflow, "pre-audit-design-review.md")) {
  const content = readText(preAuditDesignWorkflow);
  for (const term of ["Read Before Asking", "One Design Question At A Time", "recommended default", "Findings Ledger", "design risk"]) {
    requireIncludes(content, term, `pre-audit-design-review.md includes ${term}`);
  }
}

const requiredExamples = [
  "audit-plan-example.md",
  "finding-writeup-example.md",
  "final-report-example.md",
];

if (requireFile(examplesDir, "examples/ directory")) {
  const markdownFiles = readdirSync(examplesDir).filter((name) => name.endsWith(".md")).sort();
  check(
    JSON.stringify(markdownFiles) === JSON.stringify([...requiredExamples].sort()),
    `examples/ contains exactly required files: ${requiredExamples.join(", ")}`,
  );
}

if (requireFile(demoPath, "DEMO.md")) {
  const content = readText(demoPath);
  for (const heading of [
    "User Prompt",
    "References Loaded",
    "Finding Output",
    "Verification",
    "Final Report Excerpt",
  ]) {
    requireHeading(content, "DEMO.md", heading);
  }

  for (const term of ["Evidence", "Impact", "Fix", "Verification"]) {
    requireIncludes(content, term, `DEMO.md includes required finding term: ${term}`);
  }

  requireIncludes(content, "Status: Hypothesis", "DEMO.md labels finding status");
  requireIncludes(content, "Taxonomy mapping", "DEMO.md maps taxonomy");
  check(
    /false-positive|uncertainty/i.test(content),
    "DEMO.md includes false-positive or uncertainty notes",
  );
  forbidPlaceholders(content, "DEMO.md");
  forbidSecretMaterial(content, "DEMO.md");
}

const exampleContracts: Record<string, string[]> = {
  "audit-plan-example.md": [
    "User Prompt",
    "Expected Artifact",
    "Sample Output",
    "Why This Example Matters",
    "Attack Surface",
    "Priority Review Order",
    "Evidence To Collect",
    "Verification Targets",
  ],
  "finding-writeup-example.md": [
    "User Prompt",
    "Expected Artifact",
    "Sample Output",
    "Why This Example Matters",
    "Finding",
    "Status",
    "Severity",
    "Taxonomy",
    "Evidence",
    "Exploit Path",
    "Impact",
    "Fix",
    "Verification",
    "False-Positive Conditions",
  ],
  "final-report-example.md": [
    "User Prompt",
    "Expected Artifact",
    "Sample Output",
    "Why This Example Matters",
    "Executive Summary",
    "Scope",
    "Methodology",
    "Findings Table",
    "Detailed Findings",
    "Remediation Status",
    "Residual Risk",
    "Limitations",
  ],
};

for (const fileName of requiredExamples) {
  const path = join(examplesDir, fileName);
  if (!requireFile(path, `examples/${fileName}`)) continue;

  const content = readText(path);
  for (const heading of exampleContracts[fileName]) {
    requireHeading(content, fileName, heading);
  }

  requireTerms(content, fileName, ["evidence", "impact", "fix", "verification"]);
  forbidPlaceholders(content, fileName);
  forbidSecretMaterial(content, fileName);
}

const auditPlan = join(examplesDir, "audit-plan-example.md");
if (existsSync(auditPlan)) {
  const content = readText(auditPlan);
  for (const taxonomyClass of [
    "account-validation",
    "signer-authority",
    "pda-seeds-bumps",
    "cpi-trust-boundaries",
    "token-integration",
    "token-2022-transfer-hooks",
    "upgrade-admin-governance",
  ]) {
    requireIncludes(content, taxonomyClass, `audit-plan-example.md includes taxonomy class: ${taxonomyClass}`);
  }
}

const finding = join(examplesDir, "finding-writeup-example.md");
if (existsSync(finding)) {
  const content = readText(finding);
  requireIncludes(content, "Status\n\nHypothesis", "finding-writeup-example.md labels the finding as Hypothesis");
  requireIncludes(content, "Primary: `account-validation`", "finding-writeup-example.md maps primary taxonomy");
  check(
    content.includes("Secondary: `token-integration`") || content.includes("Secondary: `cpi-trust-boundaries`"),
    "finding-writeup-example.md maps secondary taxonomy",
  );
}

const finalReport = join(examplesDir, "final-report-example.md");
if (existsSync(finalReport)) {
  const content = readText(finalReport);
  requireIncludes(
    content,
    "| ID | Severity | Status | Taxonomy | Title |",
    "final-report-example.md contains required findings table columns",
  );
  for (const label of ["Evidence:", "Impact:", "Exploit Path:", "Fix:", "Verification:"]) {
    requireIncludes(content, label, `final-report-example.md detailed finding includes label: ${label}`);
  }
  for (const status of ["Confirmed", "Hypothesis", "Residual Risk", "Resolved"]) {
    requireIncludes(content, status, `final-report-example.md distinguishes status: ${status}`);
  }
}

const requiredAgents = ["audit-lead.md", "finding-writer.md"];
for (const fileName of requiredAgents) {
  const path = join(agentsDir, fileName);
  if (!requireFile(path, `agents/${fileName}`)) continue;

  const content = readText(path);
  requireIncludes(content, "skill/SKILL.md", `agents/${fileName} routes to skill/SKILL.md`);
  forbidPlaceholders(content, `agents/${fileName}`);
}

const requiredRules = ["audit-claim-discipline.md", "no-secret-material.md"];
for (const fileName of requiredRules) {
  const path = join(rulesDir, fileName);
  if (!requireFile(path, `rules/${fileName}`)) continue;

  const content = readText(path);
  forbidPlaceholders(content, `rules/${fileName}`);
}

const requiredCommands = [
  "audit-release-gate.md",
  "audit-transaction-safety.md",
  "audit-upgrade-migration.md",
];
for (const fileName of requiredCommands) {
  const path = join(commandsDir, fileName);
  if (!requireFile(path, `commands/${fileName}`)) continue;

  const content = readText(path);
  requireIncludes(content, "../skill/SKILL.md", `commands/${fileName} routes to ../skill/SKILL.md`);
  forbidPlaceholders(content, `commands/${fileName}`);
}

const releaseGateCommand = join(commandsDir, "audit-release-gate.md");
if (existsSync(releaseGateCommand)) {
  const content = readText(releaseGateCommand);
  requireIncludes(
    content,
    "../skill/references/workflows/release-gate-workflow.md",
    "audit-release-gate command routes to release-gate workflow",
  );
  for (const term of ["PASS", "FAIL", "SKIP"]) {
    requireIncludes(content, term, `audit-release-gate command requires ${term}`);
  }
  requireIncludes(content, "GATE: PASS|FAIL", "audit-release-gate command requires GATE: PASS|FAIL output");
  requireIncludes(
    content,
    "Every `FAIL` must map to a blocker, finding, or missing required evidence",
    "audit-release-gate command maps FAIL to blocker, finding, or missing evidence",
  );
  requireIncludes(
    content,
    "Missing required evidence is `FAIL`, not `SKIP`",
    "audit-release-gate command says missing required evidence is FAIL, not SKIP",
  );
}

const transactionCommand = join(commandsDir, "audit-transaction-safety.md");
if (existsSync(transactionCommand)) {
  const content = readText(transactionCommand);
  requireIncludes(
    content,
    "../skill/references/workflows/transaction-safety-workflow.md",
    "audit-transaction-safety command routes to transaction safety workflow",
  );
  requireIncludes(content, "Return exactly one decision label", "audit-transaction-safety command requires exactly one label");
  for (const label of ["AUTONOMOUS_OK", "CONFIRM_REQUIRED", "NEVER_AUTO_SIGN", "NEEDS_MORE_INFO"]) {
    requireIncludes(content, label, `audit-transaction-safety command requires label: ${label}`);
  }
  requireIncludes(
    content,
    "Decision: AUTONOMOUS_OK | CONFIRM_REQUIRED | NEVER_AUTO_SIGN | NEEDS_MORE_INFO",
    "audit-transaction-safety command output emits one of four labels",
  );
  for (const term of ["account deltas", "signer", "authority", "token", "CPI", "policy-risk"]) {
    requireIncludes(content, term, `audit-transaction-safety command reviews ${term}`);
  }
  requireIncludes(content, "Simulation success is evidence, not approval", "audit-transaction-safety command treats simulation as evidence");
}

const upgradeCommand = join(commandsDir, "audit-upgrade-migration.md");
if (existsSync(upgradeCommand)) {
  const content = readText(upgradeCommand).toLowerCase();
  for (const term of ["account layout", "migration", "authority", "simulation", "rollback"]) {
    requireIncludes(content, term, `audit-upgrade-migration command mentions ${term}`);
  }
  for (const ref of [
    "upgrade-admin-governance",
    "lifecycle-reinit-close-revival",
    "state-machine-invariants",
    "release-gate-workflow",
    "formal-verification-handoff",
  ]) {
    requireIncludes(content, ref, `audit-upgrade-migration command routes to ${ref}`);
  }
}

if (requireFile(readmePath, "README.md")) {
  const readme = readText(readmePath).toLowerCase();
  for (const phrase of [
    "demo.md",
    "agents/",
    "rules/",
    "audit-release-gate",
    "audit-transaction-safety",
    "audit-upgrade-migration",
    "pre-audit design review",
    "release-gate",
    "payment-audit",
    "transaction safety workflow",
    "token-2022 policy",
    "formal verification handoff",
    "final audit report template",
    "examples/",
    "no-credential golden",
    "default validation requires no external credentials",
  ]) {
    requireIncludes(readme, phrase, `README mentions ${phrase}`);
  }
}

if (failures > 0) {
  console.error(`\nGolden validation failed: ${failures} issue(s).`);
  process.exit(1);
}

console.log("\nGolden validation passed.");
