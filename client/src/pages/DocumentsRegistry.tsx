import { useState, useMemo } from "react";
import { FileText, Search, Filter, Eye, Download, Calendar, User, Hash, ChevronLeft, ChevronRight, X, Shield, FileCheck, AlertTriangle, BarChart3, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const DOC_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  incident_report: { label: "توثيق حادثة", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: "🔴" },
  custom_report: { label: "تقرير مخصص", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: "📋" },
  executive_summary: { label: "ملخص تنفيذي", color: "text-primary bg-primary/10 border-primary/20", icon: "📊" },
  compliance_report: { label: "تقرير امتثال", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: "✅" },
  sector_report: { label: "تقرير قطاعي", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: "🏢" },
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div
      className="glass-card gold-sweep rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground gradient-text">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

function DocumentDetailModal({ doc, onClose }: { doc: any; onClose: () => void }) {
  const typeInfo = DOC_TYPES[doc.documentType] || DOC_TYPES.custom_report;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border/50 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">{typeInfo.icon}</span>
            <div>
              <h2 className="font-bold text-foreground">{doc.titleAr || doc.title}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeInfo.color}`}>{typeInfo.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted/50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Key info grid */}
          <div className="grid grid-cols-2 gap-3 stagger-children">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="text-[11px] text-muted-foreground mb-1">رقم الوثيقة</div>
              <div className="text-sm font-mono text-foreground" dir="ltr">{doc.documentId}</div>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="text-[11px] text-muted-foreground mb-1">رمز التحقق</div>
              <div className="text-sm font-mono text-foreground" dir="ltr">{doc.verificationCode}</div>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="text-[11px] text-muted-foreground mb-1">المُصدِر</div>
              <div className="text-sm text-foreground">{doc.generatedByName}</div>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="text-[11px] text-muted-foreground mb-1">تاريخ الإصدار</div>
              <div className="text-sm text-foreground">
                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
            </div>
          </div>

          {doc.recordId && (
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="text-[11px] text-muted-foreground mb-1">رقم السجل المرتبط</div>
              <div className="text-sm font-mono text-foreground" dir="ltr">{doc.recordId}</div>
            </div>
          )}

          {/* Content Hash */}
          {doc.contentHash && (
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                بصمة SHA-256
              </div>
              <div className="font-mono text-[11px] text-indigo-400 break-all" dir="ltr">{doc.contentHash}</div>
            </div>
          )}

          {/* Verification status */}
          <div className={`rounded-lg border p-3 flex items-center gap-2 ${doc.isVerified ? "border-green-500/20 bg-green-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
            {doc.isVerified ? (
              <>
                <FileCheck className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">وثيقة متحقق منها ✓</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-400">بانتظار التحقق</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsRegistry() {
  const { playClick, playHover } = useSoundEffects();
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [recordId, setRecordId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: stats } = trpc.documentation.stats.useQuery();
  const { data: docsData, isLoading } = trpc.documentation.listFiltered.useQuery({
    search: search || undefined,
    employeeName: employeeName || undefined,
    recordId: recordId || undefined,
    documentType: documentType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
  });

  const documents = docsData?.rows || [];
  const total = docsData?.total || 0;
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">سجل الوثائق الرسمية</h1>
          <p className="text-sm text-muted-foreground mt-1">جميع الوثائق والتقارير المُصدرة من المنصة مع إمكانية البحث والتصفية</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          <StatCard icon={FileText} label="إجمالي الوثائق" value={stats.total} color="bg-blue-500/10 text-blue-400" />
          <StatCard icon={AlertTriangle} label="توثيق حوادث" value={stats.incidents} color="bg-red-500/10 text-red-400" />
          <StatCard icon={BarChart3} label="تقارير مخصصة" value={stats.customReports} color="bg-primary/10 text-primary" />
          <StatCard icon={User} label="مُصدِرون فريدون" value={stats.uniqueIssuers} color="bg-cyan-500/10 text-cyan-400" />
        </div>
      )}

      {/* Search & Filters */}
      <div className="glass-card gold-sweep rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث برقم الوثيقة، رمز التحقق، أو العنوان..."
              className="pe-10"
            />
          </div>
          <select
            value={documentType}
            onChange={(e) => { setDocumentType(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">جميع الأنواع</option>
            {Object.entries(DOC_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-primary/10 border-primary/30" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        
          {showFilters && (
            <div
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[rgba(197,165,90,0.10)]/50 stagger-children">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">اسم المُصدِر</label>
                  <Input
                    value={employeeName}
                    onChange={(e) => { setEmployeeName(e.target.value); setPage(1); }}
                    placeholder="بحث بالاسم..."
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">رقم السجل</label>
                  <Input
                    value={recordId}
                    onChange={(e) => { setRecordId(e.target.value); setPage(1); }}
                    placeholder="رقم السجل..."
                    className="h-9 text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">من تاريخ</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">إلى تاريخ</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        
      </div>

      {/* Documents Table */}
      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
            جارٍ تحميل الوثائق...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد وثائق مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">رقم الوثيقة</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">النوع</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">العنوان</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">المُصدِر</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">التاريخ</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">الحالة</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc: any, i: number) => {
                  const typeInfo = DOC_TYPES[doc.documentType] || DOC_TYPES.custom_report;
                  return (
                    <tr
                      key={doc.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs" dir="ltr">{doc.documentId}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{doc.titleAr || doc.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.generatedByName}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("ar-SA") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {doc.isVerified ? (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <FileCheck className="h-3 w-3" /> متحقق
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400">بانتظار</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDoc(doc)}
                          className="h-7 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 ms-1" />
                          عرض
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(197,165,90,0.10)]/50">
            <div className="text-xs text-muted-foreground">
              عرض {(page - 1) * 15 + 1} - {Math.min(page * 15, total)} من {total} وثيقة
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      
        {selectedDoc && (
          <DocumentDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        )}
      
    </div>
  );
}
