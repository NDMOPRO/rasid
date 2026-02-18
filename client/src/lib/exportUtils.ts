import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Excel Export ─────────────────────────────────────────────────────────────

interface ExcelExportOptions {
  filename: string;
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
  columnWidths?: number[];
}

export function exportToExcel({ filename, sheetName, headers, rows, columnWidths }: ExcelExportOptions) {
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  if (columnWidths) {
    ws["!cols"] = columnWidths.map(w => ({ wch: w }));
  } else {
    ws["!cols"] = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] || "").length));
      return { wch: Math.min(maxLen + 4, 40) };
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

interface PdfExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  summaryCards?: { label: string; value: string }[];
  orientation?: "portrait" | "landscape";
  footerText?: string;
}

export function exportToPdf({
  filename,
  title,
  subtitle,
  headers,
  rows,
  summaryCards,
  orientation = "landscape",
  footerText,
}: PdfExportOptions) {
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, 28, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 13);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 14, 20);
  }

  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-SA")} ${new Date().toLocaleTimeString("en-SA")}`, pageWidth - 14, 13, { align: "right" });
  doc.text("CoBNB KSA - Property Management System", pageWidth - 14, 20, { align: "right" });

  y = 35;

  // Summary cards
  if (summaryCards && summaryCards.length > 0) {
    const cardWidth = (pageWidth - 28 - (summaryCards.length - 1) * 4) / summaryCards.length;
    summaryCards.forEach((card, i) => {
      const x = 14 + i * (cardWidth + 4);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(x, y, cardWidth, 18, 2, 2, "F");
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(x, y, cardWidth, 18, 2, 2, "S");

      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(card.label, x + 4, y + 7);

      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(card.value, x + 4, y + 14);
    });
    y += 24;
  }

  // Table
  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: any) => {
      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      const footerY = doc.internal.pageSize.getHeight() - 8;
      doc.text(footerText || "CoBNB KSA - Confidential", 14, footerY);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 14, footerY, { align: "right" });
    },
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

// ─── Property Report Exports ──────────────────────────────────────────────────

export function exportPropertyPortfolioPdf(properties: any[], stats: any, financialSummary: any) {
  const totalRevenue = parseFloat(financialSummary?.totalRevenue || "0");
  const totalExpenses = parseFloat(financialSummary?.totalExpenses || "0");
  const netIncome = totalRevenue - totalExpenses;

  exportToPdf({
    filename: `CoBNB-Portfolio-Report-${new Date().toISOString().slice(0, 10)}`,
    title: "Portfolio Report",
    subtitle: `Total Properties: ${properties.length} | Generated on ${new Date().toLocaleDateString("en-SA")}`,
    summaryCards: [
      { label: "Total Properties", value: String(stats?.propertyStats?.total ?? 0) },
      { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} SAR` },
      { label: "Total Expenses", value: `${totalExpenses.toLocaleString()} SAR` },
      { label: "Net Income", value: `${netIncome.toLocaleString()} SAR` },
    ],
    headers: ["Unit ID", "City", "Type", "Status", "Building", "Owner", "Area (sqm)", "Bedrooms"],
    rows: properties.map((p: any) => [
      p.unitId,
      p.city,
      p.propertyType || "-",
      p.unitStatus.replace(/_/g, " "),
      p.buildingName || "-",
      p.ownerName || p.ownerNameAr || "-",
      p.areaSqm || "-",
      p.bedrooms || "-",
    ]),
  });
}

export function exportPropertyPortfolioExcel(properties: any[]) {
  exportToExcel({
    filename: `CoBNB-Portfolio-Report-${new Date().toISOString().slice(0, 10)}`,
    sheetName: "Portfolio",
    headers: ["Unit ID", "City", "Type", "Status", "Building", "Neighborhood", "Owner", "Owner Phone", "Area (sqm)", "Bedrooms", "Bathrooms", "Target ADR", "Monthly Guarantee", "Go Live Date"],
    rows: properties.map((p: any) => [
      p.unitId,
      p.city,
      p.propertyType || "",
      p.unitStatus.replace(/_/g, " "),
      p.buildingName || "",
      p.neighborhood || "",
      p.ownerName || p.ownerNameAr || "",
      p.ownerPhone || "",
      p.areaSqm || "",
      p.bedrooms || "",
      p.bathrooms || "",
      p.targetAdr || "",
      p.monthlyGuarantee || "",
      p.goLiveDate ? new Date(p.goLiveDate).toLocaleDateString() : "",
    ]),
  });
}

export function exportContractsPdf(contracts: any[], stats: any) {
  const totalRent = contracts.reduce((sum: number, c: any) => sum + parseFloat(c.monthlyRent || "0"), 0);

  exportToPdf({
    filename: `CoBNB-Contracts-Report-${new Date().toISOString().slice(0, 10)}`,
    title: "Contracts Report",
    subtitle: `Total Contracts: ${contracts.length} | Generated on ${new Date().toLocaleDateString("en-SA")}`,
    summaryCards: [
      { label: "Total Contracts", value: String(stats?.contractStats?.total ?? 0) },
      { label: "Expiring Soon", value: String(stats?.contractStats?.expiringSoon ?? 0) },
      { label: "Total Monthly Rent", value: `${totalRent.toLocaleString()} SAR` },
    ],
    headers: ["Contract #", "Title", "Type", "Status", "Owner", "Monthly Rent (SAR)", "Start Date", "End Date", "Duration"],
    rows: contracts.map((c: any) => [
      c.contractNumber,
      c.contractTitle || "-",
      (c.contractType || "").replace(/_/g, " "),
      (c.contractStatus || "").replace(/_/g, " "),
      c.ownerNameEn || c.ownerNameAr || "-",
      c.monthlyRent ? parseFloat(c.monthlyRent).toLocaleString() : "-",
      c.startDate ? new Date(c.startDate).toLocaleDateString() : "-",
      c.endDate ? new Date(c.endDate).toLocaleDateString() : "-",
      c.durationMonths ? `${c.durationMonths} months` : "-",
    ]),
  });
}

export function exportContractsExcel(contracts: any[]) {
  exportToExcel({
    filename: `CoBNB-Contracts-Report-${new Date().toISOString().slice(0, 10)}`,
    sheetName: "Contracts",
    headers: ["Contract #", "Title", "Type", "Status", "Owner (EN)", "Owner (AR)", "ID Number", "Phone", "Email", "Monthly Rent (SAR)", "Commission %", "Security Deposit", "Start Date", "End Date", "Duration (months)", "Auto Renewal", "Special Conditions"],
    rows: contracts.map((c: any) => [
      c.contractNumber,
      c.contractTitle || "",
      (c.contractType || "").replace(/_/g, " "),
      (c.contractStatus || "").replace(/_/g, " "),
      c.ownerNameEn || "",
      c.ownerNameAr || "",
      c.ownerIdNumber || "",
      c.ownerPhone || "",
      c.ownerEmail || "",
      c.monthlyRent || "",
      c.commissionPercent || "",
      c.securityDeposit || "",
      c.startDate ? new Date(c.startDate).toLocaleDateString() : "",
      c.endDate ? new Date(c.endDate).toLocaleDateString() : "",
      c.durationMonths || "",
      c.autoRenewal ? "Yes" : "No",
      c.specialConditions || "",
    ]),
  });
}

export function exportFinancialPdf(transactions: any[], financialSummary: any) {
  const totalRevenue = parseFloat(financialSummary?.totalRevenue || "0");
  const totalExpenses = parseFloat(financialSummary?.totalExpenses || "0");
  const netIncome = totalRevenue - totalExpenses;

  exportToPdf({
    filename: `CoBNB-Financial-Report-${new Date().toISOString().slice(0, 10)}`,
    title: "Financial Report",
    subtitle: `Total Transactions: ${transactions.length} | Generated on ${new Date().toLocaleDateString("en-SA")}`,
    summaryCards: [
      { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} SAR` },
      { label: "Total Expenses", value: `${totalExpenses.toLocaleString()} SAR` },
      { label: "Net Income", value: `${netIncome.toLocaleString()} SAR` },
      { label: "Pending Payments", value: String(financialSummary?.pendingPayments ?? 0) },
    ],
    headers: ["Date", "Type", "Category", "Amount (SAR)", "Status", "Payment Method", "Reference", "Description"],
    rows: transactions.map((tx: any) => [
      new Date(tx.transactionDate).toLocaleDateString(),
      tx.transactionType,
      tx.category,
      `${tx.transactionType === "revenue" ? "+" : "-"}${parseFloat(tx.amount).toLocaleString()}`,
      (tx.paymentStatus || "").replace(/_/g, " "),
      tx.paymentMethod || "-",
      tx.referenceNumber || "-",
      tx.description || "-",
    ]),
  });
}

export function exportFinancialExcel(transactions: any[]) {
  exportToExcel({
    filename: `CoBNB-Financial-Report-${new Date().toISOString().slice(0, 10)}`,
    sheetName: "Transactions",
    headers: ["Date", "Type", "Category", "Amount (SAR)", "Currency", "Status", "Payment Method", "Reference #", "Description"],
    rows: transactions.map((tx: any) => [
      new Date(tx.transactionDate).toLocaleDateString(),
      tx.transactionType,
      tx.category,
      parseFloat(tx.amount),
      tx.currency || "SAR",
      (tx.paymentStatus || "").replace(/_/g, " "),
      tx.paymentMethod || "",
      tx.referenceNumber || "",
      tx.description || "",
    ]),
  });
}
