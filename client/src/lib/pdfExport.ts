/**
 * PDF Export utility using html2canvas + jsPDF
 * Handles oklch/oklab color format issues in Tailwind CSS 4
 */
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function sanitizeColorsForCapture(container: HTMLElement): () => void {
  const originals: Array<{ el: HTMLElement; prop: string; value: string }> = [];
  const allElements = container.querySelectorAll("*");
  const colorProps = [
    "color", "backgroundColor", "borderColor", "borderTopColor",
    "borderRightColor", "borderBottomColor", "borderLeftColor",
    "outlineColor", "textDecorationColor", "fill", "stroke",
  ];
  const processElement = (el: HTMLElement) => {
    const computed = getComputedStyle(el);
    for (const prop of colorProps) {
      const val = computed.getPropertyValue(prop);
      if (val && (val.includes("oklch") || val.includes("oklab") || val.includes("color("))) {
        const camelProp = prop.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
        originals.push({ el, prop: camelProp, value: (el.style as any)[camelProp] });
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = val;
          ctx.fillRect(0, 0, 1, 1);
          const imgData2 = ctx.getImageData(0, 0, 1, 1).data;
          const r = imgData2[0], g = imgData2[1], b = imgData2[2], a = imgData2[3];
          (el.style as any)[camelProp] = a < 255 ? `rgba(${r},${g},${b},${(a / 255).toFixed(2)})` : `rgb(${r},${g},${b})`;
        }
      }
    }
  };
  allElements.forEach((el) => processElement(el as HTMLElement));
  processElement(container);
  return () => {
    for (const { el, prop, value } of originals) {
      (el.style as any)[prop] = value;
    }
  };
}

export interface PdfExportOptions {
  filename?: string;
  orientation?: "portrait" | "landscape";
  scale?: number;
  onProgress?: (stage: string) => void;
}

export async function exportElementToPdf(
  elementId: string,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = `rasid-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    orientation = "portrait",
    scale = 2,
    onProgress,
  } = options;
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);
  onProgress?.("جاري تجهيز الصفحة...");
  const restoreColors = sanitizeColorsForCapture(element);
  try {
    onProgress?.("جاري التقاط الصورة...");
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    onProgress?.("جاري إنشاء PDF...");
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const imgRatio = canvas.height / canvas.width;
    const contentHeight = contentWidth * imgRatio;
    if (contentHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);
    } else {
      let yOffset = 0;
      const pageContentHeight = pageHeight - margin * 2;
      const sourcePageHeight = (pageContentHeight / contentHeight) * canvas.height;
      while (yOffset < canvas.height) {
        if (yOffset > 0) pdf.addPage();
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sourcePageHeight, canvas.height - yOffset);
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, yOffset, canvas.width, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
        }
        const sliceData = pageCanvas.toDataURL("image/png");
        const sliceHeight = (pageCanvas.height / canvas.width) * contentWidth;
        pdf.addImage(sliceData, "PNG", margin, margin, contentWidth, sliceHeight);
        yOffset += sourcePageHeight;
      }
    }
    pdf.save(filename);
    onProgress?.("تم التصدير بنجاح");
  } finally {
    restoreColors();
  }
}
