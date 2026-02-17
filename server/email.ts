import nodemailer from "nodemailer";

// SMTP configuration - loaded from env vars or database settings
interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
  secure: boolean;
}

// Default config from env vars
let currentConfig: SmtpConfig = {
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "587"),
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || "noreply@rasid.sa",
  fromName: process.env.SMTP_FROM_NAME || "منصة راصد",
  secure: (process.env.SMTP_PORT || "587") === "465",
};

let transporter: nodemailer.Transporter | null = null;

// Update SMTP config from database settings (called when settings change)
export function updateSmtpConfig(config: Partial<SmtpConfig>) {
  const changed = Object.keys(config).some(
    (k) => config[k as keyof SmtpConfig] !== currentConfig[k as keyof SmtpConfig]
  );
  if (changed) {
    currentConfig = { ...currentConfig, ...config };
    transporter = null; // Force re-creation
  }
}

// Get current SMTP config
export function getSmtpConfig(): SmtpConfig {
  return { ...currentConfig };
}

function getTransporter(): nodemailer.Transporter | null {
  if (!currentConfig.host || !currentConfig.user) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: currentConfig.host,
      port: currentConfig.port,
      secure: currentConfig.secure || currentConfig.port === 465,
      auth: {
        user: currentConfig.user,
        pass: currentConfig.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: "SMTP not configured. Please set SMTP settings in System Settings." };
  }

  try {
    const info = await t.sendMail({
      from: `"${currentConfig.fromName}" <${currentConfig.from}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });
    console.log(`[Email] Sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email] Failed to send:`, err.message);
    return { success: false, error: err.message };
  }
}

// Verify SMTP connection
export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { success: false, error: "SMTP not configured" };
  }
  try {
    await t.verify();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Branded email template for Rasid platform
export function buildRasidEmailTemplate(options: {
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(39,52,112,0.12); }
    .header { background: linear-gradient(135deg, #0D1529 0%, #273470 50%, #3DB1AC 100%); padding: 32px; text-align: center; }
    .header img { height: 48px; margin-bottom: 12px; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 8px 0 0; }
    .body { padding: 32px; color: #1f2937; line-height: 1.8; font-size: 15px; }
    .body h2 { color: #273470; font-size: 18px; margin: 0 0 16px; }
    .cta { text-align: center; margin: 24px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #273470, #3DB1AC); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(39,52,112,0.2); }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 12px; margin: 4px 0; }
    .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: linear-gradient(135deg, #273470, #3DB1AC); padding: 10px 12px; text-align: right; font-size: 13px; color: #ffffff; border: 1px solid #e2e8f0; font-weight: 600; }
    td { padding: 10px 12px; text-align: right; font-size: 13px; color: #1f2937; border: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/NjVCCBUdZUnkmwiS.svg" alt="راصد" style="height: 48px;" />
        <h1>منصة راصد</h1>
        <p>نظام رصد الامتثال لحماية البيانات الشخصية</p>
      </div>
      <div class="body">
        <h2>${options.title}</h2>
        ${options.body}
        ${options.ctaText && options.ctaUrl ? `
        <div class="cta">
          <a href="${options.ctaUrl}">${options.ctaText}</a>
        </div>` : ""}
      </div>
      <div class="footer">
        <p>${options.footer || "هذا البريد مُرسل تلقائياً من منصة راصد - الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)"}</p>
        <p>© ${new Date().getFullYear()} منصة راصد - جميع الحقوق محفوظة</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Send scheduled report email with attachment
export async function sendReportEmail(options: {
  to: string | string[];
  reportName: string;
  reportType: string;
  summary: string;
  attachment?: { filename: string; content: Buffer; contentType: string };
  platformUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const html = buildRasidEmailTemplate({
    title: `تقرير: ${options.reportName}`,
    body: `
      <p>تم إنشاء التقرير المجدول بنجاح.</p>
      <div class="divider"></div>
      <table>
        <tr><th>اسم التقرير</th><td>${options.reportName}</td></tr>
        <tr><th>نوع التقرير</th><td>${options.reportType}</td></tr>
        <tr><th>تاريخ الإنشاء</th><td>${new Date().toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td></tr>
      </table>
      <div class="divider"></div>
      <p>${options.summary}</p>
      ${options.attachment ? "<p><strong>📎 التقرير مرفق مع هذا البريد.</strong></p>" : ""}
    `,
    ctaText: options.platformUrl ? "فتح المنصة" : undefined,
    ctaUrl: options.platformUrl,
  });

  return sendEmail({
    to: options.to,
    subject: `📊 تقرير راصد: ${options.reportName}`,
    html,
    attachments: options.attachment ? [{
      filename: options.attachment.filename,
      content: options.attachment.content,
      contentType: options.attachment.contentType,
    }] : undefined,
  });
}

// Send notification email
export async function sendNotificationEmail(options: {
  to: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  actionUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const typeLabels: Record<string, string> = {
    info: "📋 إشعار",
    warning: "⚠️ تنبيه",
    success: "✅ نجاح",
    error: "❌ خطأ",
  };

  const html = buildRasidEmailTemplate({
    title: `${typeLabels[options.type] || "إشعار"}: ${options.title}`,
    body: `<p>${options.message}</p>`,
    ctaText: options.actionUrl ? "عرض التفاصيل" : undefined,
    ctaUrl: options.actionUrl,
  });

  return sendEmail({
    to: options.to,
    subject: `${typeLabels[options.type]} - ${options.title}`,
    html,
  });
}

// Check if email service is configured
export function isEmailConfigured(): boolean {
  return !!(currentConfig.host && currentConfig.user);
}
