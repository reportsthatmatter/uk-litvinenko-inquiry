import { pipeline, flushFootnoteMarkers, quoteInset } from "@rtm/ingest";

/**
 * How this report is built. Owned by the report: every decision that shaped
 * its text is named here, and the passes it composes are library code, so a
 * fix to a shared pass reaches every report that calls it.
 */
export default pipeline({
  id: "litvinenko-inquiry",
  title: "The Litvinenko Inquiry",
  authors: "Sir Robert Owen (Chairman)",
  published_at: "21 January 2016",
  source_url: "https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/493860/The-Litvinenko-Inquiry-H-C-695-web.pdf",
  repo: ".",
  // Order is semantic: footnote numbering and page indices run continuously
  // across volumes, so reordering changes the output.
  volumes: [
    { path: "archive/The-Litvinenko-Inquiry-H-C-695-web.pdf", sha256: "236c70da1823f66851a0c316ca7e996e2e0365998b778df98a2bcc3acafc278e" },
  ],
  // OCR drops the space before a superscript here, leaving ~230 notes as bare
  // numbers in the prose. Safe for this report because its footnote numbering
  // runs once through the whole document, so a number names one note.
  passes: [
    flushFootnoteMarkers(),
    // Body text sits at column 7, quotations at 10. The default of five puts
    // every quotation in this report back into the prose.
    quoteInset(3),
  ],
});
