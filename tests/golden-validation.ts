#!/usr/bin/env npx tsx

import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const skillPath = join(repoRoot, "skill", "SKILL.md");
const readmePath = join(repoRoot, "README.md");
const examplesDir = join(repoRoot, "examples");

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
  requireIncludes(skill.toLowerCase(), "private keys", "skill/SKILL.md keeps private-key safety guardrail");
  requireIncludes(skill.toLowerCase(), "seed phrases", "skill/SKILL.md keeps seed-phrase safety guardrail");
}

const formalWorkflow = join(repoRoot, "skill", "references", "workflows", "formal-verification-handoff.md");
const reportWorkflow = join(repoRoot, "skill", "references", "workflows", "final-audit-report-template.md");
const releaseGateWorkflow = join(repoRoot, "skill", "references", "workflows", "release-gate-workflow.md");
const paymentAuditWorkflow = join(repoRoot, "skill", "references", "workflows", "payment-audit-workflow.md");
requireFile(formalWorkflow, "formal-verification-handoff.md");
requireFile(reportWorkflow, "final-audit-report-template.md");
if (requireFile(releaseGateWorkflow, "release-gate-workflow.md")) {
  const content = readText(releaseGateWorkflow);
  for (const term of ["PASS", "FAIL", "SKIP", "authority", "build", "compute", "migration"]) {
    requireIncludes(content, term, `release-gate-workflow.md includes ${term}`);
  }
}
if (requireFile(paymentAuditWorkflow, "payment-audit-workflow.md")) {
  const content = readText(paymentAuditWorkflow);
  for (const term of ["server-side", "reference", "idempotent", "finality", "Token-2022", "reconciliation"]) {
    requireIncludes(content, term, `payment-audit-workflow.md includes ${term}`);
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
  for (const status of ["Confirmed", "Residual Risk", "Resolved"]) {
    requireIncludes(content, status, `final-report-example.md distinguishes status: ${status}`);
  }
}

if (requireFile(readmePath, "README.md")) {
  const readme = readText(readmePath).toLowerCase();
  for (const phrase of [
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
