import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { ResumeData } from "./generateResumePdf";

/**
 * ATS-plain DOCX generator.
 * - Single column, no tables, no text boxes, no images, no icons.
 * - Standard fonts (Calibri 11pt body, 12-14pt headings).
 * - Section headings are uppercase plain text with a thin bottom border.
 * - Bullets use real Word bullet numbering (no unicode bullet chars).
 */

const FONT = "Calibri";

// Compact sizes (half-points in docx). Tuned to fit a typical resume on a single page.
const BODY_SIZE = 14;     // 7pt
const SMALL_SIZE = 12;    // 6pt
const HEADING_SIZE = 16;  // 8pt
const NAME_SIZE = 22;     // 11pt

const sectionHeading = (text: string) =>
  new Paragraph({
    spacing: { before: 20, after: 0, line: 160 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000", space: 1 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: HEADING_SIZE,
        font: FONT,
      }),
    ],
  });

const body = (text: string, opts: { bold?: boolean; italics?: boolean; size?: number } = {}) =>
  new Paragraph({
    spacing: { after: 0, line: 160 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        italics: opts.italics,
        size: opts.size ?? BODY_SIZE,
        font: FONT,
      }),
    ],
  });

const bullet = (text: string) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 0, line: 160 },
    children: [new TextRun({ text, size: BODY_SIZE, font: FONT })],
  });

const splitBullets = (description: string): string[] => {
  if (!description) return [];
  return description
    .split(/\r?\n+/)
    .map((l) => l.replace(/^\s*[•\-\*\u2022]\s?/, "").trim())
    .filter(Boolean);
};

export async function downloadResumeDocx(data: ResumeData) {
  const { personalInfo, experiences, education, projects, certifications, skills } = data;

  const children: Paragraph[] = [];

  // Header — name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: 160 },
      children: [
        new TextRun({
          text: personalInfo.name || "",
          bold: true,
          size: NAME_SIZE,
          font: FONT,
        }),
      ],
    })
  );

  // Contact line
  const contactBits = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ].filter(Boolean);
  if (contactBits.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0, line: 160 },
        children: [
          new TextRun({ text: contactBits.join(" | "), size: SMALL_SIZE, font: FONT }),
        ],
      })
    );
  }

  // Links line
  const linkBits = [
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.portfolio,
  ].filter(Boolean);
  if (linkBits.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0, line: 160 },
        children: [
          new TextRun({ text: linkBits.join(" | "), size: SMALL_SIZE, font: FONT }),
        ],
      })
    );
  }

  // Summary
  if (personalInfo.summary?.trim()) {
    children.push(sectionHeading("Professional Summary"));
    children.push(body(personalInfo.summary.trim()));
  }

  // Skills
  if (skills?.trim()) {
    children.push(sectionHeading("Skills"));
    const list = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
    children.push(body(list));
  }

  // Experience
  if (experiences?.length) {
    children.push(sectionHeading("Professional Experience"));
    experiences.forEach((exp) => {
      children.push(
        new Paragraph({
          spacing: { before: 10, after: 0, line: 160 },
          children: [
            new TextRun({ text: exp.position || "", bold: true, size: BODY_SIZE, font: FONT }),
            new TextRun({ text: exp.company ? `, ${exp.company}` : "", size: BODY_SIZE, font: FONT }),
          ],
        })
      );
      if (exp.duration) {
        children.push(body(exp.duration, { italics: true, size: SMALL_SIZE }));
      }
      splitBullets(exp.description).forEach((line) => children.push(bullet(line)));
    });
  }

  // Education
  if (education?.length) {
    children.push(sectionHeading("Education"));
    education.forEach((ed) => {
      children.push(
        new Paragraph({
          spacing: { before: 8, after: 0, line: 160 },
          children: [
            new TextRun({ text: ed.degree || "", bold: true, size: BODY_SIZE, font: FONT }),
            new TextRun({ text: ed.school ? `, ${ed.school}` : "", size: BODY_SIZE, font: FONT }),
          ],
        })
      );
      if (ed.year) children.push(body(ed.year, { italics: true, size: SMALL_SIZE }));
    });
  }

  // Projects
  if (projects?.length) {
    children.push(sectionHeading("Projects"));
    projects.forEach((p) => {
      children.push(
        new Paragraph({
          spacing: { before: 10, after: 0, line: 160 },
          children: [
            new TextRun({ text: p.name || "", bold: true, size: BODY_SIZE, font: FONT }),
            new TextRun({ text: p.tech ? ` — ${p.tech}` : "", size: BODY_SIZE, font: FONT }),
          ],
        })
      );
      if (p.link) children.push(body(p.link, { italics: true, size: SMALL_SIZE }));
      splitBullets(p.description).forEach((line) => children.push(bullet(line)));
    });
  }

  // Certifications
  if (certifications?.length) {
    children.push(sectionHeading("Certifications"));
    certifications.forEach((c) => {
      const parts = [c.name, c.issuer, c.year].filter(Boolean).join(" — ");
      children.push(bullet(parts));
    });
  }

  const doc = new Document({
    creator: "Resume Builder",
    title: `${personalInfo.name || "Resume"} - Resume`,
    styles: {
      default: {
        document: { run: { font: FONT, size: BODY_SIZE } },
      },
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: "bullet" as any,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 220, hanging: 160 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            // Ultra-compact margins to keep the ATS Word export on one page.
            margin: { top: 360, bottom: 360, left: 360, right: 360 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${(personalInfo.name || "resume").replace(/\s+/g, "_")}_resume.docx`;
  saveAs(blob, filename);
}
