#!/usr/bin/env node
/**
 * Regression checks for this report's committed text.
 *
 * Runs against `full.md` as it stands, so it needs neither the source PDF nor
 * a re-ingest: `pnpm test`, anywhere, any time.
 *
 * These are the defects this report has actually had. Each assertion exists
 * because the thing it describes was once live on the site (issue #1), and
 * none of them was visible to the pipeline's own fidelity gates, which count
 * words rather than reading them in order.
 */
import { readFileSync } from "node:fs";

const md = readFileSync(new URL("./full.md", import.meta.url), "utf8");
const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
const blocks = body.split("\n\n").map((b) => b.trim()).filter(Boolean);
const isProse = (b) => !/^(#|>|-|%%|\[\^)/.test(b);

const failures = [];
const check = (ok, name, detail) => {
  console.log(`  ${ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"} ${name} — ${detail}`);
  if (!ok) failures.push(name);
};

// 1. Numbered paragraphs must survive as paragraphs.
//    The report numbers its paragraphs in the margin and indents the text
//    beside them. Read as an indentation, that made 865 of 1,089 paragraphs
//    into block quotes — the first line prose, the rest quoted.
const numbered = blocks.filter((b) => /^\d+\.\d+ /.test(b)).length;
check(numbered > 1000, "numbered paragraphs are paragraphs", `${numbered} (expected > 1000)`);

// 2. A paragraph must not run straight into a quotation.
//    The signature of that defect: a sentence stopping without terminal
//    punctuation, its remainder wearing quotation marks it never had.
let severed = 0;
let paragraphs = 0;
for (const [i, b] of blocks.entries()) {
  if (!isProse(b)) continue;
  paragraphs += 1;
  const next = blocks[i + 1];
  if (!next?.startsWith("> ")) continue;
  if (/[.?!:;]["”]?$/.test(b)) continue;
  if (/^> ["“]/.test(next)) continue;
  if (/^> [a-zà-ÿ]/.test(next)) severed += 1;
}
const rate = severed / Math.max(paragraphs, 1);
check(rate < 0.2, "sentences are not severed into quotations",
  `${severed}/${paragraphs} (${(rate * 100).toFixed(1)}%, limit 20%)`);

// 3. The real quotations must still be quotations.
//    Fixing (2) by simply refusing to quote anything would pass it and lose
//    every piece of witness evidence in the report.
const quotes = blocks.filter((b) => b.startsWith("> ")).length;
check(quotes > 300, "genuine quotations are preserved", `${quotes} (expected > 300)`);

// 4. Footnote markers must not sit bare in the prose.
//    OCR drops the space before a superscript here; ~230 notes once rendered
//    as a number stuck to the end of a word.
const fused = (body.match(/\b[a-z]{4,}\d{1,3}\b/g) ?? []).length;
check(fused < 20, "footnote markers are linked, not left bare", `${fused} fused (limit 20)`);

// 5. Every footnote reference must resolve.
const defined = new Set((body.match(/^\[\^(\d+)\]:/gm) ?? []).map((d) => d.replace(/\D/g, "")));
const orphans = [...new Set((body.match(/\[\^(\d+)\]/g) ?? []).map((r) => r.replace(/\D/g, "")))]
  .filter((n) => !defined.has(n));
check(orphans.length === 0, "every footnote reference has a note",
  orphans.length ? `${orphans.length} orphaned (e.g. ${orphans[0]})` : "all resolved");

console.log(
  failures.length
    ? `\n\x1b[31m${failures.length} check(s) failed.\x1b[0m Regenerate with \`pnpm exec tsx ../reportsthatmatter/scripts/ingest/cli.ts run litvinenko-inquiry\` and read the diff.`
    : "\n\x1b[32mAll checks passed.\x1b[0m"
);
process.exit(failures.length ? 1 : 0);
