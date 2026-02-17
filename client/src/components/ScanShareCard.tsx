import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Download, Copy, CheckCircle, XCircle, Shield,
  Globe, Clock, Zap, Twitter, MessageCircle, Link2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface ScanShareCardProps {
  open: boolean;
  onClose: () => void;
  jobName: string;
  totalSites: number;
  completedSites: number;
  failedSites: number;
  elapsedTime: string;
  overallPct: number;
  clauseResults?: Array<{ name: string; status: 'pass' | 'fail' | 'waiting' }>;
}

export default function ScanShareCard({
  open, onClose, jobName, totalSites, completedSites, failedSites,
  elapsedTime, overallPct, clauseResults,
}: ScanShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const complianceRate = totalSites > 0 ? Math.round((completedSites / totalSites) * 100) : 0;
  const passedClauses = clauseResults?.filter(c => c.status === 'pass').length || 0;
  const totalClauses = clauseResults?.length || 8;

  const exportAsImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0a0e1a',
      });
      const link = document.createElement('a');
      link.download = `rasid-scan-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('تم تصدير الصورة بنجاح');
    } catch (err) {
      toast.error('فشل في تصدير الصورة');
    }
    setIsExporting(false);
  };

  const copyShareText = () => {
    const text = `📊 تقرير فحص راصد\n━━━━━━━━━━━━━━━━━━\n📋 ${jobName}\n🌐 ${totalSites} موقع تم فحصه\n✅ ${completedSites} ناجح | ❌ ${failedSites} فاشل\n⏱️ المدة: ${elapsedTime}\n⚖️ بنود المادة 12: ${passedClauses}/${totalClauses} ممتثل\n━━━━━━━━━━━━━━━━━━\n🇸🇦 منصة راصد - حماية البيانات الشخصية`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('تم نسخ النتائج');
    });
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`📊 تم فحص ${totalSites} موقع عبر منصة #راصد\n✅ ${completedSites} ناجح | ❌ ${failedSites} فاشل\n⚖️ بنود المادة 12: ${passedClauses}/${totalClauses}\n🇸🇦 #حماية_البيانات #رؤية2030`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`📊 تقرير فحص راصد\n📋 ${jobName}\n🌐 ${totalSites} موقع | ✅ ${completedSites} ناجح | ❌ ${failedSites} فاشل\n⚖️ بنود المادة 12: ${passedClauses}/${totalClauses}\n🇸🇦 منصة راصد - حماية البيانات الشخصية`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0d1117] border-[#C5A55A]/10 dark:border-white/10 text-white p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-400" />
            مشاركة نتائج الفحص
          </DialogTitle>
        </DialogHeader>

        {/* Exportable Card */}
        <div className="p-4">
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-[#0a0e1a] via-[#0d1a2d] to-[#0a1628] rounded-2xl p-6 border border-[#C5A55A]/10 dark:border-white/10 relative overflow-hidden"
            style={{ fontFamily: "'Tajawal', 'DIN Next Arabic', sans-serif" }}
            dir="rtl"
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[80px]" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-primary" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">تقرير فحص راصد</h2>
                  <p className="text-xs text-white/40">{jobName}</p>
                </div>
              </div>
              <div className="text-start">
                <div className="text-[10px] text-white/30">منصة راصد</div>
                <div className="text-[10px] text-white/30">🇸🇦 المملكة العربية السعودية</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <div className="bg-white dark:bg-white/[0.04] rounded-xl p-3 text-center border border-[#C5A55A]/8 dark:border-white/5">
                <Globe className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-blue-400">{totalSites}</div>
                <div className="text-[10px] text-white/40">إجمالي المواقع</div>
              </div>
              <div className="bg-emerald-500/[0.06] rounded-xl p-3 text-center border border-emerald-500/10">
                <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-emerald-400">{completedSites}</div>
                <div className="text-[10px] text-white/40">ناجح</div>
              </div>
              <div className="bg-red-500/[0.06] rounded-xl p-3 text-center border border-red-500/10">
                <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-red-400">{failedSites}</div>
                <div className="text-[10px] text-white/40">فاشل</div>
              </div>
              <div className="bg-amber-500/[0.06] rounded-xl p-3 text-center border border-amber-500/10">
                <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-amber-400">{elapsedTime}</div>
                <div className="text-[10px] text-white/40">المدة</div>
              </div>
            </div>

            {/* Article 12 Clauses */}
            {clauseResults && clauseResults.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-white/80">بنود المادة 12</span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary me-auto">
                    {passedClauses}/{totalClauses} ممتثل
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {clauseResults.map((clause, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg text-[11px] ${
                        clause.status === 'pass'
                          ? 'bg-emerald-500/10 text-emerald-300/80'
                          : clause.status === 'fail'
                          ? 'bg-red-500/10 text-red-300/80'
                          : 'bg-white dark:bg-white/[0.02] text-white/30'
                      }`}
                    >
                      {clause.status === 'pass' ? (
                        <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : clause.status === 'fail' ? (
                        <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-[#C5A55A]/20 dark:border-white/20 shrink-0" />
                      )}
                      <span className="truncate">{clause.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">نسبة الإنجاز</span>
                <span className="text-xs font-bold text-cyan-400">{overallPct}%</span>
              </div>
              <div className="h-2 bg-[#C5A55A]/[0.03] dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${overallPct}%`,
                    background: 'linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6)',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#C5A55A]/8 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-white/30">منصة راصد لرصد امتثال المواقع السعودية</span>
              </div>
              <span className="text-[10px] text-white/20">{new Date().toLocaleDateString('ar-SA-u-nu-latn')}</span>
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="p-4 pt-0 space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={exportAsImage}
              disabled={isExporting}
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-[oklch(0.48_0.14_290)] hover:from-primary/90 hover:to-primary text-white"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'جاري التصدير...' : 'تصدير كصورة'}
            </Button>
            <Button
              onClick={copyShareText}
              variant="outline"
              className="flex-1 gap-2 border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              نسخ النتائج
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={shareToTwitter}
              variant="outline"
              className="flex-1 gap-2 border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-blue-500/20"
            >
              <Twitter className="h-4 w-4 text-blue-400" />
              تويتر / X
            </Button>
            <Button
              onClick={shareToWhatsApp}
              variant="outline"
              className="flex-1 gap-2 border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-emerald-500/20"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              واتساب
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
