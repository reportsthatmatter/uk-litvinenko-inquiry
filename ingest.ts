import { layoutPageJoins,
  quoteListRunOns,
  pipeline,
  runningFurniture,
  layoutMarkers,
  quoteInset,
  numberedParagraphs,
  hangingIndents,
  letteredItems,
  footnoteRestarts,
} from "@rtm/ingest";

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
    // A paragraph run over a page break that opens on a capital, a digit or a
    // quotation mark (or follows a full stop on a justified page) joins when the
    // layout says it runs on: no first-line indent, same face (reportsthatmatter-38s.10).
    layoutPageJoins(),
    // A quotation running over a page arrives as two (reportsthatmatter-38s.9).
    quoteListRunOns(),
    // The running title ("The Litvinenko Inquiry", recto) and the part tab
    // ("Part 3 | Chapters 1 to 5 | …", verso) open every page. Undeclared, they
    // stood as 132 + 109 paragraphs and were spliced into sentences at page
    // breaks (reportsthatmatter-56s). `numbersTrackPages` keeps the chapter
    // headings that open Parts 6, 10 and 12 (three more are lost without it).
    // Known cost: the five "RESTRICTION ORDER" titles in Appendix 7 and Part 5's
    // "Chapter 1: Introduction" read as furniture and go, and the printed pages
    // that carry only the running title (blank versos) lose their markers.
    runningFurniture({ numbersTrackPages: true }),
    // The markers are the small raised digits the PDF sets, found by the words before them and
    // linked to the note on their page. They replace `flushFootnoteMarkers`: with only some markers
    // linked, the renderer's alignment of repeated labels took early definitions and opened 20 notes
    // from another page; linked all together, none do (reportsthatmatter-y0w9, b94).
    layoutMarkers(),
    // Notes start over at 1 in each Part; a Part's first page with only its
    // note 1 (Part 6, p.109) lost the Part's first notes to the body
    // (reportsthatmatter-n7fb).
    footnoteRestarts(),
    // Body text sits at column 7, quotations at 10. The default of five puts
    // every quotation in this report back into the prose.
    quoteInset(3),
    // Numbered "3.77" paragraphs, at the margin with no reliable blank line
    // before the next one (reportsthatmatter-hzf).
    numberedParagraphs(),
    // Paragraph text hangs one tab-stop in from its number ("4.57      Ever
    // since…"), which is the quotation inset, so 130-odd paragraphs were cut
    // into a prose opening and a quotation (reportsthatmatter-56s, -jvy).
    hangingIndents(),
    // The same for "a." / "b." sub-items, whose wrapped lines sit at that inset
    // and which must not run on into the next item.
    letteredItems(),
  ],
});
