#!/usr/bin/env npx tsx
/**
 * Skill benchmark suite.
 *
 * Two modes:
 *   trigger    - Does the skill get selected for Solana audit tasks?
 *   audit-plan - Once active, does the skill use a taxonomy-first audit posture?
 *
 * Usage:
 *   npx tsx run.ts
 *   npx tsx run.ts trigger
 *   npx tsx run.ts audit-plan
 *   npx tsx run.ts --verbose
 *   npx tsx run.ts trigger --case 3
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODEL = "claude-haiku-4-5-20251001";
const TARGET_SKILL = "solana-audit";

interface SkillEntry {
  name: string;
  description: string;
}

function loadSkillDescription(path: string): SkillEntry | null {
  try {
    const content = readFileSync(path, "utf-8");
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;
    const frontmatter = match[1];
    const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();
    if (!name || !description) return null;
    return { name, description };
  } catch {
    return null;
  }
}

function loadSkillBody(path: string): string {
  const content = readFileSync(path, "utf-8");
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "").trim();
}

const skills: SkillEntry[] = [
  loadSkillDescription(resolve(__dirname, "../skill/SKILL.md")),
  {
    name: "solana-dev",
    description: "Use when the user wants to build Solana apps, Anchor programs, test programs, or debug Solana development issues.",
  },
  {
    name: "react-best-practices",
    description: "Use when reviewing React or Next.js components for performance and architecture issues.",
  },
  {
    name: "vercel-deploy",
    description: "Use when deploying a web app to Vercel or debugging deployment failures.",
  },
  {
    name: "postgres-performance",
    description: "Use when tuning PostgreSQL queries, indexes, or database schema performance.",
  },
].filter(Boolean) as SkillEntry[];

const skillBody = loadSkillBody(resolve(__dirname, "../skill/SKILL.md"));

interface TestCase {
  prompt: string;
  expected: boolean;
}

interface SuiteResult {
  name: string;
  pass: number;
  fail: number;
  failures: { prompt: string; expected: boolean; got: boolean; reasoning: string }[];
}

async function runSuite(
  client: Anthropic,
  suiteName: string,
  systemPrompt: string,
  cases: TestCase[],
  evaluator: (text: string) => { matched: boolean; reasoning: string },
  verbose: boolean,
  singleCase: number,
): Promise<SuiteResult> {
  const selected = singleCase >= 0 ? [cases[singleCase]] : cases;
  const startIdx = singleCase >= 0 ? singleCase : 0;

  const result: SuiteResult = { name: suiteName, pass: 0, fail: 0, failures: [] };

  console.log(`\nSuite: ${suiteName}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Cases: ${selected.length}\n`);

  for (let i = 0; i < selected.length; i++) {
    const { prompt, expected } = selected[i];
    const idx = startIdx + i + 1;

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 700,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const { matched, reasoning } = evaluator(text);
      const ok = matched === expected;

      if (ok) {
        result.pass++;
        console.log(`  PASS #${idx} ${expected ? "SHOULD" : "SHOULD NOT"} match - "${prompt}"`);
      } else {
        result.fail++;
        console.log(`  FAIL #${idx} ${expected ? "SHOULD" : "SHOULD NOT"} match - "${prompt}"`);
        result.failures.push({ prompt, expected, got: matched, reasoning });
      }

      if (verbose) {
        console.log(`    ${reasoning}\n`);
      }
    } catch (err: any) {
      result.fail++;
      console.log(`  ERROR #${idx} - "${prompt}": ${err.message}`);
    }
  }

  return result;
}

const triggerSystemPrompt = `You are a skill-matching engine for a coding assistant.
You are given a list of available skills with their names and descriptions.
Your job is to decide which skills, if any, should be activated for the user's message.

Available skills:
${skills.map((s) => `- ${s.name}: ${s.description}`).join("\n")}

Respond with a JSON object:
{
  "triggered_skills": ["skill-name", "..."],
  "reasoning": "brief explanation"
}

Rules:
- Only include skills that are clearly relevant to the user's request.
- If no skill matches, return an empty array.
- Respond ONLY with the JSON object.`;

const triggerCases: TestCase[] = [
  { prompt: "Audit this Anchor instruction for signer and PDA bugs", expected: true },
  { prompt: "Review this Solana program for CPI trust-boundary issues", expected: true },
  { prompt: "Generate a release blocker checklist for this Token-2022 integration", expected: true },
  { prompt: "Explain common Solana account validation vulnerabilities from public audits", expected: true },
  { prompt: "Map this public Solana audit report to a normalized vulnerability taxonomy", expected: true },
  { prompt: "I need an exploit review for a Solana multisig upgrade path", expected: true },
  { prompt: "Assess whether this PDA derivation is vulnerable to seed-collision or bump misuse", expected: true },
  { prompt: "Classify the risks in this Anchor escrow by taxonomy, not just by best practices", expected: true },
  { prompt: "Review this token vault for authority, account-owner, and duplicate-account issues", expected: true },
  { prompt: "Give me a client-side signing risk checklist for a Solana wallet flow", expected: true },
  { prompt: "Analyze this wormhole-style fake-account exploit path on Solana", expected: true },
  { prompt: "Create a pre-audit intake checklist for a Solana governance program", expected: true },
  { prompt: "Review this Token-2022 mint integration for transfer fee and memo hazards", expected: true },
  { prompt: "Summarize real Solana oracle manipulation classes from public findings", expected: true },
  { prompt: "Perform an audit-readiness review of my Anchor program before mainnet", expected: true },
  { prompt: "Compare this finding against OtterSec, Zellic, and Neodyme Solana taxonomies", expected: true },
  { prompt: "Identify likely lifecycle bugs in this close and reinit logic", expected: true },
  { prompt: "Write a finding draft for this signer enforcement bug in a Solana instruction", expected: true },
  { prompt: "Audit this staking program for state-machine invariant failures", expected: true },
  { prompt: "Explain Solana duplicate mutable aliasing and how reviewers should catch it", expected: true },
  { prompt: "Review whether this wallet flow could cause blind-signing security issues on Solana", expected: true },
  { prompt: "Digest these public Raydium and Cashio incidents into reusable Solana audit lessons", expected: true },
  { prompt: "Build me a React landing page", expected: false },
  { prompt: "Deploy this app to Vercel", expected: false },
  { prompt: "Review my Ethereum contract", expected: false },
  { prompt: "Help with PostgreSQL indexing", expected: false },
  { prompt: "Write a Rust CLI tool", expected: false },
  { prompt: "Optimize this Next.js component", expected: false },
  { prompt: "Set up a Supabase database", expected: false },
  { prompt: "Explain CSS grid layout", expected: false },
  { prompt: "Build a Solana dapp frontend", expected: false },
  { prompt: "Debug my Anchor build error", expected: false },
];

function triggerEvaluator(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? text);
    const matched = Array.isArray(parsed.triggered_skills) && parsed.triggered_skills.includes(TARGET_SKILL);
    return {
      matched,
      reasoning: `skills: [${(parsed.triggered_skills || []).join(", ")}] - ${parsed.reasoning || "no reasoning"}`,
    };
  } catch {
    return { matched: false, reasoning: `[parse error] ${text}` };
  }
}

const auditPlanSystemPrompt = `You are Claude Code. The following skill has been activated for this conversation:

<skill>
${skillBody}
</skill>

The user is asking for Solana security help. Respond as a JSON object:
{
  "approach": ["ordered step", "..."],
  "taxonomy_first": true,
  "report_backed_categories": ["category", "..."],
  "attack_surface": ["surface", "..."],
  "mentions_severity": true,
  "requests_private_keys": false,
  "defaults_safe_cluster": true,
  "encourages_unaudited_mainnet": false,
  "reasoning": "brief explanation"
}

Rules:
- Use a taxonomy-first audit workflow.
- Mention report-backed categories, attack-surface classification, and severity or risk notes.
- Do not request seed phrases, private keys, or keypair file contents.
- Do not encourage unaudited mainnet execution by default.
- Respond ONLY with the JSON object.`;

const auditPlanCases: TestCase[] = [
  { prompt: "Review this Anchor vault for signer, PDA, and token integration bugs", expected: true },
  { prompt: "Create an audit plan for a Solana governance upgrade", expected: true },
  { prompt: "Assess this exploit path for fake-account and CPI issues", expected: true },
  { prompt: "Give me a release blocker review for this Token-2022 launch", expected: true },
  { prompt: "Digest this public audit and tell me which taxonomy classes it hits", expected: true },
  { prompt: "Review my wallet signing flow for Solana security risks", expected: true },
  { prompt: "Analyze oracle and accounting risks in this lending protocol", expected: true },
  { prompt: "I want to go live quickly. What should you review first in this Anchor code?", expected: true },
];

function auditPlanEvaluator(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? text);
    const categories = Array.isArray(parsed.report_backed_categories) ? parsed.report_backed_categories : [];
    const surfaces = Array.isArray(parsed.attack_surface) ? parsed.attack_surface : [];
    const approach = Array.isArray(parsed.approach) ? parsed.approach : [];

    const matched = Boolean(
      parsed.taxonomy_first === true &&
      categories.length > 0 &&
      surfaces.length > 0 &&
      approach.length >= 3 &&
      parsed.mentions_severity === true &&
      parsed.requests_private_keys === false &&
      parsed.defaults_safe_cluster === true &&
      parsed.encourages_unaudited_mainnet === false
    );

    return {
      matched,
      reasoning: `taxonomy_first=${parsed.taxonomy_first}, categories=${categories.length}, surfaces=${surfaces.length}, severity=${parsed.mentions_severity}, asks_keys=${parsed.requests_private_keys}, safe_cluster=${parsed.defaults_safe_cluster}, unsafe_mainnet=${parsed.encourages_unaudited_mainnet} - ${parsed.reasoning || "no reasoning"}`,
    };
  } catch {
    return { matched: false, reasoning: `[parse error] ${text}` };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose");
  const suiteFilter = args.find((a) => ["trigger", "audit-plan"].includes(a));
  const caseIdx = args.includes("--case")
    ? parseInt(args[args.indexOf("--case") + 1], 10) - 1
    : -1;

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.error("Missing Anthropic credentials. Set ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN before running the evaluator suites.");
    process.exit(1);
  }

  const client = new Anthropic();
  const results: SuiteResult[] = [];

  if (!suiteFilter || suiteFilter === "trigger") {
    results.push(
      await runSuite(client, "Skill trigger matching", triggerSystemPrompt, triggerCases, triggerEvaluator, verbose, caseIdx)
    );
  }

  if (!suiteFilter || suiteFilter === "audit-plan") {
    results.push(
      await runSuite(client, "Audit-plan behavior", auditPlanSystemPrompt, auditPlanCases, auditPlanEvaluator, verbose, caseIdx)
    );
  }

  console.log(`\n${"=".repeat(60)}`);
  let totalPass = 0;
  let totalFail = 0;

  for (const result of results) {
    totalPass += result.pass;
    totalFail += result.fail;
    const pct = Math.round((result.pass / (result.pass + result.fail)) * 100);
    console.log(`${result.name}: ${result.pass}/${result.pass + result.fail} (${pct}%)`);

    for (const failure of result.failures) {
      console.log(`  FAIL "${failure.prompt}"`);
      console.log(`    expected ${failure.expected ? "YES" : "NO"}, got ${failure.got ? "YES" : "NO"}`);
      console.log(`    ${failure.reasoning}`);
    }
  }

  const totalPct = Math.round((totalPass / (totalPass + totalFail)) * 100);
  console.log("-".repeat(60));
  console.log(`Total: ${totalPass}/${totalPass + totalFail} (${totalPct}%)\n`);

  process.exit(totalFail > 0 ? 1 : 0);
}

main();
