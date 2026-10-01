"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from "docx";

// Simple HTML-to-DOCX converter
// Parses basic HTML tags from the document content
function htmlToDocxParagraphs(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Strip doc-field spans, keep text
  const cleaned = html
    .replace(/<span class="doc-field">(.*?)<\/span>/gi, "$1")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\nHEADING:$1\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  const lines = cleaned.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("HEADING:")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace("HEADING:", "").trim(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmed.includes("**")) {
      // Bold text
      const parts = trimmed.split("**");
      const runs: TextRun[] = parts.map((p, i) =>
        new TextRun({ text: p, bold: i % 2 === 1 })
      );
      paragraphs.push(new Paragraph({ children: runs }));
    } else {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed })],
          spacing: { after: 120 },
        })
      );
    }
  }

  return paragraphs;
}

export async function exportToDOCX(
  htmlContent: string,
  filename: string = "document"
) {
  const paragraphs = htmlToDocxParagraphs(htmlContent);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1800,   // 1.25 inch left margin
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
