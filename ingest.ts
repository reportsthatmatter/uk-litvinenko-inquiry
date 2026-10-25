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
  typographicHeadings,
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
    // `keep`: Parts 4, 5, 6, 8 and 9 each open on the same "Chapter 1:  Introduction",
    // five identical lines at the head of a page, which went as a running head
    // (reportsthatmatter-8rv). Known cost: the five "RESTRICTION ORDER" titles in
    // Appendix 7 read as furniture and go (kept, the text reading makes each a
    // top-level section), and the printed pages that carry only the running title
    // (blank versos) lose their markers.
    runningFurniture({ numbersTrackPages: true, keep: /^Chapter 1: Introduction$/ }),
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
    // Parts, chapters and the topics under them are told apart only by face, against an 18pt
    // black body: Part titles in Arial 33 bold blue, chapter titles in Arial 30 bold blue, the
    // unnumbered topics ("Treatment in Barnet Hospital", PDF p.35) in ArialMT 26 blue and the
    // topics under those ("The pathologists", p.48) in ArialMT 22 blue; Appendix 7's notices
    // and orders are titled in Arial 30 bold black (No. 4 in 26), their sections in ArialMT 22 black (p.298).
    // The text reading knows Parts and chapters by their "Part N:" / "Chapter N:" labels but
    // read the ~180 topics as one-line paragraphs (reportsthatmatter-men), and Part 5's title
    // as a paragraph, leaving Part 5 under Part 4 (reportsthatmatter-8rv; corrections.yaml
    // c-0001 moves its stray colon). No `relevel`: Parts 1 and 2 are set in the chapter face
    // and stay top-level sections.
    typographicHeadings({
      firstLevel: 2,
      // Part 9's Chapter 5 title wraps after a comma onto a second line (PDF p.214).
      commaWraps: true,
      // The figure captions ("Plan of the Pine Bar", p.172) are in the 22pt blue face too, each
      // with its note marker.
      skipMarked: true,
      faces: [
        ["Arial|33|#6a86b8|b"],
        // (Restriction Notice No. 4, p.307, alone sets its title in Arial 26 bold black)
        ["Arial|30|#6a86b8|b", "Arial|30|#000000|b", "Arial|26|#000000|b"],
        ["ArialMT|26|#6a86b8", "ArialMT|22|#000000"],
        ["ArialMT|22|#6a86b8"],
      ],
    }),
  ],
});
