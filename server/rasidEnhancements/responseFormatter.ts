/**
 * Response Formatter - Issue #9
 * Post-process AI responses for better formatting and interactivity
 */

/**
 * Convert Western Arabic numerals to Eastern Arabic numerals
 */
export function convertToArabicNumerals(text: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
}

/**
 * Add contextual icons to text based on content
 */
export function addContextualIcons(text: string): string {
  const iconMappings = [
    { pattern: /(حالة رصد|حالات رصد|حادثة|حوادث|تسريب|تسريبات)/g, icon: '🚨' },
    { pattern: /(بيانات شخصية|PII)/g, icon: '🔐' },
    { pattern: /(تحذير|تنبيه|خطر)/g, icon: '⚠️' },
    { pattern: /(نجاح|تم|اكتمل)/g, icon: '✅' },
    { pattern: /(فشل|خطأ|مشكلة)/g, icon: '❌' },
    { pattern: /(إحصائيات|تقرير|ملخص)/g, icon: '📊' },
    { pattern: /(مستخدم|موظف|محلل)/g, icon: '👤' },
    { pattern: /(بائع|متجر|سوق)/g, icon: '🏪' },
    { pattern: /(الويب المظلم|darkweb)/gi, icon: '🌐' },
    { pattern: /(قاعدة معرفة|مستند|ملف)/g, icon: '📄' },
    { pattern: /(بحث|تحليل|فحص)/g, icon: '🔍' },
    { pattern: /(عاجل|مهم|حرج)/g, icon: '🔴' },
    { pattern: /(متوسط|متوسطة)/g, icon: '🟡' },
    { pattern: /(منخفض|منخفضة)/g, icon: '🟢' },
  ];

  let formatted = text;
  const originalText = text; // Store original to check against
  
  for (const { pattern, icon } of iconMappings) {
    formatted = formatted.replace(pattern, (match, ...args) => {
      const offset = args[args.length - 2]; // Get match offset
      const before = originalText.substring(Math.max(0, offset - 3), offset);
      // Don't add icon if there's already an emoji nearby in original text
      if (/[\u{1F300}-\u{1F9FF}]/u.test(before)) {
        return match;
      }
      return `${icon} ${match}`;
    });
  }

  return formatted;
}

/**
 * Convert markdown tables to HTML tables
 */
export function convertTablesToHTML(text: string): string {
  // Match markdown tables
  const tableRegex = /(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g;
  
  return text.replace(tableRegex, (tableMatch) => {
    const lines = tableMatch.trim().split('\n').filter(line => line.trim());
    if (lines.length < 3) return tableMatch; // Need at least header, separator, and one row

    const headers = lines[0]
      .split('|')
      .map(h => h.trim())
      .filter(h => h);
    
    const rows = lines.slice(2).map(line =>
      line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell !== '')
    );

    let html = '<div class="table-wrapper" style="overflow-x: auto; margin: 1rem 0;">\n';
    html += '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">\n';
    
    // Header
    html += '  <thead>\n    <tr style="background-color: #f2f2f2;">\n';
    headers.forEach(header => {
      html += `      <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${header}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    
    // Body
    html += '  <tbody>\n';
    rows.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
      html += `    <tr style="background-color: ${bgColor};">\n`;
      row.forEach(cell => {
        html += `      <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${cell}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
    
    html += '</table>\n</div>';
    return html;
  });
}

/**
 * Add smart action buttons based on content
 */
export function addSmartActionButtons(text: string, context?: { leakIds?: string[] }): string {
  const buttons: string[] = [];

  // Check for leak IDs mentioned
  const leakIdPattern = /leak[_-]?(\d+)|حالة رصد\s+رقم\s+(\d+)|حادثة\s+رقم\s+(\d+)/gi;
  const matches = text.matchAll(leakIdPattern);
  const leakIds = new Set<string>();
  
  for (const match of matches) {
    const id = match[1] || match[2];
    if (id) leakIds.add(id);
  }

  if (leakIds.size > 0) {
    const ids = Array.from(leakIds).slice(0, 3); // Max 3 buttons
    ids.forEach(id => {
      buttons.push(
        `<button class="action-button" data-action="view-leak" data-leak-id="${id}" style="margin: 4px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
          🔍 عرض حالة الرصد ${id}
        </button>`
      );
    });
  }

  // Check for report mentions
  if (/تقرير|report/i.test(text)) {
    buttons.push(
      `<button class="action-button" data-action="view-reports" style="margin: 4px; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
        📊 عرض التقارير
      </button>`
    );
  }

  // Check for statistics mentions
  if (/إحصائيات|statistics|dashboard/i.test(text)) {
    buttons.push(
      `<button class="action-button" data-action="view-dashboard" style="margin: 4px; padding: 8px 16px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer;">
        📈 عرض لوحة التحكم
      </button>`
    );
  }

  if (buttons.length > 0) {
    return text + '\n\n<div class="smart-actions" style="margin-top: 1rem;">\n' + 
           buttons.join('\n') + 
           '\n</div>';
  }

  return text;
}

/**
 * Format chart references to be more prominent
 */
export function highlightChartReferences(text: string): string {
  // Make chart URLs more prominent with visual indicators
  const chartUrlPattern = /(https?:\/\/[^\s]+chart[^\s]*)/gi;
  
  return text.replace(chartUrlPattern, (url) => {
    return `\n\n📊 **رسم بياني تفاعلي:**\n[عرض الرسم البياني](${url})\n\n`;
  });
}

/**
 * Main formatting function - applies all enhancements
 */
export function formatResponse(
  text: string,
  options?: {
    useArabicNumerals?: boolean;
    addIcons?: boolean;
    convertTables?: boolean;
    addActionButtons?: boolean;
    highlightCharts?: boolean;
    context?: { leakIds?: string[] };
  }
): string {
  const opts = {
    useArabicNumerals: true,
    addIcons: true,
    convertTables: true,
    addActionButtons: true,
    highlightCharts: true,
    ...options,
  };

  let formatted = text;

  // 1. Convert numbers to Arabic if requested
  if (opts.useArabicNumerals) {
    formatted = convertToArabicNumerals(formatted);
  }

  // 2. Add contextual icons
  if (opts.addIcons) {
    formatted = addContextualIcons(formatted);
  }

  // 3. Convert tables to HTML
  if (opts.convertTables) {
    formatted = convertTablesToHTML(formatted);
  }

  // 4. Highlight chart references
  if (opts.highlightCharts) {
    formatted = highlightChartReferences(formatted);
  }

  // 5. Add smart action buttons
  if (opts.addActionButtons) {
    formatted = addSmartActionButtons(formatted, opts.context);
  }

  return formatted;
}
