/**
 * Professional Excel Export Utility for RASID Platform
 * Creates beautifully formatted Arabic RTL Excel files
 */

import { trpc } from "@/lib/trpc";

// Helper to download base64 as file
export function downloadBase64File(base64: string, filename: string) {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export types
export type DashboardExportType =
  | "overview"
  | "clauses"
  | "sectors"
  | "categories"
  | "all";

export type SitesExportFilter = {
  complianceStatus?: string;
  sectorType?: string;
  classification?: string;
  title?: string;
};
