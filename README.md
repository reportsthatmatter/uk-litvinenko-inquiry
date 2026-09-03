# The Litvinenko Inquiry

Report into the death of Alexander Litvinenko, chaired by Sir Robert Owen.
Presented to Parliament pursuant to section 26 of the Inquiries Act 2005,
21 January 2016 (HC 695).

The inquiry examined the poisoning of Alexander Litvinenko, a former officer
of the Russian FSB, in London in November 2006. It found he was killed by
Andrei Lugovoi and Dmitry Kovtun, and that there was a "strong probability"
they were acting on behalf of the Russian FSB, "probably" approved by
Nikolai Patrushev and President Putin.

## Materials

`archive/The-Litvinenko-Inquiry-H-C-695-web.pdf` — from
https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/493860/The-Litvinenko-Inquiry-H-C-695-web.pdf

Born-digital PDF (not a scan) — clean text layer throughout.

## License

Crown copyright 2016, licensed under the Open Government Licence v3.0.
https://nationalarchives.gov.uk/doc/open-government-licence/version/3

## Rebuilding the text

`full.md` is generated, never hand-edited. `ingest.ts` is the whole recipe —
which PDFs, in what order, with what metadata, and which pipeline passes.

```bash
pnpm install
pnpm exec tsx ../reportsthatmatter/scripts/ingest/cli.ts run litvinenko-inquiry
```

Corrections to the text go in `corrections.yaml`, never into `full.md`. Each
must match exactly once or the build fails naming it. `baseline.json` is the
regression digest: if a pipeline change moves this report's output, it fails
until the baseline moves with it after the diff has been read.

## Checking the text

```bash
pnpm test
```

Runs `check.mjs` against the committed `full.md` — no source PDF, no
re-ingest needed. Each assertion exists because the thing it describes was
once live on the site (#1), and none of them was visible to the pipeline's own
fidelity gates, which count words rather than reading them in order:

- numbered paragraphs survive as paragraphs, not block quotes
- no paragraph runs straight into a quotation mid-sentence
- the genuine quotations are still quotations
- footnote markers are linked rather than left as bare numbers
- every footnote reference resolves

Verified to fail on the text as it stood when #1 was reported (46.6% severed
against a 20% limit) and pass on the text as it stands now (10.5%).

