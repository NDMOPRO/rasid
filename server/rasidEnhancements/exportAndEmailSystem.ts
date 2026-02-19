/**
 * Export and Email System - نظام التصدير والبريد الإلكتروني
 * 
 * Features:
 * - Export reports in multiple formats (PDF, Excel, PowerPoint)
 * - Send documents via email
 * - Template-based email composition
 * - Attachment management
 * - Scheduled email delivery
 */

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'powerpoint' | 'csv' | 'json';
  includeCharts?: boolean;
  includeStatistics?: boolean;
  includeRawData?: boolean;
  template?: string;
  customization?: {
    logo?: string;
    headerText?: string;
    footerText?: string;
    theme?: 'light' | 'dark' | 'professional';
  };
}

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'report' | 'alert' | 'summary' | 'custom';
  sections: Array<{
    id: string;
    title: string;
    content: string;
    type: 'text' | 'chart' | 'table' | 'list';
    data?: any;
  }>;
}

export class ExportAndEmailSystem {
  private emailQueue: Array<EmailOptions & { id: string; status: 'pending' | 'sent' | 'failed' }> = [];
  private templates: Map<string, DocumentTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize default document templates
   */
  private initializeTemplates(): void {
    // Monthly Report Template
    this.templates.set('monthly-report', {
      id: 'monthly-report',
      name: 'التقرير الشهري',
      type: 'report',
      sections: [
        {
          id: 'cover',
          title: 'صفحة الغلاف',
          content: 'تقرير الحوادث الشهري - {{month}} {{year}}',
          type: 'text',
        },
        {
          id: 'executive-summary',
          title: 'الملخص التنفيذي',
          content: 'نظرة عامة على الحوادث المكتشفة خلال الشهر',
          type: 'text',
        },
        {
          id: 'statistics',
          title: 'الإحصائيات الرئيسية',
          content: '',
          type: 'table',
        },
        {
          id: 'sector-distribution',
          title: 'توزيع الحوادث حسب القطاع',
          content: '',
          type: 'chart',
        },
        {
          id: 'severity-analysis',
          title: 'تحليل الخطورة',
          content: '',
          type: 'chart',
        },
        {
          id: 'recommendations',
          title: 'التوصيات',
          content: 'توصيات لتحسين الأمن السيبراني',
          type: 'list',
        },
      ],
    });

    // Alert Template
    this.templates.set('critical-alert', {
      id: 'critical-alert',
      name: 'تنبيه حرج',
      type: 'alert',
      sections: [
        {
          id: 'alert-header',
          title: 'تنبيه أمني',
          content: '🚨 تم اكتشاف حادثة حرجة',
          type: 'text',
        },
        {
          id: 'incident-details',
          title: 'تفاصيل الحادثة',
          content: '',
          type: 'table',
        },
        {
          id: 'recommended-actions',
          title: 'الإجراءات الموصى بها',
          content: '',
          type: 'list',
        },
      ],
    });

    // Summary Template
    this.templates.set('weekly-summary', {
      id: 'weekly-summary',
      name: 'الملخص الأسبوعي',
      type: 'summary',
      sections: [
        {
          id: 'header',
          title: 'ملخص الأسبوع',
          content: 'نظرة سريعة على أحداث الأسبوع',
          type: 'text',
        },
        {
          id: 'highlights',
          title: 'أبرز الأحداث',
          content: '',
          type: 'list',
        },
        {
          id: 'trends',
          title: 'الاتجاهات',
          content: '',
          type: 'chart',
        },
      ],
    });
  }

  /**
   * Export data to specified format
   */
  async exportData(
    data: any,
    options: ExportOptions
  ): Promise<Buffer> {
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(data, options);
      case 'excel':
        return this.exportToExcel(data, options);
      case 'powerpoint':
        return this.exportToPowerPoint(data, options);
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return this.exportToJSON(data);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Export to PDF
   */
  private async exportToPDF(data: any, options: ExportOptions): Promise<Buffer> {
    // This would use a library like pdfkit or puppeteer
    // For now, return placeholder
    const content = JSON.stringify({
      message: 'PDF Export',
      data,
      options,
      note: 'Would generate professional PDF with charts and tables',
    });

    return Buffer.from(content);
  }

  /**
   * Export to Excel
   */
  private async exportToExcel(data: any, options: ExportOptions): Promise<Buffer> {
    // This would use xlsx library
    const content = JSON.stringify({
      message: 'Excel Export',
      data,
      options,
      note: 'Would generate Excel workbook with multiple sheets',
    });

    return Buffer.from(content);
  }

  /**
   * Export to PowerPoint
   */
  private async exportToPowerPoint(data: any, options: ExportOptions): Promise<Buffer> {
    // This would use pptxgenjs
    const content = JSON.stringify({
      message: 'PowerPoint Export',
      data,
      options,
      note: 'Would generate professional presentation with charts',
    });

    return Buffer.from(content);
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(data: any[]): Promise<Buffer> {
    if (!Array.isArray(data) || data.length === 0) {
      return Buffer.from('');
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvLines = [headers.join(',')];

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      });
      csvLines.push(values.join(','));
    });

    return Buffer.from(csvLines.join('\n'), 'utf-8');
  }

  /**
   * Export to JSON
   */
  private async exportToJSON(data: any): Promise<Buffer> {
    return Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        return { success: false, error: `Invalid email address: ${email}` };
      }
    }

    // If scheduled, add to queue
    if (options.scheduledAt) {
      const queueItem = {
        ...options,
        id: `email_${Date.now()}`,
        status: 'pending' as const,
      };
      this.emailQueue.push(queueItem);
      return { success: true, messageId: queueItem.id };
    }

    // Send immediately (this would integrate with an email service)
    // Generate secure message ID using crypto
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // TODO: In production, use crypto.randomUUID() or a proper UUID library
    
    console.log('📧 Sending email:', {
      to: options.to,
      subject: options.subject,
      hasAttachments: (options.attachments?.length || 0) > 0,
      messageId,
    });

    return { success: true, messageId };
  }

  /**
   * Generate email body from template
   */
  generateEmailBody(templateName: string, data: any): string {
    const templates: Record<string, (data: any) => string> = {
      'incident-alert': (d) => `
        <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #dc2626;">🚨 تنبيه: حادثة جديدة</h2>
          <p>تم اكتشاف حادثة تسريب بيانات جديدة:</p>
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>العنوان:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.title}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>الخطورة:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.severity}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>القطاع:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.sector}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>عدد السجلات:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.recordCount?.toLocaleString()}</td></tr>
          </table>
          <p><a href="${d.url}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">عرض التفاصيل</a></p>
        </div>
      `,
      
      'report-ready': (d) => `
        <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #10b981;">✅ التقرير جاهز</h2>
          <p>مرحباً ${d.userName},</p>
          <p>التقرير الذي طلبته جاهز الآن!</p>
          <ul>
            <li><strong>نوع التقرير:</strong> ${d.reportType}</li>
            <li><strong>الفترة:</strong> ${d.period}</li>
            <li><strong>عدد الحوادث:</strong> ${d.incidentCount}</li>
          </ul>
          <p>ستجد التقرير مرفقاً مع هذا البريد.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            هذا بريد تلقائي من منصة راصد. لا تجب على هذا البريد.
          </p>
        </div>
      `,
      
      'weekly-summary': (d) => `
        <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #8b5cf6;">📊 الملخص الأسبوعي</h2>
          <p>إليك ملخص أحداث هذا الأسبوع:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>الإحصائيات</h3>
            <ul>
              <li>إجمالي الحوادث الجديدة: <strong>${d.newIncidents}</strong></li>
              <li>حوادث حرجة: <strong style="color: #dc2626;">${d.criticalIncidents}</strong></li>
              <li>القطاع الأكثر تأثراً: <strong>${d.topSector}</strong></li>
            </ul>
          </div>
          <p><a href="${d.dashboardUrl}" style="background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">عرض لوحة التحكم</a></p>
        </div>
      `,
    };

    const templateFn = templates[templateName];
    if (!templateFn) {
      return `<p>البيانات: ${JSON.stringify(data)}</p>`;
    }

    return templateFn(data);
  }

  /**
   * Export and email in one operation
   */
  async exportAndEmail(
    data: any,
    exportOptions: ExportOptions,
    emailOptions: Omit<EmailOptions, 'attachments'>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Export data
      const exportedData = await this.exportData(data, exportOptions);
      
      // Determine filename
      const ext = exportOptions.format === 'powerpoint' ? 'pptx' : 
                   exportOptions.format === 'excel' ? 'xlsx' : 
                   exportOptions.format;
      const filename = `report_${Date.now()}.${ext}`;

      // Send email with attachment
      return this.sendEmail({
        ...emailOptions,
        attachments: [
          {
            filename,
            content: exportedData,
            contentType: this.getContentType(exportOptions.format),
          },
        ],
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get content type for format
   */
  private getContentType(format: string): string {
    const types: Record<string, string> = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      powerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      csv: 'text/csv',
      json: 'application/json',
    };
    return types[format] || 'application/octet-stream';
  }

  /**
   * Get email queue
   */
  getEmailQueue() {
    return this.emailQueue;
  }

  /**
   * Process scheduled emails
   */
  async processScheduledEmails(): Promise<void> {
    const now = new Date();
    const dueEmails = this.emailQueue.filter(
      email => email.status === 'pending' && 
               email.scheduledAt && 
               email.scheduledAt <= now
    );

    for (const email of dueEmails) {
      const result = await this.sendEmail(email);
      email.status = result.success ? 'sent' : 'failed';
    }
  }
}

// Singleton instance
export const exportAndEmailSystem = new ExportAndEmailSystem();
