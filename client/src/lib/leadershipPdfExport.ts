import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LOGO_FULL_DARK } from "@/lib/rasidAssets";

const COLORS = {
  primary: [39, 52, 112] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number],
  light: [248, 250, 252] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  text: [51, 65, 85] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
};

interface LeadershipData {
  general: {
    totalSites: number;
    totalScans: number;
    compliant: number;
    nonCompliant: number;
    partiallyCompliant: number;
    noPolicy: number;
    unreachable: number;
    avgScore: number;
  };
  sectorBreakdown?: Array<{ sectorType: string; total: number; compliant: number; nonCompliant: number; partial: number; avgScore: number }>;
  clauseBreakdown?: Array<{ clauseNum: number; clauseTitle: string; compliant: number; total: number }>;
  classificationBreakdown?: Array<{ classification: string; total: number; compliant: number }>;
  topCompliant?: Array<{ name: string; domain: string; score: number }>;
  bottomCompliant?: Array<{ name: string; domain: string; score: number }>;
}

export async function generateLeadershipPDF(data: LeadershipData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 15;
  let y = 0;

  const dateStr = new Date().toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });

  // Helper functions
  const addHeader = () => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pw, 8, "F");
    doc.setFillColor(...COLORS.gold);
    doc.rect(0, 8, pw, 1.5, "F");
  };

  const addFooter = (pageNum: number) => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, ph - 10, pw, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.white);
    doc.text(`${pageNum}`, pw / 2, ph - 4, { align: "center" });
    doc.text("RASID Platform", m, ph - 4);
    doc.text(dateStr, pw - m, ph - 4, { align: "right" });
  };

  const checkBreak = (h: number) => {
    if (y + h > ph - 20) {
      doc.addPage();
      addHeader();
      y = 15;
    }
  };

  const sectionTitle = (title: string) => {
    checkBreak(18);
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(m, y, pw - m * 2, 9, 2, 2, "F");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.white);
    doc.text(title, pw - m - 4, y + 6.5, { align: "right" });
    y += 13;
  };

  // ===== COVER PAGE =====
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pw, ph, "F");

  // Gold accent lines
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, ph * 0.35, pw, 1, "F");
  doc.rect(0, ph * 0.65, pw, 0.5, "F");

  // Logo
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = LOGO_FULL_DARK;
    });
    if (img.complete && img.naturalWidth > 0) {
      doc.addImage(img, "PNG", pw / 2 - 25, 40, 50, 25);
    }
  } catch {}

  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.text("RASID Leadership Dashboard", pw / 2, ph * 0.42, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.gold);
  doc.text("Compliance Monitoring Report", pw / 2, ph * 0.48, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  doc.text(dateStr, pw / 2, ph * 0.55, { align: "center" });
  doc.text("SDAIA - Saudi Data & AI Authority", pw / 2, ph * 0.60, { align: "center" });

  // Classification badge
  doc.setFillColor(...COLORS.gold);
  doc.roundedRect(pw / 2 - 20, ph * 0.70, 40, 8, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.primary);
  doc.text("CONFIDENTIAL", pw / 2, ph * 0.70 + 5.5, { align: "center" });

  // ===== PAGE 2: General Stats =====
  doc.addPage();
  addHeader();
  y = 15;

  sectionTitle("General Compliance Overview");

  const g = data.general;
  const totalWithScans = g.compliant + g.nonCompliant + g.partiallyCompliant + g.noPolicy;
  const complianceRate = totalWithScans > 0 ? Math.round((g.compliant / totalWithScans) * 100) : 0;

  // Stats grid
  const statsItems = [
    { label: "Total Sites", value: String(g.totalSites), color: COLORS.accent },
    { label: "Total Scans", value: String(g.totalScans), color: COLORS.accent },
    { label: "Compliant", value: String(g.compliant), color: COLORS.success },
    { label: "Partially Compliant", value: String(g.partiallyCompliant), color: COLORS.warning },
    { label: "Non-Compliant", value: String(g.nonCompliant), color: COLORS.danger },
    { label: "No Policy", value: String(g.noPolicy), color: COLORS.muted },
    { label: "Unreachable", value: String(g.unreachable), color: COLORS.muted },
    { label: "Compliance Rate", value: `${complianceRate}%`, color: complianceRate >= 50 ? COLORS.success : COLORS.danger },
  ];

  const colW = (pw - m * 2 - 15) / 4;
  statsItems.forEach((item, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = m + col * (colW + 5);
    const cy = y + row * 28;

    doc.setFillColor(...COLORS.light);
    doc.roundedRect(x, cy, colW, 24, 2, 2, "F");

    // Color indicator
    doc.setFillColor(...(item.color as [number, number, number]));
    doc.roundedRect(x + colW - 3, cy + 2, 2, 20, 1, 1, "F");

    doc.setFontSize(16);
    doc.setTextColor(...COLORS.dark);
    doc.text(item.value, x + colW / 2, cy + 10, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.label, x + colW / 2, cy + 18, { align: "center" });
  });

  y += 62;

  // Compliance distribution bar
  checkBreak(25);
  sectionTitle("Compliance Distribution");

  const barY = y;
  const barW = pw - m * 2;
  const barH = 12;
  const total = g.compliant + g.nonCompliant + g.partiallyCompliant + g.noPolicy;

  if (total > 0) {
    let bx = m;
    const segments = [
      { value: g.compliant, color: COLORS.success, label: "Compliant" },
      { value: g.partiallyCompliant, color: COLORS.warning, label: "Partial" },
      { value: g.nonCompliant, color: COLORS.danger, label: "Non-Compliant" },
      { value: g.noPolicy, color: COLORS.muted, label: "No Policy" },
    ];

    segments.forEach((seg) => {
      const w = (seg.value / total) * barW;
      if (w > 0) {
        doc.setFillColor(...(seg.color as [number, number, number]));
        doc.roundedRect(bx, barY, w, barH, 1, 1, "F");
        if (w > 15) {
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.white);
          doc.text(`${Math.round((seg.value / total) * 100)}%`, bx + w / 2, barY + 7.5, { align: "center" });
        }
        bx += w;
      }
    });

    y = barY + barH + 8;

    // Legend
    let lx = m;
    segments.forEach((seg) => {
      doc.setFillColor(...(seg.color as [number, number, number]));
      doc.circle(lx + 2, y, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.text);
      doc.text(`${seg.label} (${seg.value})`, lx + 6, y + 1.5);
      lx += 45;
    });
    y += 10;
  }

  // ===== Sector Breakdown =====
  if (data.sectorBreakdown && data.sectorBreakdown.length > 0) {
    checkBreak(30);
    sectionTitle("Sector Breakdown");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Sector", "Total", "Compliant", "Non-Compliant", "Partial", "Avg Score"]],
      body: data.sectorBreakdown.map((s) => [
        s.sectorType || "N/A",
        String(s.total),
        String(s.compliant),
        String(s.nonCompliant),
        String(s.partial),
        `${s.avgScore}%`,
      ]),
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ===== Clause Breakdown =====
  if (data.clauseBreakdown && data.clauseBreakdown.length > 0) {
    checkBreak(30);
    sectionTitle("Article 12 Clause Compliance");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Clause", "Title", "Compliant", "Total", "Rate"]],
      body: data.clauseBreakdown.map((c) => [
        String(c.clauseNum),
        c.clauseTitle || `Clause ${c.clauseNum}`,
        String(c.compliant),
        String(c.total),
        c.total > 0 ? `${Math.round((c.compliant / c.total) * 100)}%` : "N/A",
      ]),
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ===== Top/Bottom Sites =====
  if (data.topCompliant && data.topCompliant.length > 0) {
    checkBreak(30);
    sectionTitle("Top Compliant Sites");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["#", "Site", "Domain", "Score"]],
      body: data.topCompliant.slice(0, 10).map((s, i) => [
        String(i + 1),
        s.name,
        s.domain,
        `${s.score}%`,
      ]),
      headStyles: { fillColor: COLORS.success, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (data.bottomCompliant && data.bottomCompliant.length > 0) {
    checkBreak(30);
    sectionTitle("Lowest Compliant Sites");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["#", "Site", "Domain", "Score"]],
      body: data.bottomCompliant.slice(0, 10).map((s, i) => [
        String(i + 1),
        s.name,
        s.domain,
        `${s.score}%`,
      ]),
      headStyles: { fillColor: COLORS.danger, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addFooter(i);
  }

  doc.save(`rasid-leadership-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
