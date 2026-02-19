// @ts-nocheck
import React, { useMemo, useState, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import * as analytics from '@/lib/breachAnalytics';
import { trpc } from '@/lib/trpc';
import { ShieldAlert, Calendar, Database, Server, User, Fingerprint, Cpu, Scale, CheckCircle, AlertTriangle, Info, ArrowLeft, Target, Bot, BookOpen, Banknote, GitBranch, ListChecks, FileText, Download, Loader2, ExternalLink, Image as ImageIcon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const InfoItem = ({ icon, label, value, className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <div className="flex items-center space-x-2 text-slate-400">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-lg font-semibold text-white">{value || '—'}</span>
  </div>
);

const SeverityBadge = ({ severity }) => {
  const severityStyles = {
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Low': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Informational': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const severityText = {
    'Critical': 'عالية الأهمية',
    'High': 'عالية',
    'Medium': 'متوسطة',
    'Low': 'منخفضة',
    'Informational': 'إعلامية',
  };

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-2 border ${severityStyles[severity] || severityStyles['Informational']}`}>
      <ShieldAlert size={16} />
      {severityText[severity] || severity}
    </span>
  );
};

export default function IncidentCard() {
  const [match, params] = useRoute('/incident/:id');
  const incident = useMemo(() => params?.id ? analytics.getIncidentById(params.id) : null, [params?.id]);
  const [certLoading, setCertLoading] = useState(false);
  const [certResult, setCertResult] = useState(null);
  const generateAtlasMutation = trpc.documentation.generateAtlas.useMutation({
    onSuccess: (data) => {
      setCertResult(data);
      setCertLoading(false);
      toast.success(`تم إصدار شهادة التوثيق — ${data.documentId}`);
    },
    onError: (err) => {
      setCertLoading(false);
      toast.error(`خطأ في إصدار الشهادة: ${err.message}`);
    },
  });

  const handleGenerateCertification = () => {
    if (!incident) return;
    setCertLoading(true);
    generateAtlasMutation.mutate({
      incidentId: incident.id,
      origin: window.location.origin,
    });
  };

  const handleDownloadCert = () => {
    if (!certResult?.htmlContent) return;
    const blob = new Blob([certResult.htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certResult.documentId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintCert = () => {
    if (!certResult?.htmlContent) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(certResult.htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-slate-900">
        <AlertTriangle size={48} className="text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold">لم يتم العثور على حالة الرصد</h1>
        <p className="text-slate-400">قد تكون حالة الرصد التي تبحث عنها قد حُذفت أو أن الرابط غير صحيح.</p>
        <Link href="/incidents-registry">
          <a className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ArrowLeft size={16} className="ml-2" />
            العودة إلى سجل الحالات
          </a>
        </Link>
      </div>
    );
  }

  const { 
    title_ar, date, overview, attacker_info, data_types_ar, 
    ai_analysis, pdpl_analysis, evidence_images, sources, leak_source, description_ar
  } = incident;

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/incidents-registry">
            <a className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ring-offset-slate-900">
              <ArrowLeft size={16} />
              العودة للسجل
            </a>
          </Link>
          <h1 className="text-xl font-bold text-slate-400">بطاقة حالة الرصد | Incident Detail</h1>
        </div>

        {/* Header */}
        <GlassCard className="mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-white mb-2">{title_ar}</h2>
              <div className="flex items-center space-x-4 space-x-reverse text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <SeverityBadge severity={overview.severity} />
              {/* Certification Button */}
              {!certResult ? (
                <Button
                  onClick={handleGenerateCertification}
                  disabled={certLoading}
                  className="bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200"
                >
                  {certLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin ml-2" />
                      جاري التوثيق...
                    </>
                  ) : (
                    <>
                      <FileText size={16} className="ml-2" />
                      طلب توثيق
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleDownloadCert}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                  >
                    <Download size={16} className="ml-2" />
                    تحميل الشهادة
                  </Button>
                  <Button
                    onClick={handlePrintCert}
                    variant="outline"
                    className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-4 py-2 rounded-xl"
                  >
                    طباعة
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* Certification Success Banner */}
          {certResult && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-3 flex-wrap">
                <CheckCircle size={20} className="text-emerald-400" />
                <span className="text-emerald-300 font-bold">تم إصدار شهادة التوثيق بنجاح</span>
                <span className="text-slate-400 text-sm">|</span>
                <span className="text-slate-300 text-sm font-mono">{certResult.documentId}</span>
                <span className="text-slate-400 text-sm">|</span>
                <span className="text-emerald-400 text-sm font-mono">{certResult.verificationCode}</span>
              </div>
            </div>
          )}
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Description */}
            {description_ar && (
              <GlassCard>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Info size={20}/> وصف حالة الرصد</h3>
                <p className="text-slate-300 leading-relaxed text-base">{description_ar}</p>
              </GlassCard>
            )}

            {/* Overview */}
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Info size={20}/> نظرة عامة</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoItem icon={<Database size={20} />} label="ادعاء البائع" value={overview.exposed_records?.toLocaleString('ar-SA')} />
                <InfoItem icon={<Server size={20} />} label="حجم البيانات" value={overview.data_size} />
                <InfoItem icon={<GitBranch size={20} />} label="المنصة المصدر" value={overview.source_platform} />
                <InfoItem icon={<Cpu size={20} />} label="أسلوب التسرب" value={overview.attack_method_ar || overview.attack_method} />
                <InfoItem icon={<CheckCircle size={20} />} label="مستوى الثقة" value={`${overview.confidence_level}%`} />
                {leak_source?.region && <InfoItem icon={<Globe size={20} />} label="المنطقة" value={leak_source.region} />}
              </div>
            </GlassCard>

            {/* PII Types */}
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Fingerprint size={20}/> أنواع البيانات الشخصية المتأثرة</h3>
              <div className="flex flex-wrap gap-2">
                {(data_types_ar || []).map((pii, index) => (
                  <span key={index} className="bg-sky-500/20 text-sky-300 text-sm font-medium px-3 py-1 rounded-full">{pii}</span>
                ))}
              </div>
            </GlassCard>

            {/* Evidence Images */}
            {evidence_images && evidence_images.length > 0 && (
              <GlassCard>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon size={20}/> لقطات الأدلة</h3>
                <div className="grid grid-cols-2 gap-3">
                  {evidence_images.slice(0, 6).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-white/10 hover:border-sky-500/50 transition-all">
                      <img src={url} alt={`دليل ${i + 1}`} className="w-full h-40 object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* AI Analysis */}
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bot size={20}/> تحليل الذكاء الاصطناعي</h3>
              <div className="space-y-4">
                {ai_analysis?.executive_summary && (
                  <div>
                    <h4 className="font-semibold text-lg text-slate-200 mb-2">الملخص التنفيذي</h4>
                    <p className="text-slate-300 leading-relaxed">{ai_analysis.executive_summary}</p>
                  </div>
                )}
                {ai_analysis?.impact_assessment && (
                  <div>
                    <h4 className="font-semibold text-lg text-slate-200 mb-2">تقييم التأثير</h4>
                    <p className="text-slate-300 leading-relaxed">{ai_analysis.impact_assessment}</p>
                  </div>
                )}
                {ai_analysis?.confidence_percentage && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">نسبة الثقة:</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-l from-teal-500 to-cyan-500 h-full rounded-full transition-all" style={{ width: `${ai_analysis.confidence_percentage}%` }} />
                    </div>
                    <span className="text-teal-400 font-bold text-sm">{ai_analysis.confidence_percentage}%</span>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* PDPL Analysis */}
            {pdpl_analysis && (
              <GlassCard>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen size={20}/> تحليل نظام حماية البيانات الشخصية (PDPL)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pdpl_analysis.estimated_fine_sar && (
                    <InfoItem icon={<Banknote size={20} />} label="الغرامات التقديرية" value={`${pdpl_analysis.estimated_fine_sar} ريال`} />
                  )}
                  {pdpl_analysis.risk_level && (
                    <InfoItem icon={<AlertTriangle size={20} />} label="مستوى المخاطر" value={pdpl_analysis.risk_level} />
                  )}
                </div>
                {pdpl_analysis.violated_articles && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-lg text-slate-200 mb-2">المواد المنتهكة:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(typeof pdpl_analysis.violated_articles === 'string' 
                        ? pdpl_analysis.violated_articles.split(',').map(s => s.trim())
                        : Array.isArray(pdpl_analysis.violated_articles) 
                          ? pdpl_analysis.violated_articles 
                          : []
                      ).map((article, i) => (
                        <span key={i} className="bg-amber-500/20 text-amber-300 text-xs font-mono px-2 py-1 rounded">{article}</span>
                      ))}
                    </div>
                  </div>
                )}
                {pdpl_analysis.compliance_gaps && Array.isArray(pdpl_analysis.compliance_gaps) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-lg text-slate-200 mb-2">فجوات الامتثال:</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                      {pdpl_analysis.compliance_gaps.map((gap, i) => <li key={i}>{gap}</li>)}
                    </ul>
                  </div>
                )}
                {pdpl_analysis.required_actions && Array.isArray(pdpl_analysis.required_actions) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-lg text-slate-200 mb-2">الإجراءات المطلوبة:</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                      {pdpl_analysis.required_actions.map((action, i) => <li key={i}>{action}</li>)}
                    </ul>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Recommendations */}
            {ai_analysis?.recommendations && ai_analysis.recommendations.length > 0 && (
              <GlassCard>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ListChecks size={20}/> التوصيات</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                  {(typeof ai_analysis.recommendations === 'string'
                    ? [ai_analysis.recommendations]
                    : ai_analysis.recommendations
                  ).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {/* Sources */}
            {sources && sources.length > 0 && (
              <GlassCard>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ExternalLink size={20}/> مصادر التحقق</h3>
                <div className="space-y-2">
                  {sources.map((src, i) => (
                    <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl hover:bg-slate-700/60 transition-all group">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ExternalLink size={14} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{src.name}</p>
                        <p className="text-slate-400 text-xs truncate">{src.url}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Attacker Info - adapted for raw data fields */}
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><User size={20}/> معلومات المهاجم</h3>
              <div className="space-y-4">
                {/* Support both raw data (alias) and processed data (name) */}
                <InfoItem icon={<User size={16} />} label="الاسم المستعار" value={attacker_info?.alias || attacker_info?.name || '—'} />
                {attacker_info?.group && <InfoItem icon={<Target size={16} />} label="المجموعة" value={attacker_info.group} />}
                {attacker_info?.platform && <InfoItem icon={<Server size={16} />} label="المنصة" value={attacker_info.platform} />}
                {attacker_info?.price_display && <InfoItem icon={<Banknote size={16} />} label="السعر المعروض" value={attacker_info.price_display} />}
                {attacker_info?.known_attacks && <InfoItem icon={<AlertTriangle size={16} />} label="هجمات معروفة" value={attacker_info.known_attacks} />}
                {/* Legacy fields for processed data */}
                {attacker_info?.aliases && Array.isArray(attacker_info.aliases) && attacker_info.aliases.length > 0 && (
                  <InfoItem icon={<User size={16} />} label="أسماء مستعارة" value={attacker_info.aliases.join(', ')} />
                )}
                {attacker_info?.threat_level && <InfoItem icon={<AlertTriangle size={16} />} label="مستوى التأثير" value={attacker_info.threat_level} />}
                {attacker_info?.known_targets && Array.isArray(attacker_info.known_targets) && attacker_info.known_targets.length > 0 && (
                  <InfoItem icon={<Target size={16} />} label="أهداف معروفة" value={attacker_info.known_targets.join(', ')} />
                )}
              </div>
              {attacker_info?.profile_url && (
                <a href={attacker_info.profile_url} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center w-full px-4 py-2 bg-sky-600/50 hover:bg-sky-500/50 text-white rounded-lg">
                  عرض الملف الكامل
                </a>
              )}
            </GlassCard>

            {/* Quick Stats Card */}
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Scale size={20}/> ملخص سريع</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700/40 rounded-xl">
                  <span className="text-slate-400 text-sm">القطاع</span>
                  <span className="text-white font-bold text-sm">{incident.sector}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/40 rounded-xl">
                  <span className="text-slate-400 text-sm">الفئة</span>
                  <span className="text-white font-bold text-sm">{incident.category}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/40 rounded-xl">
                  <span className="text-slate-400 text-sm">حساسية البيانات</span>
                  <span className="text-white font-bold text-sm">{incident.data_sensitivity}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/40 rounded-xl">
                  <span className="text-slate-400 text-sm">عدد أنواع البيانات</span>
                  <span className="text-white font-bold text-sm">{incident.data_types_count}</span>
                </div>
                {incident.victim && (
                  <div className="flex justify-between items-center p-3 bg-slate-700/40 rounded-xl">
                    <span className="text-slate-400 text-sm">الجهة المتضررة</span>
                    <span className="text-white font-bold text-sm">{incident.victim}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
