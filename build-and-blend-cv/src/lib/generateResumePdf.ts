import jsPDF from "jspdf";

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  tech: string;
  description: string;
  link: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  experiences: WorkExperience[];
  education: Education[];
  projects?: Project[];
  certifications?: Certification[];
  skills: string;
}

const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm

interface DensityConfig {
  margin: number;
  nameSize: number;
  contactSize: number;
  sectionTitleSize: number;
  bodySize: number;
  smallSize: number;
  lineGap: number;        // extra mm added per line
  sectionGapTop: number;  // mm before a section title
  itemGap: number;        // mm between items in a section
  bulletGap: number;      // mm between bullets
}

// Several density levels — we render in memory and pick the densest one
// that still fits on a single page.
const DENSITIES: DensityConfig[] = [
  { margin: 15, nameSize: 22, contactSize: 10, sectionTitleSize: 13, bodySize: 10, smallSize: 9, lineGap: 1.5, sectionGapTop: 4, itemGap: 2, bulletGap: 0 },
  { margin: 13, nameSize: 20, contactSize: 9.5, sectionTitleSize: 12, bodySize: 9.5, smallSize: 8.5, lineGap: 1.0, sectionGapTop: 3, itemGap: 1.5, bulletGap: 0 },
  { margin: 12, nameSize: 18, contactSize: 9, sectionTitleSize: 11, bodySize: 9, smallSize: 8, lineGap: 0.6, sectionGapTop: 2.5, itemGap: 1, bulletGap: 0 },
  { margin: 10, nameSize: 16, contactSize: 8.5, sectionTitleSize: 10.5, bodySize: 8.5, smallSize: 7.5, lineGap: 0.3, sectionGapTop: 2, itemGap: 0.6, bulletGap: 0 },
  { margin: 8,  nameSize: 15, contactSize: 8, sectionTitleSize: 10, bodySize: 8, smallSize: 7, lineGap: 0.1, sectionGapTop: 1.5, itemGap: 0.4, bulletGap: 0 },
  { margin: 7,  nameSize: 14, contactSize: 7.5, sectionTitleSize: 9.5, bodySize: 7.5, smallSize: 6.5, lineGap: 0, sectionGapTop: 1.2, itemGap: 0.3, bulletGap: 0 },
  { margin: 6,  nameSize: 13, contactSize: 7, sectionTitleSize: 9, bodySize: 7, smallSize: 6.5, lineGap: 0, sectionGapTop: 1, itemGap: 0.2, bulletGap: 0 },
  { margin: 5,  nameSize: 12, contactSize: 7, sectionTitleSize: 8.5, bodySize: 6.8, smallSize: 6, lineGap: 0, sectionGapTop: 0.8, itemGap: 0.15, bulletGap: 0 },
];

const scaleDensity = (cfg: DensityConfig, scale: number): DensityConfig => ({
  margin: 3,
  nameSize: Math.max(6.5, cfg.nameSize * scale),
  contactSize: Math.max(4.8, cfg.contactSize * scale),
  sectionTitleSize: Math.max(5.5, cfg.sectionTitleSize * scale),
  bodySize: Math.max(4.8, cfg.bodySize * scale),
  smallSize: Math.max(4.5, cfg.smallSize * scale),
  lineGap: 0,
  sectionGapTop: Math.max(0.25, cfg.sectionGapTop * scale),
  itemGap: Math.max(0.05, cfg.itemGap * scale),
  bulletGap: 0,
});

/**
 * Render the resume using a given density. Returns the doc and whether
 * it overflowed past a single page.
 */
const renderWithDensity = (
  data: ResumeData,
  cfg: DensityConfig
): { doc: jsPDF; overflow: boolean; finalY: number; bottomLimit: number } => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PAGE_MARGIN = cfg.margin;
  const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
  const BOTTOM_LIMIT = PAGE_HEIGHT - PAGE_MARGIN;
  let y = PAGE_MARGIN;
  let overflow = false;

  const checkOverflow = (needed: number) => {
    if (y + needed > BOTTOM_LIMIT) overflow = true;
  };

  const addSectionTitle = (title: string) => {
    y += cfg.sectionGapTop;
    checkOverflow(cfg.sectionTitleSize * 0.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(cfg.sectionTitleSize);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), PAGE_MARGIN, y);
    y += 1.2;
    doc.setDrawColor(180, 180, 180);
    doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
    y += cfg.bodySize * 0.45 + 1;
  };

  const addWrappedText = (
    text: string,
    options: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number } = {}
  ) => {
    const { size = cfg.bodySize, bold = false, color = [60, 60, 60], indent = 0 } = options;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const width = CONTENT_WIDTH - indent;
    const lines = doc.splitTextToSize(text, width);
    lines.forEach((line: string) => {
      checkOverflow(size * 0.5);
      doc.text(line, PAGE_MARGIN + indent, y);
      y += size * 0.45 + cfg.lineGap;
    });
  };

  const addBulletedDescription = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const hasBullets = lines.some((l) => /^[•\-\*]/.test(l));
    if (!hasBullets) {
      addWrappedText(text);
      return;
    }
    lines.forEach((raw) => {
      const clean = raw.replace(/^[•\-\*]\s?/, "");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(cfg.bodySize);
      doc.setTextColor(60, 60, 60);
      doc.text("•", PAGE_MARGIN + 1, y);
      const wrapped = doc.splitTextToSize(clean, CONTENT_WIDTH - 6);
      wrapped.forEach((w: string) => {
        checkOverflow(cfg.bodySize * 0.5);
        doc.text(w, PAGE_MARGIN + 6, y);
        y += cfg.bodySize * 0.45 + cfg.lineGap;
      });
      y += cfg.bulletGap;
    });
  };

  // Header - Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(cfg.nameSize);
  doc.setTextColor(20, 20, 20);
  doc.text(data.personalInfo.name || "Your Name", PAGE_MARGIN, y);
  y += cfg.nameSize * 0.4 + 1;

  // Contact line
  const contactParts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
  ].filter(Boolean);
  if (contactParts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(cfg.contactSize);
    doc.setTextColor(90, 90, 90);
    doc.text(contactParts.join("  •  "), PAGE_MARGIN, y);
    y += cfg.contactSize * 0.4 + 0.5;
  }

  // Links
  const linkParts = [
    data.personalInfo.linkedin,
    data.personalInfo.github,
    data.personalInfo.portfolio,
  ].filter((l): l is string => !!l && l.trim().length > 0);
  if (linkParts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(cfg.smallSize);
    doc.setTextColor(60, 90, 180);
    doc.text(linkParts.join("  •  "), PAGE_MARGIN, y);
    y += cfg.smallSize * 0.4 + 0.5;
  }

  doc.setDrawColor(120, 120, 120);
  doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
  y += 1.5;

  // Summary
  if (data.personalInfo.summary?.trim()) {
    addSectionTitle("Professional Summary");
    addWrappedText(data.personalInfo.summary);
  }

  // Skills (placed early so it always appears even if dense)
  if (data.skills.trim()) {
    addSectionTitle("Skills");
    addWrappedText(data.skills);
  }

  // Experience
  if (data.experiences.length > 0) {
    addSectionTitle("Work Experience");
    data.experiences.forEach((exp) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(cfg.bodySize + 1);
      doc.setTextColor(30, 30, 30);
      checkOverflow(cfg.bodySize);
      doc.text(exp.position || "Position", PAGE_MARGIN, y);
      if (exp.duration) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(cfg.bodySize);
        doc.setTextColor(110, 110, 110);
        const durWidth = doc.getTextWidth(exp.duration);
        doc.text(exp.duration, PAGE_WIDTH - PAGE_MARGIN - durWidth, y);
      }
      y += cfg.bodySize * 0.5 + 0.5;
      if (exp.company) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(cfg.smallSize);
        doc.setTextColor(80, 80, 80);
        doc.text(exp.company, PAGE_MARGIN, y);
        y += cfg.smallSize * 0.5 + 0.5;
      }
      if (exp.description) {
        addBulletedDescription(exp.description);
      }
      y += cfg.itemGap;
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    addSectionTitle("Projects");
    data.projects.forEach((proj) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(cfg.bodySize + 1);
      doc.setTextColor(30, 30, 30);
      checkOverflow(cfg.bodySize);
      doc.text(proj.name || "Project", PAGE_MARGIN, y);
      if (proj.link) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(cfg.smallSize);
        doc.setTextColor(60, 90, 180);
        const linkWidth = doc.getTextWidth(proj.link);
        doc.text(proj.link, PAGE_WIDTH - PAGE_MARGIN - linkWidth, y);
      }
      y += cfg.bodySize * 0.5 + 0.5;
      if (proj.tech) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(cfg.smallSize);
        doc.setTextColor(100, 100, 100);
        doc.text(proj.tech, PAGE_MARGIN, y);
        y += cfg.smallSize * 0.5 + 0.5;
      }
      if (proj.description) {
        addBulletedDescription(proj.description);
      }
      y += cfg.itemGap;
    });
  }

  // Education
  if (data.education.length > 0) {
    addSectionTitle("Education");
    data.education.forEach((edu) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(cfg.bodySize + 1);
      doc.setTextColor(30, 30, 30);
      checkOverflow(cfg.bodySize);
      doc.text(edu.degree || "Degree", PAGE_MARGIN, y);
      if (edu.year) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(cfg.bodySize);
        doc.setTextColor(110, 110, 110);
        const yrWidth = doc.getTextWidth(edu.year);
        doc.text(edu.year, PAGE_WIDTH - PAGE_MARGIN - yrWidth, y);
      }
      y += cfg.bodySize * 0.5 + 0.5;
      if (edu.school) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(cfg.smallSize);
        doc.setTextColor(80, 80, 80);
        doc.text(edu.school, PAGE_MARGIN, y);
        y += cfg.smallSize * 0.5 + cfg.itemGap;
      }
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    addSectionTitle("Certifications");
    data.certifications.forEach((cert) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(cfg.bodySize);
      doc.setTextColor(30, 30, 30);
      checkOverflow(cfg.bodySize);
      doc.text(cert.name || "Certification", PAGE_MARGIN, y);
      if (cert.year) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(cfg.bodySize);
        doc.setTextColor(110, 110, 110);
        const yrWidth = doc.getTextWidth(cert.year);
        doc.text(cert.year, PAGE_WIDTH - PAGE_MARGIN - yrWidth, y);
      }
      y += cfg.bodySize * 0.5 + 0.3;
      if (cert.issuer) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(cfg.smallSize);
        doc.setTextColor(90, 90, 90);
        doc.text(cert.issuer, PAGE_MARGIN, y);
        y += cfg.smallSize * 0.5 + 0.3;
      }
    });
  }

  // If we ever pushed past the page, jsPDF would have auto-added a page.
  if (doc.getNumberOfPages() > 1) overflow = true;

  return { doc, overflow, finalY: y, bottomLimit: BOTTOM_LIMIT };
};

export const buildResumePdf = (data: ResumeData): jsPDF => {
  // Try densities from comfortable -> compact, return first that fits.
  let lastResult: ReturnType<typeof renderWithDensity> | null = null;
  let lastCfg = DENSITIES[DENSITIES.length - 1];
  for (const cfg of DENSITIES) {
    const result = renderWithDensity(data, cfg);
    lastResult = result;
    lastCfg = cfg;
    if (!result.overflow) return result.doc;
  }

  // Final pass: scale the whole layout down to fit instead of deleting/cutting content.
  const contentHeight = Math.max(1, lastResult!.finalY - lastCfg.margin);
  const availableHeight = PAGE_HEIGHT - 6;
  const fittedCfg = scaleDensity(lastCfg, Math.min(1, availableHeight / contentHeight));
  const finalDoc = renderWithDensity(data, fittedCfg).doc;
  while (finalDoc.getNumberOfPages() > 1) {
    finalDoc.deletePage(finalDoc.getNumberOfPages());
  }
  return finalDoc;
};

export const downloadResumePdf = (data: ResumeData) => {
  const doc = buildResumePdf(data);
  const safeName = (data.personalInfo.name || "resume").replace(/\s+/g, "_");
  doc.save(`${safeName}_Resume.pdf`);
};

export const previewResumePdf = (data: ResumeData) => {
  const doc = buildResumePdf(data);
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank");
};
