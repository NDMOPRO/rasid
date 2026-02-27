# rasid-leaks - client-leaks

> Auto-extracted source code documentation

---

## `client/src/leaks/pages/AlertChannels.tsx`

```tsx
// Leaks Domain
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Bell,
  Users,
  Shield,
  Plus,
  ToggleLeft,
  ToggleRight,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import AnimatedCounter from "@/components/AnimatedCounter";


// Helper to safely parse JSON strings from DB
const parseJsonSafe = (v: any, fallback: any = []) => {
  if (!v) return fallback;
  if (typeof v === 'string') {
    try { const parsed = JSON.parse(v); return parsed || fallback; } catch { return fallback; }
  }
  return v;
};

const severityColors: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/30",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  low: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  sent: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  pending: <Clock className="w-4 h-4 text-amber-400" />,
};

export default function AlertChannels() {
  const [activeTab, setActiveTab] = useState<"contacts" | "rules" | "history">("contacts");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [drillLeakId, setDrillLeakId] = useState<string | null>(null);

  const { data: contacts = [], refetch: refetchContacts } = trpc.alerts.contacts.list.useQuery();
  const { data: rules = [], refetch: refetchRules } = trpc.alerts.rules.list.useQuery();
  const { data: history = [] } = trpc.alerts.history.useQuery();
  const { data: stats } = trpc.alerts.stats.useQuery();

  const toggleContact = trpc.alerts.contacts.update.useMutation({
    onSuccess: () => { refetchContacts(); toast.success("تم تحديث جهة الاتصال"); },
  });
  const toggleRule = trpc.alerts.rules.update.useMutation({
    onSuccess: () => { refetchRules(); toast.success("تم تحديث القاعدة"); },
  });
  const deleteContact = trpc.alerts.contacts.delete.useMutation({
    onSuccess: () => { refetchContacts(); toast.success("تم حذف جهة الاتصال"); },
  });
  const deleteRule = trpc.alerts.rules.delete.useMutation({
    onSuccess: () => { refetchRules(); toast.success("تم حذف القاعدة"); },
  });

  const tabs = [
    { id: "contacts" as const, label: "جهات الاتصال", labelEn: "Contacts", icon: Users, count: contacts.length },
    { id: "rules" as const, label: "قواعد التنبيه", labelEn: "Alert Rules", icon: Shield, count: rules.length },
    { id: "history" as const, label: "سجل التنبيهات", labelEn: "Alert History", icon: History, count: history.length },
  ];

  return (
    <div className="overflow-x-hidden max-w-full space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Bell className="w-6 h-6 text-amber-400" />
            </div>
            قنوات التنبيه
          </h1>
          <p className="text-muted-foreground mt-1">إدارة قنوات البريد الإلكتروني والرسائل النصية للتنبيهات</p>
        </div>
      </motion.div>

      {/* Stats Cards — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "sent", label: "تنبيهات مرسلة", value: stats?.totalSent ?? 0, icon: CheckCircle, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
          { key: "failed", label: "تنبيهات فاشلة", value: stats?.totalFailed ?? 0, icon: XCircle, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
          { key: "activeRules", label: "قواعد نشطة", value: stats?.activeRules ?? 0, icon: Shield, color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
          { key: "activeContacts", label: "جهات اتصال نشطة", value: stats?.activeContacts ?? 0, icon: Users, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.04, y: -2 }}
            className={`${stat.bgColor} backdrop-blur border ${stat.borderColor} rounded-xl p-4 cursor-pointer transition-all group`}
            onClick={() => setActiveModal(stat.key)}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground"><AnimatedCounter value={stat.value} /></div>
            <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className="text-xs bg-border/50 px-2 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Contacts Tab */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          {contacts.map((contact, idx) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={{ scale: 1.01, x: -4 }}
              className="bg-secondary/60 backdrop-blur border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => { setSelectedEntry(contact); setActiveModal("contactDetail"); }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-lg">{contact.nameAr || contact.contactName}</h3>
                    <p className="text-muted-foreground text-sm">{contact.roleAr || contact.contactRole}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {contact.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" /> {contact.contactEmail}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" /> {contact.contactPhone}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {parseJsonSafe(contact.alertChannels, []).map((ch) => (
                        <span key={ch} className="text-xs px-2 py-0.5 rounded-full bg-border/50 text-foreground border border-border">
                          {ch === "email" ? "بريد إلكتروني" : "رسالة نصية"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleContact.mutate({ id: contact.id, isActive: !contact.isActive })}
                    className={`p-2 rounded-lg transition-all ${
                      contact.isActive
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-muted-foreground bg-border/30 hover:bg-border/50"
                    }`}
                    title={contact.isActive ? "تعطيل" : "تفعيل"}
                  >
                    {contact.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => { if (confirm("هل أنت متأكد من حذف جهة الاتصال؟")) deleteContact.mutate({ id: contact.id }); }}
                    className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {contacts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد جهات اتصال بعد</p>
            </div>
          )}
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          {rules.map((rule, idx) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={{ scale: 1.01, x: -4 }}
              className="bg-secondary/60 backdrop-blur border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => { setSelectedEntry(rule); setActiveModal("ruleDetail"); }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-lg">{rule.nameAr || rule.contactName}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColors[rule.severityThreshold]}`}>
                        {rule.severityThreshold === "critical" ? "واسع النطاق" : rule.severityThreshold === "high" ? "مرتفع" : rule.severityThreshold === "medium" ? "متوسط" : "محدود"} وأعلى
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-border/50 text-foreground border border-border">
                        {rule.channel === "email" ? "بريد" : rule.channel === "sms" ? "رسالة" : "الكل"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {((rule.recipients as number[]) || []).length} مستلم
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleRule.mutate({ id: rule.id, isEnabled: !rule.isEnabled })}
                    className={`p-2 rounded-lg transition-all ${
                      rule.isEnabled
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-muted-foreground bg-border/30 hover:bg-border/50"
                    }`}
                    title={rule.isEnabled ? "تعطيل" : "تفعيل"}
                  >
                    {rule.isEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => { if (confirm("هل أنت متأكد من حذف القاعدة؟")) deleteRule.mutate({ id: rule.id }); }}
                    className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {rules.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد قواعد تنبيه بعد</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab — clickable rows */}
      {activeTab === "history" && (
        <div className="bg-secondary/60 backdrop-blur border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs text-muted-foreground font-medium p-4">الحالة</th>
                  <th className="text-right text-xs text-muted-foreground font-medium p-4">المستلم</th>
                  <th className="text-right text-xs text-muted-foreground font-medium p-4">القناة</th>
                  <th className="text-right text-xs text-muted-foreground font-medium p-4">الموضوع</th>
                  <th className="text-right text-xs text-muted-foreground font-medium p-4">حالة الرصد</th>
                  <th className="text-right text-xs text-muted-foreground font-medium p-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="border-b border-border/50 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => { setSelectedEntry(entry); setActiveModal("historyDetail"); }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {statusIcons[entry.status]}
                        <span className="text-xs text-foreground">
                          {entry.status === "sent" ? "مرسل" : entry.status === "failed" ? "فشل" : "قيد الانتظار"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">{entry.contactName}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-border/50 text-foreground">
                        {entry.channel === "email" ? "بريد" : "رسالة"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground max-w-xs truncate">{entry.subject}</td>
                    <td className="p-4 text-sm text-cyan-400 font-mono">{entry.leakId || "—"}</td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {entry.sentAt ? new Date(entry.sentAt).toLocaleString("ar-SA") : "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا يوجد سجل تنبيهات بعد</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Sent Alerts Modal */}
      <DetailModal open={activeModal === "sent"} onClose={() => setActiveModal(null)} title="التنبيهات المرسلة بنجاح" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
            <p className="text-2xl font-bold text-emerald-400"><AnimatedCounter value={stats?.totalSent ?? 0} /></p>
            <p className="text-xs text-muted-foreground">تنبيه مرسل بنجاح</p>
          </div>
          {history.filter(h => h.status === "sent").slice(0, 10).map(entry => (
            <div key={entry.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-sm text-foreground">{entry.subject}</span>
              </div>
              <p className="text-xs sm:text-[10px] text-muted-foreground">{entry.contactName} • {entry.sentAt ? new Date(entry.sentAt).toLocaleString("ar-SA") : "—"}</p>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Failed Alerts Modal */}
      <DetailModal open={activeModal === "failed"} onClose={() => setActiveModal(null)} title="التنبيهات الفاشلة" icon={<XCircle className="w-5 h-5 text-red-400" />}>
        <div className="space-y-3">
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
            <p className="text-2xl font-bold text-red-400"><AnimatedCounter value={stats?.totalFailed ?? 0} /></p>
            <p className="text-xs text-muted-foreground">تنبيه فاشل</p>
          </div>
          {history.filter(h => h.status === "failed").slice(0, 10).map(entry => (
            <div key={entry.id} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-sm text-foreground">{entry.subject}</span>
              </div>
              <p className="text-xs sm:text-[10px] text-muted-foreground">{entry.contactName} • {entry.sentAt ? new Date(entry.sentAt).toLocaleString("ar-SA") : "—"}</p>
            </div>
          ))}
          {history.filter(h => h.status === "failed").length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">لا توجد تنبيهات فاشلة</p>
          )}
        </div>
      </DetailModal>

      {/* Active Rules Modal */}
      <DetailModal open={activeModal === "activeRules"} onClose={() => setActiveModal(null)} title="القواعد النشطة" icon={<Shield className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-3">
          {rules.filter(r => r.isEnabled).map(rule => (
            <div key={rule.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-foreground">{rule.nameAr || rule.contactName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${severityColors[rule.severityThreshold]}`}>
                  {rule.severityThreshold === "critical" ? "واسع النطاق" : rule.severityThreshold === "high" ? "مرتفع" : "متوسط"} وأعلى
                </span>
                <span className="text-xs sm:text-[10px] text-muted-foreground">{((rule.recipients as number[]) || []).length} مستلم</span>
              </div>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Active Contacts Modal */}
      <DetailModal open={activeModal === "activeContacts"} onClose={() => setActiveModal(null)} title="جهات الاتصال النشطة" icon={<Users className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          {contacts.filter(c => c.isActive).map(contact => (
            <div key={contact.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{contact.nameAr || contact.contactName}</p>
                  <p className="text-xs sm:text-[10px] text-muted-foreground">{contact.roleAr || contact.contactRole}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {contact.email && <span className="text-xs sm:text-[10px] text-muted-foreground">{contact.contactEmail}</span>}
                    {contact.phone && <span className="text-xs sm:text-[10px] text-muted-foreground">{contact.contactPhone}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Contact Detail Modal */}
      <DetailModal
        open={activeModal === "contactDetail" && !!selectedEntry}
        onClose={() => { setActiveModal(null); setSelectedEntry(null); }}
        title={selectedEntry?.nameAr || selectedEntry?.name || "تفاصيل جهة الاتصال"}
        icon={<Users className="w-5 h-5 text-cyan-400" />}
      >
        {selectedEntry && activeModal === "contactDetail" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedEntry.nameAr || selectedEntry.contactName}</h3>
                <p className="text-sm text-muted-foreground">{selectedEntry.roleAr || selectedEntry.contactRole}</p>
                <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border mt-1 inline-block ${
                  selectedEntry.isActive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-red-400 bg-red-500/10 border-red-500/30"
                }`}>{selectedEntry.isActive ? "نشط" : "غير نشط"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                <p className="text-sm text-foreground">{selectedEntry.email || "—"}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">رقم الجوال</p>
                <p className="text-sm text-foreground font-mono">{selectedEntry.phone || "—"}</p>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">قنوات التنبيه</p>
              <div className="flex gap-2">
                {parseJsonSafe(selectedEntry.alertChannels, []).map((ch: string) => (
                  <span key={ch} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {ch === "email" ? "بريد إلكتروني" : "رسالة نصية"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailModal>

      {/* Rule Detail Modal */}
      <DetailModal
        open={activeModal === "ruleDetail" && !!selectedEntry}
        onClose={() => { setActiveModal(null); setSelectedEntry(null); }}
        title={selectedEntry?.nameAr || selectedEntry?.name || "تفاصيل القاعدة"}
        icon={<Zap className="w-5 h-5 text-amber-400" />}
      >
        {selectedEntry && activeModal === "ruleDetail" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">الحد الأدنى للتأثير</p>
                <span className={`text-sm font-bold mt-1 inline-block px-2 py-0.5 rounded border ${severityColors[selectedEntry.severityThreshold]}`}>
                  {selectedEntry.severityThreshold === "critical" ? "واسع النطاق" : selectedEntry.severityThreshold === "high" ? "مرتفع" : "متوسط"}
                </span>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">القناة</p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {selectedEntry.channel === "email" ? "بريد" : selectedEntry.channel === "sms" ? "رسالة" : "الكل"}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">المستلمين</p>
                <p className="text-sm font-bold text-foreground mt-1">{((selectedEntry.recipients as number[]) || []).length}</p>
              </div>
            </div>
            <div className={`rounded-xl p-3 border ${selectedEntry.isEnabled ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
              <p className={`text-sm font-medium ${selectedEntry.isEnabled ? "text-emerald-400" : "text-red-400"}`}>
                {selectedEntry.isEnabled ? "القاعدة مفعّلة وتعمل" : "القاعدة معطّلة"}
              </p>
            </div>
          </div>
        )}
      </DetailModal>

      {/* History Detail Modal */}
      <DetailModal
        open={activeModal === "historyDetail" && !!selectedEntry}
        onClose={() => { setActiveModal(null); setSelectedEntry(null); }}
        title="تفاصيل التنبيه"
        icon={<History className="w-5 h-5 text-primary" />}
      >
        {selectedEntry && activeModal === "historyDetail" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">الحالة</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {statusIcons[selectedEntry.status]}
                  <span className="text-sm font-bold text-foreground">
                    {selectedEntry.status === "sent" ? "مرسل" : selectedEntry.status === "failed" ? "فشل" : "قيد الانتظار"}
                  </span>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">المستلم</p>
                <p className="text-sm font-bold text-foreground mt-1">{selectedEntry.contactName}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">القناة</p>
                <p className="text-sm font-bold text-foreground mt-1">{selectedEntry.channel === "email" ? "بريد" : "رسالة"}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">التاريخ</p>
                <p className="text-xs font-bold text-foreground mt-1">
                  {selectedEntry.sentAt ? new Date(selectedEntry.sentAt).toLocaleString("ar-SA") : "—"}
                </p>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">الموضوع</h4>
              <p className="text-sm text-foreground">{selectedEntry.subject}</p>
            </div>
            {selectedEntry.leakId && (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setDrillLeakId(selectedEntry.leakId)}>
                <p className="text-xs text-muted-foreground">حالة الرصد المرتبطة</p>
                <p className="text-sm font-mono text-primary mt-1">{selectedEntry.leakId}</p>
                <p className="text-xs sm:text-[10px] text-primary/60 mt-1">اضغط لعرض تفاصيل حالة الرصد</p>
              </div>
            )}
          </div>
        )}
      </DetailModal>
      <LeakDetailDrilldown leak={drillLeakId ? { leakId: drillLeakId } : null} open={!!drillLeakId} onClose={() => setDrillLeakId(null)} />
    </div>
  );
}

```

---

## `client/src/leaks/pages/BreachDashboardsHub.tsx`

```tsx
// Leaks Domain
/**
 * BreachDashboardsHub — صفحة مركز لوحات المؤشرات لمنصة رصد حالات رصد البيانات
 * تجمع كل لوحات المؤشرات والتحليلات في صفحة واحدة مخصصة
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Map, Activity, TrendingUp,
  Globe, Shield, Layers, Brain, Users, Target, Eye,
  Radar, Network, FileText, Search, Plus, Sparkles,
  ArrowLeft, PieChart, Gauge, ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import AddPageButton from "@/components/AddPageButton";
import { useCustomPages } from "@/hooks/useCustomPages";

interface DashboardCard {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  category: string;
}

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: "national-overview",
    title: "لوحة القيادة الرئيسية",
    titleEn: "National Overview",
    description: "نظرة شاملة على حالات الرصد على المستوى الوطني مع مؤشرات رئيسية",
    icon: LayoutDashboard,
    path: "/",
    color: "from-cyan-500 to-blue-600",
    category: "رئيسية",
  },
  {
    id: "threat-map",
    title: "خريطة التهديدات",
    titleEn: "Threat Map",
    description: "خريطة تفاعلية لمصادر التهديدات وتوزيعها الجغرافي",
    icon: Map,
    path: "/threat-map",
    color: "from-red-500 to-rose-600",
    category: "رئيسية",
  },
  {
    id: "sector-analysis",
    title: "تحليل القطاعات",
    titleEn: "Sector Analysis",
    description: "تحليل تفصيلي لحالات الرصد حسب القطاعات",
    icon: Layers,
    path: "/sector-analysis",
    color: "from-purple-500 to-violet-600",
    category: "تحليلية",
  },
  {
    id: "impact-assessment",
    title: "تحليل الأثر",
    titleEn: "Impact Assessment",
    description: "تقييم الأثر المحتمل لحالات الرصد على الجهات المتأثرة",
    icon: Target,
    path: "/impact-assessment",
    color: "from-orange-500 to-amber-600",
    category: "تحليلية",
  },
  {
    id: "geo-analysis",
    title: "التحليل الجغرافي",
    titleEn: "Geo Analysis",
    description: "تحليل جغرافي لمصادر ومناطق حالات الرصد",
    icon: Globe,
    path: "/geo-analysis",
    color: "from-emerald-500 to-green-600",
    category: "تحليلية",
  },
  {
    id: "source-intelligence",
    title: "استخبارات المصادر",
    titleEn: "Source Intelligence",
    description: "تحليل مصادر النشر والأنماط المتكررة",
    icon: Radar,
    path: "/source-intelligence",
    color: "from-sky-500 to-cyan-600",
    category: "تحليلية",
  },
  {
    id: "threat-actors",
    title: "تحليل جهات النشر",
    titleEn: "Threat Actors",
    description: "تحليل جهات التهديد ونشاطاتها وأنماطها",
    icon: Users,
    path: "/threat-actors-analysis",
    color: "from-pink-500 to-rose-600",
    category: "تحليلية",
  },
  {
    id: "pii-atlas",
    title: "أطلس البيانات الشخصية",
    titleEn: "PII Atlas",
    description: "خريطة شاملة لأنواع البيانات الشخصية المكتشفة",
    icon: Network,
    path: "/pii-atlas",
    color: "from-indigo-500 to-blue-600",
    category: "متقدمة",
  },
  {
    id: "knowledge-graph",
    title: "رسم المعرفة",
    titleEn: "Knowledge Graph",
    description: "شبكة العلاقات بين الحالات والمصادر والجهات",
    icon: Brain,
    path: "/knowledge-graph",
    color: "from-violet-500 to-purple-600",
    category: "متقدمة",
  },
  {
    id: "leak-timeline",
    title: "الخط الزمني للحالات",
    titleEn: "Leak Timeline",
    description: "عرض زمني متسلسل لحالات الرصد",
    icon: Activity,
    path: "/leak-timeline",
    color: "from-teal-500 to-emerald-600",
    category: "تحليلية",
  },
  {
    id: "pdpl-compliance",
    title: "امتثال PDPL",
    titleEn: "PDPL Compliance",
    description: "مؤشرات الامتثال لنظام حماية البيانات الشخصية",
    icon: Shield,
    path: "/pdpl-compliance",
    color: "from-blue-500 to-indigo-600",
    category: "متقدمة",
  },
  {
    id: "feedback-accuracy",
    title: "مقاييس الدقة",
    titleEn: "Accuracy Metrics",
    description: "قياس دقة الرصد والتصنيف مع التحسين المستمر",
    icon: TrendingUp,
    path: "/feedback-accuracy",
    color: "from-amber-500 to-yellow-600",
    category: "متقدمة",
  },
  {
    id: "executive-brief",
    title: "الملخص التنفيذي",
    titleEn: "Executive Brief",
    description: "ملخص تنفيذي شامل لصناع القرار",
    icon: FileText,
    path: "/executive-brief",
    color: "from-slate-500 to-gray-600",
    category: "تقارير",
  },
  {
    id: "incident-compare",
    title: "مقارنة الحالات",
    titleEn: "Incident Compare",
    description: "مقارنة بين حالات الرصد المختلفة",
    icon: BarChart3,
    path: "/incident-compare",
    color: "from-cyan-500 to-teal-600",
    category: "تقارير",
  },
  {
    id: "campaign-tracker",
    title: "متتبع الحملات",
    titleEn: "Campaign Tracker",
    description: "تتبع حملات الرصد المنظمة والمترابطة",
    icon: Sparkles,
    path: "/campaign-tracker",
    color: "from-rose-500 to-pink-600",
    category: "متقدمة",
  },
];

const CATEGORIES = ["الكل", "رئيسية", "تحليلية", "متقدمة", "تقارير", "مخصصة"];

export default function BreachDashboardsHub() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { pages: customPages, createPage } = useCustomPages("leaks");

  const filteredCards = DASHBOARD_CARDS.filter((card) => {
    const matchesCategory = activeCategory === "الكل" || card.category === activeCategory;
    const matchesSearch = !searchQuery ||
      card.title.includes(searchQuery) ||
      card.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const customDashboardPages = (customPages || []).filter(
    (p: any) => p.pageType === "dashboard"
  );

  const handleCreatePage = async (pageType: "dashboard" | "table" | "report", title: string): Promise<boolean> => {
    const result = await createPage(pageType, title);
    if (result) {
      setLocation(`/custom/${pageType}/${(result as any).id}`);
      return true;
    }
    return false;
  };

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              مركز لوحات المؤشرات
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              منصة رصد حالات الرصد — جميع لوحات المؤشرات والتحليلات
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في اللوحات..."
              className={`pr-10 pl-4 py-2 rounded-xl border text-sm w-64 ${
                isDark
                  ? "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>
          <AddPageButton
            collapsed={false}
            onCreatePage={handleCreatePage}
            accent="hsl(var(--primary))"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : isDark
                  ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100"
                }`}
                onClick={() => setLocation(card.path)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${isDark ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-500"}`}>
                      {card.category}
                    </Badge>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {card.title}
                  </h3>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Custom Dashboard Pages */}
        {(activeCategory === "الكل" || activeCategory === "مخصصة") &&
          customDashboardPages.map((page: any, i: number) => (
            <motion.div
              key={`custom-${page.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (filteredCards.length + i) * 0.05, duration: 0.3 }}
            >
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100"
                }`}
                onClick={() => setLocation(`/custom/dashboard/${page.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-lg">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${isDark ? "border-cyan-500/30 text-cyan-400" : "border-blue-300 text-blue-500"}`}>
                      مخصصة
                    </Badge>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {page.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    لوحة مؤشرات مخصصة
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        }
      </div>

      {filteredCards.length === 0 && customDashboardPages.length === 0 && (
        <div className="text-center py-16">
          <LayoutDashboard className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            لا توجد لوحات مؤشرات مطابقة
          </p>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            جرب تغيير معايير البحث أو الفئة
          </p>
        </div>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/BreachImport.tsx`

```tsx
// Leaks Domain
/**
 * BreachImport — صفحة استيراد بيانات حالات الرصد
 * تدعم: JSON, CSV, XLSX, ZIP
 * مربوطة بـ API الاستيراد الفعلي
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Upload, FileText, FileSpreadsheet, Archive, Download,
  CheckCircle, XCircle, Loader2, ChevronLeft, AlertTriangle,
  Info, RefreshCw, Eye, Trash2, FileJson,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type ImportStatus = "idle" | "uploading" | "processing" | "completed" | "error";

interface ImportResult {
  jobId: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  errors: Array<{ record: number; error: string }>;
}

const SUPPORTED_FORMATS = [
  { ext: "json", label: "JSON", icon: FileJson, color: "text-amber-400", description: "ملف JSON بتنسيق PDPL_Package أو مصفوفة حالات" },
  { ext: "csv", label: "CSV", icon: FileText, color: "text-green-400", description: "ملف CSV مفصول بفواصل مع ترويسات" },
  { ext: "xlsx", label: "Excel", icon: FileSpreadsheet, color: "text-blue-400", description: "ملف Excel مع ورقة بيانات الحالات" },
  { ext: "zip", label: "ZIP", icon: Archive, color: "text-purple-400", description: "حزمة مضغوطة بتنسيق PDPL_Package" },
];

export default function BreachImport() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["json", "csv", "xlsx", "zip"].includes(ext || "")) {
      toast.error("صيغة ملف غير مدعومة. يرجى استخدام JSON, CSV, XLSX, أو ZIP");
      return;
    }
    setSelectedFile(file);
    setStatus("idle");
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    try {
      // Use REST endpoint with FormData for reliable file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      setStatus("processing");
      const response = await fetch("/api/cms/import/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `فشل الاستيراد: ${response.statusText}`);
      }

      const data = await response.json();
      setStatus("completed");
      setResult(data);
      toast.success(`تم استيراد ${data.successRecords} من ${data.totalRecords} سجل بنجاح`);
    } catch (err: any) {
      setStatus("error");
      toast.error(`فشل الاستيراد: ${err.message}`);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus("idle");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setLocation("/breach-operations")}
          className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            استيراد بيانات حالات الرصد
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            تغذية المنصة ببيانات حالات الرصد
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card className={`${isDark ? "bg-gray-900/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                رفع الملف
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                  ${dragActive
                    ? "border-cyan-500 bg-cyan-500/10 scale-[1.01]"
                    : isDark
                      ? "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,.xlsx,.zip"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  اسحب الملف هنا أو انقر للاختيار
                </p>
                <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  يدعم: JSON, CSV, XLSX, ZIP (حتى 50 ميجابايت)
                </p>
              </div>

              {/* Selected File */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl flex items-center justify-between ${
                    isDark ? "bg-gray-800/50 border border-gray-700/50" : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-cyan-500" />
                    <div>
                      <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{selectedFile.name}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {(selectedFile.size / 1024).toFixed(1)} كيلوبايت
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || status === "uploading" || status === "processing"}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  {status === "uploading" || status === "processing" ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      {status === "uploading" ? "جاري الرفع..." : "جاري المعالجة..."}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 ml-2" />
                      بدء الاستيراد
                    </>
                  )}
                </Button>
                {result && (
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 ml-2" />
                    استيراد جديد
                  </Button>
                )}
              </div>

              {/* Results */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className={`p-4 rounded-xl text-center ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-green-50 border border-green-200"}`}>
                      <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                      <p className="text-2xl font-bold text-emerald-500">{result.successRecords}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>نجح</p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                      <XCircle className="w-6 h-6 mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold text-red-500">{result.failedRecords}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>فشل</p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
                      <Info className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                      <p className="text-2xl font-bold text-blue-500">{result.totalRecords}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>إجمالي</p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className={`p-4 rounded-xl ${isDark ? "bg-red-500/5 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                      <p className="text-sm font-medium text-red-500 mb-2">
                        <AlertTriangle className="w-4 h-4 inline-block ml-1" />
                        أخطاء ({result.errors.length})
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {result.errors.slice(0, 20).map((err, i) => (
                          <p key={i} className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            سجل #{err.record}: {err.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supported Formats */}
        <div>
          <Card className={`${isDark ? "bg-gray-900/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                الصيغ المدعومة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SUPPORTED_FORMATS.map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <div
                    key={fmt.ext}
                    className={`p-3 rounded-xl ${isDark ? "bg-gray-800/50 border border-gray-700/50" : "bg-gray-50 border border-gray-200"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${fmt.color}`} />
                      <span className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        {fmt.label}
                      </span>
                      <Badge variant="outline" className="text-[9px]">.{fmt.ext}</Badge>
                    </div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {fmt.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Field Mapping Guide */}
          <Card className={`mt-4 ${isDark ? "bg-gray-900/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                الحقول المطلوبة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { field: "title / العنوان", required: true },
                  { field: "source / المصدر", required: true },
                  { field: "severity / مستوى التأثير", required: true },
                  { field: "sector / القطاع", required: false },
                  { field: "piiTypes / أنواع البيانات", required: false },
                  { field: "recordCount / العدد المُدّعى", required: false },
                  { field: "description / الوصف", required: false },
                  { field: "threatActor / جهة التهديد", required: false },
                ].map((item) => (
                  <div key={item.field} className="flex items-center justify-between">
                    <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>{item.field}</span>
                    <Badge variant="outline" className={`text-[9px] ${item.required ? "border-red-500/30 text-red-400" : "border-gray-500/30 text-gray-400"}`}>
                      {item.required ? "مطلوب" : "اختياري"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

```

---

## `client/src/leaks/pages/BreachOperationsHub.tsx`

```tsx
// Leaks Domain
/**
 * BreachOperationsHub — صفحة مركز العمليات التشغيلية لمنصة رصد حالات رصد البيانات
 * يحتوي على أدوات ما قبل الرصد والعمليات التشغيلية
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Send, Globe, FileText, Radio, ScanSearch, Bell,
  Crosshair, Radar, Link2, UserX, Brain, Network,
  Shield, FileCheck, Search, ChevronLeft, Import,
  Archive, CalendarClock, Eye, Activity, Upload,
  Database, Settings, Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

interface OperationCard {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  category: string;
}

const OPERATION_CARDS: OperationCard[] = [
  // ── أدوات الرصد (ما قبل الرصد) ──
  {
    id: "live-scan",
    title: "الرصد المباشر",
    titleEn: "Live Scan",
    description: "بدء رصد مباشر للمصادر والقنوات",
    icon: Radio,
    path: "/live-scan",
    color: "from-red-500 to-rose-600",
    category: "أدوات الرصد",
  },
  {
    id: "telegram",
    title: "رصد تليجرام",
    titleEn: "Telegram Monitor",
    description: "مراقبة قنوات ومجموعات تليجرام",
    icon: Send,
    path: "/telegram",
    color: "from-sky-500 to-blue-600",
    category: "أدوات الرصد",
  },
  {
    id: "darkweb",
    title: "رصد الدارك ويب",
    titleEn: "Dark Web Monitor",
    description: "مراقبة منتديات ومواقع الدارك ويب",
    icon: Globe,
    path: "/darkweb",
    color: "from-purple-500 to-violet-600",
    category: "أدوات الرصد",
  },
  {
    id: "paste-sites",
    title: "مواقع اللصق",
    titleEn: "Paste Sites",
    description: "مراقبة مواقع اللصق مثل Pastebin",
    icon: FileText,
    path: "/paste-sites",
    color: "from-amber-500 to-orange-600",
    category: "أدوات الرصد",
  },
  {
    id: "monitoring-jobs",
    title: "مهام الرصد",
    titleEn: "Monitoring Jobs",
    description: "إدارة وجدولة مهام الرصد المختلفة",
    icon: CalendarClock,
    path: "/monitoring-jobs",
    color: "from-indigo-500 to-blue-600",
    category: "أدوات الرصد",
  },
  // ── أدوات التحليل ──
  {
    id: "pii-classifier",
    title: "مختبر أنماط البيانات",
    titleEn: "PII Classifier",
    description: "تصنيف أنواع البيانات الشخصية المكتشفة",
    icon: ScanSearch,
    path: "/pii-classifier",
    color: "from-cyan-500 to-teal-600",
    category: "أدوات التحليل",
  },
  {
    id: "evidence-chain",
    title: "سلسلة الأدلة",
    titleEn: "Evidence Chain",
    description: "تتبع وتوثيق الأدلة المرتبطة بالحالات",
    icon: Link2,
    path: "/evidence-chain",
    color: "from-emerald-500 to-green-600",
    category: "أدوات التحليل",
  },
  {
    id: "threat-rules",
    title: "قواعد الرصد",
    titleEn: "Threat Rules",
    description: "إدارة وتكوين قواعد الكشف والرصد",
    icon: Crosshair,
    path: "/threat-rules",
    color: "from-rose-500 to-pink-600",
    category: "أدوات التحليل",
  },
  {
    id: "osint-tools",
    title: "أدوات OSINT",
    titleEn: "OSINT Tools",
    description: "أدوات الاستخبارات مفتوحة المصدر",
    icon: Radar,
    path: "/osint-tools",
    color: "from-teal-500 to-cyan-600",
    category: "أدوات التحليل",
  },
  // ── إدارة البيانات ──
  {
    id: "seller-profiles",
    title: "ملفات المصادر",
    titleEn: "Seller Profiles",
    description: "إدارة ملفات مصادر العينات المتاحة",
    icon: UserX,
    path: "/seller-profiles",
    color: "from-pink-500 to-rose-600",
    category: "إدارة البيانات",
  },
  {
    id: "alert-channels",
    title: "قنوات التنبيه",
    titleEn: "Alert Channels",
    description: "تكوين قنوات ووسائل التنبيه",
    icon: Bell,
    path: "/alert-channels",
    color: "from-yellow-500 to-amber-600",
    category: "إدارة البيانات",
  },
  {
    id: "incidents-registry",
    title: "سجل الحالات",
    titleEn: "Incidents Registry",
    description: "السجل الكامل لجميع حالات الرصد",
    icon: Archive,
    path: "/incidents-registry",
    color: "from-slate-500 to-gray-600",
    category: "إدارة البيانات",
  },
  {
    id: "verify-document",
    title: "التحقق من التوثيق",
    titleEn: "Verify Document",
    description: "التحقق من صحة الوثائق والتقارير",
    icon: FileCheck,
    path: "/verify",
    color: "from-blue-500 to-indigo-600",
    category: "إدارة البيانات",
  },
  // ── الاستيراد والتصدير ──
  {
    id: "import-data",
    title: "استيراد البيانات",
    titleEn: "Import Data",
    description: "استيراد بيانات حالات الرصد من ملفات خارجية",
    icon: Upload,
    path: "/breach-import",
    color: "from-green-500 to-emerald-600",
    category: "استيراد وتصدير",
  },
  {
    id: "export-data",
    title: "تصدير البيانات",
    titleEn: "Export Data",
    description: "تصدير البيانات والتقارير بصيغ مختلفة",
    icon: Download,
    path: "/export-data",
    color: "from-violet-500 to-purple-600",
    category: "استيراد وتصدير",
  },
];

const CATEGORIES = ["الكل", "أدوات الرصد", "أدوات التحليل", "إدارة البيانات", "استيراد وتصدير"];

export default function BreachOperationsHub() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const filteredCards = OPERATION_CARDS.filter((card) => {
    const matchesCategory = activeCategory === "الكل" || card.category === activeCategory;
    const matchesSearch = !searchQuery ||
      card.title.includes(searchQuery) ||
      card.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              مركز العمليات التشغيلية
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              منصة رصد حالات رصد البيانات — أدوات الرصد والعمليات التشغيلية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الأدوات..."
              className={`pr-10 pl-4 py-2 rounded-xl border text-sm w-64 ${
                isDark
                  ? "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : isDark
                  ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Operations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100"
                }`}
                onClick={() => setLocation(card.path)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${isDark ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-500"}`}>
                      {card.category}
                    </Badge>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {card.title}
                  </h3>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-16">
          <Activity className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            لا توجد أدوات مطابقة
          </p>
        </div>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/BulkAnalysis.tsx`

```tsx
// Leaks Domain
import { useState, useRef, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileSearch, Upload, Play, Pause, XCircle, Trash2, Download,
  Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet, Eye,
  ArrowRight, BarChart3, Shield, Clock, RefreshCw, ChevronLeft,
  ChevronRight, Filter, Database, Zap, TrendingUp, FileText,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const clauseNames = [
  "تحديد الغرض من جمع البيانات الشخصية",
  "تحديد محتوى البيانات الشخصية المطلوب جمعها",
  "تحديد طريقة جمع البيانات الشخصية",
  "تحديد وسيلة حفظ البيانات الشخصية",
  "تحديد كيفية معالجة البيانات الشخصية",
  "تحديد كيفية إتلاف البيانات الشخصية",
  "تحديد حقوق صاحب البيانات الشخصية",
  "تحديد كيفية ممارسة صاحب البيانات لحقوقه",
];

const clauseShortNames = [
  "الغرض", "المحتوى", "طريقة الجمع", "وسيلة الحفظ",
  "المعالجة", "الإتلاف", "الحقوق", "ممارسة الحقوق",
];

const statusLabels: Record<string, string> = {
  pending: "في الانتظار",
  running: "جاري التحليل",
  paused: "متوقف مؤقتاً",
  completed: "مكتمل",
  failed: "فشل",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  running: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const complianceLabels: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "لا يوجد سياسة",
  error: "خطأ",
};

const complianceColors: Record<string, string> = {
  compliant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  partially_compliant: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  non_compliant: "bg-red-500/10 text-red-400 border-red-500/20",
  no_policy: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function BulkAnalysis() {
  const { playClick, playHover } = useSoundEffects();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [jobName, setJobName] = useState("");
  const [importJobName, setImportJobName] = useState("تحليل المواقع المكتشفة");
  const [csvUrls, setCsvUrls] = useState<{ domain: string; privacyUrl: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 50;

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = trpc.bulkAnalysis.listJobs.useQuery();
  
  const { data: jobStats, refetch: refetchStats } = trpc.bulkAnalysis.getJobStats.useQuery(
    { jobId: selectedJobId! },
    { enabled: !!selectedJobId, refetchInterval: 5000 }
  );

  const { data: resultsData, isLoading: resultsLoading, refetch: refetchResults } = trpc.bulkAnalysis.getResults.useQuery(
    { jobId: selectedJobId!, limit: PAGE_SIZE, offset: page * PAGE_SIZE, status: statusFilter === "all" ? undefined : statusFilter },
    { enabled: !!selectedJobId, refetchInterval: 10000 }
  );

  const createJob = trpc.bulkAnalysis.createJob.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء وظيفة التحليل بنجاح");
      setShowCreateDialog(false);
      setJobName("");
      setCsvUrls([]);
      refetchJobs();
      setSelectedJobId(data.jobId);
    },
    onError: (err) => toast.error(err.message),
  });

  const importCrawl = trpc.bulkAnalysis.importCrawlResults.useMutation({
    onSuccess: (data) => {
      toast.success(`تم استيراد ${data.count} موقع بنجاح`);
      setShowImportDialog(false);
      refetchJobs();
      setSelectedJobId(data.jobId);
    },
    onError: (err) => toast.error(err.message),
  });

  const startJob = trpc.bulkAnalysis.startJob.useMutation({
    onSuccess: () => {
      toast.success("بدأ التحليل");
      refetchJobs();
      refetchStats();
    },
    onError: (err) => toast.error(err.message),
  });

  const pauseJob = trpc.bulkAnalysis.pauseJob.useMutation({
    onSuccess: () => {
      toast.success("تم إيقاف التحليل مؤقتاً");
      refetchJobs();
    },
  });

  const cancelJob = trpc.bulkAnalysis.cancelJob.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء التحليل");
      refetchJobs();
    },
  });

  const deleteJob = trpc.bulkAnalysis.deleteJob.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الوظيفة");
      setSelectedJobId(null);
      refetchJobs();
    },
  });

  const exportExcel = trpc.bulkAnalysis.exportExcel.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([Uint8Array.from(atob(data.base64 as any), c => c.charCodeAt(0))], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير التقرير بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const urls: { domain: string; privacyUrl: string }[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length >= 2) {
          const domain = parts[0].trim().replace(/^["']|["']$/g, '');
          const privacyUrl = parts[1].trim().replace(/^["']|["']$/g, '');
          if (domain) urls.push({ domain, privacyUrl });
        }
      }
      setCsvUrls(urls);
      toast.success(`تم تحميل ${urls.length} رابط`);
    };
    reader.readAsText(file);
  }, []);

  const selectedJob = useMemo(() => {
    if (!selectedJobId || !jobs) return null;
    return jobs.find((j: any) => j.id === selectedJobId) || jobStats?.job || null;
  }, [selectedJobId, jobs, jobStats]);

  const progressPercent = useMemo(() => {
    if (!selectedJob) return 0;
    const total = selectedJob.totalUrls || 1;
    const done = (selectedJob.analyzedUrls || 0) + (selectedJob.failedUrls || 0);
    return Math.round((done / total) * 100);
  }, [selectedJob]);

  const totalPages = useMemo(() => {
    if (!resultsData?.total) return 1;
    return Math.ceil(resultsData.total / PAGE_SIZE);
  }, [resultsData]);

  // ─── Job List View ───
  if (!selectedJobId) {
    return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <WatermarkLogo />
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-3">
              <FileSearch className="h-7 w-7 text-primary" />
              تحليل سياسات الخصوصية الجماعي
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              تحليل تلقائي لسياسات الخصوصية باستخدام الذكاء الاصطناعي وفقاً للمادة 12 من نظام حماية البيانات الشخصية
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  استيراد من المواقع المكتشفة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>استيراد المواقع المكتشفة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    سيتم استيراد جميع المواقع التي تم اكتشاف رابط سياسة خصوصية لها من قاعدة البيانات
                  </p>
                  <Input
                    value={importJobName}
                    onChange={(e) => setImportJobName(e.target.value)}
                    placeholder="اسم الوظيفة"
                    dir="rtl"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => importCrawl.mutate({ jobName: importJobName })}
                    disabled={importCrawl.isPending || !importJobName}
                    className="gap-2"
                  >
                    {importCrawl.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    استيراد وإنشاء
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 btn-glow">
                  <Upload className="h-4 w-4" />
                  رفع ملف CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>إنشاء وظيفة تحليل جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="اسم الوظيفة"
                    dir="rtl"
                  />
                  <div
                    className={`border-2 border-dashed rounded-xl p-3 sm:p-8 text-center transition-colors cursor-pointer
                      ${csvUrls.length > 0 ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-primary/50"}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                    {csvUrls.length > 0 ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                        <p className="text-emerald-400 font-medium">{csvUrls.length} رابط جاهز للتحليل</p>
                        <p className="text-xs text-muted-foreground">اضغط لاختيار ملف آخر</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">اسحب ملف CSV هنا أو اضغط للاختيار</p>
                        <p className="text-xs text-muted-foreground">الصيغة: domain,privacy_url</p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => createJob.mutate({ jobName, urls: csvUrls, sourceType: "csv_import" })}
                    disabled={createJob.isPending || !jobName || csvUrls.length === 0}
                    className="gap-2"
                  >
                    {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    إنشاء ({csvUrls.length} رابط)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        {jobs && jobs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{jobs.length}</div>
                <div className="text-xs text-muted-foreground mt-1">إجمالي الوظائف</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">
                  {jobs.filter((j: any) => j.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">مكتملة</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {jobs.filter((j: any) => j.status === "running").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">قيد التنفيذ</div>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {jobs.reduce((sum: number, j: any) => sum + (j.totalUrls || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">إجمالي المواقع</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Jobs List */}
        {jobsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="py-20 text-center">
              <FileSearch className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">لا توجد وظائف تحليل</h3>
              <p className="text-sm text-muted-foreground/70 mt-2">
                ابدأ بإنشاء وظيفة جديدة عبر رفع ملف CSV أو استيراد المواقع المكتشفة
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <Card
                key={job.id}
                className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => { setSelectedJobId(job.id); setPage(0); setStatusFilter("all"); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileSearch className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{job.jobName}</h3>
                          <Badge variant="outline" className={statusColors[job.status] || ""}>
                            {statusLabels[job.status] || job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{job.totalUrls?.toLocaleString()} موقع</span>
                          <span>•</span>
                          <span>{new Date(job.createdAt).toLocaleDateString("ar-SA")}</span>
                          {job.status === "completed" && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">متوسط: {Math.round(job.avgScore || 0)}%</span>
                            </>
                          )}
                        </div>
                        {(job.status === "running" || job.status === "completed") && (
                          <div className="mt-2">
                            <Progress
                              value={Math.round(((job.analyzedUrls || 0) + (job.failedUrls || 0)) / (job.totalUrls || 1) * 100)}
                              className="h-1.5"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === "completed" && (
                        <div className="flex gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{job.compliantCount} ممتثل</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">{job.partialCount} جزئي</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">{job.nonCompliantCount} غير ممتثل</span>
                        </div>
                      )}
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Job Detail View ───
  const job = selectedJob || jobStats?.job;
  const cs = jobStats?.clauseStats;

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedJobId(null)}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
              {job?.jobName || "وظيفة التحليل"}
              {job && (
                <Badge variant="outline" className={statusColors[job.status] || ""}>
                  {statusLabels[job.status] || job.status}
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {job?.totalUrls?.toLocaleString()} موقع • أُنشئت {job ? new Date(job.createdAt).toLocaleDateString("ar-SA") : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {job?.status === "pending" && (
            <Button onClick={() => startJob.mutate({ jobId: selectedJobId! })} className="gap-2 btn-glow" disabled={startJob.isPending}>
              {startJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              بدء التحليل
            </Button>
          )}
          {job?.status === "running" && (
            <Button variant="outline" onClick={() => pauseJob.mutate({ jobId: selectedJobId! })} className="gap-2">
              <Pause className="h-4 w-4" />
              إيقاف مؤقت
            </Button>
          )}
          {job?.status === "paused" && (
            <Button onClick={() => startJob.mutate({ jobId: selectedJobId! })} className="gap-2">
              <Play className="h-4 w-4" />
              استئناف
            </Button>
          )}
          {(job?.status === "running" || job?.status === "paused") && (
            <Button variant="destructive" onClick={() => cancelJob.mutate({ jobId: selectedJobId! })} className="gap-2">
              <XCircle className="h-4 w-4" />
              إلغاء
            </Button>
          )}
          {job?.status === "completed" && (
            <Button
              variant="outline"
              onClick={() => exportExcel.mutate({ jobId: selectedJobId! })}
              disabled={exportExcel.isPending}
              className="gap-2"
            >
              {exportExcel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              تصدير Excel
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { refetchStats(); refetchResults(); refetchJobs(); }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300"
            onClick={() => { if (confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) deleteJob.mutate({ jobId: selectedJobId! }); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {job && (job.status === "running" || job.status === "paused") && (
        <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap mb-2">
              <span className="text-sm font-medium">تقدم التحليل</span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between flex-wrap mt-2 text-xs text-muted-foreground">
              <span>تم تحليل {((job.analyzedUrls || 0) + (job.failedUrls || 0)).toLocaleString()} من {job.totalUrls?.toLocaleString()}</span>
              {job.status === "running" && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  جاري التحليل...
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {job && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 stagger-children">
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{job.totalUrls?.toLocaleString()}</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">إجمالي المواقع</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{(job.analyzedUrls || 0).toLocaleString()}</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">تم تحليلها</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{(job.compliantCount || 0).toLocaleString()}</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">ممتثل</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{(job.partialCount || 0).toLocaleString()}</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">ممتثل جزئياً</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{(job.nonCompliantCount || 0).toLocaleString()}</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">غير ممتثل</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-gray-400">{(job.noPolicyCount || 0).toLocaleString()}</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">لا يوجد سياسة</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(job.avgScore || 0)}%</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">متوسط النتيجة</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clause-Level Compliance Chart */}
      {cs && cs.total > 0 && (
        <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              نسبة الامتثال حسب البنود (المادة 12)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
              {clauseNames.map((name, i) => {
                const val = Number(cs[`c${i + 1}` as keyof typeof cs]) || 0;
                const pct = cs.total > 0 ? Math.round((val / cs.total) * 100) : 0;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground truncate max-w-[180px]">
                              {i + 1}. {clauseShortNames[i]}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs max-w-xs">{name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className={`font-medium ${pct >= 60 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400"}`}>
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="text-xs sm:text-[10px] text-muted-foreground">{val} من {cs.total}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              نتائج التحليل
              {resultsData && <span className="text-xs text-muted-foreground font-normal">({resultsData.total} نتيجة)</span>}
            </CardTitle>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 ms-2" />
                <SelectValue placeholder="تصفية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="compliant">ممتثل</SelectItem>
                <SelectItem value="partially_compliant">ممتثل جزئياً</SelectItem>
                <SelectItem value="non_compliant">غير ممتثل</SelectItem>
                <SelectItem value="no_policy">لا يوجد سياسة</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !resultsData?.results?.length ? (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد نتائج
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-end py-2 px-3 text-xs text-muted-foreground font-medium">النطاق</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">النتيجة</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">الحالة</th>
                      {clauseShortNames.map((name, i) => (
                        <th key={i} className="text-center py-2 px-1 text-xs text-muted-foreground font-medium">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-xs sm:text-[10px]">ب{i + 1}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{clauseNames[i]}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </th>
                      ))}
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.results.map((r: any) => (
                      <tr key={r.id} className="border-b border-border/30 hover:bg-accent/5 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs truncate max-w-[200px]">{r.domain}</span>
                            {r.privacyUrl && (
                              <a href={r.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                <FileText className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <span className={`font-bold text-xs ${
                            (r.overallScore || 0) >= 60 ? "text-emerald-400" :
                            (r.overallScore || 0) >= 40 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {r.overallScore || 0}%
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <Badge variant="outline" className={`text-xs sm:text-[10px] ${complianceColors[r.complianceStatus] || ""}`}>
                            {complianceLabels[r.complianceStatus] || r.complianceStatus}
                          </Badge>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <td key={n} className="text-center py-2.5 px-1">
                            {r[`clause${n}`] ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400/50 mx-auto" />
                            )}
                          </td>
                        ))}
                        <td className="text-center py-2.5 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setSelectedResult(r)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between flex-wrap mt-4 pt-3 border-t border-[rgba(197,165,90,0.10)]/30">
                <div className="text-xs text-muted-foreground">
                  صفحة {page + 1} من {totalPages}
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Result Detail Dialog */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  تفاصيل تحليل: {selectedResult.domain}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Score & Status */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${
                      (selectedResult.overallScore || 0) >= 60 ? "text-emerald-400" :
                      (selectedResult.overallScore || 0) >= 40 ? "text-amber-400" : "text-red-400"
                    }`}>
                      {selectedResult.overallScore || 0}%
                    </span>
                  </div>
                  <div>
                    <Badge variant="outline" className={complianceColors[selectedResult.complianceStatus] || ""}>
                      {complianceLabels[selectedResult.complianceStatus] || selectedResult.complianceStatus}
                    </Badge>
                    {selectedResult.privacyUrl && (
                      <a href={selectedResult.privacyUrl} target="_blank" rel="noopener noreferrer"
                        className="block text-xs text-primary hover:underline mt-1 truncate max-w-md">
                        {selectedResult.privacyUrl}
                      </a>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {selectedResult.summary && (
                  <div className="p-3 rounded-lg bg-accent/5 border border-border/30">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">الملخص</h4>
                    <p className="text-sm">{selectedResult.summary}</p>
                  </div>
                )}

                {/* Clause Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">تفصيل البنود</h4>
                  {clauseNames.map((name, i) => {
                    const n = i + 1;
                    const compliant = selectedResult[`clause${n}`];
                    const evidence = selectedResult[`clause${n}Evidence`];
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${compliant ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <div className="flex items-center gap-2">
                          {compliant ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                          )}
                          <span className="text-xs font-medium">البند {n}: {name}</span>
                        </div>
                        {evidence && (
                          <p className="text-xs text-muted-foreground mt-1 me-6">{evidence}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Error Message */}
                {selectedResult.errorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-red-400">{selectedResult.errorMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## `client/src/leaks/pages/CampaignTracker.tsx`

```tsx
// Leaks Domain
/**
 * CampaignTracker — متتبع الحملات
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Calendar, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function CampaignTracker() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [selectedActor, setSelectedActor] = useState<string | null>(null);

  const analysis = useMemo(() => {
    if (!leaks.length) return { campaigns: [], timeline: [] };
    const actorMap: Record<string, { leaks: any[]; sectors: Set<string>; firstSeen: string; lastSeen: string }> = {};
    leaks.forEach((l: any) => {
      const a = l.threatActorAr || l.threatActor || "غير معروف";
      if (!actorMap[a]) actorMap[a] = { leaks: [], sectors: new Set(), firstSeen: l.detectedAt || l.createdAt, lastSeen: l.detectedAt || l.createdAt };
      actorMap[a].leaks.push(l);
      actorMap[a].sectors.add(l.sectorAr || l.sector || "");
      const d = l.detectedAt || l.createdAt;
      if (d < actorMap[a].firstSeen) actorMap[a].firstSeen = d;
      if (d > actorMap[a].lastSeen) actorMap[a].lastSeen = d;
    });
    const campaigns = Object.entries(actorMap).map(([name, d]) => ({
      name, count: d.leaks.length, sectors: d.sectors.size,
      records: d.leaks.reduce((s, l) => s + (l.recordCount || 0), 0),
      critical: d.leaks.filter(l => l.severity === "critical").length,
      firstSeen: d.firstSeen, lastSeen: d.lastSeen,
    })).sort((a, b) => b.count - a.count);
    return { campaigns };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">متتبع الحملات</h1><p className="text-muted-foreground text-sm mt-1">تتبع حملات التهديد ونشاط الجهات الفاعلة</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Target className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.campaigns.length}</div><div className="text-xs text-muted-foreground">حملة نشطة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.campaigns.reduce((s, c) => s + c.critical, 0)}</div><div className="text-xs text-muted-foreground">هجمات حرجة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{leaks.length}</div><div className="text-xs text-muted-foreground">إجمالي حالات الرصد</div></CardContent></Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">نشاط الحملات</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.campaigns.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="حالات الرصد" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل الحملات</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-right text-muted-foreground p-2">الجهة</th><th className="text-center text-muted-foreground p-2">حالات الرصد</th><th className="text-center text-muted-foreground p-2">السجلات</th><th className="text-center text-muted-foreground p-2">القطاعات</th><th className="text-center text-muted-foreground p-2">حرج</th><th className="text-center text-muted-foreground p-2">أول ظهور</th><th className="text-center text-muted-foreground p-2">آخر نشاط</th></tr></thead>
              <tbody>
                {analysis.campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{c.name}</td>
                    <td className="p-2 text-center text-foreground">{c.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{c.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-purple-500/20 text-purple-400">{c.sectors}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-red-500/20 text-red-400">{c.critical}</Badge></td>
                    <td className="p-2 text-center text-muted-foreground text-xs">{c.firstSeen ? new Date(c.firstSeen).toLocaleDateString("ar-SA") : "---"}</td>
                    <td className="p-2 text-center text-muted-foreground text-xs">{c.lastSeen ? new Date(c.lastSeen).toLocaleDateString("ar-SA") : "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/leaks/pages/DarkWebMonitor.tsx`

```tsx
// Leaks Domain
/**
 * DarkWebMonitor — Dark web forum/marketplace monitoring
 * All stats and listings are clickable with detail modals
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Shield,
  AlertTriangle,
  Search,
  RefreshCw,
  Clock,
  TrendingUp,
  Loader2,
  DollarSign,
  Database,
  Eye,
  Users,
  FileText,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import AnimatedCounter from "@/components/AnimatedCounter";

const severityColor = (s: string) => {
  switch (s) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "high": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    default: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  }
};

const severityLabel = (s: string) => {
  switch (s) {
    case "critical": return "واسع النطاق";
    case "high": return "عالي";
    case "medium": return "متوسط";
    default: return "منخفض";
  }
};

export default function DarkWebMonitor() {
  const { data: listings, isLoading: listingsLoading } = trpc.darkweb.listings.useQuery();
  const { data: channels, isLoading: channelsLoading } = trpc.channels.list.useQuery({ platform: "darkweb" });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [drillLeak, setDrillLeak] = useState<any>(null);

  const darkWebListings = listings ?? [];
  const darkWebChannels = channels ?? [];
  const isLoading = listingsLoading || channelsLoading;

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-violet-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">رصد الدارك ويب</h1>
              <p className="text-xs text-muted-foreground">Dark Web Monitoring</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            مراقبة منتديات بيع البيانات وأسواق البيانات المكتشفة عبر شبكة Tor
          </p>
        </div>
      </motion.div>

      {/* Stats — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "sources", label: "مصادر مراقبة", value: darkWebChannels.length, color: "text-violet-400", borderColor: "border-violet-500/20", bgColor: "bg-violet-500/5" },
          { key: "leaks", label: "حالات رصد مكتشفة", value: darkWebChannels.reduce((a, c) => a + (c.leaksDetected ?? 0), 0), color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
          { key: "listings", label: "عروض بيع نشطة", value: darkWebListings.length, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
          { key: "records", label: "السجلات المكشوفة", value: darkWebListings.reduce((s, l) => s + (l.recordCount ?? 0), 0).toLocaleString(), color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
        ].map((stat, i) => (
          <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card
              className={`border ${stat.borderColor} ${stat.bgColor} cursor-pointer hover:scale-[1.02] transition-all group`}
              onClick={() => setActiveModal(stat.key)}
            >
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{typeof stat.value === "number" ? <AnimatedCounter value={stat.value} /> : stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monitored sources — clickable */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            المصادر المراقبة
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => toast("جاري التحديث...")}>
            <RefreshCw className="w-3.5 h-3.5" />
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {darkWebChannels.map((source, i) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-violet-500/30 transition-colors cursor-pointer"
                onClick={() => { setSelectedSource(source); setActiveModal("sourceDetail"); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{source.name}</h3>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{source.channelId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      source.status === "active" ? "bg-emerald-500" :
                      source.status === "flagged" ? "bg-red-500" : "bg-yellow-500"
                    }`} />
                    <span className="text-xs sm:text-[10px] text-muted-foreground">
                      {source.status === "active" ? "نشط" : source.status === "flagged" ? "مُعلَّم" : "متوقف"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {source.leaksDetected ?? 0} حالة رصد
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-xs sm:text-[10px] ${
                    source.riskLevel === "high" ? "text-red-400 bg-red-500/10 border-red-500/30" :
                    source.riskLevel === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                    "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                  }`}>
                    {source.riskLevel === "high" ? "تأثير عالي" : source.riskLevel === "medium" ? "تأثير متوسط" : "تأثير محدود"}
                  </span>
                </div>
                <p className="text-[9px] text-primary/50 mt-2">اضغط للتفاصيل ←</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threat intelligence feed — clickable */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            آخر عروض البيع المرصودة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {darkWebListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-lg bg-secondary/20 border border-border hover:border-red-500/20 transition-colors cursor-pointer"
                onClick={() => { setSelectedListing(listing); setActiveModal("listingDetail"); }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{listing.titleAr || listing.title}</h3>
                    <p className="text-xs text-muted-foreground">{listing.title}</p>
                  </div>
                  <span className={`text-xs sm:text-[10px] px-2 py-1 rounded border ${severityColor(listing.severity)}`}>
                    {severityLabel(listing.severity)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {listing.sourceName || "مصدر غير معروف"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {listing.detectedAt ? new Date(listing.detectedAt).toLocaleDateString("ar-SA") : "—"}
                  </span>
                  {listing.price && (
                    <span className="text-red-400 font-medium flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {listing.price}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {(listing.recordCount ?? 0).toLocaleString()} (مكشوف)
                  </span>
                </div>
                <p className="text-[9px] text-primary/50 mt-2">اضغط للتفاصيل ←</p>
              </motion.div>
            ))}
            {darkWebListings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد عروض مكتشفة حالياً</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══ MODALS ═══ */}

      {/* Sources Modal */}
      <DetailModal open={activeModal === "sources"} onClose={() => setActiveModal(null)} title="جميع المصادر المراقبة" icon={<Globe className="w-5 h-5 text-violet-400" />}>
        <div className="space-y-3">
          {darkWebChannels.map(ch => (
            <div
              key={ch.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => { setSelectedSource(ch); setActiveModal("sourceDetail"); }}
            >
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{ch.name}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{ch.channelId} • {ch.leaksDetected ?? 0} حالة رصد</p>
              </div>
              <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${
                ch.riskLevel === "high" ? "text-red-400 bg-red-500/10 border-red-500/30" :
                ch.riskLevel === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
              }`}>
                {ch.riskLevel === "high" ? "عالية" : ch.riskLevel === "medium" ? "متوسطة" : "منخفضة"}
              </span>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Leaks Modal */}
      <DetailModal open={activeModal === "leaks"} onClose={() => setActiveModal(null)} title="حالات الرصد المكتشفة من الدارك ويب" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">إجمالي {darkWebChannels.reduce((a, c) => a + (c.leaksDetected ?? 0), 0)} حالة رصد عبر {darkWebChannels.length} مصدر</p>
          {darkWebChannels.filter(c => (c.leaksDetected ?? 0) > 0).map(ch => (
            <div key={ch.id} className="bg-secondary/30 rounded-xl p-3 border border-border/30">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-foreground">{ch.name}</span>
                <Badge variant="outline" className="text-xs sm:text-[10px] mr-auto">{ch.leaksDetected ?? 0} حالة رصد</Badge>
              </div>
              <p className="text-xs sm:text-[10px] text-muted-foreground">{ch.channelId}</p>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Listings Modal */}
      <DetailModal open={activeModal === "listings"} onClose={() => setActiveModal(null)} title="عروض البيع النشطة" icon={<DollarSign className="w-5 h-5 text-red-400" />}>
        <div className="space-y-3">
          {darkWebListings.map(listing => (
            <div
              key={listing.id}
              className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => { setSelectedListing(listing); setActiveModal("listingDetail"); }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${severityColor(listing.severity)}`}>{severityLabel(listing.severity)}</span>
                <span className="text-sm font-medium text-foreground truncate">{listing.titleAr || listing.title}</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-[10px] text-muted-foreground">
                <span>{listing.sourceName}</span>
                <span>{(listing.recordCount ?? 0).toLocaleString()} (مكشوف)</span>
                {listing.price && <span className="text-red-400">{listing.price}</span>}
              </div>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Records Modal */}
      <DetailModal open={activeModal === "records"} onClose={() => setActiveModal(null)} title="تفاصيل السجلات المكشوفة للسجلات" icon={<Database className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
              <p className="text-xl font-bold text-cyan-400">{darkWebListings.reduce((s, l) => s + (l.recordCount ?? 0), 0).toLocaleString()}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">إجمالي السجلات</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
              <p className="text-xl font-bold text-foreground">{darkWebListings.length > 0 ? Math.round(darkWebListings.reduce((s, l) => s + (l.recordCount ?? 0), 0) / darkWebListings.length).toLocaleString() : 0}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">متوسط لكل عرض</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
              <p className="text-xl font-bold text-red-400">{Math.max(...darkWebListings.map(l => l.recordCount ?? 0), 0).toLocaleString()}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">أكبر عرض</p>
            </div>
          </div>
          <h4 className="text-sm font-semibold text-foreground">العروض مرتبة حسب السجلات المكشوفة</h4>
          {[...darkWebListings].sort((a, b) => (b.recordCount ?? 0) - (a.recordCount ?? 0)).map(listing => (
            <div key={listing.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
              <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${severityColor(listing.severity)}`}>{severityLabel(listing.severity)}</span>
              <span className="text-sm text-foreground truncate flex-1">{listing.titleAr || listing.title}</span>
              <span className="text-xs font-bold text-foreground">{(listing.recordCount ?? 0).toLocaleString()} (مكشوف)</span>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Source Detail Modal */}
      <DetailModal
        open={activeModal === "sourceDetail" && !!selectedSource}
        onClose={() => { setActiveModal(null); setSelectedSource(null); }}
        title={selectedSource?.name ?? "تفاصيل المصدر"}
        icon={<Globe className="w-5 h-5 text-violet-400" />}
      >
        {selectedSource && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Globe className="w-7 h-7 text-violet-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{selectedSource.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedSource.channelId}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    selectedSource.status === "active" ? "bg-emerald-500" :
                    selectedSource.status === "flagged" ? "bg-red-500" : "bg-yellow-500"
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {selectedSource.status === "active" ? "نشط" : selectedSource.status === "flagged" ? "مُعلَّم" : "متوقف"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
                <p className="text-xl font-bold text-amber-400">{selectedSource.leaksDetected ?? 0}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">حالات رصد مكتشفة</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-sm font-bold text-foreground">
                  {selectedSource.lastActivity ? new Date(selectedSource.lastActivity).toLocaleDateString("ar-SA") : "—"}
                </p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">آخر نشاط</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-sm font-bold text-foreground">{(selectedSource.subscribers ?? 0).toLocaleString()}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">أعضاء</p>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">وصف المصدر</h4>
              <p className="text-sm text-foreground leading-relaxed">
                {selectedSource.description || "مصدر على الدارك ويب يتم مراقبته لنشاط مشبوه يتعلق ببيع أو مشاركة بيانات شخصية سعودية. يتم فحص المنشورات والعروض بشكل دوري."}
              </p>
            </div>
          </div>
        )}
      </DetailModal>

      {/* Listing Detail Modal */}
      <DetailModal
        open={activeModal === "listingDetail" && !!selectedListing}
        onClose={() => { setActiveModal(null); setSelectedListing(null); }}
        title={selectedListing?.titleAr || selectedListing?.title || "تفاصيل العرض"}
        icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
      >
        {selectedListing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">التأثير</p>
                <p className={`text-sm font-bold mt-1 ${severityColor(selectedListing.severity).split(" ")[0]}`}>{severityLabel(selectedListing.severity)}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">السجلات</p>
                <p className="text-sm font-bold text-foreground mt-1">{(selectedListing.recordCount ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">السعر</p>
                <p className="text-sm font-bold text-red-400 mt-1">{selectedListing.price || "غير محدد"}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">المصدر</p>
                <p className="text-sm font-bold text-foreground mt-1">{selectedListing.sourceName || "غير معروف"}</p>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">تفاصيل العرض</h4>
              <p className="text-sm text-foreground font-semibold mb-1">{selectedListing.title}</p>
              {selectedListing.titleAr && <p className="text-sm text-foreground mb-2">{selectedListing.titleAr}</p>}
              <p className="text-xs text-muted-foreground">
                تاريخ الاكتشاف: {selectedListing.detectedAt ? new Date(selectedListing.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "غير محدد"}
              </p>
            </div>
            {selectedListing.descriptionAr && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">الوصف</h4>
                <p className="text-sm text-foreground leading-relaxed">{selectedListing.descriptionAr}</p>
              </div>
            )}
            <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
              <h4 className="text-xs font-semibold text-red-400 mb-2">تحذير أمني</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                هذا العرض تم رصده على الدارك ويب ويحتوي على بيانات شخصية مُدّعاة. يجب التحقق من صحة البيانات وتوثيق حالة الرصد وتحليلها.
              </p>
            </div>
          </div>
        )}
      </DetailModal>

      {/* Leak Detail Drilldown */}
      <LeakDetailDrilldown
        leak={drillLeak}
        open={!!drillLeak}
        onClose={() => setDrillLeak(null)}
        showBackButton={true}
        onBack={() => setDrillLeak(null)}
      />
    </div>
  );
}

```

---

## `client/src/leaks/pages/Dashboard.tsx`

```tsx
// Leaks Domain
/**
 * Dashboard — لوحة مؤشرات رصد حالات البيانات
 * تصميم Ultra Premium مطابق لـ design.rasid.vip/dashboard
 * جميع البطاقات والمؤشرات قابلة للنقر مع تفاصيل كاملة
 */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Database, Radio, ScanSearch, TrendingUp, TrendingDown,
  Loader2, Bell, Activity, Shield, FileWarning, Target, X, Eye, Globe,
  FileText, ChevronLeft, ChevronRight, Building2, Layers, Users, Wifi,
  Zap, Server, HardDrive, RefreshCw, Settings, Fingerprint, CreditCard,
  Phone, Mail, MapPin, Hash, Calendar, BarChart3, Send, Lock, Briefcase,
  GraduationCap, Heart, Plane, ShoppingCart, Landmark, Factory, CircleDot,
  Sparkles, FileCheck, ArrowUpRight, Clock, AlertTriangle, Cpu,
  Maximize2, Minimize2, Play, Pause, SkipForward, Monitor, Presentation,
  Download, FileDown, ArrowDown, ArrowUp, Equal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import MonthlyComparison from "@/components/MonthlyComparison";
import { DetailModal } from "@/components/DetailModal";
import { useTheme } from "@/contexts/ThemeContext";
import TrendPredictions from "@/components/TrendPredictions";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ActivityFeed from "@/components/ActivityFeed";
import WorldHeatmap from "@/components/WorldHeatmap";
import ExportCenter from "@/components/ExportCenter";
import AtlasDrillModal, { AtlasSlidePanel } from "@/components/AtlasDrillModal";
import type { AtlasDrillData, DrillDataItem } from "@/components/AtlasDrillModal";


// Helper to safely parse JSON strings from DB
const parseJsonSafe = (v: any, fallback: any = []) => {
  if (!v) return fallback;
  if (typeof v === 'string') {
    try { const parsed = JSON.parse(v); return parsed || fallback; } catch { return fallback; }
  }
  return v;
};

/* ═══ PII Type Arabic Labels ═══ */
const piiTypeLabels: Record<string, string> = {
  "Phone": "رقم الهاتف", "Phone Number": "رقم الهاتف", "National ID": "رقم الهوية الوطنية",
  "Full Name": "الاسم الكامل", "Email": "البريد الإلكتروني", "Email Address": "البريد الإلكتروني",
  "Address": "العنوان", "IBAN": "رقم الآيبان", "Credit Card": "بطاقة ائتمان",
  "Passport Number": "رقم الجواز", "Date of Birth": "تاريخ الميلاد", "Iqama": "رقم الإقامة",
  "Blood Type": "فصيلة الدم", "Medical Diagnosis": "التشخيص الطبي", "Medical Records": "السجلات الطبية",
  "Medical Record": "السجل الطبي", "Medications": "الأدوية", "Insurance Number": "رقم التأمين",
  "Salary": "الراتب", "Salary History": "سجل الرواتب", "Password": "كلمة المرور",
  "Credential": "بيانات الدخول", "Biometric Data": "البيانات البيومترية", "GPS Coordinates": "إحداثيات GPS",
  "IP Address": "عنوان IP", "Bank Account": "الحساب البنكي", "Vehicle Plate": "لوحة المركبة",
  "Student ID": "رقم الطالب", "Employee ID": "رقم الموظف", "Work Permit": "تصريح العمل",
  "GPA": "المعدل التراكمي", "Order History": "سجل الطلبات", "Transaction History": "سجل المعاملات",
  "Payment Info": "معلومات الدفع", "Account Balance": "رصيد الحساب", "Wallet Balance": "رصيد المحفظة",
  "Travel Route": "مسار السفر", "Booking Reference": "مرجع الحجز", "Check-in Date": "تاريخ الوصول",
  "Education": "التعليم", "Major": "التخصص", "Skills": "المهارات", "Job Title": "المسمى الوظيفي",
  "Subscription Plan": "خطة الاشتراك", "Claim Amount": "مبلغ المطالبة", "Policy Number": "رقم الوثيقة",
  "Room Number": "رقم الغرفة", "Department": "القسم", "IMEI": "رقم IMEI",
  "Call Records": "سجل المكالمات", "Property Address": "عنوان العقار", "Contract Value": "قيمة العقد",
  "Membership ID": "رقم العضوية", "Security Clearance": "التصريح الأمني",
};
const getPiiLabel = (type: string) => piiTypeLabels[type] || type;

/* ═══ PII Icon Mapping ═══ */
const getPiiIcon = (type: string) => {
  if (type.includes("Phone") || type.includes("Call")) return Phone;
  if (type.includes("ID") || type.includes("National") || type.includes("Iqama") || type.includes("Passport")) return Fingerprint;
  if (type.includes("Email")) return Mail;
  if (type.includes("Credit") || type.includes("IBAN") || type.includes("Bank") || type.includes("Payment") || type.includes("Account") || type.includes("Wallet")) return CreditCard;
  if (type.includes("Address") || type.includes("GPS") || type.includes("Property")) return MapPin;
  if (type.includes("Medical") || type.includes("Blood") || type.includes("Medication") || type.includes("Insurance")) return Heart;
  if (type.includes("Password") || type.includes("Credential") || type.includes("Biometric") || type.includes("Security")) return Lock;
  if (type.includes("Salary") || type.includes("Employee") || type.includes("Job") || type.includes("Work") || type.includes("Department")) return Briefcase;
  if (type.includes("Student") || type.includes("GPA") || type.includes("Education") || type.includes("Major")) return GraduationCap;
  if (type.includes("Travel") || type.includes("Booking") || type.includes("Room") || type.includes("Check-in")) return Plane;
  if (type.includes("Order") || type.includes("Transaction") || type.includes("Subscription")) return ShoppingCart;
  return FileText;
};

/* ═══ Source Labels ═══ */
const sourceLabel = (s: string) => { switch (s) { case "telegram": return "تليجرام"; case "darkweb": return "دارك ويب"; default: return "موقع لصق"; } };
const sourceIcon = (s: string) => { switch (s) { case "telegram": return Send; case "darkweb": return Globe; default: return FileText; } };
const sourceColor = (s: string) => {
  switch (s) {
    case "telegram": return { text: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20", fill: "#0ea5e9", glow: "rgba(14, 165, 233, 0.15)" };
    case "darkweb": return { text: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", fill: "#8b5cf6", glow: "rgba(139, 92, 246, 0.15)" };
    default: return { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", fill: "#f59e0b", glow: "rgba(245, 158, 11, 0.15)" };
  }
};

/* ═══ Sector Icon Mapping ═══ */
const getSectorIcon = (sector: string) => {
  if (sector?.includes("حكوم")) return Building2;
  if (sector?.includes("صح") || sector?.includes("طب")) return Heart;
  if (sector?.includes("مصرف") || sector?.includes("بنوك") || sector?.includes("مالي")) return Landmark;
  if (sector?.includes("تعليم") || sector?.includes("جامع")) return GraduationCap;
  if (sector?.includes("اتصال") || sector?.includes("تقني")) return Wifi;
  if (sector?.includes("نقل") || sector?.includes("طيران")) return Plane;
  if (sector?.includes("تجار") || sector?.includes("تجزئ")) return ShoppingCart;
  if (sector?.includes("طاق") || sector?.includes("نفط")) return Factory;
  if (sector?.includes("توظيف") || sector?.includes("موارد")) return Briefcase;
  if (sector?.includes("تأمين")) return Shield;
  if (sector?.includes("عقار")) return Building2;
  if (sector?.includes("ضياف") || sector?.includes("سياح")) return Plane;
  if (sector?.includes("رياض") || sector?.includes("ترفيه")) return Activity;
  if (sector?.includes("بناء") || sector?.includes("مشاريع")) return Factory;
  if (sector?.includes("توصيل") || sector?.includes("طعام")) return ShoppingCart;
  return Layers;
};

/* ═══ Animated Counter ═══ */
function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = value;
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <>{(display ?? 0).toLocaleString("en-US")}</>;
}

/* ═══ Mini Sparkline ═══ */
function MiniSparkline({ data, color = "#3b82f6", height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const points = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * w,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${w} ${height} L 0 ${height} Z`;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
    </svg>
  );
}

/* ═══ Premium Radar Animation ═══ */
function RadarAnimation() {
  return (
    <div className="relative w-full aspect-square max-w-[260px] mx-auto">
      {[1, 2, 3].map((r) => (
        <motion.div
          key={r}
          className="absolute inset-0 m-auto rounded-full"
          style={{
            width: `${r * 33}%`, height: `${r * 33}%`,
            border: "1px solid",
            borderColor: "hsl(var(--primary) / 0.12)",
          }}
          animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: r * 0.3 }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-primary/10" /></div>
      <div className="absolute inset-0 flex items-center justify-center"><div className="w-px h-full bg-primary/10" /></div>
      <motion.div className="absolute inset-0 m-auto" style={{ width: "100%", height: "100%" }} animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
        <div className="absolute top-1/2 right-1/2 h-px origin-right" style={{ width: "50%", background: "linear-gradient(to left, transparent, hsl(var(--primary) / 0.6))" }} />
      </motion.div>
      {[
        { top: "25%", right: "30%", color: "#ef4444", delay: 0 },
        { top: "60%", right: "20%", color: "#f59e0b", delay: 0.5 },
        { top: "40%", right: "65%", color: "#10b981", delay: 1 },
        { top: "70%", right: "55%", color: "#3b82f6", delay: 1.5 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{ top: dot.top, right: dot.right, backgroundColor: dot.color, boxShadow: `0 0 12px ${dot.color}80` }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-3 h-3 rounded-full bg-primary"
          style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

/* ═══ Leak List in Modal ═══ */
function LeakListInModal({ leaks, emptyMessage = "لا توجد حالات رصد" }: { leaks: any[]; emptyMessage?: string }) {
  const [selectedLeak, setSelectedLeak] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 8;
  const totalPages = Math.ceil(leaks.length / perPage);
  const pageLeaks = leaks.slice(page * perPage, (page + 1) * perPage);
  if (leaks.length === 0) return <p className="text-center text-muted-foreground text-sm py-6">{emptyMessage}</p>;
  return (
    <>
      <p className="text-xs text-muted-foreground mb-2">{leaks.length} حالة رصد</p>
      <div className="space-y-2">
        {pageLeaks.map((l) => (
          <motion.div
            key={l.leakId || l.id}
            onClick={() => setSelectedLeak(l.leakId)}
            whileHover={{ x: -3, scale: 1.01 }}
            className="flex items-center gap-3 p-3 rounded-xl glass-card-premium shimmer-hover cursor-pointer bg-secondary/20 border border-border/30 hover:border-primary/20 transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center premium-icon-hover ${sourceColor(l.source).bg}`} style={{ boxShadow: `0 0 12px ${sourceColor(l.source).glow}` }}>
              {(() => { const Icon = sourceIcon(l.source); return <Icon className={`w-4 h-4 ${sourceColor(l.source).text}`} />; })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{l.titleAr || l.title}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">{l.sectorAr} · {(l.recordCount || 0).toLocaleString()} (مُدّعى)</p>
            </div>
            <Badge variant="outline" className="text-xs sm:text-[10px] shrink-0">{sourceLabel(l.source)}</Badge>
          </motion.div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-3">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        </div>
      )}
      {selectedLeak && <LeakDetailDrilldown leak={{ leakId: selectedLeak }} open={true} onClose={() => setSelectedLeak(null)} />}
    </>
  );
}

/* ═══ Premium Section Header ═══ */
function SectionHeader({ icon: Icon, title, subtitle, action, onAction }: { icon: React.ElementType; title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between flex-wrap mb-5">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center premium-icon-hover"
          whileHover={{ rotate: -5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs sm:text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <motion.button
          onClick={onAction}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          whileHover={{ x: -3 }}
        >
          {action}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
}

/* ═══ PRESENTATION MODE OVERLAY ═══ */
const RASID_LOGO_LIGHT = "/branding/logos/Rased_3_transparent.png";
const RASID_CHARACTER_PRES = "/branding/logos/Rased_3_transparent.png";

function PresentationOverlay({
  slides, currentSlide, autoRotate, onExit, onNext, onPrev, onToggleAutoRotate, onGoToSlide,
  isDark, kpiCards, statusCards, sourceCards, systemStats, sectorDistribution, piiDistribution, monthlyTrend, recentLeaks, stats,
  onExportPdf, isExporting,
}: {
  slides: { id: string; title: string; titleEn: string; icon: React.ElementType }[];
  currentSlide: number; autoRotate: boolean;
  onExit: () => void; onNext: () => void; onPrev: () => void;
  onToggleAutoRotate: () => void; onGoToSlide: (idx: number) => void;
  isDark: boolean;
  kpiCards: any[]; statusCards: any[]; sourceCards: any[]; systemStats: any[];
  sectorDistribution: any[]; piiDistribution: any[]; monthlyTrend: any[]; recentLeaks: any[]; stats: any;
  onExportPdf: () => void; isExporting: boolean;
}) {
  const slide = slides[currentSlide];
  const SlideIcon = slide.icon;

  const renderSlideContent = () => {
    switch (slide.id) {
      case "kpi":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 w-full max-w-7xl">
            {kpiCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  className="rounded-3xl p-3 sm:p-8 relative overflow-hidden"
                  style={{
                    background: "rgba(26, 37, 80, 0.8)",
                    backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)",
                    border: "1px solid rgba(61, 177, 172, 0.15)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 0 60px " + card.glowColor,
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-40 pointer-events-none`} />
                  <div className="relative">
                    <div className="flex items-center justify-between flex-wrap mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${card.trendUp ? "text-emerald-400" : "text-red-400"}`}>{card.trend}</span>
                        {card.trendUp ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                      </div>
                      <div className={`w-16 h-16 rounded-2xl ${card.iconBg} flex items-center justify-center`} style={{ boxShadow: `0 0 24px ${card.glowColor}` }}>
                        <Icon className={`w-8 h-8 ${card.iconColor}`} />
                      </div>
                    </div>
                    <div className="text-3xl sm:text-5xl font-black text-white mb-2 tabular-nums">
                      {card.displayValue || ((card.value as number) ?? 0).toLocaleString()}
                    </div>
                    <p className="text-base text-slate-300 font-medium">{card.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{card.labelEn}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );

      case "status":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 w-full max-w-[95vw] sm:max-w-6xl">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="rounded-3xl p-3 sm:p-8" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Activity className="w-6 h-6 text-cyan-400" /> \u062d\u0627\u0644\u0629 \u0627\u0644\u062d\u0648\u0627\u062f\u062b
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {statusCards.map((sc, i) => {
                  const SIcon = sc.icon;
                  return (
                    <motion.div key={sc.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }}
                      className={`p-6 rounded-2xl ${sc.bg}`} style={{ boxShadow: `0 0 20px ${sc.glow}` }}>
                      <SIcon className={`w-7 h-7 ${sc.color} mb-3`} />
                      <p className="text-3xl font-bold text-white">{(sc.value ?? 0).toLocaleString()}</p>
                      <p className="text-sm text-slate-400 mt-1">{sc.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl p-3 sm:p-8" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Radio className="w-6 h-6 text-cyan-400" /> \u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u0631\u0635\u062f
              </h3>
              <div className="space-y-4">
                {sourceCards.map((sc, i) => {
                  const SIcon = sc.icon;
                  const total = sourceCards.reduce((s: number, c: any) => s + c.value, 0) || 1;
                  const pct = Math.round((sc.value / total) * 100);
                  return (
                    <motion.div key={sc.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                      className={`p-5 rounded-2xl ${sc.bg} border ${sc.border}`}>
                      <div className="flex items-center justify-between flex-wrap mb-3">
                        <div className="flex items-center gap-3">
                          <SIcon className={`w-6 h-6 ${sc.color}`} />
                          <span className="text-base text-white font-medium">{sc.label}</span>
                        </div>
                        <span className="text-2xl font-bold text-white">{sc.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div className={`h-full rounded-full`} style={{ background: sc.color.includes("sky") ? "#0ea5e9" : sc.color.includes("violet") ? "#8b5cf6" : "#f59e0b" }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.1 }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        );

      case "sectors":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 w-full max-w-[95vw] sm:max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="rounded-3xl p-3 sm:p-8" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-cyan-400" /> \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062a \u0627\u0644\u0645\u062a\u0623\u062b\u0631\u0629
              </h3>
              <div className="space-y-3">
                {sectorDistribution.slice(0, 6).map((s: any, i: number) => {
                  const SIcon = getSectorIcon(s.sectorAr || s.sector);
                  const maxCount = Math.max(...sectorDistribution.map((x: any) => x.count), 1);
                  const pct = Math.round((s.count / maxCount) * 100);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <SIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-white">{s.sectorAr || s.sector}</span>
                          <span className="text-sm font-bold text-white">{s.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-cyan-600"
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl p-3 sm:p-8 flex items-center justify-center" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <RadarAnimation />
            </motion.div>
          </div>
        );

      case "pii":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 w-full max-w-[95vw] sm:max-w-6xl">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="rounded-3xl p-3 sm:p-8" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Fingerprint className="w-6 h-6 text-cyan-400" /> \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {piiDistribution.slice(0, 8).map((p: any, i: number) => {
                  const PIcon = getPiiIcon(p.piiType);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <PIcon className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{getPiiLabel(p.piiType)}</p>
                        <p className="text-xs text-slate-500">{p.count} \u0633\u062c\u0644</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl p-3 sm:p-8" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Bell className="w-6 h-6 text-cyan-400" /> \u0622\u062e\u0631 \u0627\u0644\u062d\u0648\u0627\u062f\u062b
              </h3>
              <div className="space-y-3">
                {recentLeaks.slice(0, 5).map((leak: any, i: number) => {
                  const sc = sourceColor(leak.source);
                  const SIcon = sourceIcon(leak.source);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                      <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center shrink-0`}>
                        <SIcon className={`w-5 h-5 ${sc.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{leak.titleAr}</p>
                        <p className="text-xs text-slate-500">{leak.sectorAr} \u00b7 {sourceLabel(leak.source)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        );

      case "trends":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 w-full max-w-[95vw] sm:max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="rounded-3xl p-3 sm:p-8" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-cyan-400" /> \u0627\u0644\u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0634\u0647\u0631\u064a
              </h3>
              <div className="space-y-3">
                {monthlyTrend.slice(-8).map((m: any, i: number) => {
                  const maxCount = Math.max(...monthlyTrend.map((t: any) => t.count), 1);
                  const pct = Math.round((m.count / maxCount) * 100);
                  return (
                    <motion.div key={m.yearMonth} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                      className="flex items-center gap-4">
                      <span className="text-sm text-slate-400 w-20 shrink-0 font-mono">{m.yearMonth}</span>
                      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-blue-500"
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }} />
                      </div>
                      <span className="text-base font-bold text-white w-12 text-left">{m.count}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl p-3 sm:p-8" style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Server className="w-6 h-6 text-cyan-400" /> \u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {systemStats.map((st, i) => {
                  const SIcon = st.icon;
                  return (
                    <motion.div key={st.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
                      className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <SIcon className="w-7 h-7 text-cyan-400 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-white">{(st.value ?? 0).toLocaleString()}</p>
                      <p className="text-sm text-slate-400 mt-1">{st.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)",
      }}
    >
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.06), transparent 60%), " +
            "radial-gradient(ellipse 60% 40% at 80% 20%, hsl(var(--primary) / 0.04), transparent 50%)",
        }}
      />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between flex-wrap px-3 sm:px-8 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-4">
          <img src={RASID_LOGO_LIGHT} alt="\u0631\u0627\u0635\u062f" className="h-8 object-contain" style={{ filter: "drop-shadow(0 2px 8px hsl(var(--primary) / 0.15))" }} />
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-lg font-bold text-white">\u0648\u0636\u0639 \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062a\u0642\u062f\u064a\u0645\u064a</h1>
            <p className="text-xs text-slate-400">Presentation Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-rotate toggle */}
          <button onClick={onToggleAutoRotate}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoRotate ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-slate-400 border border-white/10"
            }`}>
            {autoRotate ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {autoRotate ? "\u062a\u062f\u0648\u064a\u0631 \u062a\u0644\u0642\u0627\u0626\u064a" : "\u0645\u062a\u0648\u0642\u0641"}
          </button>
          {/* PDF Export button */}
          <button onClick={onExportPdf} disabled={isExporting}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isExporting ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse" : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}>
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isExporting ? "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0635\u062f\u064a\u0631..." : "\u062a\u0635\u062f\u064a\u0631 PDF"}
          </button>
          {/* Slide counter */}
          <span className="text-xs text-slate-500 font-mono">{currentSlide + 1} / {slides.length}</span>
          {/* Exit button */}
          <button onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-all">
            <Minimize2 className="w-3.5 h-3.5" />
            \u062e\u0631\u0648\u062c
          </button>
        </div>
      </div>

      {/* Slide Title */}
      <div className="relative z-10 text-center py-6">
        <motion.div key={currentSlide} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20"
            style={{ boxShadow: "0 0 20px rgba(61, 177, 172, 0.15)" }}>
            <SlideIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
            <p className="text-sm text-slate-400">{slide.titleEn}</p>
          </div>
        </motion.div>
      </div>

      {/* Slide Content */}
      <div className="presentation-slide-content flex-1 flex items-center justify-center px-3 sm:px-8 pb-4 relative z-10 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }} className="w-full flex justify-center">
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 flex items-center justify-between flex-wrap px-3 sm:px-8 py-4" style={{ borderTop: "1px solid rgba(61, 177, 172, 0.1)" }}>
        {/* Prev button */}
        <button onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all border border-white/10">
          <ChevronRight className="w-4 h-4" />
          \u0627\u0644\u0633\u0627\u0628\u0642
        </button>

        {/* Slide dots */}
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button key={s.id} onClick={() => onGoToSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? "w-8 h-2.5 bg-gradient-to-r from-cyan-400 to-teal-400"
                  : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
              }`}
              style={idx === currentSlide ? { boxShadow: "0 0 12px rgba(61, 177, 172, 0.4)" } : {}}
            />
          ))}
        </div>

        {/* Next button */}
        <button onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 text-cyan-400 text-sm font-medium hover:bg-cyan-500/25 transition-all border border-cyan-500/20">
          \u0627\u0644\u062a\u0627\u0644\u064a
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      {autoRotate && (
        <div className="absolute bottom-0 left-0 right-0 h-1 z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-teal-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "linear" }}
            key={`progress-${currentSlide}`}
            style={{ boxShadow: "0 0 8px rgba(61, 177, 172, 0.4)" }}
          />
        </div>
      )}

      {/* Keyboard hints */}
      <div className="absolute bottom-6 left-8 z-10 flex items-center gap-3 text-xs sm:text-[10px] text-slate-600">
        <span>\u2190\u2192 \u0627\u0644\u062a\u0646\u0642\u0644</span>
        <span>\u00b7</span>
        <span>P \u062a\u062f\u0648\u064a\u0631</span>
        <span>\u00b7</span>
        <span>ESC \u062e\u0631\u0648\u062c</span>
      </div>

      {/* Rasid character watermark */}
      <img src={RASID_CHARACTER_PRES} alt="" className="absolute bottom-4 right-8 w-16 h-16 object-contain opacity-20 pointer-events-none z-10" />
    </motion.div>
  );
}

/* ═══ Premium Card Wrapper ═══ */
function PremiumCard({ children, className = "", onClick, delay = 0, glow, ariaLabel }: { children: React.ReactNode; className?: string; onClick?: () => void; delay?: number; glow?: string; ariaLabel?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={onClick ? { y: -4, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } } : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      className={`
        relative rounded-2xl border overflow-hidden
        bg-card border-border
        shadow-sm dark:shadow-none
        dark:backdrop-blur-xl
        transition-all duration-400 hover-shine card-3d-lift
        ${onClick ? "cursor-pointer hover:shadow-lg hover:border-primary/30" : ""}
        ${className}
      `}
      style={glow ? { boxShadow: `0 0 0 1px ${glow}` } : undefined}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none shimmer-hover" />
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { data: rawStats, isLoading, refetch } = trpc.dashboard.stats.useQuery();

  // ═══ حماية شاملة — يمنع كل أخطاء undefined ═══
  const stats = rawStats ?? {
    totalLeaks: 0,
    totalRecords: 0,
    newLeaks: 0,
    analyzingLeaks: 0,
    documentedLeaks: 0,
    completedLeaks: 0,
    telegramLeaks: 0,
    darkwebLeaks: 0,
    pasteLeaks: 0,
    enrichedLeaks: 0,
    activeMonitors: 0,
    totalChannels: 0,
    piiDetected: 0,
    distinctSectors: 0,
    distinctPiiTypes: 0,
    sectorDistribution: [] as any[],
    sourceDistribution: [] as any[],
    monthlyTrend: [] as any[],
    piiDistribution: [] as any[],
    recentLeaks: [] as any[],
  };
  const { data: leaks = [] } = trpc.leaks.list.useQuery();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedLeak, setSelectedLeak] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportCenter, setShowExportCenter] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ═══ ATLAS DRILL-DOWN STATE ═══
  const [atlasDrill, setAtlasDrill] = useState<AtlasDrillData | null>(null);
  const [slidePanelData, setSlidePanelData] = useState<{ type: string; data: any } | null>(null);

  // ═══ PRESENTATION MODE STATE ═══
  const [presentationMode, setPresentationMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const presentationRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SLIDE_INTERVAL = 8000; // 8 seconds per slide
  const presentationSlides = [
    { id: "kpi", title: "مؤشرات الأداء الرئيسية", titleEn: "Key Performance Indicators", icon: BarChart3 },
    { id: "status", title: "حالة الرصد ومصادر الرصد", titleEn: "Incident Status & Sources", icon: Activity },
    { id: "sectors", title: "القطاعات والرادار", titleEn: "Sectors & Radar", icon: Building2 },
    { id: "pii", title: "أنواع البيانات وحالات الرصد الأخيرة", titleEn: "PII Types & Recent Incidents", icon: Fingerprint },
    { id: "trends", title: "الاتجاهات والنشاط", titleEn: "Trends & Activity", icon: TrendingUp },
  ];

  const enterPresentationMode = useCallback(() => {
    setPresentationMode(true);
    setCurrentSlide(0);
    setAutoRotate(true);
    // Request fullscreen
    if (presentationRef.current?.requestFullscreen) {
      presentationRef.current.requestFullscreen().catch(() => {});
    } else if ((presentationRef.current as any)?.webkitRequestFullscreen) {
      (presentationRef.current as any).webkitRequestFullscreen();
    }
  }, []);

  const exitPresentationMode = useCallback(() => {
    setPresentationMode(false);
    setAutoRotate(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % presentationSlides.length);
  }, [presentationSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + presentationSlides.length) % presentationSlides.length);
  }, [presentationSlides.length]);

  // ═══ PDF EXPORT STATE ═══
  const [isExporting, setIsExporting] = useState(false);

  const exportPresentationPdf = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    // Pause auto-rotate during export
    const wasAutoRotating = autoRotate;
    setAutoRotate(false);
    const savedSlide = currentSlide;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Create PDF in landscape A4
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add cover page
      pdf.setFillColor(13, 21, 41); // hsl(var(--background))
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.text("\u062a\u0642\u0631\u064a\u0631 \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062a", pageWidth / 2, pageHeight / 2 - 15, { align: "center" });
      pdf.setFontSize(14);
      pdf.setTextColor(148, 163, 184);
      pdf.text("Dashboard Presentation Report", pageWidth / 2, pageHeight / 2 + 5, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }), pageWidth / 2, pageHeight / 2 + 18, { align: "center" });
      pdf.setTextColor(61, 177, 172);
      pdf.text("\u0631\u0627\u0635\u062f - NDMO Leak Monitor", pageWidth / 2, pageHeight - 15, { align: "center" });

      // Capture each slide
      const slideContentEl = document.querySelector(".presentation-slide-content") as HTMLElement;
      if (!slideContentEl) {
        throw new Error("Slide content element not found");
      }

      for (let i = 0; i < presentationSlides.length; i++) {
        setCurrentSlide(i);
        // Wait for animations to complete
        await new Promise(resolve => setTimeout(resolve, 1200));

        const canvas = await html2canvas(slideContentEl, {
          backgroundColor: "hsl(var(--background))",
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        pdf.addPage();

        // Add dark background
        pdf.setFillColor(13, 21, 41);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        // Add slide title header
        pdf.setFillColor(18, 28, 55);
        pdf.rect(0, 0, pageWidth, 18, "F");
        pdf.setTextColor(61, 177, 172);
        pdf.setFontSize(12);
        pdf.text(`${i + 1} / ${presentationSlides.length}`, 10, 11);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.text(presentationSlides[i].titleEn, pageWidth / 2, 11, { align: "center" });

        // Add slide screenshot
        const imgData = canvas.toDataURL("image/png");
        const imgRatio = canvas.width / canvas.height;
        const contentHeight = pageHeight - 28;
        const contentWidth = Math.min(pageWidth - 20, contentHeight * imgRatio);
        const imgWidth = Math.min(contentWidth, pageWidth - 20);
        const imgHeight = imgWidth / imgRatio;
        const xOffset = (pageWidth - imgWidth) / 2;
        const yOffset = 20 + (contentHeight - imgHeight) / 2;
        pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);

        // Footer
        pdf.setDrawColor(61, 177, 172);
        pdf.setLineWidth(0.3);
        pdf.line(10, pageHeight - 8, pageWidth - 10, pageHeight - 8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.text("NDMO Leak Monitor - Confidential", pageWidth / 2, pageHeight - 4, { align: "center" });
      }

      // Save PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`rasid-dashboard-report-${timestamp}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setCurrentSlide(savedSlide);
      if (wasAutoRotating) setAutoRotate(true);
      setIsExporting(false);
    }
  }, [isExporting, autoRotate, currentSlide, presentationSlides]);

  // Auto-rotate slides
  useEffect(() => {
    if (presentationMode && autoRotate) {
      autoRotateRef.current = setInterval(nextSlide, SLIDE_INTERVAL);
    }
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [presentationMode, autoRotate, nextSlide]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!presentationMode) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitPresentationMode();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevSlide();
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") nextSlide();
      if (e.key === "p" || e.key === "P") setAutoRotate(prev => !prev);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [presentationMode, exitPresentationMode, nextSlide, prevSlide]);

  // Listen for fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && presentationMode) {
        setPresentationMode(false);
        setAutoRotate(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [presentationMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 800);
  };

  /* ─── Derived data ─── */
  const piiDistribution = useMemo(() => stats?.piiDistribution ?? [], [stats]);
  const sectorDistribution = useMemo(() => stats?.sectorDistribution ?? [], [stats]);
  const sourceDistribution = useMemo(() => stats?.sourceDistribution ?? [], [stats]);
  const monthlyTrend = useMemo(() => stats?.monthlyTrend ?? [], [stats]);
  const recentLeaks = useMemo(() => stats?.recentLeaks ?? [], [stats]);
  const monthlyChartData = useMemo(() => monthlyTrend.map(m => m.count), [monthlyTrend]);

  /* ─── KPI Cards Config ─── */
  const kpiCards = [
    {
      key: "exposedRecords", label: "السجلات المكشوفة (العينات المتاحة)", labelEn: "Exposed Records (Available Samples)",
      value: stats?.totalAvailableSamples ?? 0,
      displayValue: stats?.totalAvailableSamples ? stats.totalAvailableSamples >= 1000 ? `${(stats.totalAvailableSamples / 1000).toFixed(1)}K` : String(stats.totalAvailableSamples) : "0",
      icon: Eye,
      gradient: "from-red-500/20 to-red-600/5", iconColor: "text-red-400",
      iconBg: "bg-red-500/15 dark:bg-red-500/20", glowColor: "rgba(239, 68, 68, 0.25)",
      sparkColor: "#ef4444", trend: "+15.7%", trendUp: true, trendLabel: "من الشهر السابق",
    },
    {
      key: "totalLeaks", label: "إجمالي حالات الرصد", labelEn: "Total Incidents",
      value: stats?.totalLeaks ?? 0, icon: ShieldAlert,
      gradient: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400",
      iconBg: "bg-blue-500/15 dark:bg-blue-500/20", glowColor: "rgba(59, 130, 246, 0.2)",
      sparkColor: "#3b82f6", trend: stats?.newLeaks ? `+${stats.newLeaks}` : "0",
      trendUp: (stats?.newLeaks ?? 0) > 0, trendLabel: "جديدة",
    },
    {
      key: "totalRecords", label: "إجمالي السجلات المكشوفة", labelEn: "Exposed Records",
      value: stats?.totalRecords ?? 0,
      displayValue: stats?.totalRecords ? stats.totalRecords >= 1000000 ? `${(stats.totalRecords / 1000000).toFixed(1)}M` : stats.totalRecords.toLocaleString() : "0",
      icon: Database,
      gradient: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20", glowColor: "rgba(16, 185, 129, 0.2)",
      sparkColor: "#10b981", trend: "+8.1%", trendUp: true, trendLabel: "من الشهر السابق",
    },
    {
      key: "piiTypes", label: "أنواع البيانات الشخصية", labelEn: "PII Types Detected",
      value: stats?.distinctPiiTypes ?? 0, icon: Fingerprint,
      gradient: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15 dark:bg-amber-500/20", glowColor: "rgba(245, 158, 11, 0.2)",
      sparkColor: "#f59e0b", trend: `${piiDistribution.length}`, trendUp: true, trendLabel: "نوع مكتشف",
    },
  ];

  /* ─── Status Cards Config ─── */
  const statusCards = [
    { label: "حالات رصد جديدة", value: stats?.newLeaks ?? 0, icon: Bell, color: "text-red-400", bg: "bg-red-500/8 dark:bg-red-500/10", glow: "rgba(239, 68, 68, 0.1)" },
    { label: "قيد التحليل", value: stats?.analyzingLeaks ?? 0, icon: Activity, color: "text-amber-400", bg: "bg-amber-500/8 dark:bg-amber-500/10", glow: "rgba(245, 158, 11, 0.1)" },
    { label: "تم التوثيق", value: stats?.documentedLeaks ?? 0, icon: FileCheck, color: "text-blue-400", bg: "bg-blue-500/8 dark:bg-blue-500/10", glow: "rgba(59, 130, 246, 0.1)" },
    { label: "مكتملة", value: stats?.completedLeaks ?? 0, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", glow: "rgba(16, 185, 129, 0.1)" },
  ];

  /* ─── Source Cards Config ─── */
  const sourceCards = [
    { key: "telegram", label: "تليجرام", labelEn: "Telegram", value: stats?.telegramLeaks ?? 0, icon: Send, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", glow: "rgba(14, 165, 233, 0.12)" },
    { key: "darkweb", label: "دارك ويب", labelEn: "Dark Web", value: stats?.darkwebLeaks ?? 0, icon: Globe, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "rgba(139, 92, 246, 0.12)" },
    { key: "paste", label: "مواقع اللصق", labelEn: "Paste Sites", value: stats?.pasteLeaks ?? 0, icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "rgba(245, 158, 11, 0.12)" },
  ];

  /* ─── System Stats ─── */
  const systemStats = [
    { label: "قنوات الرصد", value: stats?.totalChannels ?? 0, icon: Server, color: "bg-slate-600/80" },
    { label: "قنوات نشطة", value: stats?.activeMonitors ?? 0, icon: Wifi, color: "bg-emerald-600/80" },
    { label: "حالات مُثرَاة بالذكاء", value: stats?.enrichedLeaks ?? 0, icon: Zap, color: "bg-amber-600/80" },
    { label: "بيانات PII مكتشفة", value: stats?.piiDetected ?? 0, icon: ScanSearch, color: "bg-cyan-600/80" },
  ];

  /* ─── Atlas Drill-Down Handlers ─── */
  const openKpiDrill = useCallback((key: string) => {
    const sourceColors: Record<string, string> = { telegram: "#0ea5e9", darkweb: "#8b5cf6", paste: "#f59e0b" };
    const sourceLabels: Record<string, string> = { telegram: "تليجرام", darkweb: "دارك ويب", paste: "مواقع اللصق" };
    const statusColors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

    switch (key) {
      case "totalLeaks":
        setAtlasDrill({
          title: "إجمالي حالات الرصد حسب المصدر",
          subtitle: "Source Distribution",
          icon: <ShieldAlert className="w-5 h-5 text-blue-400" />,
          type: "pie",
          total: stats?.totalLeaks ?? 0,
          data: sourceCards.map(sc => ({
            name: sc.label,
            value: sc.value,
            fill: sourceColors[sc.key] || "#8b5cf6",
            subtitle: sc.labelEn,
            onClick: () => {
              setAtlasDrill(null);
              setTimeout(() => openSourceDrill(sc.key), 150);
            },
          })),
        });
        break;
      case "exposedRecords":
        setAtlasDrill({
          title: "السجلات المكشوفة (العينات المتاحة) حسب المصدر",
          subtitle: "Exposed Records by Source",
          icon: <Eye className="w-5 h-5 text-red-400" />,
          type: "bar",
          total: stats?.totalAvailableSamples ?? 0,
          data: sourceCards.map(sc => {
            const srcLeaks = leaks.filter((l: any) => l.source === sc.key);
            const srcSamples = srcLeaks.reduce((s: number, l: any) => s + (l.totalSampleRecords || 0), 0);
            return {
              name: sc.label,
              value: srcSamples,
              fill: sourceColors[sc.key] || "#ef4444",
              onClick: () => {
                setAtlasDrill(null);
                setTimeout(() => openSourceDrill(sc.key), 150);
              },
            };
          }),
        });
        break;
      case "totalRecords":
        setAtlasDrill({
          title: "إجمالي السجلات المكشوفة حسب المصدر",
          subtitle: "Records by Source",
          icon: <Database className="w-5 h-5 text-emerald-400" />,
          type: "bar",
          total: stats?.totalRecords ?? 0,
          data: sourceCards.map(sc => {
            const srcLeaks = leaks.filter((l: any) => l.source === sc.key);
            const srcRecords = srcLeaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0);
            return {
              name: sc.label,
              value: srcRecords,
              fill: sourceColors[sc.key] || "#8b5cf6",
              onClick: () => {
                setAtlasDrill(null);
                setTimeout(() => openSourceDrill(sc.key), 150);
              },
            };
          }),
        });
        break;
      case "piiTypes":
        setAtlasDrill({
          title: "أكثر البيانات الشخصية تعرضاً",
          subtitle: "PII Types Distribution",
          icon: <Fingerprint className="w-5 h-5 text-amber-400" />,
          type: "bar",
          total: piiDistribution.reduce((s: number, p: any) => s + p.count, 0),
          data: piiDistribution.slice(0, 12).map((pii: any, i: number) => {
            const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7", "#f43f5e", "#84cc16"];
            return {
              name: getPiiLabel(pii.type),
              value: pii.count,
              fill: colors[i % colors.length],
              onClick: () => {
                setAtlasDrill(null);
                setTimeout(() => openPiiDrill(pii.type), 150);
              },
            };
          }),
        });
        break;
      case "sectors":
        setAtlasDrill({
          title: "القطاعات المتأثرة",
          subtitle: "Affected Sectors",
          icon: <Building2 className="w-5 h-5 text-violet-400" />,
          type: "bar",
          total: stats?.totalLeaks ?? 0,
          data: sectorDistribution.slice(0, 12).map((sec: any, i: number) => {
            const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7", "#f43f5e", "#84cc16"];
            return {
              name: sec.sector || "غير محدد",
              value: sec.count,
              fill: colors[i % colors.length],
              subtitle: `${(sec.records ?? 0).toLocaleString()} سجل مكشوف`,
              onClick: () => {
                setAtlasDrill(null);
                setTimeout(() => openSectorDrill(sec.sector), 150);
              },
            };
          }),
        });
        break;
    }
  }, [stats, leaks, sourceCards, piiDistribution, sectorDistribution]);

  const openSourceDrill = useCallback((sourceKey: string) => {
    const srcLeaks = leaks.filter((l: any) => l.source === sourceKey);
    const label = sourceKey === "telegram" ? "تليجرام" : sourceKey === "darkweb" ? "دارك ويب" : "مواقع اللصق";
    setSlidePanelData({
      type: "source",
      data: { sourceKey, label, leaks: srcLeaks, totalRecords: srcLeaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0) },
    });
  }, [leaks]);

  const openSectorDrill = useCallback((sector: string) => {
    const sectorLeaks = leaks.filter((l: any) => l.sectorAr === sector);
    const sec = sectorDistribution.find((s: any) => s.sector === sector);
    setSlidePanelData({
      type: "sector",
      data: { sector, leaks: sectorLeaks, count: sec?.count || sectorLeaks.length, records: sec?.records || 0 },
    });
  }, [leaks, sectorDistribution]);

  const openPiiDrill = useCallback((piiType: string) => {
    const piiLeaks = leaks.filter((l: any) => parseJsonSafe(l.piiTypes, [])?.includes(piiType));
    const pii = piiDistribution.find((p: any) => p.type === piiType);
    setSlidePanelData({
      type: "pii",
      data: { piiType, label: getPiiLabel(piiType), leaks: piiLeaks, count: pii?.count || piiLeaks.length },
    });
  }, [leaks, piiDistribution]);

  const openStatusDrill = useCallback((statusKey: string, statusLabel: string, statusLeaks: any[]) => {
    setSlidePanelData({
      type: "status",
      data: { statusKey, label: statusLabel, leaks: statusLeaks },
    });
  }, []);

  const openMonthDrill = useCallback((yearMonth: string) => {
    const monthLeaks = leaks.filter((l: any) => {
      if (!l.detectedAt) return false;
      const d = new Date(l.detectedAt);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return ym === yearMonth;
    });
    setSlidePanelData({
      type: "month",
      data: { yearMonth, leaks: monthLeaks },
    });
  }, [leaks]);

  /* ═══ LOADING STATE ═══ */
  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
              <div className="flex items-center justify-between flex-wrap mb-4">
                <div className="w-20 h-4 bg-muted/50 rounded-lg" />
                <div className="w-11 h-11 bg-muted/30 rounded-xl" />
              </div>
              <div className="w-28 h-9 bg-muted/40 rounded-lg mb-3" />
              <div className="w-full h-10 bg-muted/20 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center h-40 gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <span className="text-sm text-muted-foreground">جاري تحميل المؤشرات...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={presentationRef} className="space-y-6 p-1 relative light-particles page-transition-enter overflow-x-hidden max-w-full min-w-0" role="main" aria-label="لوحة التحكم الرئيسية">

      {/* ═══ PRESENTATION MODE OVERLAY ═══ */}
      <AnimatePresence>
        {presentationMode && (
          <PresentationOverlay
            slides={presentationSlides}
            currentSlide={currentSlide}
            autoRotate={autoRotate}
            onExit={exitPresentationMode}
            onNext={nextSlide}
            onPrev={prevSlide}
            onToggleAutoRotate={() => setAutoRotate(prev => !prev)}
            onGoToSlide={setCurrentSlide}
            isDark={isDark}
            kpiCards={kpiCards}
            statusCards={statusCards}
            sourceCards={sourceCards}
            systemStats={systemStats}
            sectorDistribution={sectorDistribution}
            piiDistribution={piiDistribution}
            monthlyTrend={monthlyTrend}
            recentLeaks={recentLeaks}
            stats={stats}
            onExportPdf={exportPresentationPdf}
            isExporting={isExporting}
          />
        )}
      </AnimatePresence>

      {/* ═══ ACTION BAR ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-end gap-2 flex-wrap"
      >
        <motion.button
          onClick={() => setShowExportCenter(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all bg-primary/5 border-primary/15 hover:bg-primary/10 text-foreground"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="مركز التصدير - تصدير التقارير بصيغ متعددة"
          aria-label="مركز التصدير"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">تصدير</span>
        </motion.button>
        <motion.button
          onClick={enterPresentationMode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-primary text-xs font-semibold border transition-all bg-primary/10 border-primary/20 hover:bg-primary/15"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="وضع العرض التقديمي - مثالي للشاشات الكبيرة والاجتماعات"
          aria-label="وضع العرض التقديمي"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">عرض تقديمي</span>
        </motion.button>
        <motion.button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/15"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label="تحديث البيانات"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          تحديث
        </motion.button>
      </motion.div>

      {/* ═══ KPI CARDS ROW ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <PremiumCard key={card.key} onClick={() => openKpiDrill(card.key)} delay={idx * 0.08} className="group" ariaLabel={`${card.label} - ${card.displayValue || card.value}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 pointer-events-none`} />
              <div className="relative p-5">
                {/* Top: trend + icon */}
                <div className="flex items-center justify-between flex-wrap mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm sm:text-xs font-bold ${card.trendUp ? "text-emerald-400" : "text-red-400"}`}>{card.trend}</span>
                    {card.trendUp ? <TrendingUp className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <TrendingDown className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-400" />}
                    <span className="text-xs sm:text-[9px] text-muted-foreground">{card.trendLabel}</span>
                  </div>
                  <motion.div
                    className={`w-14 h-14 sm:w-11 sm:h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
                    style={{ boxShadow: `0 0 16px ${card.glowColor}` }}
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className={`w-7 h-7 sm:w-5 sm:h-5 ${card.iconColor}`} />
                  </motion.div>
                </div>

                {/* Value */}
                <div className="text-4xl sm:text-3xl font-bold text-foreground mb-1 tabular-nums premium-stat-enter" aria-live="polite">
                  {card.displayValue ? card.displayValue : <AnimatedNumber value={card.value as number} />}
                </div>
                {/* Label */}
                <p className="text-base sm:text-xs text-muted-foreground mb-0.5">{card.label}</p>
                <p className="text-sm sm:text-[9px] text-muted-foreground/60">{card.labelEn}</p>

                {/* Sparkline */}
                <div className="mt-3">
                  <MiniSparkline data={monthlyChartData.length > 0 ? monthlyChartData : [3, 5, 4, 7, 6, 8]} color={card.sparkColor} />
                </div>

                {/* Click hint */}
                <p className="text-[9px] text-primary/40 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Eye className="w-3 h-3" /> اضغط لعرض التفاصيل
                </p>
              </div>
            </PremiumCard>
          );
        })}
      </div>

      {/* ═══ SECOND ROW: Status + Source Distribution ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Cards */}
        <PremiumCard delay={0.35} ariaLabel="حالة الرصد - Incident Status">
          <div className="p-5">
            <SectionHeader icon={Activity} title="حالة الرصد" subtitle="Incident Status" />
            <div className="grid grid-cols-2 gap-3">
              {statusCards.map((sc, scIdx) => {
                const SIcon = sc.icon;
                const statusKey = ["new", "analyzing", "documented", "completed"][scIdx];
                const statusLeaks = leaks.filter((l: any) => l.status === statusKey);
                return (
                  <motion.div
                    key={sc.label}
                    onClick={() => openStatusDrill(statusKey, sc.label, statusLeaks)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${sc.label} - ${sc.value} حالة`}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStatusDrill(statusKey, sc.label, statusLeaks); } }}
                    className={`p-4 rounded-xl ${sc.bg} border border-transparent hover:border-border/40 transition-all cursor-pointer group`}
                    style={{ boxShadow: `0 0 12px ${sc.glow}` }}
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div whileHover={{ rotate: -10 }}>
                        <SIcon className={`w-4.5 h-4.5 ${sc.color}`} />
                      </motion.div>
                      <span className="text-xs sm:text-[11px] text-muted-foreground font-medium">{sc.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground"><AnimatedNumber value={sc.value} /></p>
                    <p className="text-[9px] text-primary/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Eye className="w-3 h-3" /> اضغط للتفاصيل
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PremiumCard>

        {/* Source Distribution */}
        <PremiumCard delay={0.4} className="group" ariaLabel="مصادر الرصد - Monitoring Sources">
          <div className="p-5">
            <SectionHeader icon={Radio} title="مصادر الرصد" subtitle="Monitoring Sources" />
            <div className="space-y-3">
              {sourceCards.map((sc) => {
                const SIcon = sc.icon;
                const total = stats?.totalLeaks || 1;
                const pct = Math.round((sc.value / total) * 100);
                return (
                  <motion.div
                    key={sc.key}
                    onClick={() => openSourceDrill(sc.key)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl ${sc.bg} border ${sc.border} transition-all cursor-pointer`}
                    style={{ boxShadow: `0 0 12px ${sc.glow}` }}
                    whileHover={{ x: -3, scale: 1.01 }}
                  >
                    <motion.div
                      className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}
                      whileHover={{ rotate: -8 }}
                    >
                      <SIcon className={`w-5 h-5 ${sc.color}`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap mb-1">
                        <div>
                          <span className="text-sm font-semibold text-foreground">{sc.label}</span>
                          <span className="text-[9px] text-muted-foreground/60 mr-2">{sc.labelEn}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground">{sc.value === 0 ? <span className="text-muted-foreground/60">لا يوجد</span> : sc.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: sourceColor(sc.key).fill }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">{pct}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* ═══ THIRD ROW: Sectors + Radar ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sector Distribution */}
        <PremiumCard delay={0.5} className="lg:col-span-2" ariaLabel="القطاعات المتأثرة - Affected Sectors">
          <div className="p-5">
            <SectionHeader icon={Building2} title="القطاعات المتأثرة" subtitle="Affected Sectors" action="عرض الكل" onAction={() => openKpiDrill("sectors")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sectorDistribution.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <Building2 className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">لا توجد قطاعات متأثرة حتى الآن</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">ستظهر هنا عند تصنيف الحالات حسب القطاع</p>
                </div>
              )}
              {sectorDistribution.slice(0, 6).map((sec) => {
                const SIcon = getSectorIcon(sec.sector || "");
                const total = stats?.totalLeaks || 1;
                const pct = Math.round((sec.count / total) * 100);
                return (
                  <motion.div
                    key={sec.sector}
                    onClick={() => openSectorDrill(sec.sector)}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border cursor-pointer hover:border-primary/20 transition-all group/sec"
                    whileHover={{ x: -3, scale: 1.01 }}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                      whileHover={{ rotate: -8 }}
                    >
                      <SIcon className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap">
                        <span className="text-xs font-semibold text-foreground truncate">{sec.sector}</span>
                        <span className="text-xs font-bold text-primary">{pct}%</span>
                      </div>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{sec.count} حالة رصد · {(sec.records ?? 0).toLocaleString()} (مُدّعى)</p>
                      <div className="w-full h-1 bg-muted/40 rounded-full mt-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary/70"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PremiumCard>

        {/* Radar */}
        <PremiumCard delay={0.6} onClick={() => setActiveModal("radar")} className="group cursor-pointer" ariaLabel="رادار الرصد - Live Radar">
          <div className="p-5">
            <SectionHeader icon={Target} title="رادار الرصد" subtitle="Live Radar" action="التفاصيل" onAction={() => setActiveModal("radar")} />
            <RadarAnimation />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {systemStats.map((ss) => {
                const SSIcon = ss.icon;
                return (
                  <motion.div
                    key={ss.label}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/20 dark:bg-muted/40"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className={`w-8 h-8 rounded-lg ${ss.color} flex items-center justify-center`}>
                      <SSIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{(ss.value ?? 0).toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">{ss.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* ═══ FOURTH ROW: PII Types + Recent Leaks ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PII Types Distribution */}
        <PremiumCard delay={0.7} className="group" ariaLabel="تصنيف البيانات الشخصية المكتشفة - PII Classification">
          <div className="p-5">
            <SectionHeader icon={Fingerprint} title="تصنيف البيانات الشخصية المكتشفة" subtitle="PII Classification" action="التفاصيل" onAction={() => openKpiDrill("piiTypes")} />
            <div className="space-y-2.5">
              {piiDistribution.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <Fingerprint className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">لم يتم اكتشاف بيانات شخصية بعد</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">ستظهر هنا عند اكتشاف أنواع PII</p>
                </div>
              )}
              {piiDistribution.slice(0, 8).map((pii, i) => {
                const PIcon = getPiiIcon(pii.type);
                const maxCount = piiDistribution[0]?.count || 1;
                const pct = Math.round((pii.count / maxCount) * 100);
                const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
                return (
                  <motion.div
                    key={pii.type}
                    className="flex items-center gap-3 cursor-pointer hover:bg-secondary/30 dark:hover:bg-[rgba(26,37,80,0.6)] rounded-lg p-1.5 -m-1.5 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    onClick={() => openPiiDrill(pii.type)}
                  >
                    <motion.div
                      className="w-8 h-8 rounded-lg bg-secondary/40 dark:bg-muted/50 flex items-center justify-center shrink-0"
                      whileHover={{ rotate: -8, scale: 1.1 }}
                    >
                      <PIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap mb-0.5">
                        <span className="text-xs text-foreground truncate font-medium">{getPiiLabel(pii.type)}</span>
                        <span className="text-xs font-bold text-foreground">{pii.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors[i % colors.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.1 * i }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {piiDistribution.length > 8 && (
                <p className="text-xs sm:text-[10px] text-primary/60 text-center pt-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> + {piiDistribution.length - 8} نوع آخر
                </p>
              )}
            </div>
          </div>
        </PremiumCard>

        {/* Recent Leaks */}
        <PremiumCard delay={0.8} onClick={() => setActiveModal("allLeaks")} className="group cursor-pointer">
          <div className="p-5">
            <SectionHeader icon={Eye} title="آخر حالات الرصد" subtitle="Latest Incidents" action="عرض الكل" onAction={() => setActiveModal("allLeaks")} />
            <div className="space-y-2">
              {recentLeaks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <Eye className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">لا توجد حالات رصد حتى الآن</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">ستظهر هنا عند اكتشاف حالة رصدات جديدة</p>
                </div>
              )}
              {recentLeaks.slice(0, 6).map((leak: any, idx: number) => {
                const sc = sourceColor(leak.source);
                const SIcon = sourceIcon(leak.source);
                return (
                  <motion.div
                    key={leak.leakId}
                    onClick={() => setSelectedLeak(leak.leakId)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.05 }}
                    whileHover={{ x: -3, scale: 1.01 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border cursor-pointer hover:border-primary/20 transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl ${sc.bg} flex items-center justify-center shrink-0`} style={{ boxShadow: `0 0 10px ${sc.glow}` }}>
                      <SIcon className={`w-4 h-4 ${sc.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{leak.titleAr}</p>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{leak.sectorAr} · {(leak.recordCount || 0).toLocaleString()} (مُدّعى)</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="text-[9px]">{sourceLabel(leak.source)}</Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* ═══ FIFTH ROW: Monthly Trend + Activity Log ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <PremiumCard delay={0.9} className="group" ariaLabel="الاتجاه الشهري - Monthly Trend">
          <div className="p-5">
            <SectionHeader icon={TrendingUp} title="الاتجاه الشهري" subtitle="Monthly Trend" action="التفاصيل" onAction={() => {
              setAtlasDrill({
                title: "الاتجاه الشهري لحالات الرصد",
                subtitle: "Monthly Trend",
                icon: <TrendingUp className="w-5 h-5 text-primary" />,
                type: "area",
                total: stats?.totalLeaks ?? 0,
                data: monthlyTrend.map(m => ({
                  name: m.yearMonth,
                  value: m.count,
                  fill: "#3db1ac",
                  onClick: () => {
                    setAtlasDrill(null);
                    setTimeout(() => openMonthDrill(m.yearMonth), 150);
                  },
                })),
              });
            }} />
            <div className="space-y-2">
              {monthlyTrend.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <TrendingUp className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">لا توجد بيانات شهرية بعد</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">ستظهر هنا عند توفر بيانات كافية</p>
                </div>
              )}
              {monthlyTrend.slice(-6).map((m, i) => {
                const maxCount = Math.max(...monthlyTrend.map(t => t.count), 1);
                const pct = Math.round((m.count / maxCount) * 100);
                return (
                  <div key={m.yearMonth} className="flex items-center gap-3 cursor-pointer hover:bg-secondary/30 dark:hover:bg-[rgba(26,37,80,0.6)] rounded-lg p-1 -m-1 transition-colors" onClick={() => openMonthDrill(m.yearMonth)}>
                    <span className="text-xs sm:text-[10px] text-muted-foreground w-16 shrink-0 text-left font-mono">{m.yearMonth}</span>
                    <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-l from-primary to-primary/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground w-8 text-left">{m.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </PremiumCard>

        {/* Activity Log */}
        <PremiumCard delay={1.0} className="border-amber-500/10 dark:border-amber-500/10" ariaLabel="سجل النشاط - Activity Log">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <div className="relative p-5">
            <SectionHeader icon={Activity} title="سجل النشاط" subtitle="Activity Log" action="الكل" onAction={() => setActiveModal("activityLog")} />
            <div className="space-y-3">
              {recentLeaks.slice(0, 5).map((leak: any, i: number) => {
                const sc = sourceColor(leak.source);
                const SIcon = sourceIcon(leak.source);
                return (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 cursor-pointer hover:bg-secondary/30 dark:hover:bg-[rgba(26,37,80,0.6)] rounded-xl p-1 -m-1 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + i * 0.05 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedLeak(leak.leakId); }}
                  >
                    <motion.div
                      className={`w-8 h-8 rounded-full ${sc.bg} flex items-center justify-center shrink-0 mt-0.5`}
                      whileHover={{ scale: 1.15 }}
                    >
                      <SIcon className={`w-3.5 h-3.5 ${sc.text}`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate font-medium">حالة رصد: {leak.titleAr}</p>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{leak.sectorAr} · {sourceLabel(leak.source)}</p>
                    </div>
                    <span className="text-xs sm:text-[10px] text-muted-foreground shrink-0">
                      {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PremiumCard>
      </div>

        {/* ═══ SIXTH ROW: Monthly Comparison (MoM) ═══ */}
      <MonthlyComparison />

      {/* ═══ SEVENTH ROW: Executive Summary ═══ */}
      <ExecutiveSummary
        totalLeaks={stats?.totalLeaks ?? 0}
        newLeaks={stats?.newLeaks ?? 0}
        totalRecords={stats?.totalRecords ?? 0}
        sectorDistribution={sectorDistribution.map((s: any) => ({ sector: s.sector || '', count: s.count || 0, records: s.records || 0 }))}
        monthlyTrend={monthlyTrend.map((m: any) => ({ yearMonth: m.yearMonth || '', count: m.count || 0 }))}
      />

      {/* ═══ EIGHTH ROW: AI Trend Predictions + Activity Feed ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendPredictions
          monthlyTrend={monthlyTrend.map((m: any) => ({ yearMonth: m.yearMonth || '', count: m.count || 0, records: m.records || 0 }))}
          totalLeaks={stats?.totalLeaks ?? 0}
          totalRecords={stats?.totalRecords ?? 0}
          newLeaks={stats?.newLeaks ?? 0}
        />
        <ActivityFeed leaks={leaks} maxItems={15} />
      </div>

      {/* ═══ NINTH ROW: World Heatmap ═══ */}
      <WorldHeatmap leaks={leaks} />

      {/* ═══ Export Center Drawer ═══ */}
      <ExportCenter
        isOpen={showExportCenter}
        onClose={() => setShowExportCenter(false)}
        stats={stats}
        leaks={leaks}
      />

      {/* ═════════════════════════════════════════════════════════════
         DETAIL MODALS — ALL PRESERVED
         ═══════════════════════════════════════════════════════════════ */}

      {/* Total Leaks Modal */}
      <DetailModal open={activeModal === "totalLeaks"} onClose={() => setActiveModal(null)} title="تفاصيل إجمالي حالات الرصد" icon={<ShieldAlert className="w-5 h-5 text-blue-500" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusCards.map((sc) => {
              const SIcon = sc.icon;
              return (
                <div key={sc.label} className={`p-4 rounded-xl ${sc.bg} text-center`} style={{ boxShadow: `0 0 12px ${sc.glow}` }}>
                  <SIcon className={`w-5 h-5 ${sc.color} mx-auto mb-1`} />
                  <p className="text-xl font-bold text-foreground">{sc.value}</p>
                  <p className="text-xs sm:text-[10px] text-muted-foreground">{sc.label}</p>
                </div>
              );
            })}
          </div>
          <h4 className="text-sm font-semibold text-foreground">جميع حالات الرصد</h4>
          <LeakListInModal leaks={leaks} />
        </div>
      </DetailModal>

      {/* Total Records Modal */}
      <DetailModal open={activeModal === "totalRecords"} onClose={() => setActiveModal(null)} title="تفاصيل إجمالي السجلات المكشوفة" icon={<Database className="w-5 h-5 text-emerald-500" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <div className="space-y-4">
          <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20" style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.08)" }}>
            <p className="text-3xl font-bold text-foreground">{(stats?.totalRecords ?? 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">إجمالي إجمالي السجلات المكشوفة</p>
          </div>
          <h4 className="text-sm font-semibold text-foreground">أكبر حالات الرصد من حيث إجمالي السجلات المكشوفة</h4>
          <LeakListInModal leaks={[...leaks].sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0))} />
        </div>
      </DetailModal>

      {/* PII Types Modal */}
      <DetailModal open={activeModal === "piiTypes"} onClose={() => setActiveModal(null)} title="تفاصيل أنواع البيانات الشخصية المكتشفة" icon={<Fingerprint className="w-5 h-5 text-amber-500" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <div className="space-y-3">
          {piiDistribution.map((pii, i) => {
            const PIcon = getPiiIcon(pii.type);
            const maxCount = piiDistribution[0]?.count || 1;
            const pct = Math.round((pii.count / maxCount) * 100);
            const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
            const piiLeaks = leaks.filter(l => parseJsonSafe(l.piiTypes, [])?.includes(pii.type));
            return (
              <div key={pii.type} className="bg-secondary/20 dark:bg-muted/40 rounded-xl p-4 border border-border/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-secondary/40 dark:bg-muted/50 flex items-center justify-center">
                    <PIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">{getPiiLabel(pii.type)}</h4>
                      <Badge variant="outline" className="text-xs sm:text-[10px]">{pii.count} حالة رصد</Badge>
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                    </div>
                  </div>
                </div>
                {piiLeaks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {piiLeaks.slice(0, 3).map(l => (
                      <p key={l.leakId} className="text-xs sm:text-[10px] text-muted-foreground truncate">• {l.titleAr} — {l.sectorAr}</p>
                    ))}
                    {piiLeaks.length > 3 && <p className="text-xs sm:text-[10px] text-primary">+ {piiLeaks.length - 3} حالة رصد أخرى</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DetailModal>

      {/* Sectors Modal */}
      <DetailModal open={activeModal === "sectors"} onClose={() => setActiveModal(null)} title="تفاصيل القطاعات المتأثرة" icon={<Building2 className="w-5 h-5 text-violet-500" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <div className="space-y-3">
          {sectorDistribution.map((sec) => {
            const SIcon = getSectorIcon(sec.sector || "");
            const total = stats?.totalLeaks || 1;
            const pct = Math.round((sec.count / total) * 100);
            const sectorLeaks = leaks.filter(l => l.sectorAr === sec.sector);
            return (
              <div key={sec.sector} className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <SIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">{sec.sector}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs sm:text-[10px]">{sec.count} حالة رصد</Badge>
                        <span className="text-xs font-bold text-primary">{pct}%</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{(sec.records ?? 0).toLocaleString()} سجل مكشوف</p>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <LeakListInModal leaks={sectorLeaks} />
              </div>
            );
          })}
        </div>
      </DetailModal>

      {/* Source Distribution Modal */}
      <DetailModal open={activeModal === "sourceDist"} onClose={() => setActiveModal(null)} title="تفاصيل مصادر الرصد" icon={<Radio className="w-5 h-5 text-primary" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <div className="space-y-4">
          {sourceCards.map((sc) => {
            const SIcon = sc.icon;
            const srcLeaks = leaks.filter(l => l.source === sc.key);
            const total = stats?.totalLeaks || 1;
            const pct = Math.round((sc.value / total) * 100);
            return (
              <div key={sc.key} className="bg-secondary/20 dark:bg-muted/40 rounded-xl p-4 border border-border/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl ${sc.bg} flex items-center justify-center`} style={{ boxShadow: `0 0 16px ${sc.glow}` }}>
                    <SIcon className={`w-5 h-5 ${sc.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">{sc.label}</h4>
                      <Badge variant="outline" className="text-xs sm:text-[10px]">{sc.value} حالة رصد — {pct}%</Badge>
                    </div>
                    <div className="w-full h-2 bg-muted/30 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: sourceColor(sc.key).fill }} />
                    </div>
                  </div>
                </div>
                <LeakListInModal leaks={srcLeaks} />
              </div>
            );
          })}
        </div>
      </DetailModal>

      {/* Monthly Trend Modal */}
      <DetailModal open={activeModal === "monthlyTrend"} onClose={() => setActiveModal(null)} title="تفاصيل الاتجاه الشهري" icon={<TrendingUp className="w-5 h-5 text-primary" />}>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-right p-2 text-muted-foreground font-medium text-xs">الشهر</th>
                  <th className="text-right p-2 text-muted-foreground font-medium text-xs">حالات الرصد</th>
                  <th className="text-right p-2 text-muted-foreground font-medium text-xs">إجمالي السجلات المكشوفة</th>
                  <th className="text-right p-2 text-muted-foreground font-medium text-xs">التغيير</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((m, i) => {
                  const prev = i > 0 ? monthlyTrend[i - 1].count : m.count;
                  const diff = m.count - prev;
                  return (
                    <tr key={m.yearMonth} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="p-2 text-foreground text-xs font-mono">{m.yearMonth}</td>
                      <td className="p-2 text-foreground font-bold text-xs">{m.count}</td>
                      <td className="p-2 text-foreground text-xs">{(m.records ?? 0).toLocaleString()}</td>
                      <td className={`p-2 text-xs font-semibold ${diff > 0 ? "text-red-400" : diff < 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DetailModal>

      {/* All Leaks Modal */}
      <DetailModal open={activeModal === "allLeaks"} onClose={() => setActiveModal(null)} title="جميع حالات الرصد" icon={<Eye className="w-5 h-5 text-primary" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <LeakListInModal leaks={leaks} />
      </DetailModal>

      {/* Radar Modal */}
      <DetailModal open={activeModal === "radar"} onClose={() => setActiveModal(null)} title="تفاصيل رادار الرصد" icon={<Target className="w-5 h-5 text-primary" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {systemStats.map((ss) => {
              const SSIcon = ss.icon;
              return (
                <div key={ss.label} className={`p-4 rounded-xl ${ss.color} text-center cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => { setActiveModal(null); setTimeout(() => setActiveModal("totalLeaks"), 100); }}>
                  <SSIcon className="w-6 h-6 text-white mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{(ss.value ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{ss.label}</p>
                </div>
              );
            })}
          </div>
          <div className="bg-secondary/20 dark:bg-muted/40 rounded-xl p-4 border border-border/30">
            <h4 className="text-sm font-semibold text-foreground mb-3">ملخص النظام</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <p className="text-lg font-bold text-primary">{stats?.totalLeaks ?? 0}</p>
                <p className="text-xs text-muted-foreground">إجمالي حالات الرصد</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-500/5">
                <p className="text-lg font-bold text-emerald-500">{(stats?.totalRecords ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">إجمالي السجلات المكشوفة</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-violet-500/5">
                <p className="text-lg font-bold text-violet-500">{sectorDistribution.length}</p>
                <p className="text-xs text-muted-foreground">قطاعات متأثرة</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/5">
                <p className="text-lg font-bold text-amber-500">{sourceCards.length}</p>
                <p className="text-xs text-muted-foreground">مصادر رصد</p>
              </div>
            </div>
          </div>
          <h4 className="text-sm font-semibold text-foreground">آخر 10 حالات رصد</h4>
          <LeakListInModal leaks={recentLeaks.slice(0, 10)} />
        </div>
      </DetailModal>

      {/* Activity Log Modal */}
      <DetailModal open={activeModal === "activityLog"} onClose={() => setActiveModal(null)} title="سجل النشاط الكامل" icon={<Activity className="w-5 h-5 text-amber-500" />} maxWidth="max-w-[95vw] sm:max-w-4xl">
        <div className="space-y-3">
          {recentLeaks.map((leak: any, i: number) => {
            const sc = sourceColor(leak.source);
            const SIcon = sourceIcon(leak.source);
            return (
              <motion.div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 dark:bg-muted/40 border border-border/30 cursor-pointer hover:border-primary/30 transition-all"
                whileHover={{ x: -3 }}
                onClick={() => { setActiveModal(null); setTimeout(() => setSelectedLeak(leak.leakId), 100); }}
              >
                <div className={`w-9 h-9 rounded-full ${sc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <SIcon className={`w-4 h-4 ${sc.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate font-medium">حالة رصد: {leak.titleAr}</p>
                  <p className="text-[10px] text-muted-foreground">{leak.sectorAr} · {sourceLabel(leak.source)} · {(leak.recordCount || 0).toLocaleString()} سجل (مُدّعى)</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) : ""}
                </span>
              </motion.div>
            );
          })}
        </div>
      </DetailModal>

      {/* Leak Detail Drilldown */}
      {selectedLeak && <LeakDetailDrilldown leak={{ leakId: selectedLeak }} open={true} onClose={() => setSelectedLeak(null)} />}

      {/* ═══ ATLAS DRILL-DOWN MODAL (Charts + Data Table) ═══ */}
      <AtlasDrillModal drillData={atlasDrill} onClose={() => setAtlasDrill(null)} />

      {/* ═══ ATLAS SLIDE PANEL (Deep Detail) ═══ */}
      {slidePanelData?.type === "source" && (
        <AtlasSlidePanel
          open={true}
          onClose={() => setSlidePanelData(null)}
          title={`تفاصيل مصدر: ${slidePanelData.data.label}`}
          subtitle={`${slidePanelData.data.leaks.length} حالة رصد · ${(slidePanelData.data.totalRecords || 0).toLocaleString()} سجل مكشوف`}
          icon={<Radio className="w-6 h-6 text-primary" />}
          accentColor={slidePanelData.data.sourceKey === "telegram" ? "#0ea5e9" : slidePanelData.data.sourceKey === "darkweb" ? "#8b5cf6" : "#f59e0b"}
        >
          <div className="space-y-3">
            {/* Source KPIs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-4 rounded-xl text-center ${isDark ? "bg-[rgba(139,127,212,0.06)] border border-[rgba(139,127,212,0.1)]" : "bg-[#f5f7fb] border border-[#e2e5ef]"}`}>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{slidePanelData.data.leaks.length}</p>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>حالات الرصد</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${isDark ? "bg-[rgba(139,127,212,0.06)] border border-[rgba(139,127,212,0.1)]" : "bg-[#f5f7fb] border border-[#e2e5ef]"}`}>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{(slidePanelData.data.totalRecords || 0).toLocaleString()}</p>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>سجلات مُدّعاة</p>
              </div>
            </div>
            {/* Sector breakdown within source */}
            {(() => {
              const sectors = slidePanelData.data.leaks.reduce((acc: any, l: any) => {
                const s = l.sectorAr || "غير محدد";
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const sorted = Object.entries(sectors).sort((a: any, b: any) => b[1] - a[1]);
              return sorted.length > 0 && (
                <div className={`p-4 rounded-xl ${isDark ? "bg-[rgba(139,127,212,0.04)] border border-[rgba(139,127,212,0.08)]" : "bg-[#f8f9fc] border border-[#e2e5ef]"}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#1e293b]"}`}>القطاعات في هذا المصدر</h4>
                  <div className="space-y-2">
                    {sorted.map(([sector, count]: any) => (
                      <div key={sector}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                        onClick={() => { setSlidePanelData(null); setTimeout(() => openSectorDrill(sector), 150); }}
                      >
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{sector}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{count}</span>
                          <ChevronLeft className={`w-3.5 h-3.5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Leak list */}
            <h4 className={`text-sm font-bold mt-4 ${isDark ? "text-white" : "text-[#1e293b]"}`}>حالات الرصد</h4>
            {slidePanelData.data.leaks.map((leak: any) => (
              <motion.div
                key={leak.leakId}
                onClick={() => { setSlidePanelData(null); setTimeout(() => setSelectedLeak(leak.leakId), 150); }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isDark ? "bg-[rgba(255,255,255,0.02)] border-[rgba(139,127,212,0.08)] hover:bg-[rgba(255,255,255,0.05)]" : "bg-white border-[#e2e5ef] hover:bg-[#f5f7fb]"}`}
                whileHover={{ x: -3 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-[#1e293b]"}`}>{leak.titleAr}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{leak.sectorAr}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{(leak.recordCount || 0).toLocaleString()} سجل</span>
                  <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AtlasSlidePanel>
      )}

      {slidePanelData?.type === "sector" && (
        <AtlasSlidePanel
          open={true}
          onClose={() => setSlidePanelData(null)}
          title={slidePanelData.data.sector || "غير محدد"}
          subtitle={`${slidePanelData.data.count} حالة رصد · ${(slidePanelData.data.records || 0).toLocaleString()} سجل مكشوف`}
          icon={<Building2 className="w-6 h-6 text-violet-400" />}
          accentColor="#8b5cf6"
        >
          <div className="space-y-3">
            {/* Source breakdown within sector */}
            {(() => {
              const sources = slidePanelData.data.leaks.reduce((acc: any, l: any) => {
                const s = l.source || "unknown";
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const srcLabels: Record<string, string> = { telegram: "تليجرام", darkweb: "دارك ويب", paste: "مواقع اللصق" };
              const sorted = Object.entries(sources).sort((a: any, b: any) => b[1] - a[1]);
              return sorted.length > 0 && (
                <div className={`p-4 rounded-xl ${isDark ? "bg-[rgba(139,127,212,0.04)] border border-[rgba(139,127,212,0.08)]" : "bg-[#f8f9fc] border border-[#e2e5ef]"}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#1e293b]"}`}>المصادر في هذا القطاع</h4>
                  <div className="space-y-2">
                    {sorted.map(([src, count]: any) => (
                      <div key={src}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                        onClick={() => { setSlidePanelData(null); setTimeout(() => openSourceDrill(src), 150); }}
                      >
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{srcLabels[src] || src}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{count}</span>
                          <ChevronLeft className={`w-3.5 h-3.5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* PII types in this sector */}
            {(() => {
              const piiMap: Record<string, number> = {};
              slidePanelData.data.leaks.forEach((l: any) => {
                const types = parseJsonSafe(l.piiTypes, []);
                types.forEach((t: string) => { piiMap[t] = (piiMap[t] || 0) + 1; });
              });
              const sorted = Object.entries(piiMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
              return sorted.length > 0 && (
                <div className={`p-4 rounded-xl ${isDark ? "bg-[rgba(139,127,212,0.04)] border border-[rgba(139,127,212,0.08)]" : "bg-[#f8f9fc] border border-[#e2e5ef]"}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#1e293b]"}`}>البيانات الشخصية المكشوفة</h4>
                  <div className="space-y-2">
                    {sorted.map(([pii, count]) => (
                      <div key={pii}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                        onClick={() => { setSlidePanelData(null); setTimeout(() => openPiiDrill(pii), 150); }}
                      >
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{getPiiLabel(pii)}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{count}</span>
                          <ChevronLeft className={`w-3.5 h-3.5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Leak list */}
            <h4 className={`text-sm font-bold mt-4 ${isDark ? "text-white" : "text-[#1e293b]"}`}>حالات الرصد</h4>
            {slidePanelData.data.leaks.map((leak: any) => (
              <motion.div
                key={leak.leakId}
                onClick={() => { setSlidePanelData(null); setTimeout(() => setSelectedLeak(leak.leakId), 150); }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isDark ? "bg-[rgba(255,255,255,0.02)] border-[rgba(139,127,212,0.08)] hover:bg-[rgba(255,255,255,0.05)]" : "bg-white border-[#e2e5ef] hover:bg-[#f5f7fb]"}`}
                whileHover={{ x: -3 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-[#1e293b]"}`}>{leak.titleAr}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{sourceLabel(leak.source)}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{(leak.recordCount || 0).toLocaleString()} سجل</span>
                  <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AtlasSlidePanel>
      )}

      {slidePanelData?.type === "pii" && (
        <AtlasSlidePanel
          open={true}
          onClose={() => setSlidePanelData(null)}
          title={slidePanelData.data.label}
          subtitle={`${slidePanelData.data.count} حالة رصد`}
          icon={<Fingerprint className="w-6 h-6 text-amber-400" />}
          accentColor="#f59e0b"
        >
          <div className="space-y-3">
            {/* Sector breakdown for this PII type */}
            {(() => {
              const sectors = slidePanelData.data.leaks.reduce((acc: any, l: any) => {
                const s = l.sectorAr || "غير محدد";
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const sorted = Object.entries(sectors).sort((a: any, b: any) => b[1] - a[1]);
              return sorted.length > 0 && (
                <div className={`p-4 rounded-xl ${isDark ? "bg-[rgba(139,127,212,0.04)] border border-[rgba(139,127,212,0.08)]" : "bg-[#f8f9fc] border border-[#e2e5ef]"}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#1e293b]"}`}>القطاعات المتأثرة</h4>
                  <div className="space-y-2">
                    {sorted.map(([sector, count]: any) => (
                      <div key={sector}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                        onClick={() => { setSlidePanelData(null); setTimeout(() => openSectorDrill(sector), 150); }}
                      >
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{sector}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{count}</span>
                          <ChevronLeft className={`w-3.5 h-3.5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Leak list */}
            <h4 className={`text-sm font-bold mt-4 ${isDark ? "text-white" : "text-[#1e293b]"}`}>حالات الرصد</h4>
            {slidePanelData.data.leaks.map((leak: any) => (
              <motion.div
                key={leak.leakId}
                onClick={() => { setSlidePanelData(null); setTimeout(() => setSelectedLeak(leak.leakId), 150); }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isDark ? "bg-[rgba(255,255,255,0.02)] border-[rgba(139,127,212,0.08)] hover:bg-[rgba(255,255,255,0.05)]" : "bg-white border-[#e2e5ef] hover:bg-[#f5f7fb]"}`}
                whileHover={{ x: -3 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-[#1e293b]"}`}>{leak.titleAr}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{leak.sectorAr}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{(leak.recordCount || 0).toLocaleString()} سجل</span>
                  <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AtlasSlidePanel>
      )}

      {slidePanelData?.type === "status" && (
        <AtlasSlidePanel
          open={true}
          onClose={() => setSlidePanelData(null)}
          title={`حالات: ${slidePanelData.data.label}`}
          subtitle={`${slidePanelData.data.leaks.length} حالة رصد`}
          icon={<Activity className="w-6 h-6 text-blue-400" />}
          accentColor="#3b82f6"
        >
          <div className="space-y-3">
            {/* Source breakdown */}
            {(() => {
              const sources = slidePanelData.data.leaks.reduce((acc: any, l: any) => {
                const s = l.source || "unknown";
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const srcLabels: Record<string, string> = { telegram: "تليجرام", darkweb: "دارك ويب", paste: "مواقع اللصق" };
              const sorted = Object.entries(sources).sort((a: any, b: any) => b[1] - a[1]);
              return sorted.length > 0 && (
                <div className={`p-4 rounded-xl ${isDark ? "bg-[rgba(139,127,212,0.04)] border border-[rgba(139,127,212,0.08)]" : "bg-[#f8f9fc] border border-[#e2e5ef]"}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#1e293b]"}`}>توزيع المصادر</h4>
                  <div className="space-y-2">
                    {sorted.map(([src, count]: any) => (
                      <div key={src}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                        onClick={() => { setSlidePanelData(null); setTimeout(() => openSourceDrill(src), 150); }}
                      >
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{srcLabels[src] || src}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{count}</span>
                          <ChevronLeft className={`w-3.5 h-3.5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Leak list */}
            <h4 className={`text-sm font-bold mt-4 ${isDark ? "text-white" : "text-[#1e293b]"}`}>حالات الرصد</h4>
            {slidePanelData.data.leaks.map((leak: any) => (
              <motion.div
                key={leak.leakId}
                onClick={() => { setSlidePanelData(null); setTimeout(() => setSelectedLeak(leak.leakId), 150); }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isDark ? "bg-[rgba(255,255,255,0.02)] border-[rgba(139,127,212,0.08)] hover:bg-[rgba(255,255,255,0.05)]" : "bg-white border-[#e2e5ef] hover:bg-[#f5f7fb]"}`}
                whileHover={{ x: -3 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-[#1e293b]"}`}>{leak.titleAr}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{leak.sectorAr}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{(leak.recordCount || 0).toLocaleString()} سجل</span>
                  <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AtlasSlidePanel>
      )}

      {slidePanelData?.type === "month" && (
        <AtlasSlidePanel
          open={true}
          onClose={() => setSlidePanelData(null)}
          title={`حالات شهر ${slidePanelData.data.yearMonth}`}
          subtitle={`${slidePanelData.data.leaks.length} حالة رصد`}
          icon={<Calendar className="w-6 h-6 text-primary" />}
          accentColor="#3db1ac"
        >
          <div className="space-y-3">
            {/* Source breakdown */}
            {(() => {
              const sources = slidePanelData.data.leaks.reduce((acc: any, l: any) => {
                const s = l.source || "unknown";
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const srcLabels: Record<string, string> = { telegram: "تليجرام", darkweb: "دارك ويب", paste: "مواقع اللصق" };
              const sorted = Object.entries(sources).sort((a: any, b: any) => b[1] - a[1]);
              return sorted.length > 0 && (
                <div className={`p-4 rounded-xl ${isDark ? "bg-[rgba(139,127,212,0.04)] border border-[rgba(139,127,212,0.08)]" : "bg-[#f8f9fc] border border-[#e2e5ef]"}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#1e293b]"}`}>المصادر</h4>
                  <div className="space-y-2">
                    {sorted.map(([src, count]: any) => (
                      <div key={src}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                        onClick={() => { setSlidePanelData(null); setTimeout(() => openSourceDrill(src), 150); }}
                      >
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{srcLabels[src] || src}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1e293b]"}`}>{count}</span>
                          <ChevronLeft className={`w-3.5 h-3.5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Leak list */}
            <h4 className={`text-sm font-bold mt-4 ${isDark ? "text-white" : "text-[#1e293b]"}`}>حالات الرصد</h4>
            {slidePanelData.data.leaks.map((leak: any) => (
              <motion.div
                key={leak.leakId}
                onClick={() => { setSlidePanelData(null); setTimeout(() => setSelectedLeak(leak.leakId), 150); }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isDark ? "bg-[rgba(255,255,255,0.02)] border-[rgba(139,127,212,0.08)] hover:bg-[rgba(255,255,255,0.05)]" : "bg-white border-[#e2e5ef] hover:bg-[#f5f7fb]"}`}
                whileHover={{ x: -3 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-[#1e293b]"}`}>{leak.titleAr}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{leak.sectorAr}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{(leak.recordCount || 0).toLocaleString()} سجل</span>
                  <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AtlasSlidePanel>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/EvidenceChain.tsx`

```tsx
// Leaks Domain
/**
 * EvidenceChain — SHA-256 blockchain-like evidence integrity verification
 * All stats and evidence blocks are clickable with detail modals
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Link2,
  Shield,
  CheckCircle2,
  XCircle,
  Hash,
  FileText,
  Image,
  Database,
  Loader2,
  Lock,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { DetailModal } from "@/components/DetailModal";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import AnimatedCounter from "@/components/AnimatedCounter";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  text: { label: "نص", icon: FileText, color: "text-cyan-400" },
  screenshot: { label: "لقطة شاشة", icon: Image, color: "text-violet-400" },
  file: { label: "ملف", icon: Database, color: "text-emerald-400" },
  metadata: { label: "بيانات وصفية", icon: Hash, color: "text-amber-400" },
};

export default function EvidenceChain() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [drillLeakId, setDrillLeakId] = useState<string | null>(null);

  const { data: evidence, isLoading } = trpc.evidence.list.useQuery();
  const { data: stats } = trpc.evidence.stats.useQuery();

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-violet-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">سلسلة الأدلة الرقمية</h1>
              <p className="text-xs text-muted-foreground">Evidence Chain — SHA-256 Integrity Verification</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            سلسلة بلوكتشين مصغرة لضمان سلامة الأدلة — كل دليل مرتبط بالسابق عبر SHA-256
          </p>
        </div>
      </motion.div>

      {/* Stats — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "total", label: "إجمالي الأدلة", value: stats?.total || 0, icon: Database, color: "text-primary", borderColor: "border-primary/20", bgColor: "bg-primary/5" },
          { key: "verified", label: "أدلة موثقة", value: stats?.verified || 0, icon: CheckCircle2, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
          { key: "verifyRate", label: "نسبة التحقق", value: stats?.total ? `${Math.round(((stats?.verified || 0) / stats.total) * 100)}%` : "0%", icon: Shield, color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
          { key: "types", label: "أنواع الأدلة", value: Object.keys(stats?.types || {}).length, icon: FileText, color: "text-violet-400", borderColor: "border-violet-500/20", bgColor: "bg-violet-500/5" },
        ].map((stat, i) => (
          <motion.div key={stat.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card
              className={`border ${stat.borderColor} ${stat.bgColor} cursor-pointer hover:scale-[1.02] transition-all group`}
              onClick={() => setActiveModal(stat.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
                <p className="text-[9px] text-primary/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Evidence Type Breakdown — clickable */}
      {stats?.types && Object.keys(stats.types).length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">توزيع أنواع الأدلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stats.types).map(([type, count]) => {
                const config = typeConfig[type] || typeConfig.metadata;
                const Icon = config.icon;
                return (
                  <div
                    key={type}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => setActiveModal(`type_${type}`)}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">{count as number}</p>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chain Visualization — clickable blocks */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !evidence || evidence.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <Link2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">لا توجد أدلة مسجلة بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            سلسلة الأدلة ({evidence.length} كتلة)
          </h3>
          {evidence.map((entry, i) => {
            const config = typeConfig[entry.evidenceType] || typeConfig.metadata;
            const Icon = config.icon;
            const isExpanded = expandedId === entry.evidenceId;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className={`border-border hover:border-primary/30 transition-colors cursor-pointer ${!entry.isVerified ? "border-red-500/30" : ""}`}
                  onClick={() => { setSelectedEvidence(entry); setActiveModal("evidenceDetail"); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${entry.isVerified ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                            <span className="text-sm font-bold text-foreground">#{entry.blockIndex}</span>
                          </div>
                          {i < evidence.length - 1 && (
                            <div className="w-0.5 h-6 bg-border mt-1" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            <span className="text-sm font-semibold text-foreground">{config.label}</span>
                            <Badge variant="outline" className="text-xs sm:text-[10px]">{entry.leakId}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.isVerified ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            <span className="text-xs sm:text-[10px] text-muted-foreground">
                              {entry.isVerified ? "تم التحقق" : "فشل التحقق"}
                            </span>
                            <span className="text-xs sm:text-[10px] text-muted-foreground">
                              {entry.capturedBy && `• ${entry.capturedBy}`}
                            </span>
                          </div>
                          {(entry as any).metadata?.description && (
                            <p className="text-xs sm:text-[10px] text-muted-foreground mt-1 line-clamp-1">{(entry as any).metadata.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : entry.evidenceId); }}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-border space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="grid grid-cols-1 gap-2">
                          <div className="p-2 rounded bg-secondary/50 border border-border">
                            <p className="text-xs sm:text-[10px] text-muted-foreground mb-1">Content Hash (SHA-256):</p>
                            <code className="text-xs sm:text-[10px] font-mono text-primary break-all" dir="ltr">{entry.contentHash}</code>
                          </div>
                          {entry.previousHash && (
                            <div className="p-2 rounded bg-secondary/50 border border-border">
                              <p className="text-xs sm:text-[10px] text-muted-foreground mb-1">Previous Hash:</p>
                              <code className="text-xs sm:text-[10px] font-mono text-amber-400 break-all" dir="ltr">{entry.previousHash}</code>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs sm:text-[10px] text-muted-foreground">
                            <span>Evidence ID: <code className="font-mono text-foreground">{entry.evidenceId}</code></span>
                            <span>التقاط: {new Date(entry.capturedAt).toLocaleString("ar-SA")}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Total Evidence Modal */}
      <DetailModal open={activeModal === "total"} onClose={() => setActiveModal(null)} title="إجمالي الأدلة الرقمية" icon={<Database className="w-5 h-5 text-primary" />}>
        <div className="space-y-4">
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 text-center">
            <p className="text-3xl font-bold text-primary"><AnimatedCounter value={stats?.total || 0} /></p>
            <p className="text-xs text-muted-foreground">دليل رقمي مسجل</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats?.types || {}).map(([type, count]) => {
              const config = typeConfig[type] || typeConfig.metadata;
              const Icon = config.icon;
              return (
                <div key={type} className="bg-secondary/30 rounded-xl p-3 border border-border/50 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <div>
                    <p className="text-sm font-bold text-foreground">{count as number}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            الأدلة الرقمية تشمل لقطات شاشة، ملفات نصية، بيانات وصفية، وملفات مرفقة. كل دليل مرتبط بحالة رصد محددة ومحمي بتشفير SHA-256.
          </p>
        </div>
      </DetailModal>

      {/* Verified Evidence Modal */}
      <DetailModal open={activeModal === "verified"} onClose={() => setActiveModal(null)} title="الأدلة الموثقة" icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
              <p className="text-2xl font-bold text-emerald-400"><AnimatedCounter value={stats?.verified || 0} /></p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">موثقة</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
              <p className="text-2xl font-bold text-red-400">{(stats?.total || 0) - (stats?.verified || 0)}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">غير موثقة</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            يتم التحقق من سلامة كل دليل عبر مقارنة تجزئة SHA-256 المخزنة مع التجزئة المحسوبة. الأدلة الموثقة تؤكد عدم العبث بالبيانات منذ لحظة التقاطها.
          </p>
        </div>
      </DetailModal>

      {/* Verify Rate Modal */}
      <DetailModal open={activeModal === "verifyRate"} onClose={() => setActiveModal(null)} title="نسبة التحقق من الأدلة" icon={<Shield className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-4">
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20 text-center">
            <p className="text-3xl font-bold text-cyan-400">
              {stats?.total ? `${Math.round(((stats?.verified || 0) / stats.total) * 100)}%` : "0%"}
            </p>
            <p className="text-xs text-muted-foreground">نسبة التحقق الكلية</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">آلية التحقق</h4>
            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> حساب تجزئة SHA-256 للمحتوى الأصلي</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> ربط كل كتلة بالكتلة السابقة عبر Previous Hash</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> التحقق الدوري من سلامة السلسلة</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> تسجيل الطابع الزمني وهوية المُلتقط</li>
            </ul>
          </div>
        </div>
      </DetailModal>

      {/* Evidence Types Modal */}
      <DetailModal open={activeModal === "types"} onClose={() => setActiveModal(null)} title="أنواع الأدلة" icon={<FileText className="w-5 h-5 text-violet-400" />}>
        <div className="space-y-3">
          {Object.entries(typeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const count = (stats?.types as any)?.[type] || 0;
            return (
              <div key={type} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-secondary`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{count} دليل</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {type === "text" && "أدلة نصية تتضمن محتوى الرسائل والمنشورات المرتبطة بحالة الرصد"}
                  {type === "screenshot" && "لقطات شاشة توثق عروض البيع والمحادثات على المنصات"}
                  {type === "file" && "ملفات مرفقة تحتوي على عينات من العينات المتاحة"}
                  {type === "metadata" && "بيانات وصفية تشمل معلومات المصدر والتوقيت والموقع"}
                </p>
              </div>
            );
          })}
        </div>
      </DetailModal>

      {/* Evidence Type Filter Modals */}
      {Object.keys(typeConfig).map(type => {
        const config = typeConfig[type];
        const Icon = config.icon;
        const filteredEvidence = evidence?.filter(e => e.evidenceType === type) || [];
        return (
          <DetailModal
            key={type}
            open={activeModal === `type_${type}`}
            onClose={() => setActiveModal(null)}
            title={`أدلة من نوع: ${config.label}`}
            icon={<Icon className={`w-5 h-5 ${config.color}`} />}
          >
            <div className="space-y-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-2xl font-bold text-foreground"><AnimatedCounter value={filteredEvidence.length} /></p>
                <p className="text-xs text-muted-foreground">دليل من نوع {config.label}</p>
              </div>
              {filteredEvidence.slice(0, 15).map(entry => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => { setSelectedEvidence(entry); setActiveModal("evidenceDetail"); }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-primary">#{entry.blockIndex}</span>
                    <Badge variant="outline" className="text-xs sm:text-[10px]">{entry.leakId}</Badge>
                    {entry.isVerified ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                  <p className="text-xs sm:text-[10px] text-muted-foreground">{new Date(entry.capturedAt).toLocaleString("ar-SA")}</p>
                </div>
              ))}
            </div>
          </DetailModal>
        );
      })}

      {/* Evidence Detail Modal */}
      <DetailModal
        open={activeModal === "evidenceDetail" && !!selectedEvidence}
        onClose={() => { setActiveModal(null); setSelectedEvidence(null); }}
        title={`دليل رقمي #${selectedEvidence?.blockIndex || ""}`}
        icon={<Link2 className="w-5 h-5 text-violet-400" />}
        maxWidth="max-w-2xl"
      >
        {selectedEvidence && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">الكتلة</p>
                <p className="text-lg font-bold text-foreground">#{selectedEvidence.blockIndex}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">النوع</p>
                <p className="text-sm font-bold text-foreground">{(typeConfig[selectedEvidence.evidenceType] || typeConfig.metadata).label}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">التحقق</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {selectedEvidence.isVerified ? (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">موثق</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-red-400" /><span className="text-sm text-red-400">غير موثق</span></>
                  )}
                </div>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">حالة الرصد</p>
                <p className="text-sm font-bold text-primary font-mono">{selectedEvidence.leakId}</p>
              </div>
            </div>

            {(selectedEvidence as any).metadata?.description && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">الوصف</h4>
                <p className="text-sm text-foreground leading-relaxed">{(selectedEvidence as any).metadata.description}</p>
              </div>
            )}

            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground">التشفير والتحقق</h4>
              <div className="p-2 rounded bg-secondary/50 border border-border">
                <p className="text-xs sm:text-[10px] text-muted-foreground mb-1">Content Hash (SHA-256):</p>
                <code className="text-xs sm:text-[10px] font-mono text-primary break-all" dir="ltr">{selectedEvidence.contentHash}</code>
              </div>
              {selectedEvidence.previousHash && (
                <div className="p-2 rounded bg-secondary/50 border border-border">
                  <p className="text-xs sm:text-[10px] text-muted-foreground mb-1">Previous Hash:</p>
                  <code className="text-xs sm:text-[10px] font-mono text-amber-400 break-all" dir="ltr">{selectedEvidence.previousHash}</code>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> المُلتقط</p>
                <p className="text-sm text-foreground mt-1">{selectedEvidence.capturedBy || "—"}</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> تاريخ الالتقاط</p>
                <p className="text-sm text-foreground mt-1">{new Date(selectedEvidence.capturedAt).toLocaleString("ar-SA")}</p>
              </div>
            </div>

            {(selectedEvidence as any).metadata && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">البيانات الوصفية</h4>
                <div className="space-y-2">
                  {Object.entries((selectedEvidence as any).metadata).filter(([k]) => k !== "description").map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between flex-wrap text-xs">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="text-foreground font-mono text-xs sm:text-[10px]">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deep-drill: View full leak details */}
            <button
              onClick={() => setDrillLeakId(selectedEvidence.leakId)}
              className="w-full p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-center"
            >
              <span className="text-xs text-primary font-medium">عرض تفاصيل حالة الرصد الكاملة ({selectedEvidence.leakId}) ←</span>
            </button>
          </div>
        )}
      </DetailModal>

      {/* Leak Detail Drilldown from Evidence */}
      <LeakDetailDrilldown
        leak={drillLeakId ? { leakId: drillLeakId } : null}
        open={!!drillLeakId}
        onClose={() => setDrillLeakId(null)}
        showBackButton={true}
        onBack={() => setDrillLeakId(null)}
      />
    </div>
  );
}

```

---

## `client/src/leaks/pages/ExecutiveBrief.tsx`

```tsx
// Leaks Domain
/**
 * ExecutiveBrief — الموجز التنفيذي
 * مربوط بـ dashboard.stats + leaks.list APIs
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, AlertTriangle, Shield, TrendingUp, Users, Building2, BarChart3, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function ExecutiveBrief() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: leaks = [], isLoading: leaksLoading } = trpc.leaks.list.useQuery();
  const isLoading = statsLoading || leaksLoading;

  const brief = useMemo(() => {
    if (!leaks.length) return null;
    const totalRecords = leaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0);
    const sevMap: Record<string, number> = {};
    const sectorMap: Record<string, number> = {};
    const recentLeaks = [...leaks].sort((a: any, b: any) => new Date(b.detectedAt || b.createdAt).getTime() - new Date(a.detectedAt || a.createdAt).getTime()).slice(0, 5);
    leaks.forEach((l: any) => {
      sevMap[l.severity] = (sevMap[l.severity] || 0) + 1;
      const s = l.sectorAr || l.sector || "غير محدد";
      sectorMap[s] = (sectorMap[s] || 0) + 1;
    });
    const severity = Object.entries(sevMap).map(([name, count]) => ({ name: name === "critical" ? "واسع النطاق" : name === "high" ? "عالي" : name === "medium" ? "متوسط" : "منخفض", count }));
    const topSectors = Object.entries(sectorMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    return { totalLeaks: leaks.length, totalRecords, severity, topSectors, recentLeaks };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div className="flex items-center gap-3"><FileText className="h-8 w-8 text-blue-400" /><div><h1 className="text-2xl font-bold text-foreground">الموجز التنفيذي</h1><p className="text-muted-foreground text-sm">ملخص شامل لحالة أمن البيانات</p></div></div>
      {brief && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{brief.totalLeaks}</div><div className="text-xs text-muted-foreground">إجمالي حالات الرصد</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30"><CardContent className="p-4 text-center"><Users className="h-6 w-6 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{brief.totalRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-muted-foreground">سجلات متأثرة</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30"><CardContent className="p-4 text-center"><Building2 className="h-6 w-6 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{brief.topSectors.length}</div><div className="text-xs text-muted-foreground">قطاعات متأثرة</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30"><CardContent className="p-4 text-center"><Shield className="h-6 w-6 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{brief.severity.find(s => s.name === "واسع النطاق")?.count || 0}</div><div className="text-xs text-muted-foreground">حالات رصد واسعة النطاق</div></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card gold-sweep">
              <CardHeader><CardTitle className="text-foreground text-base">توزيع التأثير</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={brief.severity} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {brief.severity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardHeader><CardTitle className="text-foreground text-base">أكثر القطاعات تأثراً</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={brief.topSectors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card className="glass-card gold-sweep">
            <CardHeader><CardTitle className="text-foreground text-base">آخر حالات الرصد</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {brief.recentLeaks.map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-lg bg-gray-900/30 border border-border/50">
                    <div>
                      <p className="text-foreground font-medium text-sm">{l.titleAr || l.title}</p>
                      <p className="text-muted-foreground text-xs mt-1">{l.sectorAr || l.sector} • {l.organizationAr || l.organization}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={l.severity === "critical" ? "bg-red-500/20 text-red-400" : l.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}>
                        {l.severity === "critical" ? "واسع النطاق" : l.severity === "high" ? "عالي" : l.severity === "medium" ? "متوسط" : "منخفض"}
                      </Badge>
                      <span className="text-muted-foreground text-xs">{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/FeedbackAccuracy.tsx`

```tsx
// Leaks Domain
/**
 * FeedbackAccuracy — Analyst feedback and self-learning accuracy metrics
 * Precision, Recall, F1 Score tracking
 */
import { motion } from "framer-motion";
import {
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  Loader2,
  Brain,
  Activity,
  Gauge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const classLabels: Record<string, { label: string; color: string }> = {
  personal_data: { label: "بيانات شخصية", color: "text-red-400" },
  cybersecurity: { label: "أمن سيبراني", color: "text-amber-400" },
  clean: { label: "نظيف", color: "text-emerald-400" },
  unknown: { label: "غير محدد", color: "text-muted-foreground" },
};

export default function FeedbackAccuracy() {
  const { data: stats, isLoading: statsLoading } = trpc.feedback.stats.useQuery();
  const { data: entries, isLoading: entriesLoading } = trpc.feedback.list.useQuery();

  const isLoading = statsLoading || entriesLoading;

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">مقاييس الدقة والتعلم</h1>
              <p className="text-xs text-muted-foreground">Feedback & Accuracy Metrics</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            نظام التعلم الذاتي — ملاحظات المحللين تحسّن دقة النظام تلقائياً
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "إجمالي التقييمات", value: stats?.total || 0, icon: BarChart3, color: "text-primary" },
              { label: "تصنيفات صحيحة", value: stats?.correct || 0, icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Precision", value: `${stats?.precision || 0}%`, icon: Target, color: "text-cyan-400", subtitle: "الدقة" },
              { label: "Recall", value: `${stats?.recall || 0}%`, icon: Activity, color: "text-violet-400", subtitle: "الاستدعاء" },
              { label: "F1 Score", value: `${stats?.f1 || 0}%`, icon: Gauge, color: "text-amber-400", subtitle: "المقياس المتوازن" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gauge Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Precision (الدقة)", value: stats?.precision || 0, description: "نسبة حالات الرصد المكتشفة الصحيحة من إجمالي ما أعلنه النظام", color: "text-cyan-400", bg: "bg-cyan-500" },
              { label: "Recall (الاستدعاء)", value: stats?.recall || 0, description: "نسبة حالات الرصد الحقيقية التي اكتشفها النظام", color: "text-violet-400", bg: "bg-violet-500" },
              { label: "F1 Score", value: stats?.f1 || 0, description: "المتوسط التوافقي بين الدقة والاستدعاء", color: "text-amber-400", bg: "bg-amber-500" },
            ].map((metric) => (
              <Card key={metric.label} className="border-border">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-foreground mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-foreground">{metric.value}%</p>
                  </div>
                  <div className="w-full h-3 rounded-full bg-secondary/50 overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${metric.bg}`}
                    />
                  </div>
                  <p className="text-xs sm:text-[10px] text-muted-foreground text-center">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feedback Entries */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                سجل ملاحظات المحللين ({entries?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!entries || entries.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد ملاحظات بعد</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">حالة الرصد</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">تصنيف النظام</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">تصنيف المحلل</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">النتيجة</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">المحلل</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.slice(0, 20).map((entry) => {
                        const sysClass = classLabels[entry.systemClassification] || classLabels.unknown;
                        const analystClass = classLabels[entry.analystClassification] || classLabels.unknown;
                        return (
                          <tr key={entry.id} className="border-b border-border/50 hover:bg-secondary/20">
                            <td className="py-2 px-3">
                              <code className="text-xs font-mono text-primary">{entry.feedbackLeakId}</code>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`text-xs ${sysClass.color}`}>{sysClass.label}</span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`text-xs ${analystClass.color}`}>{analystClass.label}</span>
                            </td>
                            <td className="py-2 px-3">
                              {entry.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </td>
                            <td className="py-2 px-3 text-xs text-muted-foreground">{entry.userName || "—"}</td>
                            <td className="py-2 px-3 text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString("ar-SA")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/GeoAnalysis.tsx`

```tsx
// Leaks Domain
/**
 * GeoAnalysis — التحليل الجغرافي
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Globe, AlertTriangle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function GeoAnalysis() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { regions: [], countries: [], total: 0 };
    const regionMap: Record<string, { count: number; records: number }> = {};
    const countryMap: Record<string, { count: number; records: number }> = {};
    leaks.forEach((l: any) => {
      const r = l.regionAr || l.region || "غير محدد";
      const c = l.countryAr || l.country || "غير محدد";
      if (!regionMap[r]) regionMap[r] = { count: 0, records: 0 };
      regionMap[r].count++; regionMap[r].records += l.recordCount || 0;
      if (!countryMap[c]) countryMap[c] = { count: 0, records: 0 };
      countryMap[c].count++; countryMap[c].records += l.recordCount || 0;
    });
    return {
      regions: Object.entries(regionMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count),
      countries: Object.entries(countryMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count),
      total: leaks.length,
    };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">التحليل الجغرافي</h1><p className="text-muted-foreground text-sm mt-1">التوزيع الجغرافي لحالات الرصد</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.regions.length}</div><div className="text-xs text-muted-foreground">منطقة متأثرة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.countries.length}</div><div className="text-xs text-muted-foreground">دولة متأثرة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">إجمالي حالات الرصد</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">حالات الرصد حسب المنطقة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.regions.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">التوزيع حسب الدولة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.countries.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.countries.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل المناطق</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-right text-muted-foreground p-2">المنطقة</th><th className="text-center text-muted-foreground p-2">حالات الرصد</th><th className="text-center text-muted-foreground p-2">السجلات المتأثرة</th><th className="text-center text-muted-foreground p-2">النسبة</th></tr></thead>
              <tbody>
                {analysis.regions.map((r, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{r.name}</td>
                    <td className="p-2 text-center text-foreground">{r.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{r.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-blue-500/20 text-blue-400">{analysis.total ? ((r.count / analysis.total) * 100).toFixed(1) : 0}%</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/leaks/pages/ImpactAssessment.tsx`

```tsx
// Leaks Domain
/**
 * ImpactAssessment — تقييم الأثر
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, Users, Shield, BarChart3, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function ImpactAssessment() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { severity: [], totalRecords: 0, avgRecords: 0, topImpact: [] };
    const sevMap: Record<string, { count: number; records: number }> = {};
    let totalRecords = 0;
    leaks.forEach((l: any) => {
      const s = l.severity || "unknown";
      if (!sevMap[s]) sevMap[s] = { count: 0, records: 0 };
      sevMap[s].count++;
      sevMap[s].records += l.recordCount || 0;
      totalRecords += l.recordCount || 0;
    });
    const severity = Object.entries(sevMap).map(([name, d]) => ({ name: name === "critical" ? "واسع النطاق" : name === "high" ? "عالي" : name === "medium" ? "متوسط" : "منخفض", ...d }));
    const topImpact = [...leaks].sort((a: any, b: any) => (b.recordCount || 0) - (a.recordCount || 0)).slice(0, 10);
    return { severity, totalRecords, avgRecords: Math.round(totalRecords / leaks.length), topImpact };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">تقييم الأثر</h1><p className="text-muted-foreground text-sm mt-1">تحليل حجم وتأثير حالات الرصد</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Users className="h-6 w-6 text-red-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{analysis.totalRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-muted-foreground">إجمالي السجلات المتأثرة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{analysis.avgRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-muted-foreground">متوسط السجلات المكشوفة لكل حالة رصد</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-amber-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{leaks.length}</div><div className="text-xs text-muted-foreground">إجمالي حالات الرصد</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{analysis.topImpact[0]?.recordCount?.toLocaleString("ar-SA") || 0}</div><div className="text-xs text-muted-foreground">أكبر حالة رصد</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">توزيع التأثير</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.severity} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.severity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">السجلات حسب التأثير</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.severity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="records" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">أكبر 10 حالات رصد تأثيراً</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-right text-muted-foreground p-2">#</th><th className="text-right text-muted-foreground p-2">حالة الرصد</th><th className="text-center text-muted-foreground p-2">السجلات</th><th className="text-center text-muted-foreground p-2">القطاع</th><th className="text-center text-muted-foreground p-2">التأثير</th></tr></thead>
              <tbody>
                {analysis.topImpact.map((l: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-muted-foreground">{i + 1}</td>
                    <td className="p-2 text-foreground font-medium">{l.titleAr || l.title}</td>
                    <td className="p-2 text-center text-red-400 font-bold">{(l.recordCount || 0).toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center text-muted-foreground">{l.sectorAr || l.sector}</td>
                    <td className="p-2 text-center"><Badge className={l.severity === "critical" ? "bg-red-500/20 text-red-400" : l.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}>{l.severity === "critical" ? "واسع النطاق" : l.severity === "high" ? "عالي" : l.severity === "medium" ? "متوسط" : "منخفض"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/leaks/pages/IncidentCompare.tsx`

```tsx
// Leaks Domain
/**
 * IncidentCompare — مقارنة حالات الرصد
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GitCompare, Plus, X, AlertTriangle } from "lucide-react";

const severityLabels: Record<string, string> = { critical: "واسع النطاق", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-gray-500/20 text-muted-foreground" };

export default function IncidentCompare() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (idx: number) => {
    setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : prev.length < 4 ? [...prev, idx] : prev);
  };

  const compared = useMemo(() => selected.map(i => leaks[i]).filter(Boolean), [selected, leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  const fields = [
    { key: "severity", label: "التأثير", render: (l: any) => <Badge className={severityColors[l.severity]}>{severityLabels[l.severity] || l.severity}</Badge> },
    { key: "recordCount", label: "السجلات المكشوفة", render: (l: any) => <span className="text-red-400 font-bold">{(l.recordCount || 0).toLocaleString("ar-SA")}</span> },
    { key: "sector", label: "القطاع", render: (l: any) => <span>{l.sectorAr || l.sector || "---"}</span> },
    { key: "organization", label: "المنظمة", render: (l: any) => <span>{l.organizationAr || l.organization || "---"}</span> },
    { key: "source", label: "المصدر", render: (l: any) => <span>{l.sourceAr || l.source || "---"}</span> },
    { key: "threatActor", label: "الجهة المهددة", render: (l: any) => <span>{l.threatActorAr || l.threatActor || "---"}</span> },
    { key: "leakType", label: "نوع حالة الرصد", render: (l: any) => <span>{l.leakTypeAr || l.leakType || "---"}</span> },
    { key: "region", label: "المنطقة", render: (l: any) => <span>{l.regionAr || l.region || "---"}</span> },
    { key: "detectedAt", label: "تاريخ الاكتشاف", render: (l: any) => <span>{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : "---"}</span> },
  ];

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">مقارنة حالات الرصد</h1><p className="text-muted-foreground text-sm mt-1">اختر حتى 4 حالات رصد للمقارنة</p></div>
      {compared.length >= 2 && (
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base flex items-center gap-2"><GitCompare className="h-5 w-5 text-blue-400" />جدول المقارنة</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right text-muted-foreground p-2 w-32">الحقل</th>
                    {compared.map((l: any, i: number) => <th key={i} className="text-center text-foreground p-2 min-w-[180px]">{(l.titleAr || l.title || "").substring(0, 30)}<Button variant="ghost" size="sm" className="text-red-400 mr-1" onClick={() => toggle(selected[i])}><X className="h-3 w-3" /></Button></th>)}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="p-2 text-muted-foreground font-medium">{f.label}</td>
                      {compared.map((l: any, j: number) => <td key={j} className="p-2 text-center text-foreground">{f.render(l)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        <h3 className="text-foreground font-medium">اختر حالات الرصد ({selected.length}/4)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-auto">
          {leaks.slice(0, 50).map((l: any, i: number) => (
            <button key={i} onClick={() => toggle(i)} className={`p-3 rounded-lg border text-right transition-all ${selected.includes(i) ? "border-blue-500 bg-blue-500/10" : "border-border bg-card/30 hover:bg-card/50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-medium">{(l.titleAr || l.title || "").substring(0, 50)}</span>
                <Badge className={severityColors[l.severity]}>{severityLabels[l.severity]}</Badge>
              </div>
              <p className="text-muted-foreground text-xs mt-1">{l.sectorAr || l.sector} • {(l.recordCount || 0).toLocaleString("ar-SA")} (مكشوف)</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

```

---

## `client/src/leaks/pages/IncidentDetails.tsx`

```tsx
// Leaks Domain
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useParams } from "wouter";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function IncidentDetails() {
  const params = useParams<{ incidentId: string }>();
  const incidentId = parseInt(params.incidentId || "0");
  const [, setLocation] = useLocation();

  const { data: incident, isLoading } = trpc.incidents.byId.useQuery({ id: incidentId });
  const { data: datasets } = trpc.incidents.datasets.useQuery({ incidentId });

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">حالة الرصد غير موجودة</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/incidents/list")}>
          العودة للوقائع
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/app/incidents/list")}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{incident.title || "حالة رصد"}</h1>
          <p className="text-sm text-muted-foreground">{incident.referenceNumber || ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 gold-edge">
          <p className="text-sm text-muted-foreground mb-1">الحالة</p>
          <Badge variant={incident.status === "confirmed" ? "destructive" : incident.status === "closed" ? "default" : "secondary"}>
            {incident.status || "—"}
          </Badge>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">الحساسية</p>
          <p className="font-medium">{incident.sensitivityLevel || "—"}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">تقدير الحجم</p>
          <p className="font-medium">{incident.estimatedRecords?.toLocaleString("ar-SA") || "—"}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">تاريخ الاكتشاف</p>
          <p className="font-medium">{incident.discoveredAt ? new Date(incident.discoveredAt).toLocaleDateString("ar-SA") : "—"}</p>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="summary">ملخص</TabsTrigger>
          <TabsTrigger value="datasets">فئات البيانات</TabsTrigger>
          <TabsTrigger value="impact">الأثر</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الجهة المتأثرة</p>
                <p className="font-medium">{incident.entityNameAr || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">القطاع</p>
                <p className="font-medium">{incident.sector || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مستوى الأثر</p>
                <p className="font-medium">{incident.impactLevel || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المصدر</p>
                <p className="font-medium">{incident.source || "—"}</p>
              </div>
            </div>
            {incident.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">الوصف</p>
                <p className="text-sm">{incident.description}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="datasets" className="mt-4">
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-right">فئة البيانات</TableHead>
                  <TableHead className="text-right">العدد التقديري</TableHead>
                  <TableHead className="text-right">الحساسية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!datasets || datasets.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      لا توجد فئات بيانات
                    </TableCell>
                  </TableRow>
                ) : (
                  datasets.map((ds: any) => (
                    <TableRow key={ds.id} className="border-border/20">
                      <TableCell className="font-medium">{ds.categoryNameAr || ds.categoryNameEn || "—"}</TableCell>
                      <TableCell>{ds.estimatedCount?.toLocaleString("ar-SA") || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={ds.sensitivityLevel === "high" ? "destructive" : "secondary"}>
                          {ds.sensitivityLevel || "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="mt-4">
          <div className="glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">مستوى الأثر</p>
                <p className="font-medium text-lg">{incident.impactLevel || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي السجلات المكشوفة</p>
                <p className="font-medium text-lg">{incident.estimatedRecords?.toLocaleString("ar-SA") || "—"}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

---

## `client/src/leaks/pages/IncidentsDashboard.tsx`

```tsx
// Leaks Domain
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, Database, TrendingUp } from "lucide-react";

export default function IncidentsDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.incidents.stats.useQuery();

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <h1 className="text-2xl font-bold">لوحة حالات الرصد</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statusCards = [
    { label: "إجمالي حالات الرصد", value: stats?.total ?? 0, icon: AlertTriangle, color: "text-orange-400", bgColor: "bg-orange-400/10", filter: "" },
    { label: "قيد التحقق", value: stats?.investigating ?? 0, icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-400/10", filter: "investigating" },
    { label: "تسرب مُدّعى", value: stats?.confirmed ?? 0, icon: ShieldAlert, color: "text-red-400", bgColor: "bg-red-400/10", filter: "confirmed" },
    { label: "مغلقة", value: stats?.closed ?? 0, icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-400/10", filter: "closed" },
  ];

  const impactCards = [
    { label: "محتواة", value: stats?.contained ?? 0, icon: AlertTriangle, color: "text-purple-400", bgColor: "bg-purple-400/10", param: "status=contained" },
    { label: "تم الحل", value: stats?.resolved ?? 0, icon: TrendingUp, color: "text-teal-400", bgColor: "bg-teal-400/10", param: "status=resolved" },
    { label: "تقدير السجلات", value: stats?.totalEstimatedRecords ?? 0, icon: Database, color: "text-blue-400", bgColor: "bg-blue-400/10", param: "" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap">
        <h1 className="text-2xl font-bold">لوحة حالات الرصد</h1>
        <Badge variant="outline" className="text-gold border-gold/30">حالات الرصد</Badge>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">توزيع حالات الرصد</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={() => setLocation(`/app/incidents/list${card.filter ? `?status=${card.filter}` : ""}`)}
            >
              <div className="flex items-center justify-between flex-wrap mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value.toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">مستوى الأثر</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {impactCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={() => setLocation(`/app/incidents/list?${card.param}`)}
            >
              <div className="flex items-center justify-between flex-wrap mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value.toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

```

---

## `client/src/leaks/pages/IncidentsList.tsx`

```tsx
// Leaks Domain
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useSearch } from "wouter";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  investigating: { label: "قيد التحقق", variant: "secondary" },
  confirmed: { label: "تسرب مدعى", variant: "destructive" },
  contained: { label: "محتواة", variant: "outline" },
  resolved: { label: "تم الحل", variant: "default" },
  closed: { label: "مغلقة", variant: "default" },
};

export default function IncidentsList() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const statusFilter = params.get("status") || undefined;
  const [search, setSearch] = useState("");

  const { data: incidents, isLoading } = trpc.incidents.list.useQuery({
    status: statusFilter,
    search: search || undefined,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <h1 className="text-2xl font-bold">حالات الرصد</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">حالات الرصد</h1>
        {statusFilter && (
          <Badge variant="outline" className="text-gold border-gold/30">
            تصفية: {statusMap[statusFilter]?.label || statusFilter}
          </Badge>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في حالات الرصد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        {statusFilter && (
          <Button variant="outline" onClick={() => setLocation("/app/incidents/list")}>
            إزالة التصفية
          </Button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right">عنوان حالة الرصد</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الحساسية</TableHead>
              <TableHead className="text-right">تقدير الحجم</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!incidents || incidents.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  لا توجد وقائع مطابقة
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((inc: any) => (
                <TableRow
                  key={inc.id}
                  className="cursor-pointer border-border/20 hover:bg-accent/50"
                  onClick={() => setLocation(`/app/incidents/${inc.id}`)}
                >
                  <TableCell className="font-medium">{inc.title || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[inc.status]?.variant || "outline"}>
                      {statusMap[inc.status]?.label || inc.status || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{inc.sensitivityLevel || "—"}</TableCell>
                  <TableCell>{inc.estimatedRecords?.toLocaleString("ar-SA") || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inc.discoveredAt ? new Date(inc.discoveredAt).toLocaleDateString("ar-SA") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

```

---

## `client/src/leaks/pages/IncidentsRegistry.tsx`

```tsx
// Leaks Domain
/**
 * IncidentsRegistry — سجل حالات الرصد
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Shield, FileText, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const severityLabels: Record<string, string> = { critical: "واسع النطاق", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-gray-500/20 text-muted-foreground" };

export default function IncidentsRegistry() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    let result = [...leaks];
    if (search) result = result.filter((l: any) => (l.titleAr || l.title || "").includes(search) || (l.organizationAr || l.organization || "").includes(search) || (l.sectorAr || l.sector || "").includes(search));
    if (sevFilter !== "all") result = result.filter((l: any) => l.severity === sevFilter);
    return result.sort((a: any, b: any) => new Date(b.detectedAt || b.createdAt).getTime() - new Date(a.detectedAt || a.createdAt).getTime());
  }, [leaks, search, sevFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">سجل حالات الرصد</h1><p className="text-muted-foreground text-sm mt-1">قائمة شاملة بجميع حالات الرصد</p></div>
        <Badge className="bg-gray-700 text-muted-foreground text-lg px-4 py-2">{filtered.length} حالة رصد</Badge>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="بحث..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="glass-card gold-sweep text-foreground max-w-xs" />
        <div className="flex gap-1">
          {["all", "critical", "high", "medium", "low"].map(f => (
            <button key={f} onClick={() => { setSevFilter(f); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs ${sevFilter === f ? "bg-blue-600 text-foreground" : "bg-card text-muted-foreground hover:bg-gray-700"}`}>
              {f === "all" ? "الكل" : severityLabels[f]}
            </button>
          ))}
        </div>
      </div>
      <Card className="glass-card gold-sweep">
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-gray-900/50">
                <th className="text-right text-muted-foreground p-3">حالة الرصد</th>
                <th className="text-center text-muted-foreground p-3">التأثير</th>
                <th className="text-center text-muted-foreground p-3">القطاع</th>
                <th className="text-center text-muted-foreground p-3">المنظمة</th>
                <th className="text-center text-muted-foreground p-3">السجلات</th>
                <th className="text-center text-muted-foreground p-3">التاريخ</th>
              </tr></thead>
              <tbody>
                {paged.map((l: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-3 text-foreground font-medium max-w-xs truncate">{l.titleAr || l.title}</td>
                    <td className="p-3 text-center"><Badge className={severityColors[l.severity]}>{severityLabels[l.severity]}</Badge></td>
                    <td className="p-3 text-center text-muted-foreground">{l.sectorAr || l.sector || "---"}</td>
                    <td className="p-3 text-center text-muted-foreground">{(l.organizationAr || l.organization || "---").substring(0, 25)}</td>
                    <td className="p-3 text-center text-red-400 font-bold">{(l.recordCount || 0).toLocaleString("ar-SA")}</td>
                    <td className="p-3 text-center text-muted-foreground text-xs">{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border-border text-muted-foreground"><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-muted-foreground text-sm">صفحة {page} من {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-border text-muted-foreground"><ChevronLeft className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/KnowledgeGraph.tsx`

```tsx
// Leaks Domain
/**
 * KnowledgeGraph — Threat Intelligence Entity Relationship Visualization
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Network,
  Loader2,
  Filter,
  Database,
  Users,
  Building2,
  Globe,
  Shield,
  AlertTriangle,
  Link2,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const nodeTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  leak: { label: "حالة رصد", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
  seller: { label: "بائع", icon: Users, color: "text-amber-400", bg: "bg-amber-500/20" },
  entity: { label: "جهة", icon: Building2, color: "text-blue-400", bg: "bg-blue-500/20" },
  sector: { label: "قطاع", icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  pii_type: { label: "نوع PII", icon: Shield, color: "text-violet-400", bg: "bg-violet-500/20" },
  platform: { label: "منصة", icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/20" },
  campaign: { label: "حملة", icon: Network, color: "text-pink-400", bg: "bg-pink-500/20" },
};

export default function KnowledgeGraph() {
  const [filterType, setFilterType] = useState("all");

  const { data, isLoading } = trpc.knowledgeGraph.data.useQuery();

  const filteredNodes = useMemo(() => {
    if (!data?.nodes) return [];
    if (filterType === "all") return data.nodes;
    return data.nodes.filter(n => n.nodeType === filterType);
  }, [data?.nodes, filterType]);

  const filteredEdges = useMemo(() => {
    if (!data?.edges) return [];
    const nodeIds = new Set(filteredNodes.map(n => n.nodeId));
    if (filterType === "all") return data.edges;
    return data.edges.filter(e => nodeIds.has(e.sourceNodeId) || nodeIds.has(e.targetNodeId));
  }, [data?.edges, filteredNodes, filterType]);

  const stats = useMemo(() => {
    if (!data) return { nodes: 0, edges: 0, types: {} as Record<string, number> };
    const types: Record<string, number> = {};
    data.nodes.forEach(n => { types[n.nodeType] = (types[n.nodeType] || 0) + 1; });
    return { nodes: data.nodes.length, edges: data.edges.length, types };
  }, [data]);

  // Build adjacency for display
  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof filteredNodes[0]>();
    filteredNodes.forEach(n => map.set(n.nodeId, n));
    return map;
  }, [filteredNodes]);

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-pink-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Network className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">رسم المعرفة</h1>
              <p className="text-xs text-muted-foreground">Knowledge Graph — Threat Intelligence</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            شبكة العلاقات بين حالات الرصد والبائعين والجهات والقطاعات — تحليل الروابط والأنماط
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.nodes}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">عقد (Nodes)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Link2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.edges}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">علاقات (Edges)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{Object.keys(stats.types).length}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">أنواع العقد</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Network className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {stats.nodes > 0 ? (stats.edges / stats.nodes).toFixed(1) : "0"}
                </p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">كثافة الشبكة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">توزيع أنواع العقد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(nodeTypeConfig).map(([type, config]) => {
              const count = stats.types[type] || 0;
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(filterType === type ? "all" : type)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    filterType === type ? "border-primary bg-primary/5" : "border-border bg-secondary/20 hover:border-primary/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{count}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{config.nodeLabel}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Nodes List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Edges / Relationships */}
          {filteredEdges.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  العلاقات ({filteredEdges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredEdges.map((edge, i) => {
                    const source = nodeMap.get(edge.sourceNodeId);
                    const target = nodeMap.get(edge.targetNodeId);
                    const sourceConfig = source ? nodeTypeConfig[source.nodeType] : null;
                    const targetConfig = target ? nodeTypeConfig[target.nodeType] : null;
                    return (
                      <motion.div
                        key={edge.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10 border border-border text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          {sourceConfig && <sourceConfig.icon className={`w-3 h-3 ${sourceConfig.color}`} />}
                          <span className="font-medium text-foreground">{source?.labelAr || source?.label || edge.sourceNodeId}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="h-px flex-1 bg-border" />
                          <Badge variant="outline" className="text-xs sm:text-[10px] mx-2 bg-secondary/30">
                            {edge.relationshipAr || edge.edgeRelationship}
                          </Badge>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {targetConfig && <targetConfig.icon className={`w-3 h-3 ${targetConfig.color}`} />}
                          <span className="font-medium text-foreground">{target?.labelAr || target?.label || edge.targetNodeId}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredNodes.map((node, i) => {
              const config = nodeTypeConfig[node.nodeType] || nodeTypeConfig.entity;
              const Icon = config.icon;
              const connections = (data?.edges || []).filter(
                e => e.sourceNodeId === node.nodeId || e.targetNodeId === node.nodeId
              ).length;
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate">{node.labelAr || node.nodeLabel}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs sm:text-[10px]">{config.nodeLabel}</Badge>
                            <span className="text-xs sm:text-[10px] text-muted-foreground">{connections} علاقة</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/LeakAnatomy.tsx`

```tsx
// Leaks Domain
/**
 * LeakAnatomy — تشريح حالة الرصد
 * مربوط بـ leaks.list API - عرض تفصيلي لحالة رصد واحدة
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Shield, Users, Calendar, Building2, Globe, Fingerprint, ChevronLeft, ChevronRight } from "lucide-react";

const severityLabels: Record<string, string> = { critical: "واسع النطاق", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400 border-red-500/30", high: "bg-amber-500/20 text-amber-400 border-amber-500/30", medium: "bg-blue-500/20 text-blue-400 border-blue-500/30", low: "bg-gray-500/20 text-muted-foreground border-gray-500/30" };

export default function LeakAnatomy() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return leaks;
    return leaks.filter((l: any) => (l.titleAr || l.title || "").includes(search) || (l.organizationAr || l.organization || "").includes(search));
  }, [leaks, search]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  const leak: any = filtered[selectedIndex] || null;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">تشريح حالة الرصد</h1><p className="text-muted-foreground text-sm mt-1">عرض تفصيلي لكل حالة رصد</p></div>
      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="بحث عن حالة رصد..." value={search} onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }} className="glass-card gold-sweep text-foreground max-w-xs" />
        <Badge className="bg-gray-700 text-muted-foreground">{filtered.length} حالة رصد</Badge>
        <div className="flex items-center gap-1 mr-auto">
          <Button variant="outline" size="sm" disabled={selectedIndex <= 0} onClick={() => setSelectedIndex(i => i - 1)} className="border-border text-muted-foreground"><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-muted-foreground text-sm px-2">{selectedIndex + 1} / {filtered.length}</span>
          <Button variant="outline" size="sm" disabled={selectedIndex >= filtered.length - 1} onClick={() => setSelectedIndex(i => i + 1)} className="border-border text-muted-foreground"><ChevronLeft className="h-4 w-4" /></Button>
        </div>
      </div>
      {leak ? (
        <div className="space-y-4">
          <Card className="glass-card gold-sweep">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">{leak.titleAr || leak.title}</h2>
                  <p className="text-muted-foreground text-sm">{leak.descriptionAr || leak.description || "لا يوجد وصف"}</p>
                </div>
                <Badge className={`text-lg px-4 py-2 ${severityColors[leak.severity] || "bg-gray-500/20 text-muted-foreground"}`}>{severityLabels[leak.severity] || leak.severity}</Badge>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card gold-sweep"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-red-400" /><span className="text-muted-foreground text-sm">السجلات المكشوفة</span></div><p className="text-2xl font-bold text-foreground">{(leak.recordCount || 0).toLocaleString("ar-SA")}</p></CardContent></Card>
            <Card className="glass-card gold-sweep"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Building2 className="h-5 w-5 text-blue-400" /><span className="text-muted-foreground text-sm">المنظمة</span></div><p className="text-lg font-bold text-foreground">{leak.organizationAr || leak.organization || "---"}</p></CardContent></Card>
            <Card className="glass-card gold-sweep"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Shield className="h-5 w-5 text-purple-400" /><span className="text-muted-foreground text-sm">القطاع</span></div><p className="text-lg font-bold text-foreground">{leak.sectorAr || leak.sector || "---"}</p></CardContent></Card>
            <Card className="glass-card gold-sweep"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Calendar className="h-5 w-5 text-emerald-400" /><span className="text-muted-foreground text-sm">تاريخ الاكتشاف</span></div><p className="text-lg font-bold text-foreground">{leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA") : "---"}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card gold-sweep">
              <CardHeader><CardTitle className="text-foreground text-base">معلومات إضافية</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "المصدر", value: leak.sourceAr || leak.source },
                  { label: "نوع حالة الرصد", value: leak.leakTypeAr || leak.leakType },
                  { label: "الجهة المهددة", value: leak.threatActorAr || leak.threatActor },
                  { label: "المنطقة", value: leak.regionAr || leak.region },
                  { label: "الدولة", value: leak.countryAr || leak.country },
                  { label: "الحالة", value: leak.statusAr || leak.status },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between p-2 rounded bg-gray-900/30">
                    <span className="text-muted-foreground text-sm">{item.label}</span>
                    <span className="text-foreground text-sm font-medium">{item.value || "---"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardHeader><CardTitle className="text-foreground text-base">البيانات الشخصية المكتشفة</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(leak.piiTypesAr || leak.piiTypes) ? (leak.piiTypesAr || leak.piiTypes) : typeof (leak.piiTypesAr || leak.piiTypes) === "string" ? (leak.piiTypesAr || leak.piiTypes).split(",") : []).map((t: string, i: number) => (
                    <Badge key={i} className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Fingerprint className="h-3 w-3 ml-1" />{t.trim()}</Badge>
                  ))}
                  {(!leak.piiTypesAr && !leak.piiTypes) && <p className="text-muted-foreground text-sm">لا توجد بيانات</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          {(leak.aiRecommendationsAr || leak.aiRecommendations) && (
            <Card className="glass-card gold-sweep">
              <CardHeader><CardTitle className="text-foreground text-base">توصيات الذكاء الاصطناعي</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{leak.aiRecommendationsAr || leak.aiRecommendations}</p></CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="glass-card gold-sweep"><CardContent className="p-12 text-center text-muted-foreground">لا توجد حالات رصد مطابقة</CardContent></Card>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/LeakTimeline.tsx`

```tsx
// Leaks Domain
/**
 * LeakTimeline — الخط الزمني لحالات الرصد
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const severityColors: Record<string, string> = { critical: "border-red-500 bg-red-500/10", high: "border-amber-500 bg-amber-500/10", medium: "border-blue-500 bg-blue-500/10", low: "border-gray-500 bg-gray-500/10" };
const severityLabels: Record<string, string> = { critical: "واسع النطاق", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityBadge: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-gray-500/20 text-muted-foreground" };

export default function LeakTimeline() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [filter, setFilter] = useState<string>("all");

  const { monthly, filtered, stats } = useMemo(() => {
    const sorted = [...leaks].sort((a: any, b: any) => new Date(b.detectedAt || b.createdAt).getTime() - new Date(a.detectedAt || a.createdAt).getTime());
    const fil = filter === "all" ? sorted : sorted.filter((l: any) => l.severity === filter);
    const monthMap: Record<string, number> = {};
    sorted.forEach((l: any) => {
      const d = new Date(l.detectedAt || l.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const monthly = Object.entries(monthMap).sort().map(([month, count]) => ({ month, count }));
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 7);
    return {
      monthly,
      filtered: fil,
      stats: {
        total: leaks.length,
        thisMonth: monthMap[thisMonth] || 0,
        lastMonth: monthMap[lastMonth] || 0,
        trend: (monthMap[thisMonth] || 0) - (monthMap[lastMonth] || 0),
      },
    };
  }, [leaks, filter]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">الخط الزمني لحالات الرصد</h1><p className="text-muted-foreground text-sm mt-1">تتبع حالات الرصد عبر الزمن</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Calendar className="h-6 w-6 text-blue-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{stats.total}</div><div className="text-xs text-muted-foreground">إجمالي حالات الرصد</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Clock className="h-6 w-6 text-emerald-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{stats.thisMonth}</div><div className="text-xs text-muted-foreground">هذا الشهر</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-amber-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{stats.lastMonth}</div><div className="text-xs text-muted-foreground">الشهر الماضي</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><TrendingUp className={`h-6 w-6 mx-auto mb-2 ${stats.trend > 0 ? "text-red-400" : "text-emerald-400"}`} /><div className={`text-xl font-bold ${stats.trend > 0 ? "text-red-400" : "text-emerald-400"}`}>{stats.trend > 0 ? "+" : ""}{stats.trend}</div><div className="text-xs text-muted-foreground">التغيير</div></CardContent></Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">اتجاه حالات الرصد الشهري</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="flex gap-2 flex-wrap">
        {["all", "critical", "high", "medium", "low"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === f ? "bg-blue-600 text-foreground" : "bg-card text-muted-foreground hover:bg-gray-700"}`}>
            {f === "all" ? "الكل" : severityLabels[f]} ({f === "all" ? leaks.length : leaks.filter((l: any) => l.severity === f).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.slice(0, 30).map((l: any, i: number) => (
          <div key={i} className={`p-4 rounded-lg border-r-4 border border-border/50 ${severityColors[l.severity] || "border-gray-500 bg-gray-500/10"}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-foreground font-medium text-sm">{l.titleAr || l.title}</p>
                <p className="text-muted-foreground text-xs mt-1">{l.sectorAr || l.sector} • {l.organizationAr || l.organization} • {l.recordCount?.toLocaleString("ar-SA")} (مكشوف)</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={severityBadge[l.severity] || "bg-gray-500/20 text-muted-foreground"}>{severityLabels[l.severity] || l.severity}</Badge>
                <span className="text-muted-foreground text-xs">{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : ""}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

```

---

## `client/src/leaks/pages/Leaks.tsx`

```tsx
// Leaks Domain
/**
 * Leaks — All leak records view with filtering, CSV export, and comprehensive detail modals
 * Uses tRPC API with evidence chain integration
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Search,
  Download,
  Eye,
  Send,
  Globe,
  FileText,
  Loader2,
  Brain,
  Sparkles,
  X,
  CheckCircle,
  AlertTriangle,
  Shield,
  Camera,
  Hash,
  MapPin,
  Calendar,
  User,
  Link2,
  Database,
  Lock,
  FileCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Fingerprint,
  DollarSign,
  Skull,
  Zap,
  Image as ImageIcon,
  Table,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import { toast } from "sonner";
import AnimatedCounter from "@/components/AnimatedCounter";


// Helper to safely parse JSON strings from DB
const parseJsonSafe = (v: any, fallback: any = []) => {
  if (!v) return fallback;
  if (typeof v === 'string') {
    try { const parsed = JSON.parse(v); return parsed || fallback; } catch { return fallback; }
  }
  return v;
};

const severityColor = (s: string) => {
  switch (s) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "high": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    default: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  }
};

const severityLabel = (s: string) => {
  switch (s) {
    case "critical": return "واسع النطاق";
    case "high": return "مرتفع التأثير";
    case "medium": return "متوسط التأثير";
    default: return "محدود التأثير";
  }
};

const sourceIcon = (s: string) => {
  switch (s) {
    case "telegram": return Send;
    case "darkweb": return Globe;
    default: return FileText;
  }
};

const sourceLabel = (s: string) => {
  switch (s) {
    case "telegram": return "تليجرام";
    case "darkweb": return "دارك ويب";
    default: return "موقع لصق";
  }
};

const sourceColor = (s: string) => {
  switch (s) {
    case "telegram": return "text-cyan-400 bg-cyan-500/10";
    case "darkweb": return "text-violet-400 bg-violet-500/10";
    default: return "text-amber-400 bg-amber-500/10";
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case "new": return "حالة رصد";
    case "analyzing": return "قيد التحقق";
    case "documented": return "حالة رصد موثقة";
    default: return "مغلق";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "new": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    case "analyzing": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "documented": return "text-violet-400 bg-violet-500/10 border-violet-500/30";
    default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  }
};

const evidenceTypeIcon = (t: string) => {
  switch (t) {
    case "screenshot": return Camera;
    case "text": return FileText;
    case "file": return FileCheck;
    case "metadata": return Database;
    default: return FileText;
  }
};

const evidenceTypeLabel = (t: string) => {
  switch (t) {
    case "screenshot": return "لقطة شاشة";
    case "text": return "نص";
    case "file": return "ملف";
    case "metadata": return "بيانات وصفية";
    default: return t;
  }
};

/* ─── Stats Detail Modal (with deep-drill) ─── */
function StatsDetailModal({ open, onClose, title, leaks }: { open: boolean; onClose: () => void; title: string; leaks: any[] }) {
  const [drillLeak, setDrillLeak] = useState<any>(null);
  if (!open) return null;
  return (
    <>
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border p-4 rounded-t-2xl flex items-center justify-between flex-wrap">
            <h3 className="text-foreground font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {leaks.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">لا توجد بيانات</p>}
            {leaks.map((leak) => (
              <div
                key={leak.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setDrillLeak(leak)}
              >
                <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border shrink-0 ${severityColor(leak.severity)}`}>
                  {severityLabel(leak.severity)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{leak.titleAr}</p>
                  <p className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">{leak.leakId} — {leak.sectorAr} — {leak.recordCount.toLocaleString()} (العدد المُدّعى)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border shrink-0 ${statusColor(leak.status)}`}>
                    {statusLabel(leak.status)}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    <LeakDetailDrilldown
      leak={drillLeak}
      open={!!drillLeak}
      onClose={() => setDrillLeak(null)}
      showBackButton={true}
      onBack={() => setDrillLeak(null)}
    />
    </>
  );
}

/* ─── Screenshot Lightbox ─── */
function ScreenshotLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="relative max-w-[95vw] sm:max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute -top-10 left-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>
        <img src={url} alt="Evidence Screenshot" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10 object-contain" />
      </motion.div>
    </motion.div>
  );
}

export default function Leaks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: leaks, isLoading } = trpc.leaks.list.useQuery({
    source: sourceFilter !== "all" ? sourceFilter : undefined,
    severity: severityFilter !== "all" ? severityFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  const { refetch: fetchExport } = trpc.leaks.exportCsv.useQuery(
    {
      source: sourceFilter !== "all" ? sourceFilter : undefined,
      severity: severityFilter !== "all" ? severityFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    { enabled: false }
  );

  const [selectedLeak, setSelectedLeak] = useState<string | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "samples" | "evidence" | "ai">("overview");
  const [statsModal, setStatsModal] = useState<{ title: string; leaks: any[] } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const utils = trpc.useUtils();

  // Fetch detail with evidence when a leak is selected
  const { data: leakDetail, isLoading: detailLoading } = trpc.leaks.detail.useQuery(
    { leakId: selectedLeak! },
    { enabled: !!selectedLeak }
  );

  const enrichMutation = trpc.enrichment.enrichLeak.useMutation({
    onSuccess: (result) => {
      toast.success(`تم إثراء حالة الرصد بنجاح (ثقة: ${result.aiConfidence}%)`);
      setEnrichingId(null);
      utils.leaks.list.invalidate();
      if (selectedLeak) utils.leaks.detail.invalidate({ leakId: selectedLeak });
    },
    onError: () => {
      toast.error("فشل إثراء حالة الرصد بالذكاء الاصطناعي");
      setEnrichingId(null);
    },
  });

  const handleEnrich = (leakId: string) => {
    setEnrichingId(leakId);
    enrichMutation.mutate({ leakId });
  };

  const allLeaks = leaks ?? [];

  const filteredLeaks = useMemo(() => {
    if (!searchQuery) return allLeaks;
    const q = searchQuery.toLowerCase();
    return allLeaks.filter(
      (leak) =>
        leak.titleAr.includes(q) ||
        leak.title.toLowerCase().includes(q) ||
        leak.leakId.toLowerCase().includes(q)
    );
  }, [allLeaks, searchQuery]);

  const handleExportCsv = async () => {
    try {
      const { data } = await fetchExport();
      if (data?.csv) {
        const blob = new Blob(["\uFEFF" + data.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("تم تصدير البيانات بنجاح");
      }
    } catch {
      toast.error("فشل تصدير البيانات");
    }
  };

  // Stats data for clickable cards
  const statsData = useMemo(() => [
    { label: "إجمالي حالات الرصد", value: allLeaks.length, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5", icon: ShieldAlert, filter: () => allLeaks },
    { label: "السجلات المكشوفة الإجمالي", value: allLeaks.filter((l) => l.severity === "critical").length, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5", icon: AlertTriangle, filter: () => allLeaks.filter((l) => l.severity === "critical") },
    { label: "قيد التحقق", value: allLeaks.filter((l) => l.status === "analyzing").length, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5", icon: Clock, filter: () => allLeaks.filter((l) => l.status === "analyzing") },
    { label: "مغلق", value: allLeaks.filter((l) => l.status === "reported").length, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5", icon: CheckCircle, filter: () => allLeaks.filter((l) => l.status === "reported") },
  ], [allLeaks]);

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header stats — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                className={`border ${stat.borderColor} ${stat.bgColor} cursor-pointer hover:scale-[1.03] transition-all duration-300 bg-white dark:bg-card dark:backdrop-blur-xl border-border dark:border-primary/12 hover:shadow-lg hover:shadow-primary/5 shadow-[0_1px_3px_rgba(100,80,180,0.04)] dark:shadow-none group relative overflow-hidden`}
                onClick={() => setStatsModal({ title: stat.label, leaks: stat.filter() })}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, transparent 40%, hsl(var(--primary) / 0.08) 50%, transparent 60%)', backgroundSize: '200% 200%', animation: 'shimmer 2s infinite' }} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between flex-wrap">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}><AnimatedCounter value={typeof stat.value === "number" ? stat.value : 0} /></p>
                    </div>
                    <motion.div whileHover={{ rotate: -10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Icon className={`w-8 h-8 ${stat.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                    </motion.div>
                  </div>
                  <p className="text-xs sm:text-[10px] text-muted-foreground mt-2 group-hover:text-primary/60 transition-colors">اضغط للتفاصيل ←</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-[rgba(22,33,70,0.6)] dark:backdrop-blur-xl border-border dark:border-border shadow-[0_1px_3px_rgba(100,80,180,0.04)] dark:shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في حالات الرصد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="التأثير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="critical">واسع النطاق</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="المصدر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المصادر</SelectItem>
                <SelectItem value="telegram">تليجرام</SelectItem>
                <SelectItem value="darkweb">دارك ويب</SelectItem>
                <SelectItem value="paste">موقع لصق</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="new">حالة رصد</SelectItem>
                <SelectItem value="analyzing">قيد التحقق</SelectItem>
                <SelectItem value="documented">موثّق</SelectItem>
                <SelectItem value="reported">مغلق</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportCsv} className="gap-2">
              <Download className="w-4 h-4" />
              تصدير CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leak List */}
      <div className="space-y-2">
        {filteredLeaks.map((leak, idx) => {
          const SourceIcon = sourceIcon(leak.source);
          return (
            <motion.div
              key={leak.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card
                className="bg-white dark:bg-card dark:backdrop-blur-xl border-border dark:border-primary/12 hover:border-primary/15 dark:hover:border-primary/30 dark:hover:bg-card cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 shadow-[0_1px_3px_rgba(100,80,180,0.04)] dark:shadow-none group relative overflow-hidden"
                onClick={() => { setSelectedLeak(leak.leakId); setActiveTab("overview"); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${severityColor(leak.severity)}`}>
                      {severityLabel(leak.severity)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{leak.titleAr}</p>
                      <p className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">
                        {leak.leakId} — {leak.sectorAr} — {leak.recordCount.toLocaleString()} (العدد المُدّعى)
                      </p>
                    </div>

                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs sm:text-[10px] ${sourceColor(leak.source)}`}>
                      <SourceIcon className="w-3 h-3" />
                      {sourceLabel(leak.source)}
                    </div>

                    <span className={`text-xs sm:text-[10px] px-2 py-1 rounded border ${statusColor(leak.status)} lg:w-24 text-center`}>
                      {statusLabel(leak.status)}
                    </span>

                    <span className="text-xs text-muted-foreground lg:w-24">
                      {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA") : "—"}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {leak.enrichedAt && (
                        <span className="text-xs sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); setSelectedLeak(leak.leakId); setActiveTab("overview"); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!leak.enrichedAt && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => { e.stopPropagation(); handleEnrich(leak.leakId); }}
                          disabled={enrichingId === leak.leakId}
                        >
                          {enrichingId === leak.leakId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Brain className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                    {parseJsonSafe(leak.piiTypes, []).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs sm:text-[10px] bg-primary/5 border-primary/20 text-primary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ Comprehensive Leak Detail Modal ═══ */}
      <AnimatePresence>
        {selectedLeak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedLeak(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading || !leakDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-muted-foreground mr-3">جاري تحميل التفاصيل...</span>
                </div>
              ) : (
                <>
                  {/* ── Modal Header ── */}
                  <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-5 rounded-t-2xl">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30">
                          <ShieldAlert className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-bold text-lg">{leakDetail.titleAr}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{leakDetail.leakId}</span>
                            <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${severityColor(leakDetail.severity)}`}>
                              {severityLabel(leakDetail.severity)}
                            </span>
                            <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${statusColor(leakDetail.status)}`}>
                              {statusLabel(leakDetail.status)}
                            </span>
                            {(leakDetail as any).threatActor && (
                              <span className="text-xs sm:text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                                <Skull className="w-3 h-3" /> {(leakDetail as any).threatActor}
                              </span>
                            )}
                            {(leakDetail as any).price && (
                              <span className="text-xs sm:text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> {(leakDetail as any).price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedLeak(null)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex gap-1 mt-4 bg-secondary/50 rounded-lg p-1">
                      {[
                        { key: "overview" as const, label: "نظرة عامة", icon: Eye },
                        { key: "samples" as const, label: `عينات البيانات (${((leakDetail as any).sampleData as any[] || []).length})`, icon: Table },
                        { key: "evidence" as const, label: `الأدلة (${(leakDetail.evidence?.length ?? 0) + ((leakDetail as any).screenshotUrls as any[] || []).length})`, icon: Shield },
                        { key: "ai" as const, label: "تحليل AI", icon: Brain },
                      ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                              activeTab === tab.key
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                          >
                            <TabIcon className="w-3.5 h-3.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === "overview" && (
                      <>
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs sm:text-[10px] text-muted-foreground">المصدر</p>
                            </div>
                            <div className={`flex items-center gap-1.5 ${sourceColor(leakDetail.source)}`}>
                              {(() => { const Icon = sourceIcon(leakDetail.source); return <Icon className="w-3.5 h-3.5" />; })()}
                              <span className="text-sm font-medium">{sourceLabel(leakDetail.source)}</span>
                            </div>
                            {(leakDetail as any).sourcePlatform && (
                              <p className="text-xs sm:text-[10px] text-muted-foreground mt-1">{(leakDetail as any).sourcePlatform}</p>
                            )}
                          </div>
                          <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/20" style={{ boxShadow: '0 0 12px rgba(239, 68, 68, 0.08)' }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Eye className="w-3 h-3 text-red-400" />
                              <p className="text-xs sm:text-[10px] text-red-400 font-semibold">السجلات المكشوفة (العينات المتاحة)</p>
                            </div>
                            <p className="text-sm font-bold text-red-400">{((leakDetail as any).totalSampleRecords || 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Database className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs sm:text-[10px] text-muted-foreground">العدد المُدّعى</p>
                            </div>
                            <p className="text-sm font-bold text-emerald-400">{leakDetail.recordCount.toLocaleString()}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Zap className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs sm:text-[10px] text-muted-foreground">طريقة الوصول المُدّعاة</p>
                            </div>
                            <p className="text-sm text-foreground font-medium">{(leakDetail as any).breachMethodAr || "غير محدد"}</p>
                            {(leakDetail as any).breachMethod && (
                              <p className="text-xs sm:text-[10px] text-muted-foreground mt-0.5 font-mono" dir="ltr">{(leakDetail as any).breachMethod}</p>
                            )}
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs sm:text-[10px] text-muted-foreground">تاريخ الاكتشاف</p>
                            </div>
                            <p className="text-sm text-foreground">{leakDetail.detectedAt ? new Date(leakDetail.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
                          </div>
                        </div>

                        {/* Threat Actor & Source Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Threat Actor Card */}
                          <div className="bg-gradient-to-br from-red-500/5 to-red-500/10 rounded-xl p-4 border border-red-500/20">
                            <h4 className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-1.5">
                              <Skull className="w-3.5 h-3.5" />
                              معلومات المهاجم / البائع
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between flex-wrap">
                                <span className="text-xs text-muted-foreground">الاسم المستعار</span>
                                <span className="text-sm font-mono text-red-400 font-bold">{(leakDetail as any).threatActor || "مجهول"}</span>
                              </div>
                              <div className="flex items-center justify-between flex-wrap">
                                <span className="text-xs text-muted-foreground">السعر المطلوب</span>
                                <span className="text-sm font-mono text-amber-400 font-bold">{(leakDetail as any).price || "غير محدد"}</span>
                              </div>
                              <div className="flex items-center justify-between flex-wrap">
                                <span className="text-xs text-muted-foreground">المنصة</span>
                                <span className="text-sm text-foreground">{(leakDetail as any).sourcePlatform || sourceLabel(leakDetail.source)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Source Link Card */}
                          <div className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 rounded-xl p-4 border border-violet-500/20">
                            <h4 className="text-xs font-semibold text-violet-400 mb-3 flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5" />
                              مصدر الرصد
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between flex-wrap">
                                <span className="text-xs text-muted-foreground">القطاع</span>
                                <span className="text-sm text-foreground">{leakDetail.sectorAr}</span>
                              </div>
                              {leakDetail.regionAr && (
                                <div className="flex items-center justify-between flex-wrap">
                                  <span className="text-xs text-muted-foreground">المنطقة</span>
                                  <span className="text-sm text-foreground">{leakDetail.regionAr} {leakDetail.cityAr ? `— ${leakDetail.cityAr}` : ""}</span>
                                </div>
                              )}
                              {(leakDetail as any).sourceUrl && (
                                <div className="mt-2 pt-2 border-t border-border/30">
                                  <a
                                    href={(leakDetail as any).sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 rounded-lg p-2"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate font-mono" dir="ltr">{(leakDetail as any).sourceUrl}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Full Description */}
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            وصف حالة الرصد
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed">{leakDetail.descriptionAr || "لا يوجد وصف متاح"}</p>
                          {leakDetail.description && leakDetail.description !== leakDetail.descriptionAr && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <p className="text-xs sm:text-[10px] text-muted-foreground mb-1">English Description</p>
                              <p className="text-xs text-muted-foreground leading-relaxed" dir="ltr">{leakDetail.description}</p>
                            </div>
                          )}
                        </div>

                        {/* PII Types */}
                        {parseJsonSafe(leakDetail.piiTypes, []).length > 0 && (
                          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Fingerprint className="w-3.5 h-3.5" />
                              أنواع البيانات الشخصية المكتشفة ({parseJsonSafe(leakDetail.piiTypes, []).length} نوع)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {parseJsonSafe(leakDetail.piiTypes, []).map((type) => (
                                <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                  <Lock className="w-3 h-3 text-red-400 shrink-0" />
                                  <span className="text-xs text-foreground">{type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Incident Timeline */}
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                          <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            الجدول الزمني لحالة الرصد
                          </h4>
                          <div className="space-y-3 relative before:absolute before:right-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                            {[
                              { date: leakDetail.detectedAt, label: "تم اكتشاف حالة الرصد", color: "bg-red-400" },
                              { date: leakDetail.createdAt, label: "تم تسجيل حالة الرصد في النظام", color: "bg-cyan-400" },
                              ...(leakDetail.enrichedAt ? [{ date: leakDetail.enrichedAt, label: "تم تحليل حالة الرصد بالذكاء الاصطناعي", color: "bg-purple-400" }] : []),
                              { date: leakDetail.updatedAt, label: `الحالة الحالية: ${statusLabel(leakDetail.status)}`, color: leakDetail.status === "reported" ? "bg-emerald-400" : "bg-amber-400" },
                            ].filter(e => e.date).map((event, idx) => (
                              <div key={idx} className="flex items-start gap-3 pr-1">
                                <div className={`w-3.5 h-3.5 rounded-full ${event.color} shrink-0 mt-0.5 ring-2 ring-card z-10`} />
                                <div>
                                  <p className="text-xs text-foreground">{event.label}</p>
                                  <p className="text-xs sm:text-[10px] text-muted-foreground">{new Date(event.date!).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ═══ SAMPLES TAB — Leaked Data Samples ═══ */}
                    {activeTab === "samples" && (
                      <>
                        {(() => {
                          const samples = parseJsonSafe((leakDetail as any).sampleData, null);
                          if (!samples || samples.length === 0) {
                            return (
                              <div className="text-center py-12">
                                <Table className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">لا توجد عينات بيانات مسجلة لحالة الرصد هذه</p>
                              </div>
                            );
                          }
                          const columns = Object.keys(samples[0]);
                          return (
                            <>
                              {/* Warning Banner */}
                              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-red-400">تحذير: سجلات مكشوفة فعلياً (عينات متاحة)</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    هذه عينات متاحة من البيانات الشخصية المكشوفة فعلياً في حالة الرصد. تم عرض {samples.length} سجل مكشوف من أصل {leakDetail.recordCount.toLocaleString()} سجل مكشوف.
                                    يجب التعامل مع هذه البيانات بسرية تامة وفقاً لنظام حماية البيانات الشخصية.
                                  </p>
                                </div>
                              </div>

                              {/* Data Table */}
                              <div className="bg-secondary/30 rounded-xl border border-border/30 overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm" dir="rtl">
                                    <thead>
                                      <tr className="border-b border-border bg-secondary/50">
                                        <th className="text-right text-xs sm:text-[10px] font-semibold text-muted-foreground p-3 w-8">#</th>
                                        {columns.map((col) => (
                                          <th key={col} className="text-right text-xs sm:text-[10px] font-semibold text-muted-foreground p-3 whitespace-nowrap">
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {samples.map((row, idx) => (
                                        <tr key={idx} className="border-b border-border/30 hover:bg-secondary/40 transition-colors">
                                          <td className="p-3 text-xs sm:text-[10px] text-muted-foreground font-mono">{idx + 1}</td>
                                          {columns.map((col) => (
                                            <td key={col} className="p-3 text-xs text-foreground whitespace-nowrap font-mono">
                                              {row[col] || "—"}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="p-3 border-t border-border/30 bg-secondary/20 flex items-center justify-between flex-wrap">
                                  <p className="text-xs sm:text-[10px] text-muted-foreground">
                                    عرض {samples.length} سجل مكشوف من أصل {leakDetail.recordCount.toLocaleString()} سجل مكشوف
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs sm:text-[10px]">{columns.length} حقل</Badge>
                                    <Badge variant="outline" className="text-xs sm:text-[10px] bg-red-500/10 text-red-400 border-red-500/30">بيانات حساسة</Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Column Analysis */}
                              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                                <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <Fingerprint className="w-3.5 h-3.5" />
                                  تحليل الحقول المكتشفة
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {columns.map((col) => (
                                    <div key={col} className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                                      <Lock className="w-3 h-3 text-red-400 shrink-0" />
                                      <div>
                                        <p className="text-xs text-foreground font-medium">{col}</p>
                                        <p className="text-xs sm:text-[10px] text-muted-foreground">{samples.length} عينة متاحة</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}

                    {/* ═══ EVIDENCE TAB ═══ */}
                    {activeTab === "evidence" && (
                      <>
                        {/* Screenshots Section */}
                        {(() => {
                          const screenshots = parseJsonSafe((leakDetail as any).screenshotUrls, null);
                          if (screenshots && screenshots.length > 0) {
                            return (
                              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                                <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <Camera className="w-3.5 h-3.5" />
                                  لقطات شاشة من مصدر حالة الرصد ({screenshots.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {screenshots.map((url, idx) => (
                                    <div
                                      key={idx}
                                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg"
                                      onClick={() => setLightboxUrl(url)}
                                    >
                                      <img
                                        src={url}
                                        alt={`Evidence Screenshot ${idx + 1}`}
                                        className="w-full h-48 object-cover object-top"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <p className="text-xs sm:text-[10px] text-white/80">لقطة {idx + 1} — {(leakDetail as any).sourcePlatform || sourceLabel(leakDetail.source)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Source Link */}
                        {(leakDetail as any).sourceUrl && (
                          <div className="bg-violet-500/5 rounded-xl p-4 border border-violet-500/20">
                            <h4 className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5" />
                              رابط المصدر الأصلي
                            </h4>
                            <a
                              href={(leakDetail as any).sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 rounded-lg p-3"
                            >
                              <ExternalLink className="w-4 h-4 shrink-0" />
                              <span className="truncate font-mono text-xs" dir="ltr">{(leakDetail as any).sourceUrl}</span>
                            </a>
                            <p className="text-xs sm:text-[10px] text-muted-foreground mt-2">
                              تم اكتشاف حالة الرصد هذه على منصة <strong>{(leakDetail as any).sourcePlatform || sourceLabel(leakDetail.source)}</strong> بواسطة نظام المراقبة الآلي
                            </p>
                          </div>
                        )}

                        {/* Evidence Chain */}
                        {(leakDetail.evidence?.length ?? 0) === 0 ? (
                          !((leakDetail as any).screenshotUrls as any[] || []).length && (
                            <div className="text-center py-12">
                              <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                              <p className="text-sm text-muted-foreground">لا توجد أدلة مسجلة لحالة الرصد هذه</p>
                            </div>
                          )
                        ) : (
                          <>
                            {/* Evidence Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {["screenshot", "text", "file", "metadata"].map((type) => {
                                const count = leakDetail.evidence?.filter((e: any) => e.evidenceType === type).length ?? 0;
                                const Icon = evidenceTypeIcon(type);
                                return (
                                  <div key={type} className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                                    <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                                    <p className="text-lg font-bold text-foreground">{count}</p>
                                    <p className="text-xs sm:text-[10px] text-muted-foreground">{evidenceTypeLabel(type)}</p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Evidence Chain Items */}
                            <div className="space-y-3">
                              {leakDetail.evidence?.map((ev: any, idx: number) => {
                                const Icon = evidenceTypeIcon(ev.evidenceType);
                                const meta = parseJsonSafe(ev.evidenceMetadata, null);
                                return (
                                  <div key={ev.id} className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                        <Icon className="w-4 h-4 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-mono text-primary">{ev.evidenceId}</span>
                                          <Badge variant="outline" className="text-xs sm:text-[10px]">{evidenceTypeLabel(ev.evidenceType)}</Badge>
                                          {ev.isVerified && (
                                            <span className="text-xs sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                              <CheckCircle className="w-2.5 h-2.5" /> موثّق
                                            </span>
                                          )}
                                          <span className="text-xs sm:text-[10px] text-muted-foreground mr-auto">Block #{ev.blockIndex}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs sm:text-[10px] text-muted-foreground">
                                          <User className="w-3 h-3" />
                                          {ev.capturedBy || "غير محدد"}
                                          <span className="mx-1">•</span>
                                          <Calendar className="w-3 h-3" />
                                          {ev.capturedAt ? new Date(ev.capturedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Hash Info */}
                                    <div className="bg-card/50 rounded-lg p-2.5 border border-border/30 mb-2">
                                      <div className="flex items-center gap-2 text-xs sm:text-[10px]">
                                        <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground">SHA-256:</span>
                                        <span className="font-mono text-foreground truncate">{ev.contentHash}</span>
                                      </div>
                                      {ev.previousHash && (
                                        <div className="flex items-center gap-2 text-xs sm:text-[10px] mt-1">
                                          <Link2 className="w-3 h-3 text-muted-foreground shrink-0" />
                                          <span className="text-muted-foreground">السابق:</span>
                                          <span className="font-mono text-muted-foreground truncate">{ev.previousHash}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Metadata Details */}
                                    {meta && Object.keys(meta).length > 0 && (
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        {Object.entries(meta).map(([key, value]) => (
                                          <div key={key} className="bg-card/30 rounded-lg p-2 border border-border/20">
                                            <p className="text-[9px] text-muted-foreground mb-0.5">{key}</p>
                                            <p className="text-xs sm:text-[11px] text-foreground truncate" dir={typeof value === 'string' && /^[a-zA-Z]/.test(value) ? 'ltr' : 'rtl'}>
                                              {typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : String(value)}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* ═══ AI ANALYSIS TAB ═══ */}
                    {activeTab === "ai" && (
                      <>
                        {leakDetail.enrichedAt ? (
                          <>
                            {/* AI Confidence & Severity */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20 text-center">
                                <Brain className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                                <p className="text-2xl font-bold text-purple-400">{leakDetail.aiConfidence}%</p>
                                <p className="text-xs sm:text-[10px] text-muted-foreground mt-1">مستوى الثقة</p>
                              </div>
                              <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 text-center">
                                <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-amber-400" />
                                <p className={`text-lg font-bold ${severityColor(leakDetail.aiSeverity || leakDetail.severity).split(' ')[0]}`}>
                                  {severityLabel(leakDetail.aiSeverity || leakDetail.severity)}
                                </p>
                                <p className="text-xs sm:text-[10px] text-muted-foreground mt-1">تقييم التأثير AI</p>
                              </div>
                              <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 text-center">
                                <Calendar className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
                                <p className="text-sm font-medium text-foreground">
                                  {leakDetail.enrichedAt ? new Date(leakDetail.enrichedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : "—"}
                                </p>
                                <p className="text-xs sm:text-[10px] text-muted-foreground mt-1">تاريخ التحليل</p>
                              </div>
                            </div>

                            {/* AI Summary */}
                            <div className="bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-xl p-4 border border-purple-500/20">
                              <h4 className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                الملخص التنفيذي
                              </h4>
                              <p className="text-sm text-foreground leading-relaxed">{leakDetail.aiSummaryAr || leakDetail.aiSummary || "لا يوجد ملخص"}</p>
                            </div>

                            {/* AI Recommendations */}
                            {parseJsonSafe(leakDetail.aiRecommendationsAr, null) || parseJsonSafe(leakDetail.aiRecommendations, []).length > 0 && (
                              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                                <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  التوصيات ({parseJsonSafe(leakDetail.aiRecommendationsAr, null) || parseJsonSafe(leakDetail.aiRecommendations, []).length})
                                </h4>
                                <div className="space-y-2">
                                  {parseJsonSafe(leakDetail.aiRecommendationsAr, null) || parseJsonSafe(leakDetail.aiRecommendations, []).map((rec, i) => (
                                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs sm:text-[10px] font-bold text-emerald-400">{i + 1}</span>
                                      </div>
                                      <p className="text-xs text-foreground leading-relaxed">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            {enrichingId === leakDetail.leakId ? (
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                                <span className="text-foreground text-sm">جاري تحليل حالة الرصد بالذكاء الاصطناعي...</span>
                              </div>
                            ) : (
                              <div>
                                <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                                <p className="text-muted-foreground text-sm mb-4">لم يتم إثراء حالة الرصد بالذكاء الاصطناعي بعد</p>
                                <Button
                                  onClick={() => handleEnrich(leakDetail.leakId)}
                                  className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600"
                                >
                                  <Sparkles className="w-4 h-4" />
                                  إثراء بالذكاء الاصطناعي
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <ScreenshotLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        )}
      </AnimatePresence>

      {/* Stats Detail Modal */}
      <StatsDetailModal
        open={!!statsModal}
        onClose={() => setStatsModal(null)}
        title={statsModal?.title ?? ""}
        leaks={statsModal?.leaks ?? []}
      />

      {filteredLeaks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد حالات رصد تطابق معايير البحث</p>
        </div>
      )}
    </div>
  );
}

```

---

## `client/src/leaks/pages/LiveScan.tsx`

```tsx
// Leaks Domain
import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  FileText,
  AlertTriangle,
  Database,
  Brain,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Mail,
  Key,
  Phone,
  CreditCard,
  Radar,
  Activity,
  Target,
  Eye,
  Save,
  Download,
  CheckCheck,
  Code,
} from "lucide-react";
import { toast } from "sonner";
import AnimatedCounter from "@/components/AnimatedCounter";

// ============================================================
// Types
// ============================================================

interface ScanTarget {
  type: "email" | "domain" | "keyword" | "phone" | "national_id";
  value: string;
}

interface ScanResult {
  id: string;
  source: string;
  sourceIcon: string;
  type: "breach" | "paste" | "certificate" | "exposure" | "darkweb";
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  details: Record<string, any>;
  timestamp: Date;
  url?: string;
  affectedRecords?: number;
  dataTypes?: string[];
}

interface ScanProgress {
  source: string;
  status: "scanning" | "completed" | "error" | "skipped";
  message: string;
  resultsCount: number;
  timestamp: Date;
}

// ============================================================
// Constants
// ============================================================

const TARGET_TYPES = [
  { value: "email" as const, label: "بريد إلكتروني", icon: Mail, placeholder: "example@domain.com" },
  { value: "domain" as const, label: "نطاق", icon: Globe, placeholder: "example.com" },
  { value: "keyword" as const, label: "كلمة مفتاحية", icon: Key, placeholder: "اسم جهة أو كلمة بحث" },
  { value: "phone" as const, label: "رقم هاتف", icon: Phone, placeholder: "+966501234567" },
  { value: "national_id" as const, label: "رقم هوية", icon: CreditCard, placeholder: "1087456321" },
];

const SCAN_SOURCES = [
  { id: "xposedornot", name: "XposedOrNot", desc: "فحص حالات رصد البريد الإلكتروني", icon: ShieldAlert, color: "text-red-400" },
  { id: "crtsh", name: "crt.sh", desc: "شفافية الشهادات واكتشاف النطاقات", icon: Globe, color: "text-blue-400" },
  { id: "psbdmp", name: "PSBDMP", desc: "البحث في تفريغات مواقع اللصق", icon: FileText, color: "text-yellow-400" },
  { id: "googledork", name: "Google Dorking", desc: "استعلامات بحث ذكية", icon: Search, color: "text-green-400" },
  { id: "breachdirectory", name: "BreachDirectory", desc: "قاعدة بيانات حالات الرصد العامة", icon: Database, color: "text-purple-400" },
  { id: "github", name: "GitHub Code", desc: "فحص مستودعات الكود العامة", icon: Code, color: "text-gray-400" },
  { id: "dehashed", name: "Dehashed", desc: "قواعد بيانات الحالات المجمعة", icon: Eye, color: "text-orange-400" },
  { id: "intelx", name: "IntelX", desc: "استخبارات التهديدات", icon: Radar, color: "text-cyan-400" },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "واسع النطاق", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" },
  high: { label: "عالي", color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30" },
  medium: { label: "متوسط", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30" },
  low: { label: "منخفض", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  info: { label: "معلومات", color: "text-gray-400", bg: "bg-gray-500/20 border-gray-500/30" },
};

const SOURCE_ICON_MAP: Record<string, any> = {
  "shield-alert": ShieldAlert,
  "file-text": FileText,
  globe: Globe,
  "alert-triangle": AlertTriangle,
  database: Database,
  brain: Brain,
  search: Search,
  code: Code,
  radar: Radar,
};

// ============================================================
// Component
// ============================================================

export default function LiveScan() {
  const { user } = useAuth();
  const [targetType, setTargetType] = useState<ScanTarget["type"]>("email");
  const [targetValue, setTargetValue] = useState("");
  const [enabledSources, setEnabledSources] = useState<string[]>(SCAN_SOURCES.map((s) => s.id));
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanProgress, setScanProgress] = useState<ScanProgress[]>([]);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("setup");
  const [scanHistory, setScanHistory] = useState<Array<{ target: string; type: string; findings: number; date: Date }>>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  const executeMutation = trpc.liveScan.execute.useMutation();
  const quickMutation = trpc.liveScan.quick.useMutation();
  const saveAsLeakMutation = trpc.liveScan.saveAsLeak.useMutation();
  const saveAllMutation = trpc.liveScan.saveAllAsLeaks.useMutation();
  const [savedResults, setSavedResults] = useState<Set<string>>(new Set());
  const [savingAll, setSavingAll] = useState(false);

  const saveResultAsLeak = async (result: ScanResult) => {
    try {
      const res = await saveAsLeakMutation.mutateAsync({
        scanResult: {
          id: result.id,
          source: result.source,
          type: result.type,
          severity: result.severity,
          title: result.title,
          description: result.description,
          details: result.details,
          url: result.url,
          affectedRecords: result.affectedRecords,
          dataTypes: result.dataTypes,
        },
        targetValue,
        targetType,
      });
      setSavedResults(prev => new Set(prev).add(result.id));
      toast.success(`\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062d\u0627\u062f\u062b\u0629: ${res.leakId}`);
    } catch (e: any) {
      toast.error(`\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062d\u0641\u0638: ${e.message}`);
    }
  };

  const saveAllResults = async () => {
    if (scanResults.length === 0) return;
    setSavingAll(true);
    try {
      const unsaved = scanResults.filter(r => !savedResults.has(r.id));
      if (unsaved.length === 0) {
        toast.info("\u062c\u0645\u064a\u0639 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0645\u062d\u0641\u0648\u0638\u0629 \u0628\u0627\u0644\u0641\u0639\u0644");
        return;
      }
      const res = await saveAllMutation.mutateAsync({
        scanResults: unsaved.map(r => ({
          id: r.id,
          source: r.source,
          type: r.type,
          severity: r.severity,
          title: r.title,
          description: r.description,
          details: r.details,
          url: r.url,
          affectedRecords: r.affectedRecords,
          dataTypes: r.dataTypes,
        })),
        targetValue,
        targetType,
      });
      const newSaved = new Set(savedResults);
      unsaved.forEach(r => newSaved.add(r.id));
      setSavedResults(newSaved);
      toast.success(`\u062a\u0645 \u062d\u0641\u0638 ${res.savedCount} \u062d\u0627\u062f\u062b\u0629 \u062a\u0633\u0631\u064a\u0628 \u0641\u064a \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a`);
    } catch (e: any) {
      toast.error(`\u062e\u0637\u0623: ${e.message}`);
    } finally {
      setSavingAll(false);
    }
  };

  const toggleSource = (sourceId: string) => {
    setEnabledSources((prev) => (prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]));
  };

  const startScan = async () => {
    if (!targetValue.trim()) {
      toast.error("يرجى إدخال قيمة للمسح");
      return;
    }
    if (enabledSources.length === 0) {
      toast.error("يرجى تحديد مصدر واحد على الأقل");
      return;
    }

    setIsScanning(true);
    setScanResults([]);
    setScanProgress([]);
    setScanCompleted(false);
    setActiveTab("results");

    try {
      const session = await executeMutation.mutateAsync({
        targets: [{ type: targetType, value: targetValue.trim() }],
        sources: enabledSources,
      });

      setScanResults(session.results as ScanResult[]);
      setScanProgress(session.progress as ScanProgress[]);
      setScanCompleted(true);
      setScanHistory((prev) => [
        { target: targetValue, type: targetType, findings: session.totalFindings, date: new Date() },
        ...prev.slice(0, 9),
      ]);

      if (session.totalFindings > 0) {
        toast.warning(`تم اكتشاف ${session.totalFindings} تهديد!`);
      } else {
        toast.success("لم يتم اكتشاف أي تهديدات");
      }
    } catch (error: any) {
      toast.error(`خطأ في المسح: ${error.message}`);
      setScanCompleted(true);
    } finally {
      setIsScanning(false);
    }
  };

  const quickScanAction = async () => {
    if (!targetValue.trim()) {
      toast.error("يرجى إدخال قيمة للمسح السريع");
      return;
    }

    setIsScanning(true);
    setScanResults([]);
    setScanProgress([]);
    setScanCompleted(false);
    setActiveTab("results");

    try {
      const session = await quickMutation.mutateAsync({
        value: targetValue.trim(),
        type: targetType,
      });

      setScanResults(session.results as ScanResult[]);
      setScanProgress(session.progress as ScanProgress[]);
      setScanCompleted(true);
      setScanHistory((prev) => [
        { target: targetValue, type: targetType, findings: session.totalFindings, date: new Date() },
        ...prev.slice(0, 9),
      ]);

      if (session.totalFindings > 0) {
        toast.warning(`تم اكتشاف ${session.totalFindings} تهديد!`);
      } else {
        toast.success("لم يتم اكتشاف أي تهديدات");
      }
    } catch (error: any) {
      toast.error(`خطأ: ${error.message}`);
      setScanCompleted(true);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSourceIcon = (iconName: string) => {
    return SOURCE_ICON_MAP[iconName] || Shield;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  const criticalCount = scanResults.filter((r) => r.severity === "critical").length;
  const highCount = scanResults.filter((r) => r.severity === "high").length;
  const mediumCount = scanResults.filter((r) => r.severity === "medium").length;
  const lowCount = scanResults.filter((r) => r.severity === "low" || r.severity === "info").length;

  return (
    <div className="overflow-x-hidden max-w-full space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/20">
              <Radar className="w-6 h-6 text-purple-400" />
            </div>
            المسح والفحص المباشر
          </h1>
          <p className="text-sm text-white/50 mt-1">فحص حقيقي ومباشر عن حالات رصد البيانات الشخصية عبر مصادر متعددة</p>
        </div>
        {scanHistory.length > 0 && (
          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
            <Activity className="w-3 h-3 ml-1" />
            {scanHistory.length} عملية مسح
          </Badge>
        )}
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="setup" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Target className="w-4 h-4 ml-1" />
            إعداد المسح
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Eye className="w-4 h-4 ml-1" />
            النتائج
            {scanResults.length > 0 && (
              <Badge variant="secondary" className="mr-2 bg-purple-500/20 text-purple-300 text-xs">
                {scanResults.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
            <Clock className="w-4 h-4 ml-1" />
            السجل
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* Setup Tab */}
        {/* ============================================================ */}
        <TabsContent value="setup" className="space-y-6 mt-4">
          {/* Target Input */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              هدف المسح
            </h2>

            {/* Target Type Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TARGET_TYPES.map((tt) => (
                <button
                  key={tt.value}
                  onClick={() => setTargetType(tt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    targetType === tt.value
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  <tt.icon className="w-4 h-4" />
                  {tt.label}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={TARGET_TYPES.find((t) => t.value === targetType)?.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 text-base pr-4 pl-12"
                  dir="ltr"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isScanning) startScan();
                  }}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              </div>
              <Button
                onClick={startScan}
                disabled={isScanning || !targetValue.trim()}
                className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جارٍ المسح...
                  </>
                ) : (
                  <>
                    <Radar className="w-4 h-4 ml-2" />
                    بدء المسح
                  </>
                )}
              </Button>
              <Button
                onClick={quickScanAction}
                disabled={isScanning || !targetValue.trim()}
                variant="outline"
                className="h-12 px-4 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Zap className="w-4 h-4 ml-1" />
                سريع
              </Button>
            </div>
          </div>

          {/* Sources Selection */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                مصادر المسح
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnabledSources(SCAN_SOURCES.map((s) => s.id))}
                  className="text-xs text-white/50 hover:text-white"
                >
                  تحديد الكل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnabledSources([])}
                  className="text-xs text-white/50 hover:text-white"
                >
                  إلغاء الكل
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SCAN_SOURCES.map((source) => {
                const isEnabled = enabledSources.includes(source.id);
                return (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${
                      isEnabled
                        ? "bg-white/10 border-purple-500/30"
                        : "bg-white/5 border-white/10 opacity-60 hover:opacity-80"
                    }`}
                  >
                    <div className={`mt-0.5 ${isEnabled ? "text-green-400" : "text-white/30"}`}>
                      {isEnabled ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <source.icon className={`w-4 h-4 ${source.color}`} />
                        <span className="font-medium text-white text-sm">{source.name}</span>
                      </div>
                      <p className="text-xs text-white/50 mt-1">{source.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="glass-card rounded-2xl p-4 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium">مسح حقيقي ومباشر</p>
                <p className="text-xs text-white/50 mt-1">
                  يتم إجراء المسح عبر واجهات برمجية حقيقية (APIs) متصلة بمصادر بيانات حالات الرصد العالمية. النتائج فعلية وليست تجريبية.
                  يشمل المسح: فحص حالات رصد البريد الإلكتروني، اكتشاف النطاقات الفرعية، البحث في مواقع اللصق، واستعلامات بحث ذكية.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* Results Tab */}
        {/* ============================================================ */}
        <TabsContent value="results" className="space-y-4 mt-4" ref={resultsRef}>
          {/* Scanning Animation */}
          {isScanning && (
            <div className="glass-card rounded-2xl p-3 sm:p-8 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-purple-500/30 animate-pulse" />
                <div className="absolute inset-4 rounded-full border-4 border-purple-500/40 animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radar className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white">جارٍ المسح الحقيقي...</h3>
              <p className="text-sm text-white/50">يتم فحص "{targetValue}" عبر {enabledSources.length} مصدر</p>

              {/* Live Progress */}
              <div className="space-y-2 mt-4 max-w-md mx-auto text-right">
                {SCAN_SOURCES.filter((s) => enabledSources.includes(s.id)).map((source) => (
                  <div key={source.id} className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-3 h-3 text-purple-400 animate-spin shrink-0" />
                    <span className="text-white/60">{source.name}</span>
                    <span className="text-white/30 text-xs">— {source.desc}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-3 h-3 text-purple-400 animate-spin shrink-0" />
                  <span className="text-white/60">التحليل الذكي</span>
                  <span className="text-white/30 text-xs">— تحليل بالذكاء الاصطناعي</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {scanCompleted && scanResults.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card rounded-xl p-4 border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-white/50">واسع النطاق</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{criticalCount}</span>
                </div>
                <div className="glass-card rounded-xl p-4 border-orange-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-white/50">عالي</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-400">{highCount}</span>
                </div>
                <div className="glass-card rounded-xl p-4 border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-white/50">متوسط</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">{mediumCount}</span>
                </div>
                <div className="glass-card rounded-xl p-4 border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/50">منخفض / معلومات</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{lowCount}</span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  مراحل المسح
                </h3>
                <div className="space-y-2">
                  {scanProgress.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {p.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      ) : p.status === "error" ? (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : p.status === "skipped" ? (
                        <XCircle className="w-4 h-4 text-white/30 shrink-0" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      )}
                      <span className="text-white/70 font-medium min-w-[100px]">{p.source}</span>
                      <span className="text-white/40 flex-1">{p.message}</span>
                      {p.resultsCount > 0 && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                          {p.resultsCount}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  النتائج المفصّلة ({scanResults.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                  onClick={saveAllResults}
                  disabled={savingAll || scanResults.length === 0 || savedResults.size === scanResults.length}
                >
                  {savingAll ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : savedResults.size === scanResults.length && scanResults.length > 0 ? (
                    <CheckCheck className="w-4 h-4 ml-1" />
                  ) : (
                    <Download className="w-4 h-4 ml-1" />
                  )}
                  {savedResults.size === scanResults.length && scanResults.length > 0
                    ? "تم حفظ الكل"
                    : `حفظ الكل كحالات رصد (${scanResults.length - savedResults.size})`}
                </Button>
              </div>

                {scanResults.map((result, idx) => {
                  const isExpanded = expandedResults.has(result.id);
                  const sevConfig = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.info;
                  const IconComp = getSourceIcon(result.sourceIcon);

                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, delay: idx * 0.06 }}
                      whileHover={{ scale: 1.01 }}
                      className={`glass-card rounded-xl border ${sevConfig.bg} overflow-hidden transition-all`}
                    >
                      <button
                        onClick={() => toggleExpand(result.id)}
                        className="w-full p-4 flex items-start gap-3 text-right"
                      >
                        <div className={`p-2 rounded-lg ${sevConfig.bg} shrink-0`}>
                          <IconComp className={`w-5 h-5 ${sevConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-xs ${sevConfig.bg} ${sevConfig.color} border-current`}>
                              {sevConfig.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-white/10 text-white/50">
                              {result.source}
                            </Badge>
                            {result.affectedRecords && (
                              <Badge variant="outline" className="text-xs border-white/10 text-white/50">
                                {result.affectedRecords.toLocaleString()} سجل
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-white mt-1.5">{result.title}</h4>
                          <p className="text-xs text-white/50 mt-1 line-clamp-2">{result.description}</p>
                        </div>
                        <div className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white/30" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white/30" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                          {/* Data Types */}
                          {result.dataTypes && result.dataTypes.length > 0 && (
                            <div>
                              <span className="text-xs text-white/40 block mb-1">البيانات المكتشفة:</span>
                              <div className="flex flex-wrap gap-1">
                                {result.dataTypes.map((dt, i) => (
                                  <Badge key={i} variant="outline" className="text-xs border-red-500/20 text-red-300">
                                    {dt}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Details */}
                          <div>
                            <span className="text-xs text-white/40 block mb-1">التفاصيل:</span>
                            <pre
                              className="text-xs text-white/60 bg-black/30 rounded-lg p-3 overflow-x-auto max-h-48"
                              dir="ltr"
                            >
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {result.url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs border-white/10 text-white/60"
                                onClick={() => window.open(result.url, "_blank")}
                              >
                                <ExternalLink className="w-3 h-3 ml-1" />
                                فتح المصدر
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-white/10 text-white/60"
                              onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                            >
                              <Copy className="w-3 h-3 ml-1" />
                              نسخ
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-xs ${
                                savedResults.has(result.id)
                                  ? "border-green-500/30 text-green-300 bg-green-500/10"
                                  : "border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                              }`}
                              onClick={() => saveResultAsLeak(result)}
                              disabled={savedResults.has(result.id) || saveAsLeakMutation.isPending}
                            >
                              {savedResults.has(result.id) ? (
                                <CheckCheck className="w-3 h-3 ml-1" />
                              ) : saveAsLeakMutation.isPending ? (
                                <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3 ml-1" />
                              )}
                              {savedResults.has(result.id) ? "تم الحفظ" : "حفظ كحالة رصد"}
                            </Button>
                          </div>

                          {/* Google Dork Queries */}
                          {result.details?.queries && (
                            <div>
                              <span className="text-xs text-white/40 block mb-2">استعلامات البحث الذكية:</span>
                              <div className="space-y-1">
                                {result.details.queries.map((q: string, i: number) => (
                                  <div key={i} className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
                                    <code className="text-xs text-green-300 flex-1" dir="ltr">
                                      {q}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(q)}
                                    >
                                      <Copy className="w-3 h-3 text-white/40" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() =>
                                        window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank")
                                      }
                                    >
                                      <ExternalLink className="w-3 h-3 text-white/40" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Subdomains */}
                          {result.details?.subdomains && (
                            <div>
                              <span className="text-xs text-white/40 block mb-2">
                                النطاقات الفرعية المكتشفة ({result.details.totalSubdomains}):
                              </span>
                              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                {result.details.subdomains.map((sd: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs border-blue-500/20 text-blue-300" dir="ltr">
                                    {sd}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Recommendations */}
                          {result.details?.recommendations && (
                            <div>
                              <span className="text-xs text-white/40 block mb-2">التوصيات:</span>
                              <ul className="space-y-1">
                                {result.details.recommendations.map((rec: string, i: number) => (
                                  <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* No Results */}
          {scanCompleted && scanResults.length === 0 && !isScanning && (
            <div className="glass-card rounded-2xl p-4 sm:p-12 text-center">
              <ShieldCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">لم يتم اكتشاف أي حالات رصد</h3>
              <p className="text-sm text-white/50 mt-2">لم يتم العثور على أي عينات متاحة مرتبطة بالهدف المحدد</p>
            </div>
          )}

          {/* Empty State */}
          {!scanCompleted && !isScanning && scanResults.length === 0 && (
            <div className="glass-card rounded-2xl p-4 sm:p-12 text-center">
              <Radar className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/50">لم يتم إجراء أي مسح بعد</h3>
              <p className="text-sm text-white/30 mt-2">انتقل إلى تبويب "إعداد المسح" لبدء فحص جديد</p>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* History Tab */}
        {/* ============================================================ */}
        <TabsContent value="history" className="mt-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              سجل عمليات المسح
            </h3>

            {scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">لا توجد عمليات مسح سابقة في هذه الجلسة</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Search className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-white font-medium">{h.target}</span>
                      <span className="text-xs text-white/40 mr-2">
                        ({TARGET_TYPES.find((t) => t.value === h.type)?.label})
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        h.findings > 0
                          ? "border-red-500/30 text-red-300"
                          : "border-green-500/30 text-green-300"
                      }
                    >
                      {h.findings > 0 ? `${h.findings} تهديد` : "آمن"}
                    </Badge>
                    <span className="text-xs text-white/30">{h.date.toLocaleTimeString("ar-SA")}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

---

## `client/src/leaks/pages/MonitoringJobs.tsx`

```tsx
// Leaks Domain
/**
 * MonitoringJobs — Scheduled background monitoring job dashboard
 * All stats and job cards are clickable with detail modals
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  Play,
  Pause,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Globe,
  Send,
  FileText,
  Activity,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";
import AnimatedCounter from "@/components/AnimatedCounter";

const platformIcons: Record<string, React.ElementType> = {
  telegram: Send,
  darkweb: Globe,
  paste: FileText,
  all: Activity,
};

const platformLabels: Record<string, { ar: string; en: string }> = {
  telegram: { ar: "تليجرام", en: "Telegram" },
  darkweb: { ar: "الدارك ويب", en: "Dark Web" },
  paste: { ar: "مواقع اللصق", en: "Paste Sites" },
  all: { ar: "جميع المنصات", en: "All Platforms" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "نشط", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  paused: { label: "متوقف", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Pause },
  running: { label: "قيد التشغيل", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: Loader2 },
  error: { label: "خطأ", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
};

function formatDate(date: Date | string | null) {
  if (!date) return "لم يتم التشغيل بعد";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function MonitoringJobs() {
  const { data: jobs, isLoading, refetch } = trpc.jobs.list.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const triggerMutation = trpc.jobs.trigger.useMutation({
    onSuccess: (_, vars) => {
      toast.success("تم تشغيل المهمة", { description: `Job ${vars.jobId} triggered` });
      refetch();
    },
    onError: () => {
      toast.error("فشل تشغيل المهمة", { description: "Failed to trigger job" });
    },
  });

  const toggleMutation = trpc.jobs.toggleStatus.useMutation({
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "active" ? "تم استئناف المهمة" : "تم إيقاف المهمة",
        { description: `Job ${vars.jobId} ${vars.status === "active" ? "resumed" : "paused"}` }
      );
      refetch();
    },
  });

  // Listen for real-time job updates
  const { lastJobUpdate } = useWebSocket();
  useEffect(() => {
    if (lastJobUpdate) {
      refetch();
    }
  }, [lastJobUpdate]);

  // Summary stats
  const activeJobs = jobs?.filter((j) => j.status === "active").length ?? 0;
  const totalRuns = jobs?.reduce((sum, j) => sum + (j.totalRuns ?? 0), 0) ?? 0;
  const totalLeaksFound = jobs?.reduce((sum, j) => sum + (j.leaksFound ?? 0), 0) ?? 0;

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">مهام الرصد المجدولة</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitoring Jobs — إدارة مهام الفحص التلقائي</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent border-border"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث
        </Button>
      </div>

      {/* Stats — clickable */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: "activeJobs", label: "المهام النشطة", labelEn: "Active Jobs", value: activeJobs, icon: Radio, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
          { key: "totalRuns", label: "إجمالي التشغيلات", labelEn: "Total Runs", value: totalRuns, icon: RefreshCw, color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
          { key: "leaksFound", label: "حالات رصد مكتشفة", labelEn: "Leaks Found", value: totalLeaksFound, icon: AlertTriangle, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
          { key: "totalJobs", label: "إجمالي المهام", labelEn: "Total Jobs", value: jobs?.length ?? 0, icon: Clock, color: "text-purple-400", borderColor: "border-purple-500/20", bgColor: "bg-purple-500/5" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-all group`}
              onClick={() => setActiveModal(stat.key)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-secondary`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold text-foreground`}>{stat.value}</p>
                  <p className="text-xs sm:text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              <p className="text-[9px] text-primary/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
            </motion.div>
          );
        })}
      </div>

      {/* Jobs list — clickable */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="bg-secondary/30 border border-border rounded-xl p-4 sm:p-12 text-center">
          <Radio className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">لا توجد مهام مجدولة</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job, idx) => {
            const PlatformIcon = platformIcons[job.platform] || Activity;
            const platLabel = platformLabels[job.platform] || platformLabels.all;
            const statusConf = statusConfig[job.status] || statusConfig.active;
            const StatusIcon = statusConf.icon;
            const isRunning = job.status === "running";

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-secondary/30 border border-border rounded-xl p-5 hover:border-primary/20 transition-colors cursor-pointer"
                onClick={() => { setSelectedJob(job); setActiveModal("jobDetail"); }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Job info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <PlatformIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{job.jobNameAr}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.jobName}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs sm:text-[11px] font-medium border ${statusConf.color}`}>
                          <StatusIcon className={`w-3 h-3 ${isRunning ? "animate-spin" : ""}`} />
                          {statusConf.label}
                        </span>
                        <span className="text-xs sm:text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {platLabel.ar}
                        </span>
                        <span className="text-xs sm:text-[11px] text-muted-foreground font-mono">
                          {job.cronExpression}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs bg-transparent border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      onClick={() => triggerMutation.mutate({ jobId: job.jobId })}
                      disabled={isRunning || triggerMutation.isPending}
                    >
                      {isRunning ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      تشغيل يدوي
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 text-xs bg-transparent border-border ${
                        job.status === "active"
                          ? "hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30"
                          : "hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                      }`}
                      onClick={() =>
                        toggleMutation.mutate({
                          jobId: job.jobId,
                          status: job.status === "active" ? "paused" : "active",
                        })
                      }
                      disabled={isRunning}
                    >
                      {job.status === "active" ? (
                        <>
                          <Pause className="w-3 h-3" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          استئناف
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Job details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/30">
                  <div>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">آخر تشغيل</p>
                    <p className="text-xs text-foreground mt-0.5">{formatDate(job.lastRunAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">إجمالي التشغيلات</p>
                    <p className="text-xs text-foreground mt-0.5 font-bold">{job.totalRuns ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">حالات رصد مكتشفة</p>
                    <p className="text-xs text-amber-400 mt-0.5 font-bold">{job.leaksFound ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">آخر نتيجة</p>
                    <p className="text-xs text-foreground mt-0.5 truncate">{job.lastResult || "—"}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Active Jobs Modal */}
      <DetailModal open={activeModal === "activeJobs"} onClose={() => setActiveModal(null)} title="المهام النشطة" icon={<Radio className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
            <p className="text-2xl font-bold text-emerald-400">{activeJobs}</p>
            <p className="text-xs text-muted-foreground">مهمة نشطة</p>
          </div>
          {jobs?.filter(j => j.status === "active").map(job => {
            const PIcon = platformIcons[job.platform] || Activity;
            return (
              <div key={job.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => { setSelectedJob(job); setActiveModal("jobDetail"); }}>
                <div className="flex items-center gap-2 mb-1">
                  <PIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{job.jobNameAr}</span>
                </div>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{platformLabels[job.platform]?.ar} • {job.cronExpression}</p>
              </div>
            );
          })}
        </div>
      </DetailModal>

      {/* Total Runs Modal */}
      <DetailModal open={activeModal === "totalRuns"} onClose={() => setActiveModal(null)} title="إجمالي التشغيلات" icon={<RefreshCw className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-3">
          <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
            <p className="text-2xl font-bold text-cyan-400">{totalRuns}</p>
            <p className="text-xs text-muted-foreground">تشغيل إجمالي</p>
          </div>
          {jobs?.sort((a, b) => (b.totalRuns ?? 0) - (a.totalRuns ?? 0)).map(job => (
            <div key={job.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-between flex-wrap">
              <div>
                <p className="text-sm text-foreground">{job.jobNameAr}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">آخر تشغيل: {formatDate(job.lastRunAt)}</p>
              </div>
              <span className="text-lg font-bold text-cyan-400">{job.totalRuns ?? 0}</span>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Leaks Found Modal */}
      <DetailModal open={activeModal === "leaksFound"} onClose={() => setActiveModal(null)} title="حالات الرصد المكتشفة بواسطة المهام" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
            <p className="text-2xl font-bold text-amber-400">{totalLeaksFound}</p>
            <p className="text-xs text-muted-foreground">حالة رصد مكتشفة</p>
          </div>
          {jobs?.filter(j => (j.leaksFound ?? 0) > 0).sort((a, b) => (b.leaksFound ?? 0) - (a.leaksFound ?? 0)).map(job => (
            <div key={job.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-between flex-wrap">
              <div>
                <p className="text-sm text-foreground">{job.jobNameAr}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{platformLabels[job.platform]?.ar}</p>
              </div>
              <span className="text-lg font-bold text-amber-400">{job.leaksFound ?? 0}</span>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Total Jobs Modal */}
      <DetailModal open={activeModal === "totalJobs"} onClose={() => setActiveModal(null)} title="جميع المهام" icon={<Clock className="w-5 h-5 text-purple-400" />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
              <p className="text-xl font-bold text-emerald-400">{jobs?.filter(j => j.status === "active").length ?? 0}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">نشطة</p>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
              <p className="text-xl font-bold text-amber-400">{jobs?.filter(j => j.status === "paused").length ?? 0}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">متوقفة</p>
            </div>
          </div>
          {jobs?.map(job => {
            const sc = statusConfig[job.status] || statusConfig.active;
            return (
              <div key={job.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => { setSelectedJob(job); setActiveModal("jobDetail"); }}>
                <div className="flex items-center justify-between flex-wrap">
                  <span className="text-sm text-foreground">{job.jobNameAr}</span>
                  <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${sc.color}`}>{sc.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </DetailModal>

      {/* Job Detail Modal */}
      <DetailModal
        open={activeModal === "jobDetail" && !!selectedJob}
        onClose={() => { setActiveModal(null); setSelectedJob(null); }}
        title={selectedJob?.nameAr || "تفاصيل المهمة"}
        icon={<Activity className="w-5 h-5 text-primary" />}
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
              {(() => { const PI = platformIcons[selectedJob.platform] || Activity; return <PI className="w-8 h-8 text-primary" />; })()}
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedJob.jobNameAr}</h3>
                <p className="text-xs text-muted-foreground">{selectedJob.jobName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">الحالة</p>
                <span className={`text-sm font-bold mt-1 inline-block px-2 py-0.5 rounded border ${(statusConfig[selectedJob.status] || statusConfig.active).color}`}>
                  {(statusConfig[selectedJob.status] || statusConfig.active).label}
                </span>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">المنصة</p>
                <p className="text-sm font-bold text-foreground mt-1">{platformLabels[selectedJob.platform]?.ar || selectedJob.jobPlatform}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">التشغيلات</p>
                <p className="text-lg font-bold text-cyan-400 mt-1">{selectedJob.totalRuns ?? 0}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">حالات الرصد</p>
                <p className="text-lg font-bold text-amber-400 mt-1">{selectedJob.leaksFound ?? 0}</p>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">الجدول الزمني</h4>
              <p className="text-sm text-foreground font-mono">{selectedJob.cronExpression}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                <p className="text-xs text-muted-foreground">آخر تشغيل</p>
                <p className="text-sm text-foreground mt-1">{formatDate(selectedJob.lastRunAt)}</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                <p className="text-xs text-muted-foreground">آخر نتيجة</p>
                <p className="text-sm text-foreground mt-1">{selectedJob.lastResult || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}

```

---

## `client/src/leaks/pages/NationalOverview.tsx`

```tsx
// Leaks Domain
/**
 * NationalOverview — النظرة الوطنية
 * Matches breachdash design: KPI cards, severity distribution, sector analysis,
 * leak methods, leak platforms, and quick navigation cards
 */
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Database, AlertTriangle, DollarSign,
  Shield, Globe, Target, Users, Fingerprint, BarChart3,
  TrendingUp, TrendingDown, Equal, ArrowUpRight,
  ScanSearch, Network, CalendarClock, UserX, Map, Link2,
  Crosshair, ScrollText, Brain, FileBarChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useFilters } from "@/contexts/FilterContext";
import { Loader2 } from "lucide-react";
import GlobalFilterBar from "@/components/GlobalFilterBar";
import { Link } from "wouter";

/* ─── helpers ─── */
function fmt(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString("en-US");
}

const severityColors: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#3b82f6",
  Low: "#22c55e",
};

const severityLabels: Record<string, string> = {
  Critical: "عالي الأهمية",
  High: "مرتفع",
  Medium: "متوسط",
  Low: "منخفض",
};

/* ─── animation variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function NationalOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: apiRecords, isLoading, error } = trpc.leaks.fullData.useQuery();
  const records = apiRecords || [];

  /* ─── KPI computations ─── */
  const stats = useMemo(() => {
    const total = records.length;
    const exposed = records.reduce((s, r) => s + (r.overview?.exposed_records || 0), 0);
    const critical = records.filter(r => r.overview?.severity === "Critical").length;
    const totalPrice = records.reduce((s, r) => s + ((r as any).attacker_info?.price_usd || 0), 0);
    const ransomware = records.filter(r => r.category === "Ransomware").length;
    const dataBreach = records.filter(r => r.category === "Data Leak Case").length;
    const highSev = records.filter(r => r.overview?.severity === "High").length;
    const sectors = new Set(records.map(r => r.sector).filter(Boolean));
    const dataTypes = new Set(records.flatMap(r => r.data_types || []));
    const avgConf = records.reduce((s, r) => s + ((r as any).ai_analysis?.confidence_percentage || 0), 0) / Math.max(total, 1);
    return { total, exposed, critical, totalPrice, ransomware, dataBreach, highSev, sectors: sectors.size, dataTypes: dataTypes.size, avgConf: Math.round(avgConf) };
  }, [records]);

  /* ─── Severity distribution ─── */
  const severityData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const sev = r.overview?.severity || "Unknown";
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / Math.max(records.length, 1)) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  /* ─── Top sectors ─── */
  const topSectors = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const s = r.sector;
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [records]);

  /* ─── Leak methods ─── */
  const leakMethods = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const m = r.category || "غير محدد";
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  /* ─── Leak platforms ─── */
  const leakPlatforms = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const p = r.overview?.source_platform || "غير محدد";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  /* ─── Quick nav cards ─── */
  const quickNav = [
    { label: "تشريح حالات الرصد", labelEn: "Case Anatomy", icon: ScanSearch, path: "/leak-anatomy", color: "hsl(var(--primary))" },
    { label: "القطاعات المتضررة", labelEn: "Affected Sectors", icon: Network, path: "/sector-analysis", color: "#6459A7" },
    { label: "الخط الزمني", labelEn: "Timeline", icon: CalendarClock, path: "/leak-timeline", color: "#f59e0b" },
    { label: "مصادر حالة الرصد", labelEn: "Publishing Entities", icon: UserX, path: "/threat-actors-analysis", color: "#ef4444" },
    { label: "التحليل الجغرافي", labelEn: "Geo Analysis", icon: Map, path: "/geo-analysis", color: "#3b82f6" },
    { label: "سجل الحالات", labelEn: "Registry", icon: ScrollText, path: "/incidents-registry", color: "#22c55e" },
  ];

  const mainKpis = [
    { label: "إجمالي حالات الرصد", labelEn: "Total Incidents", value: stats.total, icon: ShieldAlert, color: "#ef4444" },
    { label: "العدد المُدّعى", labelEn: "العدد المُدّعى", value: fmt(stats.exposed), icon: Database, color: "hsl(var(--primary))" },
    { label: "حالات رصد عالية الأهمية", labelEn: "Critical Incidents", value: stats.critical, icon: AlertTriangle, color: "#f59e0b" },
    { label: "إجمالي السعر المطلوب", labelEn: "Total Asking Price", value: "$" + fmt(stats.totalPrice), icon: DollarSign, color: "#6459A7" },
  ];

  const miniStats = [
    { label: "حالات رصد فدية", value: stats.ransomware, icon: Target, color: "#ef4444" },
    { label: "حالة رصد بيانات", value: stats.dataBreach, icon: Globe, color: "#3b82f6" },
    { label: "مرتفعة مستوى التأثير", value: stats.highSev, icon: Shield, color: "#f59e0b" },
    { label: "قطاعات متأثرة", value: stats.sectors, icon: Users, color: "#22c55e" },
    { label: "أنواع بيانات", value: stats.dataTypes, icon: Fingerprint, color: "#6459A7" },
    { label: "ثقة التحليل", value: stats.avgConf + "%", icon: BarChart3, color: "hsl(var(--primary))" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3" dir="rtl">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">جاري تحميل البيانات من قاعدة البيانات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 gap-3" dir="rtl">
        <AlertTriangle className="w-8 h-8 text-destructive" />
        <span className="text-sm text-destructive">خطأ في تحميل البيانات: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden max-w-full space-y-6" dir="rtl">
      <GlobalFilterBar />

      {/* Page Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">النظرة الوطنية</h1>
        <p className="text-sm text-muted-foreground mt-1">National Overview</p>
      </div>

      {/* ═══ Main KPI Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Card className={`relative overflow-hidden border ${isDark ? "border-primary/15 bg-[rgba(13,21,41,0.6)] backdrop-blur-xl" : "border-border bg-white"}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between flex-wrap mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  <p className="text-xs sm:text-[10px] text-muted-foreground/60">{kpi.labelEn}</p>
                </CardContent>
                {/* Decorative gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ Mini Stat Cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {miniStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible">
              <Card className={`text-center border ${isDark ? "border-primary/10 bg-[rgba(13,21,41,0.4)] backdrop-blur-sm" : "border-border bg-white"}`}>
                <CardContent className="p-4">
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs sm:text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ Charts Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div custom={10} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-primary/15 bg-[rgba(13,21,41,0.6)] backdrop-blur-xl" : "border-border bg-white"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                توزيع مستوى التأثير
                <span className="text-xs sm:text-[10px] text-muted-foreground font-normal">Severity Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {severityData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between flex-wrap text-sm">
                    <span className="font-medium">{severityLabels[item.name] || item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.count}</span>
                      <Badge variant="outline" className="text-xs sm:text-[10px] px-1.5" style={{ borderColor: severityColors[item.name], color: severityColors[item.name] }}>
                        {item.pct}%
                      </Badge>
                    </div>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: severityColors[item.name] || "#6b7280" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Affected Sectors */}
        <motion.div custom={11} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-primary/15 bg-[rgba(13,21,41,0.6)] backdrop-blur-xl" : "border-border bg-white"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Network className="w-4 h-4 text-[#6459A7]" />
                أكثر القطاعات تضرراً
                <span className="text-xs sm:text-[10px] text-muted-foreground font-normal">Most Affected Sectors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topSectors.slice(0, 8).map((item, idx) => {
                const maxCount = topSectors[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = ["hsl(var(--primary))", "#6459A7", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e", "#ec4899", "#8b5cf6"];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between flex-wrap text-sm">
                      <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                      <span className="text-muted-foreground font-mono">{item.count}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: colors[idx % colors.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.05 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leak Methods */}
        <motion.div custom={12} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-primary/15 bg-[rgba(13,21,41,0.6)] backdrop-blur-xl" : "border-border bg-white"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ef4444]" />
                أساليب حالة الرصد
                <span className="text-xs sm:text-[10px] text-muted-foreground font-normal">Leak Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leakMethods.map((item, idx) => {
                const maxCount = leakMethods[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between flex-wrap text-sm">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.count}</span>
                        <Badge variant="outline" className="text-xs sm:text-[10px] px-1.5" style={{ borderColor: colors[idx % colors.length], color: colors[idx % colors.length] }}>
                          {Math.round((item.count / records.length) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: colors[idx % colors.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leak Platforms */}
        <motion.div custom={13} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-primary/15 bg-[rgba(13,21,41,0.6)] backdrop-blur-xl" : "border-border bg-white"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3b82f6]" />
                منصات حالة الرصد
                <span className="text-xs sm:text-[10px] text-muted-foreground font-normal">Leak Platforms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leakPlatforms.map((item, idx) => {
                const maxCount = leakPlatforms[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = ["#3b82f6", "#6459A7", "hsl(var(--primary))", "#f59e0b"];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between flex-wrap text-sm">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.count}</span>
                        <Badge variant="outline" className="text-xs sm:text-[10px] px-1.5" style={{ borderColor: colors[idx % colors.length], color: colors[idx % colors.length] }}>
                          {Math.round((item.count / records.length) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: colors[idx % colors.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ Latest Incidents ═══ */}
      <motion.div custom={14} variants={cardVariants} initial="hidden" animate="visible">
        <Card className={`border ${isDark ? "border-primary/15 bg-[rgba(13,21,41,0.6)] backdrop-blur-xl" : "border-border bg-white"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
              أحدث حالات الرصد
              <span className="text-xs sm:text-[10px] text-muted-foreground font-normal">Latest Incidents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.slice(0, 5).map((r) => (
                <Link key={r.id} href={`/incident/${r.id}`}>
                  <div className={`flex items-center justify-between flex-wrap p-3 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-primary/8" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${severityColors[r.overview?.severity] || "#6b7280"}15` }}>
                        <Database className="w-4 h-4" style={{ color: severityColors[r.overview?.severity] || "#6b7280" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{r.title_ar}</p>
                        <p className="text-xs sm:text-[10px] text-muted-foreground">{r.sector} · {r.overview?.source_platform}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{r.overview?.discovery_date}</p>
                      <Badge variant="outline" className="text-xs sm:text-[10px]" style={{ borderColor: severityColors[r.overview?.severity], color: severityColors[r.overview?.severity] }}>
                        {severityLabels[r.overview?.severity] || r.overview?.severity}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ Quick Navigation Cards ═══ */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-primary" />
          استكشف الأطلس
          <span className="text-xs text-muted-foreground font-normal">Explore Atlas</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {quickNav.map((nav, i) => {
            const Icon = nav.icon;
            return (
              <motion.div key={nav.path} custom={i + 15} variants={cardVariants} initial="hidden" animate="visible">
                <Link href={nav.path}>
                  <Card className={`cursor-pointer transition-all duration-200 border ${isDark ? "border-primary/10 bg-[rgba(13,21,41,0.4)] hover:border-primary/30 hover:bg-[rgba(13,21,41,0.6)]" : "border-border bg-white hover:border-primary/30 hover:shadow-md"}`}>
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${nav.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: nav.color }} />
                      </div>
                      <p className="text-sm font-medium">{nav.label}</p>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{nav.labelEn}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className={`text-center py-4 text-xs text-muted-foreground border-t ${isDark ? "border-border" : "border-border"}`}>
        <span className="font-mono">{stats.total}</span> حالة رصد · <span className="font-mono">+{fmt(stats.exposed)}</span> (العدد المُدّعى)
      </div>
    </div>
  );
}

```

---

## `client/src/leaks/pages/OsintTools.tsx`

```tsx
// Leaks Domain
/**
 * OsintTools — Google Dorks, Shodan queries, recon plans for Saudi data
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Radar,
  Search,
  Globe,
  Server,
  Terminal,
  Copy,
  Loader2,
  ExternalLink,
  Filter,
  Eye,
  Database,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  google_dork: { label: "Google Dork", icon: Search, color: "text-blue-400" },
  shodan: { label: "Shodan", icon: Server, color: "text-red-400" },
  recon: { label: "Recon", icon: Radar, color: "text-emerald-400" },
  spiderfoot: { label: "SpiderFoot", icon: Globe, color: "text-violet-400" },
};

export default function OsintTools() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { data: queries, isLoading } = trpc.osint.list.useQuery(
    activeType !== "all" ? { queryType: activeType } : undefined
  );

  const filteredQueries = (queries || []).filter((q) => {
    if (!searchTerm) return true;
    return q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.nameAr.includes(searchTerm) ||
      q.query.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    total: queries?.length || 0,
    google: queries?.filter(q => q.queryType === "google_dork").length || 0,
    shodan: queries?.filter(q => q.queryType === "shodan").length || 0,
    recon: queries?.filter(q => q.queryType === "recon").length || 0,
  };

  const copyQuery = (query: string) => {
    navigator.clipboard.writeText(query);
    toast.success("تم نسخ الاستعلام");
  };

  const statCards = [
    { label: "إجمالي الاستعلامات", value: stats.total, icon: Database, color: "text-primary", description: "مجموع كل استعلامات OSINT المتوفرة في النظام." },
    { label: "Google Dorks", value: stats.google, icon: Search, color: "text-blue-400", description: "استعلامات بحث متقدمة للعثور على معلومات محددة باستخدام جوجل." },
    { label: "Shodan", value: stats.shodan, icon: Server, color: "text-red-400", description: "استعلامات للبحث عن أجهزة وخوادم متصلة بالإنترنت بناءً على خصائصها." },
    { label: "Recon", value: stats.recon, icon: Radar, color: "text-emerald-400", description: "خطط وإجراءات استطلاعية لجمع معلومات استخباراتية أولية." },
  ];

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Radar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">أدوات OSINT</h1>
              <p className="text-xs text-muted-foreground">Open Source Intelligence Tools</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            استعلامات Google Dorks و Shodan مخصصة للبيانات السعودية — {stats.total}+ استعلام جاهز للاستخدام
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border-border cursor-pointer hover:scale-[1.02] transition-all group"
            onClick={() => setActiveModal(`stat-${stat.label}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الاستعلامات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={activeType === "all" ? "default" : "outline"} onClick={() => setActiveType("all")} className="text-xs">الكل</Button>
          {Object.entries(typeConfig).map(([key, config]) => (
            <Button
              key={key}
              size="sm"
              variant={activeType === key ? "default" : "outline"}
              onClick={() => setActiveType(key)}
              className="text-xs gap-1"
            >
              <config.icon className="w-3 h-3" />
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredQueries.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <Radar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">لا توجد استعلامات مطابقة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQueries.map((query, i) => {
            const config = typeConfig[query.queryType] || typeConfig.google_dork;
            const Icon = config.icon;
            return (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card 
                  className="border-border hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => setActiveModal(String(query.id))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{query.queryNameAr}</h3>
                          <p className="text-xs sm:text-[10px] text-muted-foreground">{query.queryName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs sm:text-[10px]">{config.label}</Badge>
                        {query.categoryAr && (
                          <Badge variant="outline" className="text-xs sm:text-[10px] bg-secondary/30">{query.queryCategoryAr}</Badge>
                        )}
                      </div>
                    </div>

                    {query.descriptionAr && (
                      <p className="text-xs text-muted-foreground mb-2">{query.descriptionAr}</p>
                    )}

                    {/* Query box */}
                    <div className="relative p-3 rounded-lg bg-black/30 border border-border group/query">
                      <code className="text-xs font-mono text-primary break-all" dir="ltr">{query.query}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 left-2 h-6 w-6 p-0 opacity-0 group-hover/query:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); copyQuery(query.query); }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between flex-wrap mt-2">
                      <span className="text-xs sm:text-[10px] text-muted-foreground font-mono">{query.queryId}</span>
                      {query.resultsCount !== null && query.resultsCount > 0 && (
                        <span className="text-xs sm:text-[10px] text-muted-foreground">{query.resultsCount} نتيجة</span>
                      )}
                    </div>
                    <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {statCards.map(stat => (
        <DetailModal
          key={`modal-stat-${stat.label}`}
          open={activeModal === `stat-${stat.label}`}
          onClose={() => setActiveModal(null)}
          title={stat.label}
          icon={<stat.icon className={`w-5 h-5 ${stat.color}`} />}
        >
          <div className="p-4 text-center">
            <p className="text-2xl sm:text-4xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-2">{stat.description}</p>
          </div>
        </DetailModal>
      ))}

      {filteredQueries.map(query => {
        const config = typeConfig[query.queryType] || typeConfig.google_dork;
        return (
          <DetailModal
            key={`modal-query-${query.id}`}
            open={activeModal === String(query.id)}
            onClose={() => setActiveModal(null)}
            title={query.queryNameAr}
            icon={<config.icon className={`w-5 h-5 ${config.color}`} />}
            maxWidth="max-w-2xl"
          >
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">{query.descriptionAr}</p>
              <div className="relative p-3 rounded-lg bg-black/30 border border-border group">
                <code className="text-sm font-mono text-primary break-all" dir="ltr">{query.query}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 left-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyQuery(query.query)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>ID: {query.queryId}</span>
                <span>النوع: {config.label}</span>
                {query.categoryAr && <span>الفئة: {query.queryCategoryAr}</span>}
              </div>
            </div>
          </DetailModal>
        )
      })}
    </div>
  );
}

```

---

## `client/src/leaks/pages/PIIAtlas.tsx`

```tsx
// Leaks Domain
/**
 * PIIAtlas — أطلس البيانات الشخصية
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Fingerprint, Shield, AlertTriangle, Database } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#14b8a6"];

export default function PIIAtlas() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { piiTypes: [], total: 0, totalRecords: 0 };
    const map: Record<string, { count: number; records: number }> = {};
    leaks.forEach((l: any) => {
      const types = l.piiTypesAr || l.piiTypes || [];
      const arr = Array.isArray(types) ? types : typeof types === "string" ? types.split(",").map((t: string) => t.trim()) : [];
      arr.forEach((t: string) => {
        if (!t) return;
        if (!map[t]) map[t] = { count: 0, records: 0 };
        map[t].count++;
        map[t].records += l.recordCount || 0;
      });
    });
    const piiTypes = Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count);
    return { piiTypes, total: leaks.length, totalRecords: piiTypes.reduce((s, p) => s + p.records, 0) };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">أطلس البيانات الشخصية</h1><p className="text-muted-foreground text-sm mt-1">تحليل أنواع البيانات الشخصية المكتشفة (PII)</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Fingerprint className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.piiTypes.length}</div><div className="text-xs text-muted-foreground">نوع بيانات شخصية</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">حالات الرصد</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Database className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.totalRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-muted-foreground">سجلات متأثرة</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">أكثر أنواع البيانات تعرضاً</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analysis.piiTypes.slice(0, 12)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={130} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">توزيع الأنواع</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={analysis.piiTypes.slice(0, 10)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.piiTypes.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل أنواع البيانات الشخصية</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.piiTypes.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-900/50 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium text-sm">{p.name}</span>
                  <Badge className="bg-purple-500/20 text-purple-400">{p.count}</Badge>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${analysis.piiTypes[0]?.count ? (p.count / analysis.piiTypes[0].count) * 100 : 0}%` }} />
                </div>
                <p className="text-muted-foreground text-xs mt-1">{p.records.toLocaleString("ar-SA")} السجلات المكشوفة</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/leaks/pages/PIIClassifier.tsx`

```tsx
// Leaks Domain
/**
 * PIIClassifier — Enhanced PII detection and classification tool
 * 18 Saudi-specific PII patterns + InfoStealer + Smart Detection
 * Dark Observatory Theme — Uses tRPC API
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Play,
  RotateCcw,
  FileText,
  Hash,
  Phone,
  Mail,
  CreditCard,
  User,
  History,
  Loader2,
  Bug,
  Database,
  Key,
  MapPin,
  Calendar,
  Stethoscope,
  Receipt,
  Car,
  BookOpen,
  Binary,
  Lock,
  Eye,
  DollarSign,
  Fingerprint,
  Globe,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";
import AnimatedCounter from "@/components/AnimatedCounter";

// sampleData removed — PIIClassifier now loads last scanned text from DB via trpc.pii.history

interface DetectedPII {
  type: string;
  typeAr: string;
  value: string;
  line: number;
  icon: React.ElementType;
  color: string;
  confidence: number;
  position: [number, number];
  category: string;
}

// 18 Saudi-specific PII patterns + InfoStealer + Smart Detection
const piiRegexPatterns = [
  // === Identity Data ===
  { type: "National ID", typeAr: "رقم الهوية الوطنية", regex: /\b1\d{9}\b/g, icon: Hash, color: "text-red-400", category: "identity", confidence: 0.98 },
  { type: "Iqama Number", typeAr: "رقم الإقامة", regex: /\b2\d{9}\b/g, icon: FileText, color: "text-amber-400", category: "identity", confidence: 0.97 },
  { type: "Passport", typeAr: "رقم جواز السفر", regex: /\b[A-Z]\d{8}\b/g, icon: Globe, color: "text-indigo-400", category: "identity", confidence: 0.85 },
  { type: "Family Book", typeAr: "رقم دفتر العائلة", regex: /\b\d{10}\b/g, icon: BookOpen, color: "text-pink-400", category: "identity", confidence: 0.60 },
  { type: "Driving License", typeAr: "رقم رخصة القيادة", regex: /\bDL[-]?\d{10}\b/gi, icon: Car, color: "text-orange-400", category: "identity", confidence: 0.92 },

  // === Contact Data ===
  { type: "Saudi Phone", typeAr: "رقم جوال سعودي", regex: /\b05\d{8}\b/g, icon: Phone, color: "text-cyan-400", category: "contact", confidence: 0.96 },
  { type: "Saudi Email", typeAr: "بريد إلكتروني سعودي", regex: /[\w.-]+@[\w.-]+\.sa\b/gi, icon: Mail, color: "text-violet-400", category: "contact", confidence: 0.95 },
  { type: "National Address", typeAr: "العنوان الوطني", regex: /\b[A-Z]{4}\d{4}\b/g, icon: MapPin, color: "text-teal-400", category: "contact", confidence: 0.88 },

  // === Financial Data ===
  { type: "IBAN", typeAr: "رقم الحساب البنكي", regex: /\bSA\d{22}\b/g, icon: CreditCard, color: "text-emerald-400", category: "financial", confidence: 0.99 },
  { type: "Credit Card", typeAr: "بطاقة ائتمان", regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, icon: CreditCard, color: "text-yellow-400", category: "financial", confidence: 0.90 },
  { type: "Tax Number", typeAr: "الرقم الضريبي", regex: /\b3\d{14}\b/g, icon: Receipt, color: "text-lime-400", category: "financial", confidence: 0.93 },
  { type: "Salary", typeAr: "الراتب", regex: /(?:راتب|salary|أجر)[:\s]*[\d,]+(?:\s*(?:ريال|SAR|SR))?/gi, icon: DollarSign, color: "text-green-400", category: "financial", confidence: 0.85 },

  // === Sensitive Data ===
  { type: "Date of Birth", typeAr: "تاريخ الميلاد", regex: /\b(?:19|20)\d{2}[\/\-]\d{2}[\/\-]\d{2}\b/g, icon: Calendar, color: "text-blue-400", category: "sensitive", confidence: 0.80 },
  { type: "Medical Record", typeAr: "السجل الطبي", regex: /\bMRN[-]?\d{4}[-]?\d{5}\b/gi, icon: Stethoscope, color: "text-rose-400", category: "sensitive", confidence: 0.94 },
  { type: "IP Address", typeAr: "عنوان IP", regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g, icon: Globe, color: "text-sky-400", category: "technical", confidence: 0.92 },

  // === Smart Detection: InfoStealer ===
  { type: "Credentials", typeAr: "بيانات تسجيل الدخول", regex: /(?:password|passwd|pass|كلمة.?(?:المرور|السر))[:\s]+\S+/gi, icon: Key, color: "text-red-500", category: "stealer", confidence: 0.95 },
  { type: "InfoStealer URL", typeAr: "رابط InfoStealer", regex: /(?:URL|Host)[:\s]+https?:\/\/[^\s]+(?:login|auth|bank|pay)/gi, icon: Bug, color: "text-red-600", category: "stealer", confidence: 0.90 },

  // === Smart Detection: SQL/Code ===
  { type: "SQL Pattern", typeAr: "نمط SQL", regex: /\b(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b.*(?:national_id|phone|email|iqama|salary|password)/gi, icon: Database, color: "text-purple-400", category: "code", confidence: 0.88 },

  // === Smart Detection: Masked Data ===
  { type: "Masked Data", typeAr: "بيانات مقنّعة", regex: /\b(?:05|10|20)\d*X{3,}\d*\b/g, icon: Eye, color: "text-zinc-500", category: "masked", confidence: 0.75 },

  // === Smart Detection: Base64 ===
  { type: "Base64 Encoded", typeAr: "بيانات مشفرة Base64", regex: /\b[A-Za-z0-9+/]{20,}={1,2}\b/g, icon: Binary, color: "text-fuchsia-400", category: "encoded", confidence: 0.70 },
];

const categoryInfo: Record<string, { label: string; labelEn: string; color: string; icon: React.ElementType }> = {
  identity: { label: "بيانات الهوية", labelEn: "Identity Data", color: "border-red-500/30 bg-red-500/5", icon: Hash },
  contact: { label: "بيانات الاتصال", labelEn: "Contact Data", color: "border-cyan-500/30 bg-cyan-500/5", icon: Phone },
  financial: { label: "البيانات المالية", labelEn: "Financial Data", color: "border-emerald-500/30 bg-emerald-500/5", icon: CreditCard },
  sensitive: { label: "البيانات الحساسة", labelEn: "Sensitive Data", color: "border-amber-500/30 bg-amber-500/5", icon: Shield },
  technical: { label: "البيانات التقنية", labelEn: "Technical Data", color: "border-sky-500/30 bg-sky-500/5", icon: Globe },
  stealer: { label: "InfoStealer", labelEn: "InfoStealer Logs", color: "border-red-600/30 bg-red-600/5", icon: Bug },
  code: { label: "أنماط الكود", labelEn: "Code Patterns", color: "border-purple-500/30 bg-purple-500/5", icon: Database },
  masked: { label: "بيانات مقنّعة", labelEn: "Masked Data", color: "border-zinc-500/30 bg-zinc-500/5", icon: Eye },
  encoded: { label: "بيانات مشفرة", labelEn: "Encoded Data", color: "border-fuchsia-500/30 bg-fuchsia-500/5", icon: Binary },
};

const piiTypeColors: Record<string, string> = {
  "National ID": "text-red-400 bg-red-500/10 border-red-500/30",
  "Iqama Number": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "Phone Number": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  "Saudi Phone": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  "Email": "text-violet-400 bg-violet-500/10 border-violet-500/30",
  "Saudi Email": "text-violet-400 bg-violet-500/10 border-violet-500/30",
  "IBAN": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "Full Name": "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Passport": "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  "Credit Card": "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  "Credentials": "text-red-500 bg-red-500/10 border-red-500/30",
  "InfoStealer URL": "text-red-600 bg-red-600/10 border-red-600/30",
  "SQL Pattern": "text-purple-400 bg-purple-500/10 border-purple-500/30",
  "Masked Data": "text-zinc-500 bg-zinc-500/10 border-zinc-500/30",
  "Base64 Encoded": "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
  "National Address": "text-teal-400 bg-teal-500/10 border-teal-500/30",
  "Date of Birth": "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Medical Record": "text-rose-400 bg-rose-500/10 border-rose-500/30",
  "IP Address": "text-sky-400 bg-sky-500/10 border-sky-500/30",
  "Tax Number": "text-lime-400 bg-lime-500/10 border-lime-500/30",
  "Salary": "text-green-400 bg-green-500/10 border-green-500/30",
  "Family Book": "text-pink-400 bg-pink-500/10 border-pink-500/30",
  "Driving License": "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

export default function PIIClassifier() {
  const [inputText, setInputText] = useState("");
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [apiResults, setApiResults] = useState<{
    results: Array<{ type: string; typeAr: string; value: string; line: number }>;
    totalMatches: number;
  } | null>(null);

  const { data: history, isLoading: historyLoading } = trpc.pii.history.useQuery();
  const scanMutation = trpc.pii.scan.useMutation();

  // تحميل آخر نص تم فحصه من قاعدة البيانات عند فتح الصفحة
  const [isInitialized, setIsInitialized] = useState(false);
  useMemo(() => {
    if (!isInitialized && history && history.length > 0 && !inputText) {
      setInputText((history[0] as any).inputText || "");
      setIsInitialized(true);
    }
  }, [history, isInitialized, inputText]);

  // Local regex scan with all 20 patterns
  const detectedPII = useMemo(() => {
    if (!hasScanned) return [];
    const results: DetectedPII[] = [];
    const lines = inputText.split("\n");

    lines.forEach((line, lineIdx) => {
      piiRegexPatterns.forEach((pattern) => {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match;
        while ((match = regex.exec(line)) !== null) {
          results.push({
            type: pattern.type,
            typeAr: pattern.typeAr,
            value: match[0],
            line: lineIdx + 1,
            icon: pattern.icon,
            color: pattern.color,
            confidence: pattern.confidence,
            position: [match.index, match.index + match[0].length],
            category: pattern.category,
          });
        }
      });
    });

    return results;
  }, [inputText, hasScanned]);

  const piiSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    detectedPII.forEach((pii) => {
      summary[pii.typeAr] = (summary[pii.typeAr] || 0) + 1;
    });
    return summary;
  }, [detectedPII]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, DetectedPII[]> = {};
    detectedPII.forEach((pii) => {
      if (!summary[pii.category]) summary[pii.category] = [];
      summary[pii.category].push(pii);
    });
    return summary;
  }, [detectedPII]);

  const handleScan = async () => {
    if (!inputText.trim()) {
      toast.error("الرجاء إدخال نص للفحص");
      return;
    }
    setIsScanning(true);
    setHasScanned(true);
    try {
      const result = await scanMutation.mutateAsync({ text: inputText });
      setApiResults(result);
      toast.success(`تم اكتشاف ${result.totalMatches} بيانات شخصية`, {
        description: "PII detection complete",
      });
    } catch {
      // Fall back to local scan
      toast.success(`تم اكتشاف ${detectedPII.length} بيانات شخصية (محلي)`, {
        description: "PII detection complete (local)",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setInputText("");
    setHasScanned(false);
    setApiResults(null);
    setExpandedCategory(null);
  };

  const matchCount = apiResults?.totalMatches ?? detectedPII.length;
  const riskScore = matchCount > 15 ? 95 : matchCount > 10 ? 85 : matchCount > 5 ? 70 : matchCount > 2 ? 50 : 20;
  const hasStealerData = detectedPII.some(p => p.category === "stealer");
  const hasSQLPatterns = detectedPII.some(p => p.category === "code");

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <ScanSearch className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">مصنّف البيانات الشخصية المتقدم</h1>
              <p className="text-xs text-muted-foreground">Advanced PII Classifier — 20 Pattern • InfoStealer • Smart Detection</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            محرك كشف متقدم يدعم 20 نمطاً سعودياً + كشف InfoStealer + أنماط SQL + Base64 + البيانات المقنّعة
          </p>
        </div>
      </motion.div>

      {/* Stats bar — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: "patterns", label: "نمط كشف", value: 20, color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
          { key: "identity", label: "بيانات هوية", value: 5, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
          { key: "financial", label: "بيانات مالية", value: 4, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
          { key: "stealer", label: "InfoStealer", value: 2, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
          { key: "smart", label: "كشف ذكي", value: 3, color: "text-purple-400", borderColor: "border-purple-500/20", bgColor: "bg-purple-500/5" },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`p-3 rounded-lg ${stat.bgColor} border ${stat.borderColor} text-center cursor-pointer hover:scale-[1.02] transition-all group`}
            onClick={() => setActiveModal(stat.key)}
          >
            <p className={`text-2xl font-bold ${stat.color}`}><AnimatedCounter value={typeof stat.value === "number" ? stat.value : 0} /></p>
            <p className="text-xs sm:text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="scanner" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="scanner">الماسح التفاعلي</TabsTrigger>
          <TabsTrigger value="patterns">أنماط الكشف (20)</TabsTrigger>
          <TabsTrigger value="categories">التصنيفات</TabsTrigger>
          <TabsTrigger value="history">سجل الفحوصات</TabsTrigger>
        </TabsList>

        {/* Scanner tab */}
        <TabsContent value="scanner" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between flex-wrap">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    النص المدخل
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5 h-7 text-xs">
                      <RotateCcw className="w-3 h-3" />
                      إعادة تعيين
                    </Button>
                    <Button size="sm" onClick={handleScan} disabled={isScanning} className="gap-1.5 h-7 text-xs bg-primary text-primary-foreground">
                      {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      فحص شامل
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); setHasScanned(false); setApiResults(null); }}
                  className="w-full h-80 p-4 rounded-lg bg-black/30 border border-border text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="الصق النص هنا لفحص البيانات الشخصية..."
                  dir="auto"
                />
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  نتائج الكشف
                  {hasScanned && (
                    <Badge variant="outline" className="mr-2 bg-primary/10 border-primary/30 text-primary text-xs">
                      {matchCount} نتيجة
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasScanned ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ScanSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">اضغط "فحص شامل" لبدء الكشف عن البيانات الشخصية</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">20 نمط كشف + InfoStealer + SQL + Base64</p>
                    </div>
                  </div>
                ) : isScanning ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">جارٍ الفحص بـ 20 نمطاً...</p>
                    </div>
                  </div>
                ) : detectedPII.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                      <p className="text-sm">لم يتم اكتشاف بيانات شخصية</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Risk score + alerts */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-secondary/20 border border-border">
                        <span className="text-sm text-foreground">درجة التأثير</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full bg-secondary/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${riskScore}%` }}
                              transition={{ duration: 0.8 }}
                              className={`h-full rounded-full ${riskScore >= 80 ? "bg-red-500" : riskScore >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                            />
                          </div>
                          <span className={`text-sm font-bold ${riskScore >= 80 ? "text-red-400" : riskScore >= 50 ? "text-amber-400" : "text-emerald-400"}`}>
                            {riskScore}%
                          </span>
                        </div>
                      </div>

                      {/* InfoStealer alert */}
                      {hasStealerData && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                        >
                          <Bug className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-red-400">تحذير: بيانات InfoStealer مكتشفة!</p>
                            <p className="text-xs sm:text-[10px] text-red-400/70">تم اكتشاف بيانات تسجيل دخول مسروقة — يُحتمل أنها من برمجيات RedLine/Vidar</p>
                          </div>
                        </motion.div>
                      )}

                      {/* SQL alert */}
                      {hasSQLPatterns && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center gap-3"
                        >
                          <Database className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-purple-400">تحذير: أنماط SQL مكتشفة!</p>
                            <p className="text-xs sm:text-[10px] text-purple-400/70">تم اكتشاف استعلامات SQL تحتوي على أسماء أعمدة بيانات شخصية</p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Category summary */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(categorySummary).map(([cat, items]) => {
                        const info = categoryInfo[cat];
                        if (!info) return null;
                        return (
                          <Badge key={cat} variant="outline" className={`${info.color} text-xs cursor-pointer`}
                            onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}>
                            {info.label}: {items.length}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Detailed results */}
                    <div className="h-40 overflow-y-auto space-y-2">
                      {detectedPII.map((pii, i) => {
                        const Icon = pii.icon;
                        return (
                          <motion.div
                            key={`${pii.type}-${pii.value}-${i}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border"
                          >
                            <Icon className={`w-4 h-4 ${pii.color} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{pii.typeAr}</p>
                              <p className="text-xs sm:text-[10px] text-muted-foreground">سطر {pii.line} • ثقة {Math.round(pii.confidence * 100)}%</p>
                            </div>
                            <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded truncate max-w-[200px]">
                              {pii.value}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(pii.value);
                                toast("تم النسخ");
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns tab — all 20 patterns */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {piiRegexPatterns.map((pattern, i) => {
              const Icon = pattern.icon;
              const catInfo = categoryInfo[pattern.category];
              return (
                <motion.div key={pattern.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="border-border hover:border-primary/30 transition-colors h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon className={`w-4.5 h-4.5 ${pattern.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">{pattern.typeAr}</h3>
                          <p className="text-xs sm:text-[10px] text-muted-foreground">{pattern.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-[9px] ${catInfo?.color || ""}`}>
                          {catInfo?.label || pattern.category}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">
                          ثقة {Math.round(pattern.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-border">
                        <code className="text-xs sm:text-[10px] font-mono text-primary break-all" dir="ltr">{pattern.regex.source}</code>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Categories tab — PDPL classification */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const Icon = info.icon;
              const patterns = piiRegexPatterns.filter(p => p.category === key);
              if (patterns.length === 0) return null;
              return (
                <Card key={key} className={`border ${info.color}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {info.label}
                      <Badge variant="outline" className="text-xs sm:text-[10px] mr-auto">{patterns.length} أنماط</Badge>
                    </CardTitle>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{info.labelEn}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patterns.map((p) => {
                        const PIcon = p.icon;
                        return (
                          <div key={p.type} className="flex items-center gap-2 p-2 rounded bg-secondary/20 border border-border/50">
                            <PIcon className={`w-3.5 h-3.5 ${p.color} flex-shrink-0`} />
                            <span className="text-xs text-foreground flex-1">{p.typeAr}</span>
                            <span className="text-[9px] text-muted-foreground">{Math.round(p.confidence * 100)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* PDPL Compliance Categories */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                تصنيف البيانات حسب نظام حماية البيانات الشخصية (PDPL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { category: "بيانات الهوية الشخصية", categoryEn: "Personal Identity Data", items: ["رقم الهوية الوطنية", "رقم الإقامة", "رقم جواز السفر", "رقم دفتر العائلة", "رقم رخصة القيادة"], color: "border-red-500/30", icon: "🪪" },
                  { category: "بيانات الاتصال", categoryEn: "Contact Data", items: ["رقم الجوال السعودي", "البريد الإلكتروني", "العنوان الوطني"], color: "border-cyan-500/30", icon: "📱" },
                  { category: "البيانات المالية", categoryEn: "Financial Data", items: ["رقم الحساب البنكي (IBAN)", "بطاقة الائتمان", "الرقم الضريبي", "الراتب والأجور"], color: "border-emerald-500/30", icon: "💳" },
                  { category: "البيانات الحساسة", categoryEn: "Sensitive Data", items: ["تاريخ الميلاد", "السجل الطبي", "البيانات البيومترية"], color: "border-amber-500/30", icon: "🔒" },
                  { category: "البيانات التقنية", categoryEn: "Technical Data", items: ["عنوان IP", "بيانات تسجيل الدخول", "بيانات InfoStealer"], color: "border-sky-500/30", icon: "🖥️" },
                  { category: "الكشف الذكي", categoryEn: "Smart Detection", items: ["أنماط SQL/قواعد البيانات", "البيانات المقنّعة", "البيانات المشفرة Base64"], color: "border-purple-500/30", icon: "🧠" },
                ].map((cat) => (
                  <div key={cat.category} className={`p-4 rounded-lg bg-secondary/20 border ${cat.color}`}>
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <span>{cat.icon}</span> {cat.category}
                    </h4>
                    <p className="text-xs sm:text-[10px] text-muted-foreground mb-2">{cat.categoryEn}</p>
                    <ul className="space-y-1">
                      {cat.items.map((item) => (
                        <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                سجل الفحوصات السابقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (history && history.length > 0) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">التاريخ</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">حجم النص</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">النتائج</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">التأثير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((scan) => {
                        const mc = scan.totalMatches ?? (scan.results?.length ?? 0);
                        const risk = mc > 15 ? 95 : mc > 10 ? 85 : mc > 5 ? 70 : mc > 2 ? 50 : 20;
                        return (
                          <tr key={scan.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString("ar-SA") : "—"}
                            </td>
                            <td className="py-3 px-4 text-xs text-foreground">{scan.inputText.length} حرف</td>
                            <td className="py-3 px-4 text-xs text-foreground font-medium">{mc} نتيجة</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs sm:text-[10px] px-2 py-1 rounded border ${
                                risk >= 80 ? "text-red-400 bg-red-500/10 border-red-500/30" :
                                risk >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                                "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              }`}>
                                {risk}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد فحوصات سابقة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ MODALS ═══ */}
      <DetailModal open={activeModal === "patterns"} onClose={() => setActiveModal(null)} title="أنماط الكشف المتقدمة" icon={<ScanSearch className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-3">
          <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
            <p className="text-2xl font-bold text-cyan-400">20</p>
            <p className="text-xs text-muted-foreground">نمط كشف متقدم</p>
          </div>
          <p className="text-xs text-muted-foreground">يدعم المحرك 20 نمطاً للكشف عن البيانات الشخصية السعودية، تشمل بيانات الهوية والاتصال والبيانات المالية والحساسة، بالإضافة إلى الكشف الذكي عن InfoStealer وأنماط SQL والبيانات المشفرة.</p>
          <div className="space-y-2">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const count = piiRegexPatterns.filter(p => p.category === key).length;
              if (count === 0) return null;
              const Icon = info.icon;
              return (
                <div key={key} className={`p-3 rounded-lg border ${info.color} flex items-center justify-between flex-wrap`}>
                  <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span className="text-sm text-foreground">{info.label}</span></div>
                  <span className="text-sm font-bold text-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "identity"} onClose={() => setActiveModal(null)} title="أنماط بيانات الهوية" icon={<Hash className="w-5 h-5 text-red-400" />}>
        <div className="space-y-3">
          {piiRegexPatterns.filter(p => p.category === "identity").map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
                <code className="text-xs sm:text-[10px] font-mono text-primary mt-1 block" dir="ltr">{p.regex.source}</code>
              </div>
            );
          })}
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "financial"} onClose={() => setActiveModal(null)} title="أنماط البيانات المالية" icon={<CreditCard className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          {piiRegexPatterns.filter(p => p.category === "financial").map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
                <code className="text-xs sm:text-[10px] font-mono text-primary mt-1 block" dir="ltr">{p.regex.source}</code>
              </div>
            );
          })}
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "stealer"} onClose={() => setActiveModal(null)} title="أنماط InfoStealer" icon={<Bug className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-xs text-red-400">تكشف هذه الأنماط عن بيانات تسجيل الدخول المسروقة بواسطة برمجيات مثل RedLine و Vidar و Raccoon</p>
          </div>
          {piiRegexPatterns.filter(p => p.category === "stealer").map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
              </div>
            );
          })}
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "smart"} onClose={() => setActiveModal(null)} title="الكشف الذكي" icon={<Zap className="w-5 h-5 text-purple-400" />}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">يشمل الكشف الذكي اكتشاف أنماط SQL التي تحتوي على أسماء أعمدة بيانات شخصية، والبيانات المقنّعة جزئياً، والبيانات المشفرة بـ Base64.</p>
          {piiRegexPatterns.filter(p => ["code", "masked", "encoded"].includes(p.category)).map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
              </div>
            );
          })}
        </div>
      </DetailModal>
    </div>
  );
}

```

---

## `client/src/leaks/pages/PasteSites.tsx`

```tsx
// Leaks Domain
/**
 * PasteSites — Enhanced Paste site monitoring view
 * Dark Observatory Theme — Uses tRPC API
 * Enhanced with: search/filter, severity indicators, timeline, risk heatmap, animated stats
 */
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  Clock,
  RefreshCw,
  ExternalLink,
  Eye,
  Loader2,
  Info,
  Server,
  ScanLine,
  ShieldAlert,
  Search,
  Filter,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
  Calendar,
  Shield,
  Flame,
  Zap,
  BarChart2,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { DetailModal } from "@/components/DetailModal";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";


// Helper to safely parse JSON strings from DB
const parseJsonSafe = (v: any, fallback: any = []) => {
  if (!v) return fallback;
  if (typeof v === 'string') {
    try { const parsed = JSON.parse(v); return parsed || fallback; } catch { return fallback; }
  }
  return v;
};

const statusStyle = (s: string) => {
  switch (s) {
    case "flagged": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "analyzing": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "documented": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  }
};

const statusText = (s: string) => {
  switch (s) {
    case "flagged": return "مُعلَّم";
    case "analyzing": return "قيد التحليل";
    case "documented": return "موثّق";
    default: return "تم التوثيق";
  }
};

const severityLevel = (paste: any): { level: string; color: string; icon: typeof Shield; label: string } => {
  const piiCount = parseJsonSafe(paste.pastePiiTypes, undefined)?.length ?? 0;
  if (paste.status === "flagged" || piiCount >= 4) {
    return { level: "critical", color: "text-red-500", icon: Flame, label: "واسع النطاق" };
  }
  if (piiCount >= 2) {
    return { level: "high", color: "text-orange-400", icon: AlertTriangle, label: "عالي" };
  }
  if (piiCount >= 1) {
    return { level: "medium", color: "text-amber-400", icon: Shield, label: "متوسط" };
  }
  return { level: "low", color: "text-emerald-400", icon: Shield, label: "منخفض" };
};

// Animated counter component
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

export default function PasteSites() {
  const { data: pastes, isLoading: pastesLoading, refetch: refetchPastes } = trpc.pastes.list.useQuery();
  const { data: channels, isLoading: channelsLoading, refetch: refetchChannels } = trpc.channels.list.useQuery({ platform: "paste" });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [drillLeak, setDrillLeak] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "severity">("date");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pasteEntries = pastes ?? [];
  const pasteChannels = channels ?? [];
  const isLoading = pastesLoading || channelsLoading;

  // Filtered and sorted pastes
  const filteredPastes = useMemo(() => {
    let filtered = [...pasteEntries];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.filename.toLowerCase().includes(q) ||
        p.sourceName.toLowerCase().includes(q) ||
        (p.preview && p.preview.toLowerCase().includes(q)) ||
        parseJsonSafe(p.pastePiiTypes, []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
    } else {
      filtered.sort((a, b) => {
        const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (severityOrder[severityLevel(b).level] || 0) - (severityOrder[severityLevel(a).level] || 0);
      });
    }

    return filtered;
  }, [pasteEntries, searchQuery, statusFilter, sortBy]);

  // Risk distribution for heatmap
  const riskDistribution = useMemo(() => {
    const dist = { critical: 0, high: 0, medium: 0, low: 0 };
    pasteEntries.forEach(p => {
      const sev = severityLevel(p);
      dist[sev.level as keyof typeof dist]++;
    });
    return dist;
  }, [pasteEntries]);

  // Timeline data (group by date)
  const timelineData = useMemo(() => {
    const groups: Record<string, number> = {};
    pasteEntries.forEach(p => {
      const date = new Date(p.detectedAt).toLocaleDateString("ar-SA");
      groups[date] = (groups[date] || 0) + 1;
    });
    return Object.entries(groups).slice(0, 7).reverse();
  }, [pasteEntries]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchPastes(), refetchChannels()]);
      toast.success("تم تحديث البيانات");
    } catch {
      toast.error("فشل في تحديث البيانات");
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportPastes = () => {
    if (filteredPastes.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const BOM = "\uFEFF";
    const headers = ["اسم الملف", "المصدر", "الحالة", "تاريخ الاكتشاف", "أنواع البيانات", "التأثير"];
    const rows = filteredPastes.map(p => [
      p.filename,
      p.sourceName,
      statusText(p.status),
      new Date(p.detectedAt).toLocaleString("ar-SA"),
      parseJsonSafe(p.pastePiiTypes, []).join(" | "),
      severityLevel(p).label,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paste-sites-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير البيانات بنجاح");
  };

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { id: "monitored-sites", label: "مواقع مراقبة", value: pasteChannels.length, color: "text-amber-400", icon: Server, description: "إجمالي عدد مواقع اللصق التي تتم مراقبتها حاليًا بحثًا عن حالات رصد محتملة." },
    { id: "pastes-found", label: "لصقات مرصودة", value: pasteEntries.length, color: "text-cyan-400", icon: ScanLine, description: "إجمالي عدد اللصقات (Pastes) التي تم رصدها عبر جميع المواقع المراقبة." },
    { id: "analyzing", label: "قيد التحليل", value: pasteEntries.filter((p) => p.status === "analyzing").length, color: "text-violet-400", icon: Loader2, description: "عدد اللصقات التي يتم تحليلها حاليًا لتحديد ما إذا كانت تحتوي على بيانات حساسة." },
    { id: "flagged", label: "موثّقة", value: pasteEntries.filter((p) => p.status === "flagged").length, color: "text-red-400", icon: ShieldAlert, description: "عدد اللصقات التي تم تحديدها على أنها تحتوي على بيانات شخصية مُدّعاة وتم توثيقها." },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-amber-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">رصد مواقع اللصق</h1>
              <p className="text-xs text-muted-foreground">Paste Sites Monitoring</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            مراقبة Pastebin وبدائله حيث تُنشر كثير من حالات الرصد الأولية
          </p>
        </div>
      </motion.div>

      {/* Stats with animated counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="group cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setActiveModal(`stat-${stat.id}`)}>
              <Card className="border-border group-hover:border-primary/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color} opacity-60`} />
                  <AnimatedCounter value={stat.value} className={`text-2xl font-bold ${stat.color}`} />
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Risk Heatmap + Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution Heatmap */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              توزيع مستوى التأثير
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: "critical", label: "واسع النطاق", color: "bg-red-500", textColor: "text-red-400", count: riskDistribution.critical },
                { key: "high", label: "عالي", color: "bg-orange-500", textColor: "text-orange-400", count: riskDistribution.high },
                { key: "medium", label: "متوسط", color: "bg-amber-500", textColor: "text-amber-400", count: riskDistribution.medium },
                { key: "low", label: "منخفض", color: "bg-emerald-500", textColor: "text-emerald-400", count: riskDistribution.low },
              ].map(item => (
                <motion.div
                  key={item.key}
                  whileHover={{ scale: 1.05 }}
                  className="relative p-3 rounded-lg bg-secondary/30 border border-border text-center cursor-default"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${item.color}`} style={{ opacity: Math.min(1, item.count / Math.max(1, pasteEntries.length) + 0.2) }} />
                  <p className={`text-xl font-bold ${item.textColor}`}>{item.count}</p>
                  <p className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                </motion.div>
              ))}
            </div>
            {/* Bar visualization */}
            <div className="mt-3 h-3 rounded-full bg-secondary/30 overflow-hidden flex">
              {pasteEntries.length > 0 && (
                <>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(riskDistribution.critical / pasteEntries.length) * 100}%` }} transition={{ duration: 0.8 }} className="bg-red-500 h-full" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(riskDistribution.high / pasteEntries.length) * 100}%` }} transition={{ duration: 0.8, delay: 0.1 }} className="bg-orange-500 h-full" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(riskDistribution.medium / pasteEntries.length) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-amber-500 h-full" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(riskDistribution.low / pasteEntries.length) * 100}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="bg-emerald-500 h-full" />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              النشاط الزمني
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {timelineData.length > 0 ? (
              <div className="space-y-2">
                {timelineData.map(([date, count], i) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs sm:text-[10px] text-muted-foreground min-w-[80px] text-left font-mono">{date}</span>
                    <div className="flex-1 h-5 bg-secondary/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (count / Math.max(...timelineData.map(d => d[1] as number))) * 100)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-l from-cyan-500 to-teal-500 rounded-full flex items-center justify-end px-2"
                      >
                        <span className="text-[9px] font-bold text-white">{count}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                لا توجد بيانات زمنية متاحة
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monitored sites */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pasteChannels.map((source, i) => (
          <motion.div key={source.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="group cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setActiveModal(`channel-${source.id}`)}>
              <Card className="border-border group-hover:border-amber-500/30 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between flex-wrap mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-semibold text-foreground">{source.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <motion.span
                          animate={source.status === "active" ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-2 h-2 rounded-full ${source.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        <span className="text-xs sm:text-[10px] text-muted-foreground">{source.status === "active" ? "نشط" : "متوقف"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between flex-wrap text-xs text-muted-foreground">
                      <span>{source.leaksDetected ?? 0} حالة رصد مكتشفة</span>
                      <span className={`px-2 py-0.5 rounded border text-xs sm:text-[10px] ${
                        source.riskLevel === "high" ? "text-red-400 bg-red-500/10 border-red-500/30" :
                        source.riskLevel === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                        "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      }`}>
                        {source.riskLevel === "high" ? "عالي" : source.riskLevel === "medium" ? "متوسط" : "منخفض"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] text-primary/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">اضغط للتفاصيل ←</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent pastes with search/filter */}
      <Card className="border-border">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              أحدث اللصقات المرصودة
              <Badge variant="outline" className="text-xs sm:text-[10px] mr-2">
                {filteredPastes.length} / {pasteEntries.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={exportPastes}>
                <Download className="w-3 h-3" />
                تصدير
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-3 h-3" />
                فلترة
                {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="بحث بالاسم، المصدر، أو نوع البيانات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 text-sm rounded-lg bg-secondary/30 border border-border focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { value: "all", label: "الكل" },
                      { value: "flagged", label: "مُعلَّم" },
                      { value: "analyzing", label: "قيد التحليل" },
                      { value: "documented", label: "موثّق" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`text-xs sm:text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${
                          statusFilter === opt.value
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-secondary/20 border-border text-muted-foreground hover:border-primary/20"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-[10px] text-muted-foreground">ترتيب:</span>
                    <button
                      onClick={() => setSortBy("date")}
                      className={`text-xs sm:text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                        sortBy === "date" ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary/20 border-border text-muted-foreground"
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      التاريخ
                    </button>
                    <button
                      onClick={() => setSortBy("severity")}
                      className={`text-xs sm:text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                        sortBy === "severity" ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary/20 border-border text-muted-foreground"
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      التأثير
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPastes.map((paste, i) => {
                const sev = severityLevel(paste);
                const SevIcon = sev.icon;
                return (
                  <motion.div
                    key={paste.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-4 rounded-lg bg-secondary/20 border border-border hover:border-amber-500/20 transition-colors group cursor-pointer relative"
                    onClick={() => setActiveModal(`paste-${paste.id}`)}
                  >
                    {/* Severity indicator bar */}
                    <div className={`absolute top-0 right-0 bottom-0 w-1 rounded-r-lg ${
                      sev.level === "critical" ? "bg-red-500" :
                      sev.level === "high" ? "bg-orange-500" :
                      sev.level === "medium" ? "bg-amber-500" : "bg-emerald-500"
                    }`} />

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        {/* Severity icon */}
                        <div className={`mt-0.5 p-1.5 rounded-lg ${
                          sev.level === "critical" ? "bg-red-500/10" :
                          sev.level === "high" ? "bg-orange-500/10" :
                          sev.level === "medium" ? "bg-amber-500/10" : "bg-emerald-500/10"
                        }`}>
                          <SevIcon className={`w-4 h-4 ${sev.color}`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-mono font-semibold text-foreground">{paste.filename}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {paste.sourceName}
                            </span>
                            {paste.fileSize && <span>{paste.fileSize}</span>}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {paste.detectedAt ? new Date(paste.detectedAt).toLocaleDateString("ar-SA") : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${
                          sev.level === "critical" ? "text-red-400 bg-red-500/10 border-red-500/30" :
                          sev.level === "high" ? "text-orange-400 bg-orange-500/10 border-orange-500/30" :
                          sev.level === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                          "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                        }`}>
                          {sev.label}
                        </span>
                        <span className={`text-xs sm:text-[10px] px-2 py-1 rounded border ${statusStyle(paste.status)}`}>
                          {statusText(paste.status)}
                        </span>
                      </div>
                    </div>

                    {/* PII types found */}
                    {paste.piiTypes && parseJsonSafe(paste.pastePiiTypes, []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2 mr-10">
                        {parseJsonSafe(paste.pastePiiTypes, []).map((type) => (
                          <Badge key={type} variant="outline" className="text-xs sm:text-[10px] bg-red-500/5 border-red-500/20 text-red-400">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Preview */}
                    {paste.preview && (
                      <div className="p-2 rounded bg-black/30 border border-border mr-10">
                        <code className="text-xs sm:text-[11px] text-muted-foreground font-mono break-all">{paste.preview}</code>
                      </div>
                    )}
                    <p className="text-[9px] text-primary/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-center">اضغط للتفاصيل ←</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredPastes.length === 0 && pasteEntries.length > 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد نتائج مطابقة للبحث</p>
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                  className="text-primary text-sm mt-2 hover:underline"
                >
                  إزالة الفلاتر
                </button>
              </div>
            )}

            {pasteEntries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد لصقات مكتشفة حالياً</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {stats.map(stat => (
        <DetailModal
          key={`modal-stat-${stat.id}`}
          open={activeModal === `stat-${stat.id}`}
          onClose={() => setActiveModal(null)}
          title={stat.label}
          icon={stat.icon && <stat.icon className={`w-6 h-6 ${stat.color}`} />}
        >
          <div className="p-4 text-center">
            <p className={`text-3xl sm:text-5xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-4">{stat.description}</p>
          </div>
        </DetailModal>
      ))}

      {pasteChannels.map(channel => (
        <DetailModal
          key={`modal-channel-${channel.id}`}
          open={activeModal === `channel-${channel.id}`}
          onClose={() => setActiveModal(null)}
          title={channel.name}
          icon={<FileText className="w-6 h-6 text-amber-400" />}
        >
          <div className="p-4 space-y-4">
            <p>تفاصيل الموقع المُرَاقب <span className="font-mono">{channel.name}</span>.</p>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">الحالة</p>
                    <p className="font-bold text-lg">{channel.status === "active" ? "نشط" : "متوقف"}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">مستوى التأثير</p>
                    <p className="font-bold text-lg">{channel.riskLevel === "high" ? "عالي" : channel.riskLevel === "medium" ? "متوسط" : "منخفض"}</p>
                </div>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">حالات الرصد المكتشفة</p>
                <p className="font-bold text-2xl text-cyan-400">{channel.leaksDetected ?? 0}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => {
              if ((channel as any).url) {
                window.open((channel as any).url, '_blank', 'noopener,noreferrer');
              } else {
                toast.info("لا يوجد رابط متاح لهذا الموقع");
              }
            }}>
              زيارة الموقع <ExternalLink className="w-3 h-3 mr-2" />
            </Button>
          </div>
        </DetailModal>
      ))}

      {pasteEntries.map(paste => {
        const sev = severityLevel(paste);
        return (
          <DetailModal
            key={`modal-paste-${paste.id}`}
            open={activeModal === `paste-${paste.id}`}
            onClose={() => setActiveModal(null)}
            title="تفاصيل اللصقة"
            icon={<FileText className="w-6 h-6 text-cyan-400" />}
            maxWidth="max-w-2xl"
          >
            <div className="p-4 space-y-3 text-sm">
              <h3 className="font-mono text-lg text-primary">{paste.filename}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1.5"><Server className="w-3 h-3" /> {paste.sourceName}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(paste.detectedAt).toLocaleString("ar-SA")}</span>
                  {paste.fileSize && <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> {paste.fileSize}</span>}
              </div>

              {/* Severity + Status row */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 p-2.5 rounded-lg flex-1 ${
                  sev.level === "critical" ? "bg-red-500/10 border border-red-500/20" :
                  sev.level === "high" ? "bg-orange-500/10 border border-orange-500/20" :
                  sev.level === "medium" ? "bg-amber-500/10 border border-amber-500/20" :
                  "bg-emerald-500/10 border border-emerald-500/20"
                }`}>
                  <sev.icon className={`w-5 h-5 ${sev.color}`} />
                  <div>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">مستوى التأثير</p>
                    <p className={`font-bold ${sev.color}`}>{sev.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-secondary/30 rounded-lg flex-1 border border-border">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">الحالة</p>
                    <p className={`font-semibold ${statusStyle(paste.status).split(" ")[0]}`}>{statusText(paste.status)}</p>
                  </div>
                </div>
              </div>

              {paste.piiTypes && parseJsonSafe(paste.pastePiiTypes, []).length > 0 && (
                  <div>
                      <h4 className="font-semibold mb-2">البيانات الحساسة المكتشفة:</h4>
                      <div className="flex flex-wrap gap-2">
                          {parseJsonSafe(paste.pastePiiTypes, []).map(type => (
                              <Badge key={type} variant="destructive" className="text-xs">{type}</Badge>
                          ))}
                      </div>
                  </div>
              )}
              {paste.preview && (
                  <div>
                      <h4 className="font-semibold mb-2">معاينة المحتوى:</h4>
                      <div className="p-3 rounded bg-black/50 border border-border max-h-48 overflow-y-auto">
                          <code className="text-xs text-muted-foreground font-mono break-all whitespace-pre-wrap">{paste.preview}</code>
                      </div>
                  </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => {
                if ((paste as any).sourceUrl) {
                  window.open((paste as any).sourceUrl, '_blank', 'noopener,noreferrer');
                } else if (paste.sourceName) {
                  toast.info(`المصدر: ${paste.sourceName}`, { description: "لا يوجد رابط مباشر متاح" });
                } else {
                  toast.info("لا يوجد رابط متاح لهذا المصدر");
                }
              }}>
                فتح المصدر الأصلي <ExternalLink className="w-3 h-3 mr-2" />
              </Button>
            </div>
          </DetailModal>
        );
      })}

      {/* Leak Detail Drilldown */}
      <LeakDetailDrilldown
        leak={drillLeak}
        open={!!drillLeak}
        onClose={() => setDrillLeak(null)}
        showBackButton={true}
        onBack={() => setDrillLeak(null)}
      />
    </div>
  );
}

```

---

## `client/src/leaks/pages/SectorAnalysis.tsx`

```tsx
// Leaks Domain
/**
 * SectorAnalysis — تحليل القطاعات
 * مربوط بـ leaks.list + dashboard.stats APIs
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Shield, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function SectorAnalysis() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { sectors: [], total: 0 };
    const map: Record<string, { count: number; records: number; critical: number; high: number; medium: number; low: number }> = {};
    leaks.forEach((l: any) => {
      const s = l.sectorAr || l.sector || "غير محدد";
      if (!map[s]) map[s] = { count: 0, records: 0, critical: 0, high: 0, medium: 0, low: 0 };
      map[s].count++;
      map[s].records += l.recordCount || 0;
      if (l.severity === "critical") map[s].critical++;
      else if (l.severity === "high") map[s].high++;
      else if (l.severity === "medium") map[s].medium++;
      else map[s].low++;
    });
    const sectors = Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count);
    return { sectors, total: leaks.length };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">تحليل القطاعات</h1><p className="text-muted-foreground text-sm mt-1">توزيع حالات الرصد حسب القطاعات</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Building2 className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.sectors.length}</div><div className="text-xs text-muted-foreground">قطاع متأثر</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">إجمالي حالات الرصد</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.sectors.reduce((s, sec) => s + sec.critical, 0)}</div><div className="text-xs text-muted-foreground">حالات رصد حرجة</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">توزيع حالات الرصد حسب القطاع</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.sectors.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">نسبة القطاعات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.sectors.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.sectors.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل القطاعات</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-right text-muted-foreground p-2">القطاع</th>
                <th className="text-center text-muted-foreground p-2">حالات الرصد</th>
                <th className="text-center text-muted-foreground p-2">السجلات</th>
                <th className="text-center text-muted-foreground p-2">حرج</th>
                <th className="text-center text-muted-foreground p-2">عالي</th>
                <th className="text-center text-muted-foreground p-2">متوسط</th>
              </tr></thead>
              <tbody>
                {analysis.sectors.map((s, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{s.name}</td>
                    <td className="p-2 text-center text-foreground">{s.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{s.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-red-500/20 text-red-400">{s.critical}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-amber-500/20 text-amber-400">{s.high}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-blue-500/20 text-blue-400">{s.medium}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/leaks/pages/SellerProfiles.tsx`

```tsx
// Leaks Domain
/**
 * SellerProfiles — Track and score data sellers across platforms
 * All stats and seller cards are clickable with detail modals
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserX,
  AlertTriangle,
  TrendingUp,
  Search,
  Loader2,
  Shield,
  Eye,
  Globe,
  Send,
  FileText,
  Activity,
  Calendar,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { DetailModal } from "@/components/DetailModal";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import AnimatedCounter from "@/components/AnimatedCounter";

const riskColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const riskLabels: Record<string, string> = {
  critical: "واسع النطاق",
  high: "عالي",
  medium: "متوسط",
  low: "منخفض",
};

const platformIcons: Record<string, React.ElementType> = {
  telegram: Send,
  darkweb: Globe,
  paste: FileText,
};

export default function SellerProfiles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [drillLeak, setDrillLeak] = useState<any>(null);

  const { data: sellers, isLoading } = trpc.sellers.list.useQuery(
    filterRisk !== "all" ? { riskLevel: filterRisk } : undefined
  );

  const filteredSellers = (sellers || []).filter((s) => {
    if (!searchTerm) return true;
    return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.aliases as string[] || []).some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const stats = {
    total: sellers?.length || 0,
    critical: sellers?.filter(s => s.riskLevel === "critical").length || 0,
    active: sellers?.filter(s => s.isActive).length || 0,
    totalLeaks: sellers?.reduce((sum, s) => sum + (s.totalLeaks || 0), 0) || 0,
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-amber-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <UserX className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ملفات البائعين</h1>
              <p className="text-xs text-muted-foreground">Seller Profiles & Risk Scoring</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            تتبع بائعي البيانات عبر المنصات — تصنيف المخاطر وربط الأسماء المستعارة
          </p>
        </div>
      </motion.div>

      {/* Stats — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "total", label: "إجمالي البائعين", value: stats.total, icon: UserX, color: "text-primary", borderColor: "border-primary/20", bgColor: "bg-primary/5" },
          { key: "critical", label: "بائعون واسعو النطاق", value: stats.critical, icon: AlertTriangle, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
          { key: "active", label: "بائعون نشطون", value: stats.active, icon: Activity, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
          { key: "totalLeaks", label: "حالات رصد مرتبطة", value: stats.totalLeaks, icon: TrendingUp, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
        ].map((stat, i) => (
          <motion.div key={stat.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card
              className={`border ${stat.borderColor} ${stat.bgColor} cursor-pointer hover:scale-[1.02] transition-all group`}
              onClick={() => setActiveModal(stat.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
                <p className="text-[9px] text-primary/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الاسم المستعار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "critical", "high", "medium", "low"].map((level) => (
            <Button
              key={level}
              size="sm"
              variant={filterRisk === level ? "default" : "outline"}
              onClick={() => setFilterRisk(level)}
              className="text-xs"
            >
              {level === "all" ? "الكل" : riskLabels[level]}
            </Button>
          ))}
        </div>
      </div>

      {/* Sellers List — clickable */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredSellers.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <UserX className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">لا يوجد بائعون مطابقون</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSellers.map((seller, i) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => { setSelectedSeller(seller); setActiveModal("sellerDetail"); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        seller.riskLevel === "critical" ? "bg-red-500/20" :
                        seller.riskLevel === "high" ? "bg-amber-500/20" :
                        "bg-secondary"
                      }`}>
                        <UserX className={`w-5 h-5 ${
                          seller.riskLevel === "critical" ? "text-red-400" :
                          seller.riskLevel === "high" ? "text-amber-400" :
                          "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{seller.name}</h3>
                        <p className="text-xs sm:text-[10px] text-muted-foreground font-mono">{seller.sellerId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs sm:text-[10px] ${riskColors[seller.riskLevel]}`}>
                        {riskLabels[seller.riskLevel]}
                      </Badge>
                      {seller.isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Risk Score Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between flex-wrap mb-1">
                      <span className="text-xs sm:text-[10px] text-muted-foreground">حجم التأثير</span>
                      <span className="text-xs font-bold text-foreground">{seller.riskScore}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${seller.riskScore}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${
                          (seller.riskScore || 0) >= 80 ? "bg-red-500" :
                          (seller.riskScore || 0) >= 60 ? "bg-amber-500" :
                          (seller.riskScore || 0) >= 40 ? "bg-yellow-500" :
                          "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between flex-wrap pt-2 border-t border-border">
                    <div className="flex items-center gap-4 text-xs sm:text-[10px] text-muted-foreground">
                      <span>{seller.totalLeaks || 0} حالة رصد</span>
                      <span>{(seller.totalRecords || 0).toLocaleString()} (العدد المُدّعى)</span>
                    </div>
                    <span className="text-[9px] text-primary/50">اضغط للتفاصيل ←</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Total Sellers Modal */}
      <DetailModal open={activeModal === "total"} onClose={() => setActiveModal(null)} title="إجمالي البائعين" icon={<UserX className="w-5 h-5 text-primary" />}>
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 text-center">
            <p className="text-2xl font-bold text-primary"><AnimatedCounter value={stats.total} /></p>
            <p className="text-xs text-muted-foreground">بائع مرصود</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["critical", "high", "medium", "low"].map(level => (
              <div key={level} className={`rounded-xl p-3 border text-center ${riskColors[level]}`}>
                <p className="text-xl font-bold">{sellers?.filter(s => s.riskLevel === level).length || 0}</p>
                <p className="text-xs sm:text-[10px]">{riskLabels[level]}</p>
              </div>
            ))}
          </div>
        </div>
      </DetailModal>

      {/* Critical Sellers Modal */}
      <DetailModal open={activeModal === "critical"} onClose={() => setActiveModal(null)} title="بائعون واسعو النطاق" icon={<AlertTriangle className="w-5 h-5 text-red-400" />}>
        <div className="space-y-3">
          {sellers?.filter(s => s.riskLevel === "critical").map(seller => (
            <div
              key={seller.id}
              className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 cursor-pointer hover:bg-red-500/10 transition-colors"
              onClick={() => { setSelectedSeller(seller); setActiveModal("sellerDetail"); }}
            >
              <div className="flex items-center justify-between flex-wrap mb-1">
                <span className="text-sm font-medium text-foreground">{seller.name}</span>
                <span className="text-sm font-bold text-red-400">{seller.riskScore}/100</span>
              </div>
              <p className="text-xs sm:text-[10px] text-muted-foreground">{seller.totalLeaks} حالة رصد • {(seller.totalRecords || 0).toLocaleString()} (العدد المُدّعى)</p>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Active Sellers Modal */}
      <DetailModal open={activeModal === "active"} onClose={() => setActiveModal(null)} title="البائعون النشطون" icon={<Activity className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
            <p className="text-2xl font-bold text-emerald-400"><AnimatedCounter value={stats.active} /></p>
            <p className="text-xs text-muted-foreground">بائع نشط حالياً</p>
          </div>
          {sellers?.filter(s => s.isActive).map(seller => (
            <div
              key={seller.id}
              className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => { setSelectedSeller(seller); setActiveModal("sellerDetail"); }}
            >
              <div className="flex items-center justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-foreground">{seller.name}</span>
                </div>
                <Badge variant="outline" className={`text-xs sm:text-[10px] ${riskColors[seller.riskLevel]}`}>{riskLabels[seller.riskLevel]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Total Leaks Modal */}
      <DetailModal open={activeModal === "totalLeaks"} onClose={() => setActiveModal(null)} title="حالات الرصد المرتبطة بالبائعين" icon={<TrendingUp className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
            <p className="text-2xl font-bold text-amber-400"><AnimatedCounter value={stats.totalLeaks} /></p>
            <p className="text-xs text-muted-foreground">حالة رصد مرتبطة</p>
          </div>
          {sellers?.sort((a, b) => (b.totalLeaks || 0) - (a.totalLeaks || 0)).slice(0, 10).map(seller => (
            <div key={seller.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-between flex-wrap">
              <div>
                <p className="text-sm text-foreground">{seller.name}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{(seller.totalRecords || 0).toLocaleString()} (العدد المُدّعى)</p>
              </div>
              <span className="text-lg font-bold text-amber-400">{seller.totalLeaks || 0}</span>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Seller Detail Modal */}
      <DetailModal
        open={activeModal === "sellerDetail" && !!selectedSeller}
        onClose={() => { setActiveModal(null); setSelectedSeller(null); }}
        title={selectedSeller?.name || "تفاصيل البائع"}
        icon={<UserX className="w-5 h-5 text-amber-400" />}
        maxWidth="max-w-2xl"
      >
        {selectedSeller && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedSeller.riskLevel === "critical" ? "bg-red-500/20" :
                selectedSeller.riskLevel === "high" ? "bg-amber-500/20" :
                "bg-secondary"
              }`}>
                <UserX className={`w-7 h-7 ${
                  selectedSeller.riskLevel === "critical" ? "text-red-400" :
                  selectedSeller.riskLevel === "high" ? "text-amber-400" :
                  "text-muted-foreground"
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedSeller.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedSeller.sellerId}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs sm:text-[10px] ${riskColors[selectedSeller.riskLevel]}`}>
                    {riskLabels[selectedSeller.riskLevel]}
                  </Badge>
                  {selectedSeller.isActive && (
                    <span className="text-xs sm:text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      نشط
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">حجم التأثير</p>
                <p className={`text-xl font-bold mt-1 ${
                  (selectedSeller.riskScore || 0) >= 80 ? "text-red-400" :
                  (selectedSeller.riskScore || 0) >= 60 ? "text-amber-400" :
                  "text-emerald-400"
                }`}>{selectedSeller.riskScore}/100</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">حالات الرصد</p>
                <p className="text-xl font-bold text-foreground mt-1">{selectedSeller.totalLeaks || 0}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">السجلات</p>
                <p className="text-lg font-bold text-foreground mt-1">{(selectedSeller.totalRecords || 0).toLocaleString()}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">آخر نشاط</p>
                <p className="text-xs font-bold text-foreground mt-1">
                  {selectedSeller.lastActivity ? new Date(selectedSeller.lastActivity).toLocaleDateString("ar-SA") : "—"}
                </p>
              </div>
            </div>

            {/* Aliases */}
            {selectedSeller.aliases && (selectedSeller.aliases as string[]).length > 0 && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">الأسماء المستعارة</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedSeller.aliases as string[]).map((alias: string, ai: number) => (
                    <Badge key={ai} variant="outline" className="text-xs">{alias}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Platforms */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">المنصات النشطة</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedSeller.platforms as string[]).map((platform: string) => {
                  const PIcon = platformIcons[platform] || Globe;
                  return (
                    <div key={platform} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground">
                      <PIcon className="w-4 h-4 text-primary" />
                      {platform === "telegram" ? "تليجرام" : platform === "darkweb" ? "الدارك ويب" : platform}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            {selectedSeller.notes && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">ملاحظات</h4>
                <p className="text-sm text-foreground leading-relaxed">{selectedSeller.notes}</p>
              </div>
            )}

            {/* Sectors */}
            {selectedSeller.sectors && (selectedSeller.sectors as string[]).length > 0 && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">القطاعات المستهدفة</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedSeller.sectors as string[]).map((sector: string, si: number) => (
                    <Badge key={si} variant="outline" className="text-xs">{sector}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailModal>

      {/* Leak Detail Drilldown */}
      <LeakDetailDrilldown
        leak={drillLeak}
        open={!!drillLeak}
        onClose={() => setDrillLeak(null)}
        showBackButton={true}
        onBack={() => setDrillLeak(null)}
      />
    </div>
  );
}

```

---

## `client/src/leaks/pages/SourceIntelligence.tsx`

```tsx
// Leaks Domain
/**
 * SourceIntelligence — استخبارات المصادر
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Globe, Database, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function SourceIntelligence() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { sources: [], types: [], total: 0 };
    const srcMap: Record<string, { count: number; records: number }> = {};
    const typeMap: Record<string, number> = {};
    leaks.forEach((l: any) => {
      const s = l.sourceAr || l.source || "غير محدد";
      const t = l.leakTypeAr || l.leakType || "غير محدد";
      if (!srcMap[s]) srcMap[s] = { count: 0, records: 0 };
      srcMap[s].count++; srcMap[s].records += l.recordCount || 0;
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    return {
      sources: Object.entries(srcMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count),
      types: Object.entries(typeMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      total: leaks.length,
    };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">استخبارات المصادر</h1><p className="text-muted-foreground text-sm mt-1">تحليل مصادر وأنواع حالات الرصد</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Radio className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.sources.length}</div><div className="text-xs text-muted-foreground">مصدر</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Database className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.types.length}</div><div className="text-xs text-muted-foreground">نوع حالة رصد</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Eye className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">إجمالي</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">المصادر الأكثر نشاطاً</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.sources.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={130} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">أنواع حالات الرصد</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.types.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.types.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل المصادر</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-right text-muted-foreground p-2">المصدر</th><th className="text-center text-muted-foreground p-2">حالات الرصد</th><th className="text-center text-muted-foreground p-2">السجلات</th><th className="text-center text-muted-foreground p-2">النسبة</th></tr></thead>
              <tbody>
                {analysis.sources.map((s, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{s.name}</td>
                    <td className="p-2 text-center text-foreground">{s.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{s.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-purple-500/20 text-purple-400">{analysis.total ? ((s.count / analysis.total) * 100).toFixed(1) : 0}%</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/leaks/pages/TelegramMonitor.tsx`

```tsx
// Leaks Domain
/**
 * TelegramMonitor — Telegram channel monitoring view
 * All stats and channel cards are clickable with detail modals
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Users,
  AlertTriangle,
  Eye,
  Pause,
  Play,
  Flag,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  X,
  ShieldAlert,
  Clock,
  MessageSquare,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import AnimatedCounter from "@/components/AnimatedCounter";

const riskColor = (r: string) => {
  switch (r) {
    case "high": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  }
};

const riskLabel = (r: string) => {
  switch (r) {
    case "high": return "تأثير عالي";
    case "medium": return "تأثير متوسط";
    default: return "تأثير محدود";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "active": return "bg-emerald-500";
    case "paused": return "bg-yellow-500";
    default: return "bg-red-500";
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case "active": return "نشط";
    case "paused": return "متوقف";
    default: return "مُعلَّم";
  }
};

const severityColor = (s: string) => {
  switch (s) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "high": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    default: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  }
};

const severityLabel = (s: string) => {
  switch (s) {
    case "critical": return "واسع النطاق";
    case "high": return "عالي";
    case "medium": return "متوسط";
    default: return "منخفض";
  }
};

export default function TelegramMonitor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [selectedLeak, setSelectedLeak] = useState<any>(null);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: channels, isLoading: channelsLoading } = trpc.channels.list.useQuery({ platform: "telegram" });
  const { data: leaksData, isLoading: leaksLoading } = trpc.leaks.list.useQuery({ source: "telegram" });

  const telegramChannels = channels ?? [];
  const telegramLeaks = leaksData ?? [];

  const filteredChannels = telegramChannels.filter(
    (ch) => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "all" || ch.riskLevel === riskFilter;
      const matchesStatus = statusFilter === "all" || ch.status === statusFilter;
      return matchesSearch && matchesRisk && matchesStatus;
    }
  );

  const activeChannels = telegramChannels.filter(c => c.status === "active");
  const highRiskChannels = telegramChannels.filter(c => c.riskLevel === "high");
  const totalLeaksDetected = telegramChannels.reduce((a, c) => a + (c.leaksDetected ?? 0), 0);

  if (channelsLoading) {
    return (
      <div className="overflow-x-hidden max-w-full flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">رصد تليجرام</h1>
              <p className="text-xs text-muted-foreground">Telegram Channel Monitoring</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            مراقبة القنوات التي تبيع أو تشارك قواعد بيانات سعودية باستخدام Telethon API
          </p>
        </div>
      </motion.div>

      {/* Stats row — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "allChannels", label: "قنوات مراقبة", value: telegramChannels.length, color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
          { key: "activeChannels", label: "قنوات نشطة", value: activeChannels.length, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
          { key: "detectedLeaks", label: "حالات رصد مكتشفة", value: totalLeaksDetected, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
          { key: "highRisk", label: "قنوات عالية التأثير", value: highRiskChannels.length, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
        ].map((stat, i) => (
          <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card
              className={`border ${stat.borderColor} ${stat.bgColor} cursor-pointer hover:scale-[1.02] transition-all group`}
              onClick={() => setActiveModal(stat.key)}
            >
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}><AnimatedCounter value={typeof stat.value === "number" ? stat.value : 0} /></p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث في القنوات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-secondary/50 border-border"
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast("تحديث البيانات...", { description: "Refreshing data..." })}>
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-foreground"
        >
          <option value="all">التأثير: الكل</option>
          <option value="high">عالي</option>
          <option value="medium">متوسط</option>
          <option value="low">منخفض</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-foreground"
        >
          <option value="all">الحالة: الكل</option>
          <option value="active">نشط</option>
          <option value="paused">متوقف</option>
          <option value="flagged">مُعلَّم</option>
        </select>
      </div>

      {/* Channels grid — clickable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredChannels.map((channel, i) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => { setSelectedChannel(channel); setActiveModal("channelDetail"); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Send className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{channel.name}</h3>
                      <p className="text-xs text-muted-foreground">{channel.channelId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusColor(channel.status)}`} />
                    <span className="text-xs text-muted-foreground">{statusLabel(channel.status)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-secondary/30">
                    <Users className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs font-medium text-foreground">{(channel.subscribers ?? 0).toLocaleString()}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">مشترك</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-foreground">{channel.leaksDetected ?? 0}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">حالة رصد</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/30">
                    <Eye className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-foreground">
                      {channel.lastActivity ? new Date(channel.lastActivity).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : "—"}
                    </p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">آخر نشاط</p>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap">
                  <span className={`text-xs sm:text-[10px] px-2 py-1 rounded border ${riskColor(channel.riskLevel)}`}>
                    {riskLabel(channel.riskLevel)}
                  </span>
                  <p className="text-[9px] text-primary/50">اضغط للتفاصيل ←</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Telegram leaks — clickable rows */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">أحدث حالات رصد تليجرام</CardTitle>
        </CardHeader>
        <CardContent>
          {leaksLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">المعرّف</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">العنوان</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">القطاع</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">السجلات</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">التأثير</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {telegramLeaks.map((leak) => (
                    <tr
                      key={leak.id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => { setSelectedLeak(leak); setActiveModal("leakDetail"); }}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-primary">{leak.leakId}</td>
                      <td className="py-3 px-4 text-foreground">{leak.titleAr}</td>
                      <td className="py-3 px-4 text-muted-foreground">{leak.sectorAr}</td>
                      <td className="py-3 px-4 text-foreground font-medium">{leak.recordCount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs sm:text-[10px] px-2 py-1 rounded border ${severityColor(leak.severity)}`}>
                          {severityLabel(leak.severity)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keywords being monitored */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">كلمات البحث المراقبة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["بيانات سعودية", "قاعدة بيانات", "KSA data", "Saudi database", "تسرب بيانات", "Saudi leak", "هوية وطنية", "أرقام جوال", "سجلات صحية", "بيانات بنكية", "Saudi PII", "KSA dump"].map((keyword) => (
              <Badge key={keyword} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══ MODALS ═══ */}

      {/* All Channels Modal */}
      <DetailModal open={activeModal === "allChannels"} onClose={() => setActiveModal(null)} title="جميع القنوات المراقبة" icon={<Send className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{telegramChannels.length} قناة</p>
          {telegramChannels.map(ch => (
            <div
              key={ch.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => { setSelectedChannel(ch); setActiveModal("channelDetail"); }}
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{ch.name}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{ch.channelId} • {(ch.subscribers ?? 0).toLocaleString()} مشترك</p>
              </div>
              <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${riskColor(ch.riskLevel)}`}>{riskLabel(ch.riskLevel)}</span>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${statusColor(ch.status)}`} />
                <span className="text-xs sm:text-[10px] text-muted-foreground">{statusLabel(ch.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Active Channels Modal */}
      <DetailModal open={activeModal === "activeChannels"} onClose={() => setActiveModal(null)} title="القنوات النشطة" icon={<Eye className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{activeChannels.length} قناة نشطة</p>
          {activeChannels.map(ch => (
            <div
              key={ch.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => { setSelectedChannel(ch); setActiveModal("channelDetail"); }}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{ch.name}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{ch.channelId} • {ch.leaksDetected ?? 0} حالة رصد</p>
              </div>
              <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${riskColor(ch.riskLevel)}`}>{riskLabel(ch.riskLevel)}</span>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Detected Leaks Modal */}
      <DetailModal open={activeModal === "detectedLeaks"} onClose={() => setActiveModal(null)} title="حالات الرصد المكتشفة من تليجرام" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{telegramLeaks.length} حالة رصد</p>
          {telegramLeaks.map(leak => (
            <div
              key={leak.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => { setSelectedLeak(leak); setActiveModal("leakDetail"); }}
            >
              <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border shrink-0 ${severityColor(leak.severity)}`}>{severityLabel(leak.severity)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{leak.titleAr}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{leak.leakId} • {leak.sectorAr} • {leak.recordCount.toLocaleString()} (مكشوف)</p>
              </div>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* High Risk Channels Modal */}
      <DetailModal open={activeModal === "highRisk"} onClose={() => setActiveModal(null)} title="القنوات عالية التأثير" icon={<ShieldAlert className="w-5 h-5 text-red-400" />}>
        <div className="space-y-3">
          {highRiskChannels.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">لا توجد قنوات عالية التأثير</p>
          ) : (
            <>
              <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/20">
                <p className="text-xs text-red-400">{highRiskChannels.length} قناة مصنفة بتأثير عالي — تتطلب مراقبة مكثفة</p>
              </div>
              {highRiskChannels.map(ch => (
                <div
                  key={ch.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20 cursor-pointer hover:bg-red-500/10 transition-colors"
                  onClick={() => { setSelectedChannel(ch); setActiveModal("channelDetail"); }}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{ch.name}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{(ch.subscribers ?? 0).toLocaleString()} مشترك • {ch.leaksDetected ?? 0} حالة رصد</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </DetailModal>

      {/* Channel Detail Modal */}
      <DetailModal
        open={activeModal === "channelDetail" && !!selectedChannel}
        onClose={() => { setActiveModal(null); setSelectedChannel(null); }}
        title={selectedChannel?.name ?? "تفاصيل القناة"}
        icon={<Send className="w-5 h-5 text-cyan-400" />}
      >
        {selectedChannel && (
          <div className="space-y-4">
            {/* Channel info header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Send className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{selectedChannel.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedChannel.channelId}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${statusColor(selectedChannel.status)}`} />
                  <span className="text-xs text-muted-foreground">{statusLabel(selectedChannel.status)}</span>
                  <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded border ${riskColor(selectedChannel.riskLevel)}`}>{riskLabel(selectedChannel.riskLevel)}</span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
                <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-cyan-400">{(selectedChannel.subscribers ?? 0).toLocaleString()}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">مشترك</p>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-400">{selectedChannel.leaksDetected ?? 0}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">حالات رصد مكتشفة</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">
                  {selectedChannel.lastActivity ? new Date(selectedChannel.lastActivity).toLocaleDateString("ar-SA") : "—"}
                </p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">آخر نشاط</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <MessageSquare className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">
                  {selectedChannel.createdAt ? new Date(selectedChannel.createdAt).toLocaleDateString("ar-SA") : "—"}
                </p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">تاريخ الإضافة</p>
              </div>
            </div>

            {/* Channel description */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">وصف القناة</h4>
              <p className="text-sm text-foreground leading-relaxed">
                {selectedChannel.description || "قناة تليجرام مراقبة لنشاط مشبوه يتعلق ببيع أو مشاركة بيانات شخصية سعودية. يتم رصد الرسائل والملفات المشاركة بشكل آلي."}
              </p>
            </div>

            {/* Related leaks */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">حالات الرصد المرتبطة بهذه القناة</h4>
              {telegramLeaks.length > 0 ? (
                <div className="space-y-2">
                  {telegramLeaks.slice(0, 5).map(leak => (
                    <div key={leak.id} className="flex items-center gap-2 p-2 rounded bg-card/50 border border-border/20">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${severityColor(leak.severity)}`}>{severityLabel(leak.severity)}</span>
                      <span className="text-xs text-foreground truncate flex-1">{leak.titleAr}</span>
                      <span className="text-xs sm:text-[10px] text-muted-foreground">{leak.recordCount.toLocaleString()} (مكشوف)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">لا توجد حالات رصد مرتبطة</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 flex-1" onClick={() => toast("تم إيقاف/تشغيل المراقبة")}>
                {selectedChannel.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {selectedChannel.status === "active" ? "إيقاف المراقبة" : "تشغيل المراقبة"}
              </Button>
              <Button variant="outline" className="gap-2 flex-1" onClick={() => toast("تم تعليم القناة")}>
                <Flag className="w-4 h-4" />
                تعليم القناة
              </Button>
            </div>
          </div>
        )}
      </DetailModal>

      {/* Leak Detail Drilldown */}
      <LeakDetailDrilldown
        leak={selectedLeak}
        open={activeModal === "leakDetail" && !!selectedLeak}
        onClose={() => { setActiveModal(null); setSelectedLeak(null); }}
        showBackButton={true}
        onBack={() => { setActiveModal(null); setSelectedLeak(null); }}
      />
    </div>
  );
}

```

---

## `client/src/leaks/pages/ThreatActorsAnalysis.tsx`

```tsx
// Leaks Domain
/**
 * ThreatActorsAnalysis — تحليل مصادر التهديد
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserX, AlertTriangle, Shield, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function ThreatActorsAnalysis() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { actors: [], total: 0 };
    const map: Record<string, { count: number; records: number; critical: number; sectors: Set<string> }> = {};
    leaks.forEach((l: any) => {
      const a = l.threatActorAr || l.threatActor || "غير معروف";
      if (!map[a]) map[a] = { count: 0, records: 0, critical: 0, sectors: new Set() };
      map[a].count++;
      map[a].records += l.recordCount || 0;
      if (l.severity === "critical") map[a].critical++;
      map[a].sectors.add(l.sectorAr || l.sector || "");
    });
    const actors = Object.entries(map).map(([name, d]) => ({ name, count: d.count, records: d.records, critical: d.critical, sectors: d.sectors.size })).sort((a, b) => b.count - a.count);
    return { actors, total: leaks.length };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">تحليل مصادر التهديد</h1><p className="text-muted-foreground text-sm mt-1">تحليل الجهات الفاعلة وراء حالات الرصد</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><UserX className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.actors.length}</div><div className="text-xs text-muted-foreground">جهة تهديد</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Target className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">إجمالي الهجمات</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.actors.reduce((s, a) => s + a.critical, 0)}</div><div className="text-xs text-muted-foreground">هجمات حرجة</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">أنشط الجهات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.actors.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={140} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">توزيع الجهات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.actors.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.actors.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل الجهات</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-right text-muted-foreground p-2">الجهة</th><th className="text-center text-muted-foreground p-2">الهجمات</th><th className="text-center text-muted-foreground p-2">السجلات</th><th className="text-center text-muted-foreground p-2">حرج</th><th className="text-center text-muted-foreground p-2">القطاعات</th></tr></thead>
              <tbody>
                {analysis.actors.map((a, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{a.name}</td>
                    <td className="p-2 text-center text-foreground">{a.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{a.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-red-500/20 text-red-400">{a.critical}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-purple-500/20 text-purple-400">{a.sectors}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/leaks/pages/ThreatMap.tsx`

```tsx
// Leaks Domain
/**
 * ThreatMap — Interactive geographic visualization of leak origins
 * All stats, regions, and leak entries are clickable with detail modals
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Eye,
  Filter,
  Loader2,
  Building2,
  Globe,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { DetailModal } from "@/components/DetailModal";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";

const REGION_POSITIONS: Record<string, { x: number; y: number }> = {
  "Riyadh": { x: 55, y: 52 },
  "Eastern Province": { x: 72, y: 48 },
  "Makkah": { x: 28, y: 60 },
  "Madinah": { x: 30, y: 48 },
  "Asir": { x: 32, y: 75 },
  "Tabuk": { x: 22, y: 30 },
  "Hail": { x: 42, y: 35 },
  "Qassim": { x: 48, y: 40 },
  "Jazan": { x: 28, y: 82 },
  "Najran": { x: 48, y: 78 },
  "Al Baha": { x: 28, y: 68 },
  "Northern Borders": { x: 50, y: 22 },
  "Al Jouf": { x: 35, y: 22 },
};

const severityColors = {
  critical: { bg: "bg-red-500", text: "text-red-400", ring: "ring-red-500/30", fill: "#ef4444", glow: "rgba(239,68,68,0.4)" },
  high: { bg: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/30", fill: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  medium: { bg: "bg-cyan-500", text: "text-cyan-400", ring: "ring-cyan-500/30", fill: "#06b6d4", glow: "rgba(6,182,212,0.4)" },
  low: { bg: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30", fill: "#10b981", glow: "rgba(16,185,129,0.4)" },
};

const sevLabels: Record<string, string> = { critical: "واسع النطاق", high: "مرتفع", medium: "متوسط", low: "محدود" };

export default function ThreatMap() {
  const { data, isLoading } = trpc.threatMap.data.useQuery();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [hoveredLeak, setHoveredLeak] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedLeak, setSelectedLeak] = useState<any>(null);
  const [selectedRegionDetail, setSelectedRegionDetail] = useState<any>(null);

  const filteredLeaks = useMemo(() => {
    if (!data?.leaks) return [];
    let filtered = data.leaks;
    if (severityFilter !== "all") {
      filtered = filtered.filter((l) => l.severity === severityFilter);
    }
    if (selectedRegion) {
      filtered = filtered.filter((l) => l.region === selectedRegion);
    }
    return filtered;
  }, [data?.leaks, severityFilter, selectedRegion]);

  const regionStats = useMemo(() => {
    if (!data?.regions) return [];
    return data.regions.sort((a, b) => b.count - a.count);
  }, [data?.regions]);

  const totalLeaks = data?.leaks?.length ?? 0;
  const totalRecords = data?.leaks?.reduce((sum, l) => sum + l.recordCount, 0) ?? 0;
  const criticalCount = data?.leaks?.filter((l) => l.severity === "critical").length ?? 0;
  const regionsAffected = data?.regions?.length ?? 0;

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "totalLeaks", label: "إجمالي حالات الرصد", value: totalLeaks, icon: Shield, color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
          { key: "critical", label: "حالات رصد واسعة النطاق", value: criticalCount, icon: AlertTriangle, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
          { key: "regions", label: "المناطق المتأثرة", value: regionsAffected, icon: MapPin, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
          { key: "records", label: "السجلات المتأثرة", value: totalRecords.toLocaleString(), icon: Activity, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
        ].map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-all group`}
            onClick={() => setActiveModal(stat.key)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
            <p className="text-[9px] text-primary/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
          </motion.div>
        ))}
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground ml-1">تصفية حسب التأثير:</span>
        {["all", "critical", "high", "medium", "low"].map((sev) => (
          <Button
            key={sev}
            variant={severityFilter === sev ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setSeverityFilter(sev)}
          >
            {sev === "all" ? "الكل" : sevLabels[sev]}
          </Button>
        ))}
        {selectedRegion && (
          <Button variant="ghost" size="sm" className="text-xs h-7 text-primary" onClick={() => setSelectedRegion(null)}>
            إلغاء تحديد المنطقة ✕
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="xl:col-span-2 bg-card/60 dark:backdrop-blur-sm border border-border/50 rounded-xl p-6 relative overflow-hidden">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            خريطة التهديدات — المملكة العربية السعودية
          </h3>

          <div className="relative w-full" style={{ paddingBottom: "80%" }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 0 20px rgba(6,182,212,0.1))" }}>
              <path
                d="M 15 25 L 35 15 L 55 18 L 75 22 L 80 30 L 78 45 L 75 55 L 70 60 L 65 55 L 60 58 L 55 65 L 50 75 L 45 80 L 35 85 L 25 80 L 20 70 L 22 60 L 25 55 L 20 45 L 15 35 Z"
                fill="rgba(6,182,212,0.05)"
                stroke="rgba(6,182,212,0.3)"
                strokeWidth="0.5"
              />
              {[20, 30, 40, 50, 60, 70, 80].map((y) => (
                <line key={`h${y}`} x1="10" y1={y} x2="85" y2={y} stroke="rgba(6,182,212,0.05)" strokeWidth="0.2" />
              ))}
              {[20, 30, 40, 50, 60, 70].map((x) => (
                <line key={`v${x}`} x1={x} y1="10" x2={x} y2="90" stroke="rgba(6,182,212,0.05)" strokeWidth="0.2" />
              ))}

              {regionStats.map((region) => {
                const pos = REGION_POSITIONS[region.region];
                if (!pos) return null;
                const maxSeverity = region.critical > 0 ? "critical" : region.high > 0 ? "high" : region.medium > 0 ? "medium" : "low";
                const colors = severityColors[maxSeverity];
                const isSelected = selectedRegion === region.region;
                const size = Math.max(2, Math.min(5, region.count * 1.5));

                return (
                  <g key={region.region} className="cursor-pointer" onClick={() => { setSelectedRegionDetail(region); setActiveModal("regionDetail"); }}>
                    <circle cx={pos.x} cy={pos.y} r={size + 2} fill="none" stroke={colors.fill} strokeWidth="0.3" opacity={isSelected ? 0.8 : 0.4}>
                      <animate attributeName="r" values={`${size + 1};${size + 4};${size + 1}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pos.x} cy={pos.y} r={size} fill={colors.fill} opacity={isSelected ? 0.9 : 0.6} stroke={isSelected ? "#fff" : colors.fill} strokeWidth={isSelected ? 0.5 : 0.2} />
                    <text x={pos.x} y={pos.y + 0.8} textAnchor="middle" fill="white" fontSize="2.5" fontWeight="bold">{region.count}</text>
                    <text x={pos.x} y={pos.y - size - 1.5} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="2">{region.regionAr}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center gap-4 mt-4 justify-center flex-wrap">
            {(["critical", "high", "medium", "low"] as const).map((sev) => (
              <div key={sev} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${severityColors[sev].bg}`} />
                <span className="text-xs text-muted-foreground">{sevLabels[sev]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region Details Panel */}
        <div className="space-y-4">
          <div className="bg-card/60 dark:backdrop-blur-sm border border-border/50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              ترتيب المناطق حسب حالات الرصد
            </h3>
            <div className="space-y-2">
              {regionStats.map((region, i) => {
                const maxCount = regionStats[0]?.count || 1;
                const pct = Math.round((region.count / maxCount) * 100);
                const isSelected = selectedRegion === region.region;
                return (
                  <motion.div
                    key={region.region}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/15 border border-primary/30" : "hover:bg-accent/30"
                    }`}
                    onClick={() => { setSelectedRegionDetail(region); setActiveModal("regionDetail"); }}
                  >
                    <div className="flex items-center justify-between flex-wrap mb-1">
                      <span className="text-xs font-medium text-foreground">{region.regionAr}</span>
                      <span className="text-xs text-muted-foreground">{region.count} حالة رصد</span>
                    </div>
                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          region.critical > 0 ? "bg-red-500" : region.high > 0 ? "bg-amber-500" : "bg-cyan-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                    <div className="flex gap-2 mt-1">
                      {region.critical > 0 && <span className="text-xs sm:text-[10px] text-red-400">{region.critical} واسع النطاق</span>}
                      {region.high > 0 && <span className="text-xs sm:text-[10px] text-amber-400">{region.high} عالي</span>}
                      {region.medium > 0 && <span className="text-xs sm:text-[10px] text-cyan-400">{region.medium} متوسط</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-card/60 dark:backdrop-blur-sm border border-border/50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              {selectedRegion
                ? `حالات رصد ${regionStats.find((r) => r.region === selectedRegion)?.regionAr || selectedRegion}`
                : "أحدث حالات الرصد"}
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredLeaks.slice(0, 10).map((leak, i) => {
                const colors = severityColors[leak.severity as keyof typeof severityColors] || severityColors.medium;
                return (
                  <motion.div
                    key={leak.leakId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      hoveredLeak === i ? "border-primary/40 bg-primary/5" : "border-border/30 bg-background/50"
                    }`}
                    onMouseEnter={() => setHoveredLeak(i)}
                    onMouseLeave={() => setHoveredLeak(null)}
                    onClick={() => { setSelectedLeak(leak); setActiveModal("leakDetail"); }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{leak.titleAr}</p>
                        <p className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">
                          {leak.cityAr} • {leak.sectorAr} • {leak.recordCount?.toLocaleString()} (مكشوف)
                        </p>
                      </div>
                      <span className={`text-xs sm:text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg}/20 ${colors.text} font-medium flex-shrink-0`}>
                        {sevLabels[leak.severity] || leak.severity}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {filteredLeaks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">لا توجد حالات رصد مطابقة</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Total Leaks Modal */}
      <DetailModal open={activeModal === "totalLeaks"} onClose={() => setActiveModal(null)} title="إجمالي حالات الرصد على الخريطة" icon={<Shield className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-3">
          <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
            <p className="text-2xl font-bold text-cyan-400">{totalLeaks}</p>
            <p className="text-xs text-muted-foreground">حالة رصد جغرافية</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["critical", "high", "medium", "low"] as const).map(sev => (
              <div key={sev} className={`rounded-xl p-3 border text-center ${severityColors[sev].bg}/10 ${severityColors[sev].text} border-current/20`}>
                <p className="text-xl font-bold">{data?.leaks?.filter(l => l.severity === sev).length || 0}</p>
                <p className="text-xs sm:text-[10px]">{sevLabels[sev]}</p>
              </div>
            ))}
          </div>
        </div>
      </DetailModal>

      {/* Critical Leaks Modal */}
      <DetailModal open={activeModal === "critical"} onClose={() => setActiveModal(null)} title="حالات الرصد الواسعة النطاق" icon={<AlertTriangle className="w-5 h-5 text-red-400" />}>
        <div className="space-y-3">
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
            <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">حالة رصد واسعة النطاق</p>
          </div>
          {data?.leaks?.filter(l => l.severity === "critical").map(leak => (
            <div key={leak.leakId} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 cursor-pointer hover:bg-red-500/10 transition-colors" onClick={() => { setSelectedLeak(leak); setActiveModal("leakDetail"); }}>
              <p className="text-sm font-medium text-foreground">{leak.titleAr}</p>
              <p className="text-xs sm:text-[10px] text-muted-foreground">{leak.cityAr} • {leak.sectorAr} • {leak.recordCount?.toLocaleString()} (مكشوف)</p>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Regions Affected Modal */}
      <DetailModal open={activeModal === "regions"} onClose={() => setActiveModal(null)} title="المناطق المتأثرة" icon={<MapPin className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
            <p className="text-2xl font-bold text-amber-400">{regionsAffected}</p>
            <p className="text-xs text-muted-foreground">منطقة متأثرة</p>
          </div>
          {regionStats.map(region => (
            <div key={region.region} className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => { setSelectedRegionDetail(region); setActiveModal("regionDetail"); }}>
              <div className="flex items-center justify-between flex-wrap">
                <span className="text-sm text-foreground">{region.regionAr}</span>
                <span className="text-sm font-bold text-foreground">{region.count}</span>
              </div>
              <div className="flex gap-2 mt-1">
                {region.critical > 0 && <span className="text-xs sm:text-[10px] text-red-400">{region.critical} واسع النطاق</span>}
                {region.high > 0 && <span className="text-xs sm:text-[10px] text-amber-400">{region.high} عالي</span>}
                {region.medium > 0 && <span className="text-xs sm:text-[10px] text-cyan-400">{region.medium} متوسط</span>}
              </div>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Records Affected Modal */}
      <DetailModal open={activeModal === "records"} onClose={() => setActiveModal(null)} title="السجلات المتأثرة" icon={<Activity className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalRecords.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">السجلات المكشوفة</p>
          </div>
          {data?.leaks?.sort((a, b) => b.recordCount - a.recordCount).slice(0, 10).map(leak => (
            <div key={leak.leakId} className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-between flex-wrap cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => { setSelectedLeak(leak); setActiveModal("leakDetail"); }}>
              <div>
                <p className="text-sm text-foreground">{leak.titleAr}</p>
                <p className="text-xs sm:text-[10px] text-muted-foreground">{leak.cityAr} • {leak.sectorAr}</p>
              </div>
              <span className="text-lg font-bold text-emerald-400">{leak.recordCount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </DetailModal>

      {/* Region Detail Modal */}
      <DetailModal
        open={activeModal === "regionDetail" && !!selectedRegionDetail}
        onClose={() => { setActiveModal(null); setSelectedRegionDetail(null); }}
        title={`منطقة ${selectedRegionDetail?.regionAr || ""}`}
        icon={<MapPin className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
      >
        {selectedRegionDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">إجمالي حالات الرصد</p>
                <p className="text-xl font-bold text-foreground mt-1">{selectedRegionDetail.count}</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
                <p className="text-xs text-muted-foreground">واسع النطاق</p>
                <p className="text-xl font-bold text-red-400 mt-1">{selectedRegionDetail.critical || 0}</p>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
                <p className="text-xs text-muted-foreground">عالي</p>
                <p className="text-xl font-bold text-amber-400 mt-1">{selectedRegionDetail.high || 0}</p>
              </div>
              <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
                <p className="text-xs text-muted-foreground">متوسط</p>
                <p className="text-xl font-bold text-cyan-400 mt-1">{selectedRegionDetail.medium || 0}</p>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">حالات الرصد في هذه المنطقة</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {data?.leaks?.filter(l => l.region === selectedRegionDetail.region).map(leak => {
                  const colors = severityColors[leak.severity as keyof typeof severityColors] || severityColors.medium;
                  return (
                    <div key={leak.leakId} className="p-2.5 rounded-lg border border-border/30 bg-background/50 cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => { setSelectedLeak(leak); setActiveModal("leakDetail"); }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-foreground">{leak.titleAr}</p>
                          <p className="text-xs sm:text-[10px] text-muted-foreground">{leak.cityAr} • {leak.sectorAr} • {leak.recordCount?.toLocaleString()} (مكشوف)</p>
                        </div>
                        <span className={`text-xs sm:text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg}/20 ${colors.text}`}>{sevLabels[leak.severity]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DetailModal>

      {/* Leak Detail Modal */}
      <LeakDetailDrilldown
        leak={selectedLeak}
        open={activeModal === "leakDetail" && !!selectedLeak}
        onClose={() => { setActiveModal(null); setSelectedLeak(null); }}
        showBackButton={true}
        onBack={() => { setActiveModal(null); setSelectedLeak(null); }}
      />
    </div>
  );
}

```

---

## `client/src/leaks/pages/ThreatRules.tsx`

```tsx
// Leaks Domain
/**
 * ThreatRules — Threat Hunting Rules Engine
 * 25 Saudi-specific YARA-like rules for threat detection
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crosshair,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Loader2,
  Zap,
  Database,
  CreditCard,
  Lock,
  Building2,
  Heart,
  GraduationCap,
  Radio,
  Landmark,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  data_leak: { label: "حالة رصد بيانات", icon: Database, color: "text-red-400" },
  credentials: { label: "بيانات اعتماد", icon: Lock, color: "text-amber-400" },
  sale_ad: { label: "إعلان بيع", icon: CreditCard, color: "text-violet-400" },
  db_dump: { label: "تفريغ قاعدة بيانات", icon: Server, color: "text-cyan-400" },
  financial: { label: "مالي", icon: CreditCard, color: "text-emerald-400" },
  health: { label: "صحي", icon: Heart, color: "text-pink-400" },
  government: { label: "حكومي", icon: Landmark, color: "text-blue-400" },
  telecom: { label: "اتصالات", icon: Radio, color: "text-indigo-400" },
  education: { label: "تعليمي", icon: GraduationCap, color: "text-purple-400" },
  infrastructure: { label: "بنية تحتية", icon: Building2, color: "text-orange-400" },
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export default function ThreatRules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { data: rules, isLoading } = trpc.threatRules.list.useQuery();

  const filteredRules = (rules || []).filter((rule) => {
    const matchesSearch = !searchTerm || 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.nameAr.includes(searchTerm);
    const matchesCategory = filterCategory === "all" || rule.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: rules?.length || 0,
    enabled: rules?.filter(r => r.isEnabled).length || 0,
    critical: rules?.filter(r => r.severity === "critical").length || 0,
    totalMatches: rules?.reduce((sum, r) => sum + (r.matchCount || 0), 0) || 0,
  };

  const statItems = [
    { key: "total_rules", label: "إجمالي القواعد", value: stats.total, icon: Crosshair, color: "text-primary", description: "إجمالي القواعد يمثل العدد الكلي لقواعد الصيد والكشف عن التهديدات المتاحة في النظام. هذه القواعد مصممة لتحديد الأنشطة المشبوهة وحالات البيانات والتهديدات الأمنية الأخرى." },
    { key: "enabled_rules", label: "قواعد نشطة", value: stats.enabled, icon: CheckCircle2, color: "text-emerald-400", description: "القواعد النشطة هي القواعد التي يتم تطبيقها حاليًا للمراقبة والتحليل. يمكن تمكين أو تعطيل القواعد بناءً على احتياجات الأمان والأداء." },
    { key: "critical_rules", label: "قواعد واسعة النطاق", value: stats.critical, icon: AlertTriangle, color: "text-red-400", description: "القواعد واسعة النطاق هي القواعد ذات الأولوية القصوى والتي تشير إلى حالات رصد كبيرة تتطلب متابعة فورية. يتم تصنيفها بناءً على حجم التأثير المحتمل." },
    { key: "total_matches", label: "إجمالي التطابقات", value: stats.totalMatches.toLocaleString(), icon: Zap, color: "text-amber-400", description: "إجمالي التطابقات يمثل عدد المرات التي تم فيها تفعيل قواعد الكشف نتيجة تطابقها مع بيانات أو أنشطة محددة. هذا الرقم يساعد في قياس فعالية القواعد وتحديد حجم التهديدات." },
  ];

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-red-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">قواعد صيد التهديدات</h1>
              <p className="text-xs text-muted-foreground">Threat Hunting Rules Engine</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            {stats.total} قاعدة YARA مخصصة للسياق السعودي — كشف تلقائي لحالات الرصد وبيانات الاعتماد وإعلانات البيع
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat) => (
          <div key={stat.key} onClick={() => setActiveModal(stat.key)} className="cursor-pointer hover:scale-[1.02] transition-all group">
            <Card className="border-border h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث في القواعد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filterCategory === "all" ? "default" : "outline"}
            onClick={() => setFilterCategory("all")}
            className="text-xs"
          >
            الكل
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              size="sm"
              variant={filterCategory === key ? "default" : "outline"}
              onClick={() => setFilterCategory(key)}
              className="text-xs gap-1"
            >
              <config.icon className="w-3 h-3" />
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredRules.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <Crosshair className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">لا توجد قواعد مطابقة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRules.map((rule, i) => {
            const catConfig = categoryConfig[rule.category] || categoryConfig.data_leak;
            const CatIcon = catConfig.icon;
            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setActiveModal(`rule_${rule.id}`)}
                className="cursor-pointer hover:scale-[1.02] transition-all group h-full"
              >
                <Card className={`border-border hover:border-primary/30 transition-colors h-full ${!rule.isEnabled ? "opacity-50" : ""}`}>
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                          <CatIcon className={`w-4 h-4 ${catConfig.color}`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{rule.ruleNameAr}</h3>
                          <p className="text-xs sm:text-[10px] text-muted-foreground">{rule.ruleName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs sm:text-[10px] ${severityColors[rule.severity]}`}>
                          {rule.severity === "critical" ? "واسع النطاق" : rule.severity === "high" ? "مرتفع" : rule.severity === "medium" ? "متوسط" : "محدود"}
                        </Badge>
                        {rule.isEnabled ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {rule.descriptionAr && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">{rule.ruleDescriptionAr}</p>
                    )}

                    {/* Patterns */}
                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs sm:text-[10px] text-muted-foreground font-medium">أنماط الكشف:</p>
                      <div className="flex flex-wrap gap-1">
                        {(rule.patterns as string[] || []).slice(0, 4).map((pattern, pi) => (
                          <code key={pi} className="text-xs sm:text-[10px] font-mono bg-black/30 text-primary/80 px-1.5 py-0.5 rounded border border-border" dir="ltr">
                            {pattern.length > 30 ? pattern.slice(0, 30) + "..." : pattern}
                          </code>
                        ))}
                        {(rule.patterns as string[] || []).length > 4 && (
                          <span className="text-xs sm:text-[10px] text-muted-foreground">+{(rule.patterns as string[]).length - 4} أنماط أخرى</span>
                        )}
                      </div>
                    </div>

                    {/* Keywords */}
                    {rule.keywords && (rule.keywords as string[]).length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        <p className="text-xs sm:text-[10px] text-muted-foreground font-medium">كلمات مفتاحية:</p>
                        <div className="flex flex-wrap gap-1">
                          {(rule.keywords as string[]).slice(0, 6).map((kw, ki) => (
                            <Badge key={ki} variant="outline" className="text-xs sm:text-[10px] bg-secondary/50">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between flex-wrap pt-2 border-t border-border mt-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs sm:text-[10px] bg-secondary/30">
                          {catConfig.label}
                        </Badge>
                        <span className="text-xs sm:text-[10px] text-muted-foreground">
                          {rule.matchCount || 0} تطابق
                        </span>
                      </div>
                      <span className="text-xs sm:text-[10px] text-muted-foreground font-mono">{rule.ruleId}</span>
                    </div>
                     <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {statItems.map(stat => (
        <DetailModal
          key={stat.key}
          open={activeModal === stat.key}
          onClose={() => setActiveModal(null)}
          title={stat.label}
          icon={<stat.icon className={`w-6 h-6 ${stat.color}`} />}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
        </DetailModal>
      ))}

      {filteredRules.map(rule => {
        const catConfig = categoryConfig[rule.category] || categoryConfig.data_leak;
        return (
          <DetailModal
            key={`modal_${rule.id}`}
            open={activeModal === `rule_${rule.id}`}
            onClose={() => setActiveModal(null)}
            title={rule.ruleNameAr}
            icon={<catConfig.icon className={`w-6 h-6 ${catConfig.color}`} />}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{rule.ruleDescriptionAr}</p>
              <div>
                <h4 className="font-semibold mb-2">تفاصيل القاعدة:</h4>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p><strong className="text-foreground">المعرّف:</strong> <span className="font-mono">{rule.ruleId}</span></p>
                  <p><strong className="text-foreground">الحالة:</strong> {rule.isEnabled ? <span className="text-emerald-400">نشطة</span> : <span>معطلة</span>}</p>
                  <p><strong className="text-foreground">التصنيف:</strong> <span className={severityColors[rule.severity]}>{rule.ruleSeverity}</span></p>
                  <p><strong className="text-foreground">الفئة:</strong> {catConfig.label}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">أنماط الكشف:</h4>
                <div className="flex flex-wrap gap-2">
                  {(rule.patterns as string[] || []).map((pattern, pi) => (
                    <code key={pi} className="text-xs font-mono bg-black/30 text-primary/80 px-2 py-1 rounded border border-border" dir="ltr">
                      {pattern}
                    </code>
                  ))}
                </div>
              </div>
              {rule.keywords && (rule.keywords as string[]).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">كلمات مفتاحية:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(rule.keywords as string[]).map((kw, ki) => (
                      <Badge key={ki} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DetailModal>
        )
      })}
    </div>
  );
}

```

---

## `client/src/leaks/pages/atlas/ExternalPlatform.tsx`

```tsx
// Leaks Domain
/**
 * ExternalPlatform — Embeds external Rasid platforms via iframe
 * Supports loading states, error handling, and fullscreen toggle
 * Theme-aware: supports dark/light via useThemeColors
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2, Minimize2, ExternalLink, RefreshCw,
  Loader2, AlertTriangle, Globe
} from "lucide-react";
import { useThemeColors } from "@/hooks/atlas/useThemeColors";

interface ExternalPlatformProps {
  url: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  accentColor?: string;
}

export default function ExternalPlatform({
  url,
  title,
  titleEn,
  description,
  icon: Icon,
  accentColor = "#8B7FD4",
}: ExternalPlatformProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const tc = useThemeColors();

  useEffect(() => {
    setLoading(true);
    setError(false);
    setIframeKey(prev => prev + 1);
  }, [url]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(false);
    setIframeKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, [loading, iframeKey]);

  const containerBg = tc.isDark ? "rgba(14,11,36,0.5)" : "rgba(248,247,244,0.5)";
  const overlayBg = tc.isDark ? "rgba(14,11,36,0.9)" : "rgba(248,247,244,0.92)";
  const errorBg = tc.isDark ? "rgba(14,11,36,0.95)" : "rgba(248,247,244,0.97)";
  const iframeBg = tc.isDark ? "#0E0B24" : "#f8f7f4";

  return (
    <div className={`${fullscreen ? "fixed inset-0 z-[200]" : "relative"}`} style={fullscreen ? { background: tc.pageBg } : {}}>
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between gap-3 mb-3 px-1"
        style={fullscreen ? { padding: "12px 16px", marginBottom: 0, borderBottom: "1px solid rgba(120,100,200,0.12)" } : {}}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color: accentColor }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate" style={{ color: tc.textPrimary }}>{title}</h2>
            <p className="text-[10px] truncate" style={{ color: tc.textDim }}>{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleRefresh}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ color: tc.textMuted }}
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => window.open(url, "_blank")}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ color: tc.textMuted }}
            title="فتح في نافذة جديدة"
          >
            <ExternalLink className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setFullscreen(!fullscreen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ color: tc.textMuted }}
            title={fullscreen ? "تصغير" : "ملء الشاشة"}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Iframe Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-xl overflow-hidden"
        style={{
          height: fullscreen ? "calc(100vh - 56px)" : "calc(100vh - 140px)",
          border: "1px solid rgba(120,100,200,0.12)",
          background: containerBg,
        }}
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
              style={{ background: overlayBg, ...(tc.isDark ? { backdropFilter: "blur(8px)" } : {}) }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-10 h-10" style={{ color: accentColor }} />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: tc.textSecondary }}>جاري تحميل {title}</p>
                <p className="text-xs mt-1 font-mono" style={{ color: tc.textDim }}>{url}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
              style={{ background: errorBg }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.2)" }}
              >
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: tc.textSecondary }}>تعذر تحميل المنصة</p>
                <p className="text-xs mt-1" style={{ color: tc.textDim }}>قد تكون المنصة غير متاحة حالياً أو تمنع التضمين</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                  style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: tc.textPrimary }}
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(url, "_blank")}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-80"
                  style={{ border: tc.isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", color: tc.textSecondary }}
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح مباشرة
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <iframe
          key={iframeKey}
          src={url}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0"
          style={{ background: iframeBg }}
          allow="fullscreen; clipboard-write; clipboard-read"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads"
          title={titleEn}
        />
      </motion.div>
    </div>
  );
}

```

---

## `client/src/leaks/pages/atlas/ImpactLens.tsx`

```tsx
// Leaks Domain
/**
 * ImpactLens — عدسة الأثر والحقوق
 * Design: Purple/Navy Glassmorphism — Sovereign Premium
 * Analyzes impact of breaches: affected individuals, rights violations, sector impact
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Scale, AlertTriangle, Database, Users, Building2,
  TrendingUp, Eye, Globe, Fingerprint, Lock, MapPin
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import { useData } from "@/contexts/atlas/DataContext";
import PageShell from "@/components/atlas/PageShell";
import { RASID_ASSETS } from "@/lib/atlas/assets";
import KpiCard from "@/components/atlas/KpiCard";
import SectionHeader from "@/components/atlas/SectionHeader";
import DrillModal from "@/components/atlas/DrillModal";
import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, CHART_TOOLTIP_STYLE, stagger, SUMMARY_TO_INCIDENT_SEVERITY } from "@/lib/atlas/design";

export default function ImpactLens() {
  const { data, loading, allIncidents } = useData();
  const [kpiDrill, setKpiDrill] = useState<string | null>(null);

  // Impact metrics
  const impactMetrics = useMemo(() => {
    if (!data) return null;
    const criticalIncidents = allIncidents.filter(inc => inc.severity === "حرج" || inc.severity === "واسع النطاق");
    const highRecords = criticalIncidents.reduce((s, inc) => s + inc.records, 0);
    const avgRecords = allIncidents.length > 0 ? Math.round(data.summary.totalRecords / allIncidents.length) : 0;
    const uniquePiiTypes = new Set<string>();
    allIncidents.forEach(inc => inc.piiTypes?.forEach(p => uniquePiiTypes.add(p)));
    const multiPiiIncidents = allIncidents.filter(inc => (inc.piiTypes?.length || 0) > 3);
    return { criticalCount: criticalIncidents.length, highRecords, avgRecords, uniquePiiTypes: uniquePiiTypes.size, multiPiiCount: multiPiiIncidents.length };
  }, [data, allIncidents]);

  // Sector impact analysis
  const sectorImpact = useMemo(() => {
    if (!data) return [];
    return data.sectors.slice(0, 12).map(s => ({
      name: s.name.length > 12 ? s.name.slice(0, 12) + ".." : s.name,
      "حالات رصد": s.count,
      سجلات: Math.round(s.records / 1000),
      fill: "#8B7FD4",
    }));
  }, [data]);

  // PII exposure by type
  const piiExposure = useMemo(() => {
    if (!data) return [];
    return data.piiAtlas.slice(0, 10).map(p => ({
      name: p.nameAr,
      value: p.count,
      fill: p.sensitivity === "high" ? "#FF4D6A" : p.sensitivity === "medium" ? "#F0D060" : "#4ECDC4",
    }));
  }, [data]);

  // Severity impact radar
  const severityImpact = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.summary.severityDistribution).map(([k, v]) => ({
      subject: k,
      value: v,
      fullMark: Math.max(...Object.values(data.summary.severityDistribution)),
    }));
  }, [data]);

  // Monthly records trend
  const monthlyRecords = useMemo(() => {
    if (!data) return [];
    return data.monthly.slice(-12).map(m => ({
      month: m.month,
      سجلات: Math.round(m.records / 1000),
    }));
  }, [data]);

  // Risk scatter data (sector vs records)
  const riskScatter = useMemo(() => {
    if (!data) return [];
    return data.sectors.slice(0, 20).map(s => ({
      x: s.count,
      y: Math.round(s.records / 1000),
      z: s.piiTypes?.length || 1,
      name: s.name.length > 15 ? s.name.slice(0, 15) + ".." : s.name,
    }));
  }, [data]);

  // Drill data
  const kpiDrillData = useMemo(() => {
    if (!data || !kpiDrill) return null;
    switch (kpiDrill) {
      case "critical":
        return { title: "حالات الرصد واسعة النطاق حسب المصدر", data: Object.entries(data.summary.sourceDistribution).map(([k, v]) => ({ name: k, value: v.count, fill: SOURCE_COLORS[k] || "#8B7FD4" })), type: "pie" as const };
      case "records":
        return { title: "السجلات حسب المصدر", data: Object.entries(data.summary.sourceDistribution).map(([k, v]) => ({ name: k, value: v.records, fill: SOURCE_COLORS[k] || "#8B7FD4" })), type: "bar" as const };
      case "pii":
        return { title: "أكثر البيانات تعرضاً", data: piiExposure, type: "bar" as const };
      default: return null;
    }
  }, [data, kpiDrill, piiExposure]);

  if (loading || !data || !impactMetrics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      <SectionHeader title="عدسة الأثر والحقوق" subtitle="Impact Lens" icon={Scale} />

      {/* KPIs */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-8">
        <KpiCard label="حالات رصد واسعة النطاق" value={impactMetrics.criticalCount} icon={AlertTriangle} accent="crimson" delay={0} onClick={() => setKpiDrill("critical")} />
        <KpiCard label="السجلات المكشوفة" value={data.summary.totalRecords} icon={Database} accent="teal" delay={0.08} onClick={() => setKpiDrill("records")} />
        <KpiCard label="متوسط السجلات/حالة رصد" value={impactMetrics.avgRecords} icon={TrendingUp} accent="purple" delay={0.16} />
        <KpiCard label="أنواع البيانات المكشوفة" value={impactMetrics.uniquePiiTypes} icon={Fingerprint} accent="gold" delay={0.24} onClick={() => setKpiDrill("pii")} />
        <KpiCard label="حالات رصد متعددة البيانات" value={impactMetrics.multiPiiCount} icon={Lock} accent="blue" delay={0.32} subtitle="أكثر من 3 أنواع" />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
        {/* Sector Impact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#F0D060]" />
            أثر الحالات على القطاعات
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorImpact} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#aaa", fontSize: 11, fontFamily: "Tajawal" }} width={90} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="حالات رصد" fill="#8B7FD4" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* PII Exposure */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-[#FF4D6A]" />
            أكثر البيانات الشخصية تعرضاً
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={piiExposure}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#aaa", fontSize: 9, fontFamily: "Tajawal" }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {piiExposure.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Severity Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF8C42]" />
            توزيع مستويات التأثير
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={severityImpact}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#aaa", fontSize: 11, fontFamily: "Tajawal" }} />
              <PolarRadiusAxis tick={{ fill: "#555", fontSize: 9 }} />
              <Radar name="حالات رصد" dataKey="value" stroke="#FF4D6A" fill="#FF4D6A" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Records Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4ECDC4]" />
            اتجاه السجلات المكشوفة شهرياً (بالآلاف)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRecords}>
              <defs>
                <linearGradient id="gradImpact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D6A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF4D6A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="سجلات" stroke="#FF4D6A" fill="url(#gradImpact)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Risk Matrix */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-3 md:p-6 mb-4 md:mb-8">
        <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#8B7FD4]" />
          مصفوفة المخاطر — القطاعات (حالات الرصد × السجلات بالآلاف)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="x" name="حالات رصد" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} label={{ value: "عدد حالات الرصد", position: "bottom", fill: "#666", fontSize: 11, fontFamily: "Tajawal" }} />
            <YAxis dataKey="y" name="سجلات (K)" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} label={{ value: "السجلات (آلاف)", angle: -90, position: "insideLeft", fill: "#666", fontSize: 11, fontFamily: "Tajawal" }} />
            <ZAxis dataKey="z" range={[40, 400]} />
            <RechartsTooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value: any, name: string) => [fmtNum(value), name === "x" ? "حالات رصد" : "سجلات (K)"]}
              labelFormatter={(label: any) => ""}
            />
            <Scatter data={riskScatter} fill="#8B7FD4" fillOpacity={0.6} stroke="#8B7FD4" strokeWidth={1} />
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Rights Impact Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card p-3 md:p-6 mb-4 md:mb-8">
        <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#F0D060]" />
          ملخص أثر الحقوق
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <div className="glass-card p-4 text-center">
            <div className="kpi-icon mx-auto mb-3" data-accent="crimson" style={{ width: 48, height: 48, borderRadius: 14 }}>
              <Users className="w-6 h-6 relative z-10 text-[#FF4D6A]" />
            </div>
            <div className="mono-num text-lg md:text-2xl font-bold text-white mb-1">{fmtNum(data.summary.totalRecords)}</div>
            <div className="text-xs text-gray-400">سجل شخصي مدعى</div>
            <div className="text-[10px] text-gray-600 mt-1">حق حماية البيانات</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="kpi-icon mx-auto mb-3" data-accent="gold" style={{ width: 48, height: 48, borderRadius: 14 }}>
              <Fingerprint className="w-6 h-6 relative z-10 text-[#F0D060]" />
            </div>
            <div className="mono-num text-lg md:text-2xl font-bold text-white mb-1">{impactMetrics.uniquePiiTypes}</div>
            <div className="text-xs text-gray-400">نوع بيانات مدعى</div>
            <div className="text-[10px] text-gray-600 mt-1">حق حماية البيانات</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="kpi-icon mx-auto mb-3" data-accent="purple" style={{ width: 48, height: 48, borderRadius: 14 }}>
              <Building2 className="w-6 h-6 relative z-10 text-[#8B7FD4]" />
            </div>
            <div className="mono-num text-lg md:text-2xl font-bold text-white mb-1">{data.summary.totalSectors}</div>
            <div className="text-xs text-gray-400">قطاع متأثر</div>
            <div className="text-[10px] text-gray-600 mt-1">حق المساءلة</div>
          </div>
        </div>
      </motion.div>

      <DrillModal drillData={kpiDrillData} onClose={() => setKpiDrill(null)} />
    </PageShell>
  );
}

```

---

## `client/src/leaks/pages/atlas/IncidentRegistry.tsx`

```tsx
// Leaks Domain
/**
 * IncidentRegistry — سجل حالات الرصد
 * Design: Purple/Navy Glassmorphism — Sovereign Premium
 * Full incident list with search, filters, sort, pagination
 * Drill-down to individual incident details
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Database, AlertTriangle, Globe, Calendar,
  ChevronLeft, ChevronRight, ArrowUpDown, Building2,
  MapPin, Eye, Download, SortAsc, SortDesc
} from "lucide-react";
import { useData, IncidentDetail } from "@/contexts/atlas/DataContext";
import PageShell from "@/components/atlas/PageShell";
import { RASID_ASSETS } from "@/lib/atlas/assets";
import IncidentPanel from "@/components/atlas/IncidentPanel";
import KpiCard from "@/components/atlas/KpiCard";
import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, stagger } from "@/lib/atlas/design";
import { useThemeColors } from "@/hooks/atlas/useThemeColors";

const PER_PAGE = 20;

export default function IncidentRegistry() {
  const { data, loading, allIncidents } = useData();
  const tc = useThemeColors();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"records" | "date">("records");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState<IncidentDetail | null>(null);

  const sectors = useMemo(() => {
    const s = new Set(allIncidents.map(inc => inc.sector).filter(Boolean));
    return Array.from(s).sort();
  }, [allIncidents]);

  const filtered = useMemo(() => {
    let list = [...allIncidents];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(inc =>
        inc.title?.toLowerCase().includes(q) ||
        inc.titleEn?.toLowerCase().includes(q) ||
        inc.id?.toLowerCase().includes(q) ||
        inc.sector?.toLowerCase().includes(q) ||
        inc.region?.toLowerCase().includes(q) ||
        inc.threatActor?.toLowerCase().includes(q)
      );
    }
    if (severityFilter !== "all") list = list.filter(inc => inc.severity === severityFilter);
    if (sourceFilter !== "all") list = list.filter(inc => inc.source === sourceFilter);
    if (sectorFilter !== "all") list = list.filter(inc => inc.sector === sectorFilter);

    list.sort((a, b) => {
      if (sortBy === "records") return sortDir === "desc" ? b.records - a.records : a.records - b.records;
      return sortDir === "desc" ? (b.date || "").localeCompare(a.date || "") : (a.date || "").localeCompare(b.date || "");
    });
    return list;
  }, [allIncidents, search, severityFilter, sourceFilter, sectorFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalRecords = filtered.reduce((sum, inc) => sum + inc.records, 0);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
          style={{ background: "rgba(139,127,212,0.1)", border: "1px solid rgba(139,127,212,0.2)" }}
        >
          <Database className="w-4 h-4 text-[#8B7FD4]" />
          <span className="text-sm text-[#8B7FD4] font-medium">Incident Registry</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-2xl font-extrabold" style={{ color: tc.textPrimary }}
        >
          سجل حالات الرصد الشامل
        </motion.h2>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        <KpiCard label="حالات الرصد المعروضة" value={filtered.length} icon={Database} accent="purple" delay={0} />
        <KpiCard label="السجلات المكشوفة" value={totalRecords} icon={AlertTriangle} accent="crimson" delay={0.08} />
        <KpiCard label="القطاعات" value={sectors.length} icon={Building2} accent="gold" delay={0.16} />
        <KpiCard label="المناطق" value={data.summary.totalRegions} icon={MapPin} accent="teal" delay={0.24} />
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-3 md:p-4 mb-4 md:mb-6"
      >
        <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث بالعنوان، المعرف، القطاع، المنطقة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#8B7FD4]/30"
              style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.04)", border: tc.isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(120,100,200,0.1)", color: tc.textPrimary }}
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ color: tc.textMuted }}
            style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.04)", border: tc.isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(120,100,200,0.1)", color: tc.isDark ? undefined : "#4a4578" }}
          >
            <option value="all">جميع مستويات التأثير</option>
            <option value="حرج">واسع النطاق</option>
            <option value="مرتفع">مرتفع</option>
            <option value="متوسط">متوسط</option>
            <option value="منخفض">محدود</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ color: tc.textMuted }}
            style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.04)", border: tc.isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(120,100,200,0.1)", color: tc.isDark ? undefined : "#4a4578" }}
          >
            <option value="all">جميع المصادر</option>
            <option value="دارك ويب">دارك ويب</option>
            <option value="تليجرام">تليجرام</option>
            <option value="مواقع اللصق">مواقع اللصق</option>
          </select>

          {/* Sort */}
          <button
            onClick={() => {
              if (sortBy === "records") { setSortBy("date"); } else { setSortBy("records"); }
            }}
            className="px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5" style={{ color: tc.textDim }}
            style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.04)", border: tc.isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(120,100,200,0.1)", color: tc.isDark ? undefined : "#4a4578" }}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortBy === "records" ? "السجلات المكشوفة" : "التاريخ"}
          </button>
          <button
            onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
            className="px-2.5 py-2.5 rounded-xl transition-colors" style={{ color: tc.textDim }}
            style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.04)", border: tc.isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(120,100,200,0.1)", color: tc.isDark ? undefined : "#4a4578" }}
          >
            {sortDir === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Incident List */}
      <div className="space-y-3 mb-6">
        <AnimatePresence mode="popLayout">
          {paginated.map((inc, i) => {
            const sevColor = SEVERITY_COLORS[inc.severity] || "#4ECDC4";
            const srcColor = SOURCE_COLORS[inc.source] || "#8B7FD4";
            return (
              <motion.div
                key={inc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.03 }}
                className="kpi-card p-4 cursor-pointer group"
                data-accent={inc.severity === "حرج" || inc.severity === "واسع النطاق" ? "crimson" : inc.severity === "مرتفع" ? "gold" : inc.severity === "متوسط" ? "blue" : "teal"}
                onClick={() => setSelectedIncident(inc)}
              >
                <div className="flex items-start justify-between gap-2 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="mono-num text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25` }}>
                        {inc.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${sevColor}12`, color: sevColor }}>
                        {inc.severity}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${srcColor}12`, color: srcColor }}>
                        {inc.source}
                      </span>
                    </div>
                    <h4 className="text-xs md:text-sm font-semibold mb-1 line-clamp-2 md:truncate group-hover:text-[#8B7FD4] transition-colors" style={{ color: tc.textPrimary }}>
                      {inc.title}
                    </h4>
                    <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-[11px] text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{inc.sector}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.region || "غير محددة"}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{inc.date || "غير محدد"}</span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="mono-num text-sm md:text-lg font-bold" style={{ color: sevColor }}>{fmtNum(inc.records)}</div>
                    <div className="text-[10px] text-gray-600">سجل</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-600 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3" /> انقر للتفاصيل
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.06)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="mono-num text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.06)" }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-center text-xs text-gray-600 mb-4">
        عرض <span className="mono-num text-gray-400">{paginated.length}</span> من أصل <span className="mono-num text-gray-400">{filtered.length}</span> حالة رصد
      </div>

      {/* Incident Detail Panel */}
      {selectedIncident && (
        <IncidentPanel
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </PageShell>
  );
}

```

---

## `client/src/leaks/pages/atlas/NationalOverview.tsx`

```tsx
// Leaks Domain
/**
 * NationalOverview — النظرة الوطنية
 * Design: Purple/Navy Glassmorphism — Sovereign Premium
 * All numbers: English (en-US) via mono-num class
 * Cards: Glassmorphism with colored side bars
 * Drill-down modals on every KPI
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Database, AlertTriangle, TrendingUp, Globe, MapPin,
  Building2, Fingerprint, Eye, Activity, BarChart3, Layers
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { useData } from "@/contexts/atlas/DataContext";
import KpiCard from "@/components/atlas/KpiCard";
import SectionHeader from "@/components/atlas/SectionHeader";
import DrillModal from "@/components/atlas/DrillModal";
import PageShell from "@/components/atlas/PageShell";
import { useThemeColors } from "@/hooks/atlas/useThemeColors";
import { RASID_ASSETS } from "@/lib/atlas/assets";
import SaudiMap from "@/components/atlas/SaudiMap";
import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, CHART_TOOLTIP_STYLE, stagger, NEW_BG } from "@/lib/atlas/design";

export default function NationalOverview() {
  const { data, loading, allIncidents } = useData();
  const [kpiDrill, setKpiDrill] = useState<string | null>(null);

  // Derived data
  const topSectors = useMemo(() => {
    if (!data) return [];
    return data.sectors.slice(0, 8).map(s => ({
      name: s.name.length > 14 ? s.name.slice(0, 14) + ".." : s.name,
      "حالات رصد": s.count,
      fill: "#8B7FD4",
    }));
  }, [data]);

  const monthlyTrend = useMemo(() => {
    if (!data) return [];
    return data.monthly.slice(-12).map(m => ({
      month: m.month,
      "حالات رصد": m.count,
      سجلات: Math.round(m.records / 1000),
    }));
  }, [data]);

  const sourceDistPie = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.summary.sourceDistribution).map(([k, v]) => ({
      name: k, value: v.count, fill: SOURCE_COLORS[k] || "#8B7FD4",
    }));
  }, [data]);

  const severityDistPie = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.summary.severityDistribution).map(([k, v]) => ({
      name: k, value: v, fill: SEVERITY_COLORS[k] || "#8B7FD4",
    }));
  }, [data]);

  const regionRadar = useMemo(() => {
    if (!data) return [];
    return data.regions.slice(0, 8).map(r => ({
      subject: r.name.length > 10 ? r.name.slice(0, 10) + ".." : r.name,
      value: r.count,
      fullMark: data.regions[0]?.count || 100,
    }));
  }, [data]);

  // KPI drill-down data
  const kpiDrillData = useMemo(() => {
    if (!data || !kpiDrill) return null;
    switch (kpiDrill) {
      case "incidents":
        return { title: "تفصيل حالات الرصد حسب التأثير", data: severityDistPie, type: "pie" as const };
      case "records":
        return { title: "السجلات حسب المصدر", data: Object.entries(data.summary.sourceDistribution).map(([k, v]) => ({ name: k, value: v.records, fill: SOURCE_COLORS[k] || "#8B7FD4" })), type: "bar" as const };
      case "piiTypes":
        return { title: "أكثر أنواع البيانات ظهوراً", data: data.piiAtlas.slice(0, 8).map(p => ({ name: p.nameAr, value: p.count, fill: p.sensitivity === "high" ? "#DC3545" : p.sensitivity === "medium" ? "#D4AF37" : "hsl(var(--primary))" })), type: "bar" as const };
      case "sectors":
        return { title: "أكثر القطاعات تعرضاً", data: topSectors.map(s => ({ ...s, value: s["حالات رصد"] })), type: "bar" as const };
      case "regions":
        return { title: "حالات الرصد حسب المنطقة", data: data.regions.slice(0, 8).map(r => ({ name: r.name, value: r.count, fill: "#4ECDC4" })), type: "bar" as const };
      case "severity":
        return { title: "توزيع مستويات التأثير", data: severityDistPie, type: "pie" as const };
      default: return null;
    }
  }, [data, kpiDrill, severityDistPie, topSectors]);

  const tc = useThemeColors();

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      {/* Hero Banner */}
      <div className="relative rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-8" style={{ minHeight: 180 }}>
        <img src={NEW_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: tc.heroOverlay }} />
        <div className="relative z-10 p-4 md:p-8 flex flex-col justify-center" style={{ minHeight: 180 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 self-start"
            style={{ background: "rgba(139,127,212,0.15)", border: "1px solid rgba(139,127,212,0.25)" }}
          >
            <BarChart3 className="w-4 h-4 text-[#8B7FD4]" />
            <span className="text-sm text-[#8B7FD4] font-medium">National Overview</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-3xl lg:text-4xl font-extrabold mb-2" style={{ color: tc.textPrimary }}
          >
            النظرة الوطنية لحالات رصد البيانات
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm max-w-xl" style={{ color: tc.textMuted }}
          >
            لوحة تحكم شاملة لرصد وتحليل حالات حالة رصد البيانات الشخصية على المستوى الوطني
          </motion.p>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-4 mb-4 md:mb-8">
        <KpiCard label="إجمالي حالات الرصد" value={data.summary.totalIncidents} icon={AlertTriangle} accent="crimson" delay={0} onClick={() => setKpiDrill("incidents")} />
        <KpiCard label="السجلات المكشوفة" value={data.summary.totalRecords} icon={Database} accent="teal" delay={0.08} onClick={() => setKpiDrill("records")} />
        <KpiCard label="أنواع البيانات" value={data.summary.totalPiiTypes} icon={Fingerprint} accent="purple" delay={0.16} onClick={() => setKpiDrill("piiTypes")} />
        <KpiCard label="القطاعات المتأثرة" value={data.summary.totalSectors} icon={Building2} accent="gold" delay={0.24} onClick={() => setKpiDrill("sectors")} />
        <KpiCard label="المناطق" value={data.summary.totalRegions} icon={MapPin} accent="blue" delay={0.32} onClick={() => setKpiDrill("regions")} />
        <KpiCard label="مستوى التأثير" value={data.summary.severityDistribution["واسع النطاق"] || 0} icon={Eye} accent="crimson" delay={0.4} subtitle="واسع النطاق" onClick={() => setKpiDrill("severity")} />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-3 md:p-6"
        >
          <h3 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2" style={{ color: tc.textSecondary }}>
            <TrendingUp className="w-4 h-4 text-[#4ECDC4]" />
            الاتجاه الشهري لحالات الرصد
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B7FD4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B7FD4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="حالات رصد" stroke="#8B7FD4" fill="url(#gradArea)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-3 md:p-6"
        >
          <h3 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2" style={{ color: tc.textSecondary }}>
            <Globe className="w-4 h-4 text-[#8B7FD4]" />
            توزيع المصادر
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceDistPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {sourceDistPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {sourceDistPie.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                {s.name} (<span className="mono-num">{s.value}</span>)
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Sectors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-3 md:p-6"
        >
          <h3 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2" style={{ color: tc.textSecondary }}>
            <Building2 className="w-4 h-4 text-[#F0D060]" />
            أكثر القطاعات تعرضاً
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topSectors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#aaa", fontSize: 11, fontFamily: "Tajawal" }} width={100} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="حالات رصد" radius={[0, 6, 6, 0]} fill="#8B7FD4" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Regional Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-3 md:p-6"
        >
          <h3 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2" style={{ color: tc.textSecondary }}>
            <MapPin className="w-4 h-4 text-[#4ECDC4]" />
            التوزيع الجغرافي
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={regionRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#aaa", fontSize: 10, fontFamily: "Tajawal" }} />
              <PolarRadiusAxis tick={{ fill: "#555", fontSize: 9 }} />
              <Radar name="حالات رصد" dataKey="value" stroke="#8B7FD4" fill="#8B7FD4" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Saudi Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-3 md:p-6 mb-4 md:mb-8"
      >
        <h3 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2" style={{ color: tc.textSecondary }}>
          <Globe className="w-4 h-4 text-[#8B7FD4]" />
          خريطة المملكة — توزيع حالات الرصد
        </h3>
        <SaudiMap incidents={allIncidents} regions={data.regions} />
      </motion.div>

      {/* Severity Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-3 md:p-6 mb-4 md:mb-8"
      >
        <h3 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2" style={{ color: tc.textSecondary }}>
          <AlertTriangle className="w-4 h-4 text-[#FF4D6A]" />
          توزيع مستويات التأثير
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {severityDistPie.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="glass-card p-4 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1 h-full rounded-r-xl" style={{ background: item.fill }} />
              <div className="text-sm text-gray-400 mb-2">{item.name}</div>
              <div className="mono-num text-2xl font-bold" style={{ color: item.fill }}>{item.value}</div>
              <div className="text-xs text-gray-600 mt-1">حالة رصد</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Drill Modal */}
      <DrillModal drillData={kpiDrillData} onClose={() => setKpiDrill(null)} />
    </PageShell>
  );
}

```

---

## `client/src/leaks/pages/atlas/PatternLab.tsx`

```tsx
// Leaks Domain
/**
 * PatternLab — مختبر الأنماط
 * Design: Purple/Navy Glassmorphism — Sovereign Premium
 * Pattern cards with drill-down, comparison tool, source filters
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Globe, AlertTriangle, Database, Eye, Search,
  Building2, Calendar, MapPin, ChevronRight, ChevronLeft, X,
  GitCompareArrows, Fingerprint, Filter
} from "lucide-react";
import { useData, PatternItem, IncidentDetail } from "@/contexts/atlas/DataContext";
import PageShell from "@/components/atlas/PageShell";
import { RASID_ASSETS } from "@/lib/atlas/assets";
import KpiCard from "@/components/atlas/KpiCard";
import SectionHeader from "@/components/atlas/SectionHeader";
import IncidentPanel from "@/components/atlas/IncidentPanel";
import PatternCompare from "@/components/atlas/PatternCompare";
import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, CHART_TOOLTIP_STYLE, stagger } from "@/lib/atlas/design";
import { useThemeColors } from "@/hooks/atlas/useThemeColors";

// Pattern Drill-Down Panel
function PatternDrillPanel({ pattern, onClose, onSelectIncident }: {
  pattern: PatternItem; onClose: () => void; onSelectIncident: (inc: IncidentDetail) => void;
}) {
  const tc = useThemeColors();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"records" | "date">("records");
  const [page, setPage] = useState(1);
  const perPage = 15;
  const sevColor = SEVERITY_COLORS[pattern.severity] || "#4ECDC4";
  const srcColor = SOURCE_COLORS[pattern.source] || "#8B7FD4";

  const sectors = useMemo(() => {
    if (!pattern.incidents) return [];
    return Array.from(new Set(pattern.incidents.map(inc => inc.sector).filter(Boolean))).sort();
  }, [pattern]);

  const filtered = useMemo(() => {
    if (!pattern.incidents) return [];
    let list = [...pattern.incidents];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(inc => inc.title?.toLowerCase().includes(q) || inc.id?.toLowerCase().includes(q) || inc.sector?.toLowerCase().includes(q));
    }
    if (sectorFilter !== "all") list = list.filter(inc => inc.sector === sectorFilter);
    list.sort((a, b) => sortBy === "records" ? b.records - a.records : (b.date || "").localeCompare(a.date || ""));
    return list;
  }, [pattern, search, sectorFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <motion.div
      initial={{ opacity: 0, x: -60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}
      animate={{ opacity: 1, x: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}
      exit={{ opacity: 0, x: -60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto w-full md:w-[560px] z-[60] overflow-y-auto"
      style={{ background: tc.panelGradient, ...(tc.isDark ? { backdropFilter: "blur(40px)" } : {}) }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25` }}>{pattern.severity}</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${srcColor}15`, color: srcColor, border: `1px solid ${srcColor}25` }}>{pattern.source}</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-3 text-center">
            <div className="mono-num text-xl font-bold text-white">{pattern.count}</div>
            <div className="text-[10px] text-gray-500">حالة رصد</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="mono-num text-xl font-bold" style={{ color: sevColor }}>{fmtNum(pattern.records)}</div>
            <div className="text-[10px] text-gray-500">سجل</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="mono-num text-xl font-bold text-[#F0D060]">{pattern.sectorCount}</div>
            <div className="text-[10px] text-gray-500">قطاع</div>
          </div>
        </div>

        {/* PII Types */}
        {Array.isArray(pattern.piiTypes) && pattern.piiTypes.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs text-gray-500 mb-2">أنواع البيانات المكشوفة</h4>
            <div className="flex flex-wrap gap-1.5">
              {pattern.piiTypes.map((pii, j) => (
                <span key={j} className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(240,208,96,0.08)", color: "#F0D060", border: "1px solid rgba(240,208,96,0.12)" }}>
                  {pii}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث..."
              className="w-full pr-9 pl-3 py-2 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          </div>
          <select value={sectorFilter} onChange={e => { setSectorFilter(e.target.value); setPage(1); }}
            className="px-2 py-2 rounded-xl text-xs text-gray-300 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <option value="all">جميع القطاعات</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Incident List */}
        <div className="space-y-2">
          {paginated.map((inc, i) => {
            const iSevColor = SEVERITY_COLORS[inc.severity] || "#4ECDC4";
            return (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all group"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                onClick={() => onSelectIncident(inc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="mono-num text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${iSevColor}12`, color: iSevColor }}>{inc.id}</span>
                    </div>
                    <h5 className="text-xs font-medium text-gray-200 truncate group-hover:text-white">{inc.title}</h5>
                    <div className="text-[10px] text-gray-600 mt-1">{inc.sector} · {inc.date || "غير محدد"}</div>
                  </div>
                  <div className="mono-num text-sm font-bold" style={{ color: iSevColor }}>{fmtNum(inc.records)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-gray-400 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            <span className="mono-num text-xs text-gray-500">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-gray-400 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PatternLabPage() {
  const { data, loading } = useData();
  const tc = useThemeColors();
  const [sourceFilter, setSourceFilter] = useState("all");
  const [drillPattern, setDrillPattern] = useState<PatternItem | null>(null);
  const [drillIncident, setDrillIncident] = useState<IncidentDetail | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const filteredPatterns = useMemo(() => {
    if (!data) return [];
    if (sourceFilter === "all") return data.patterns;
    return data.patterns.filter(p => p.sourceKey === sourceFilter);
  }, [data, sourceFilter]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      <SectionHeader title="مختبر الأنماط" subtitle="Pattern Lab" icon={Layers} />

      {/* Source Filters + Compare Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="flex flex-wrap gap-2">
          {[{ key: "all", label: "جميع المصادر" }, { key: "darkweb", label: "دارك ويب" }, { key: "telegram", label: "تليجرام" }, { key: "paste", label: "مواقع اللصق" }].map(f => (
            <button
              key={f.key}
              onClick={() => setSourceFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sourceFilter === f.key ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              style={sourceFilter === f.key ? { background: "rgba(139,127,212,0.2)", border: "1px solid rgba(139,127,212,0.3)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCompare(true)}
          className="px-4 py-2 rounded-full text-sm font-medium text-[#8B7FD4] transition-all hover:bg-[#8B7FD4]/10 flex items-center gap-2"
          style={{ background: "rgba(139,127,212,0.08)", border: "1px solid rgba(139,127,212,0.2)" }}
        >
          <GitCompareArrows className="w-4 h-4" />
          مقارنة الأنماط
        </button>
      </div>

      {/* Pattern Cards Grid */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-8">
        {filteredPatterns.map((pattern, i) => {
          const sevColor = SEVERITY_COLORS[pattern.severity] || "#4ECDC4";
          const srcColor = SOURCE_COLORS[pattern.source] || "#8B7FD4";
          const accentKey = pattern.severity === "واسع النطاق" ? "crimson" : pattern.severity === "مرتفع" ? "gold" : pattern.severity === "متوسط" ? "blue" : "teal";
          return (
            <motion.div
              key={pattern.id}
              variants={stagger.item}
              className="kpi-card p-3 md:p-5 cursor-pointer group"
              data-accent={accentKey}
              onClick={() => setDrillPattern(pattern)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25` }}>
                  {pattern.severity}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${srcColor}15`, color: srcColor, border: `1px solid ${srcColor}25` }}>
                  {pattern.source}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="mono-num text-lg font-bold text-white">{pattern.count}</div>
                  <div className="text-[10px] text-gray-500">حالة رصد</div>
                </div>
                <div className="text-center">
                  <div className="mono-num text-lg font-bold" style={{ color: sevColor }}>{fmtNum(pattern.records)}</div>
                  <div className="text-[10px] text-gray-500">سجل</div>
                </div>
                <div className="text-center">
                  <div className="mono-num text-lg font-bold text-[#F0D060]">{pattern.sectorCount}</div>
                  <div className="text-[10px] text-gray-500">قطاع</div>
                </div>
              </div>

              {Array.isArray(pattern.piiTypes) && pattern.piiTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {pattern.piiTypes.slice(0, 4).map((pii, j) => (
                    <span key={j} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(240,208,96,0.06)", color: "#F0D060", border: "1px solid rgba(240,208,96,0.1)" }}>
                      {pii}
                    </span>
                  ))}
                  {pattern.piiTypes.length > 4 && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full text-gray-500" style={{ background: "rgba(255,255,255,0.03)" }}>
                      +{pattern.piiTypes.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Top 3 incidents preview */}
              {pattern.topIncidents && pattern.topIncidents.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {pattern.topIncidents.slice(0, 3).map((inc, j) => (
                    <div key={j} className="flex items-center justify-between text-[10px] p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-gray-400 truncate flex-1">{inc.title}</span>
                      <span className="mono-num text-gray-500 mr-2">{fmtNum(inc.records)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-gray-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-3 h-3" /> انقر للتفاصيل
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Pattern Drill-Down Panel */}
      <AnimatePresence>
        {drillPattern && !drillIncident && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 ${tc.isDark ? "bg-black/50 backdrop-blur-sm" : "bg-black/20"} z-40`} onClick={() => setDrillPattern(null)} />
            <PatternDrillPanel pattern={drillPattern} onClose={() => setDrillPattern(null)} onSelectIncident={setDrillIncident} />
          </>
        )}
      </AnimatePresence>

      {/* Incident Detail Panel */}
      {drillIncident && (
        <IncidentPanel
          incident={drillIncident}
          onClose={() => { setDrillIncident(null); setDrillPattern(null); }}
          onBack={() => setDrillIncident(null)}
        />
      )}

      {/* Pattern Compare Overlay */}
      <AnimatePresence>
        {showCompare && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 ${tc.isDark ? "bg-black/60 backdrop-blur-sm" : "bg-black/25"} z-40`} onClick={() => setShowCompare(false)} />
            <motion.div
              initial={{ opacity: 0, y: 60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}
              animate={{ opacity: 1, y: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}
              exit={{ opacity: 0, y: 60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-4 md:inset-12 z-50 overflow-y-auto rounded-2xl"
              style={{ background: tc.panelGradient, ...(tc.isDark ? { backdropFilter: "blur(40px)" } : {}), border: "1px solid rgba(139,127,212,0.15)" }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GitCompareArrows className="w-5 h-5 text-[#8B7FD4]" />
                    مقارنة الأنماط
                  </h3>
                  <button onClick={() => setShowCompare(false)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <PatternCompare patterns={data.patterns} onClose={() => setShowCompare(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

```

---

## `client/src/leaks/pages/atlas/PiiAtlas.tsx`

```tsx
// Leaks Domain
/**
 * PiiAtlas — أطلس البيانات الشخصية
 * Design: Purple/Navy Glassmorphism — Sovereign Premium
 * Treemap visualization, sensitivity filters, PII detail panels
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint, Lock, Unlock, Eye, Database, Globe, AlertTriangle,
  Building2, X, User, Phone, Mail, MapPin, CreditCard,
  Wifi, Hash, Search, Filter
} from "lucide-react";
import {
  Treemap, ResponsiveContainer, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { useData, PiiItem } from "@/contexts/atlas/DataContext";
import PageShell from "@/components/atlas/PageShell";
import { RASID_ASSETS } from "@/lib/atlas/assets";
import KpiCard from "@/components/atlas/KpiCard";
import SectionHeader from "@/components/atlas/SectionHeader";
import { fmtNum, SENSITIVITY_COLORS, SENSITIVITY_AR, SOURCE_COLORS, SEVERITY_COLORS, CHART_TOOLTIP_STYLE, stagger } from "@/lib/atlas/design";
import { useThemeColors } from "@/hooks/atlas/useThemeColors";

const PII_ICONS: Record<string, any> = {
  "الهوية الوطنية": Fingerprint, "الاسم الكامل": User, "رقم الهاتف": Phone,
  "البريد الإلكتروني": Mail, "العنوان": MapPin, "الحساب البنكي": CreditCard,
  "بطاقة الائتمان": CreditCard, "المسمى الوظيفي": Building2, "عنوان IP": Wifi,
  "كلمة المرور": Lock, "رقم الإقامة": Hash,
};

function SensitivityBadge({ level }: { level: "high" | "medium" | "low" }) {
  const cls = level === "high" ? "badge-high" : level === "medium" ? "badge-medium" : "badge-low";
  return (
    <span className={`${cls} text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1`}>
      {level === "high" ? <Lock className="w-3 h-3" /> : level === "medium" ? <Eye className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      {SENSITIVITY_AR[level]}
    </span>
  );
}

// Custom Treemap Content
function CustomTreemapContent(props: any) {
  const { x, y, width, height, name, nameAr, sensitivity, count } = props;
  if (!width || !height || width < 40 || height < 30) return null;
  const colors = SENSITIVITY_COLORS[sensitivity as keyof typeof SENSITIVITY_COLORS] || SENSITIVITY_COLORS.low;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} fill={colors.bg} stroke={colors.border} strokeWidth={1} className="treemap-tile" />
      {width > 60 && height > 40 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill={colors.text} fontSize={width > 100 ? 12 : 10} fontFamily="Tajawal" fontWeight="600">
            {nameAr || name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10} fontFamily="JetBrains Mono">
            {count != null ? fmtNum(count) : '0'}
          </text>
        </>
      )}
    </g>
  );
}

// PII Detail Panel
function PiiDetailPanel({ item, onClose }: { item: PiiItem; onClose: () => void }) {
  const tc = useThemeColors();
  const IconComp = PII_ICONS[item.nameAr] || Database;
  const colors = SENSITIVITY_COLORS[item.sensitivity];
  const sourceData = Object.entries(item.sourceDistribution).map(([name, value]) => ({ name, value, fill: SOURCE_COLORS[name] || "#8B7FD4" }));
  const severityData = Object.entries(item.severityDistribution).map(([name, value]) => ({ name, value, fill: SEVERITY_COLORS[name] || "#4ECDC4" }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, ...(tc.isDark ? { filter: "blur(10px)" } : {}) }}
      animate={{ opacity: 1, x: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}
      exit={{ opacity: 0, x: -50, ...(tc.isDark ? { filter: "blur(10px)" } : {}) }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto w-full md:w-[480px] z-50 overflow-y-auto"
      style={{ background: tc.panelGradient, ...(tc.isDark ? { backdropFilter: "blur(40px)" } : {}) }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <SensitivityBadge level={item.sensitivity} />
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="kpi-icon w-16 h-16 rounded-2xl" data-accent={item.sensitivity === "high" ? "crimson" : item.sensitivity === "medium" ? "gold" : "teal"} style={{ width: 64, height: 64, borderRadius: 18 }}>
            <IconComp className="w-8 h-8 relative z-10" style={{ color: colors.text }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{item.nameAr}</h3>
            <p className="text-sm text-gray-500 font-mono">{item.name}</p>
          </div>
        </div>
        <div className="glass-card p-5 mb-6 text-center">
          <div className="text-sm text-gray-400 mb-1">عدد مرات الظهور في حالات الرصد</div>
          <div className="mono-num text-4xl font-bold" style={{ color: colors.text }}>{fmtNum(item.count)}</div>
        </div>
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#4ECDC4]" /> أكثر القطاعات تعرضاً
          </h4>
          <div className="space-y-2">
            {item.topSectors.slice(0, 5).map((s, i) => {
              const pct = item.topSectors[0] ? (s.count / item.topSectors[0].count) * 100 : 0;
              return (
                <div key={i} className="glass-card p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-200">{s.sector}</span>
                    <span className="mono-num text-sm text-[#4ECDC4]">{fmtNum(s.count)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${colors.fill}, ${colors.text})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#8B7FD4]" /> توزيع المصادر
          </h4>
          <div className="glass-card p-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {sourceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F0D060]" /> توزيع مستوى التأثير
          </h4>
          <div className="glass-card p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={severityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#aaa", fontSize: 12, fontFamily: "Tajawal" }} width={90} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PiiAtlas() {
  const { data, loading } = useData();
  const [selectedPii, setSelectedPii] = useState<PiiItem | null>(null);
  const [piiFilter, setPiiFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const tc = useThemeColors();

  const filteredPii = useMemo(() => {
    if (!data) return [];
    const items = piiFilter === "all" ? data.piiAtlas : data.piiAtlas.filter(p => p.sensitivity === piiFilter);
    return items.slice(0, 50);
  }, [data, piiFilter]);

  const treemapData = useMemo(() => {
    return filteredPii.map(p => ({ name: p.name, nameAr: p.nameAr, size: p.count, count: p.count, sensitivity: p.sensitivity }));
  }, [filteredPii]);

  const sensitivityRadar = useMemo(() => {
    if (!data) return [];
    const groups = { high: 0, medium: 0, low: 0 };
    data.piiAtlas.forEach(p => { groups[p.sensitivity] += p.count; });
    return [
      { subject: "عالية الحساسية", value: groups.high, fullMark: Math.max(groups.high, groups.medium, groups.low) },
      { subject: "متوسطة", value: groups.medium, fullMark: Math.max(groups.high, groups.medium, groups.low) },
      { subject: "منخفضة", value: groups.low, fullMark: Math.max(groups.high, groups.medium, groups.low) },
    ];
  }, [data]);

  const topSectorsChart = useMemo(() => {
    if (!data) return [];
    return data.sectors.slice(0, 10).map(s => ({
      name: s.name.length > 15 ? s.name.slice(0, 15) + "..." : s.name,
      "حالات رصد": s.count,
    }));
  }, [data]);

  const handlePiiSelect = useCallback((item: any) => {
    if (!data) return;
    const found = data.piiAtlas.find(p => p.name === item.name);
    if (found) setSelectedPii(found);
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      {/* Header */}
      <SectionHeader title="أطلس البيانات الشخصية" subtitle="PII Atlas" icon={Fingerprint} />

      {/* KPIs */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
        <KpiCard label="أنواع البيانات" value={data.summary.totalPiiTypes} icon={Fingerprint} accent="purple" delay={0} />
        <KpiCard label="إجمالي الظهور" value={data.piiAtlas.reduce((s, p) => s + p.count, 0)} icon={Database} accent="teal" delay={0.08} />
        <KpiCard label="عالية الحساسية" value={data.piiAtlas.filter(p => p.sensitivity === "high").length} icon={Lock} accent="crimson" delay={0.16} />
        <KpiCard label="القطاعات المتأثرة" value={data.summary.totalSectors} icon={Building2} accent="gold" delay={0.24} />
      </motion.div>

      {/* Sensitivity Filters */}
      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
        {(["all", "high", "medium", "low"] as const).map(f => (
          <button
            key={f}
            onClick={() => setPiiFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${piiFilter === f ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
            style={piiFilter === f ? { background: "rgba(139,127,212,0.2)", border: "1px solid rgba(139,127,212,0.3)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {f === "all" ? "الكل" : SENSITIVITY_AR[f]}
            <span className="mono-num text-xs mr-1.5">({f === "all" ? data.piiAtlas.length : data.piiAtlas.filter(p => p.sensitivity === f).length})</span>
          </button>
        ))}
      </div>

      {/* Treemap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-3 md:p-6 mb-4 md:mb-8">
        <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-[#8B7FD4]" />
          خريطة البيانات الشخصية المكشوفة
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="rgba(255,255,255,0.05)"
            content={<CustomTreemapContent />}
            onClick={handlePiiSelect}
          />
        </ResponsiveContainer>
        <p className="text-[11px] text-gray-600 mt-3 text-center">انقر على أي عنصر لعرض التفاصيل الكاملة</p>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
        {/* Sensitivity Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-4 h-4 object-contain" />
            توزيع مستويات الحساسية
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={sensitivityRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#aaa", fontSize: 11, fontFamily: "Tajawal" }} />
              <PolarRadiusAxis tick={{ fill: "#555", fontSize: 9 }} />
              <Radar name="ظهور" dataKey="value" stroke="#8B7FD4" fill="#8B7FD4" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Sectors Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#F0D060]" />
            أكثر القطاعات تعرضاً للبيانات الشخصية
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topSectorsChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#aaa", fontSize: 11, fontFamily: "Tajawal" }} width={110} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="حالات رصد" radius={[0, 6, 6, 0]} fill="#8B7FD4" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* PII Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-3 md:p-6 mb-4 md:mb-8">
        <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#4ECDC4]" />
          قائمة أنواع البيانات الشخصية
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredPii.map((item, i) => {
            const colors = SENSITIVITY_COLORS[item.sensitivity];
            const IconComp = PII_ICONS[item.nameAr] || Database;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="kpi-card p-3 cursor-pointer group"
                data-accent={item.sensitivity === "high" ? "crimson" : item.sensitivity === "medium" ? "gold" : "teal"}
                onClick={() => setSelectedPii(item)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="kpi-icon w-8 h-8" data-accent={item.sensitivity === "high" ? "crimson" : item.sensitivity === "medium" ? "gold" : "teal"} style={{ width: 32, height: 32, borderRadius: 10 }}>
                      <IconComp className="w-4 h-4 relative z-10" style={{ color: colors.text }} />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium group-hover:text-[#8B7FD4] transition-colors">{item.nameAr}</span>
                      <span className="text-[10px] text-gray-600 font-mono block">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <span className="hidden md:inline-flex"><SensitivityBadge level={item.sensitivity} /></span>
                      <span className="mono-num text-xs md:text-sm font-bold" style={{ color: colors.text }}>{fmtNum(item.count)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* PII Detail Panel */}
      <AnimatePresence>
        {selectedPii && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 ${tc.isDark ? "bg-black/50 backdrop-blur-sm" : "bg-black/20"} z-40`} onClick={() => setSelectedPii(null)} />
            <PiiDetailPanel item={selectedPii} onClose={() => setSelectedPii(null)} />
          </>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

```

---

## `client/src/leaks/pages/atlas/ReportsCenter.tsx`

```tsx
// Leaks Domain
/**
 * ReportsCenter — مركز التقارير
 * Design: Purple/Navy Glassmorphism — Sovereign Premium
 * Generate and view reports, export data summaries
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Calendar, Globe, AlertTriangle,
  Building2, Database, Fingerprint, Eye, Printer, BarChart3,
  TrendingUp, MapPin, Clock
} from "lucide-react";
import { useData } from "@/contexts/atlas/DataContext";
import PageShell from "@/components/atlas/PageShell";
import { RASID_ASSETS } from "@/lib/atlas/assets";
import SectionHeader from "@/components/atlas/SectionHeader";
import KpiCard from "@/components/atlas/KpiCard";
import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, stagger } from "@/lib/atlas/design";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  accent: string;
  type: "summary" | "sector" | "source" | "region" | "pii" | "timeline";
}

const REPORT_TEMPLATES: ReportCard[] = [
  { id: "summary", title: "التقرير التنفيذي الشامل", description: "ملخص شامل لجميع حالات رصد البيانات مع الإحصائيات الرئيسية والتوصيات", icon: BarChart3, accent: "purple", type: "summary" },
  { id: "sector", title: "تقرير القطاعات", description: "تحليل مفصل لحالات رصد البيانات حسب القطاع مع مقارنات وتوصيات", icon: Building2, accent: "gold", type: "sector" },
  { id: "source", title: "تقرير المصادر", description: "تحليل مصادر الحالة رصد (دارك ويب، تليجرام، مواقع اللصق) مع الاتجاهات", icon: Globe, accent: "crimson", type: "source" },
  { id: "region", title: "التقرير الجغرافي", description: "توزيع حالات الرصد على مناطق المملكة مع خرائط حرارية", icon: MapPin, accent: "teal", type: "region" },
  { id: "pii", title: "تقرير البيانات الشخصية", description: "تحليل أنواع البيانات الشخصية المكشوفة ومستويات حساسيتها", icon: Fingerprint, accent: "blue", type: "pii" },
  { id: "timeline", title: "التقرير الزمني", description: "تحليل الاتجاهات الزمنية والتغيرات الشهرية في حالات رصد البيانات", icon: TrendingUp, accent: "green", type: "timeline" },
];

export default function ReportsCenter() {
  const { data, loading, allIncidents } = useData();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Report data generators
  const reportData = useMemo(() => {
    if (!data || !selectedReport) return null;
    switch (selectedReport) {
      case "summary":
        return {
          title: "التقرير التنفيذي الشامل",
          sections: [
            { label: "إجمالي حالات الرصد", value: fmtFull(data.summary.totalIncidents) },
            { label: "السجلات المكشوفة", value: fmtFull(data.summary.totalRecords) },
            { label: "أنواع البيانات", value: fmtFull(data.summary.totalPiiTypes) },
            { label: "القطاعات المتأثرة", value: fmtFull(data.summary.totalSectors) },
            { label: "المناطق", value: fmtFull(data.summary.totalRegions) },
          ],
          details: Object.entries(data.summary.severityDistribution).map(([k, v]) => ({ label: k, value: v, color: SEVERITY_COLORS[k] || "#8B7FD4" })),
        };
      case "sector":
        return {
          title: "تقرير القطاعات",
          sections: data.sectors.slice(0, 15).map(s => ({ label: s.name, value: `${fmtFull(s.count)} حالة رصد — ${fmtNum(s.records)} سجل` })),
          details: [],
        };
      case "source":
        return {
          title: "تقرير المصادر",
          sections: Object.entries(data.summary.sourceDistribution).map(([k, v]) => ({ label: k, value: `${fmtFull(v.count)} حالة رصد — ${fmtNum(v.records)} سجل` })),
          details: [],
        };
      case "region":
        return {
          title: "التقرير الجغرافي",
          sections: data.regions.map(r => ({ label: r.name, value: `${fmtFull(r.count)} حالة رصد — ${fmtNum(r.records)} سجل` })),
          details: [],
        };
      case "pii":
        return {
          title: "تقرير البيانات الشخصية",
          sections: data.piiAtlas.slice(0, 20).map(p => ({ label: `${p.nameAr} (${p.name})`, value: `${fmtFull(p.count)} ظهور — ${p.sensitivity === "high" ? "عالية" : p.sensitivity === "medium" ? "متوسطة" : "منخفضة"}` })),
          details: [],
        };
      case "timeline":
        return {
          title: "التقرير الزمني",
          sections: data.monthly.slice(-12).map(m => ({ label: m.month, value: `${fmtFull(m.count)} حالة رصد — ${fmtNum(m.records)} سجل` })),
          details: [],
        };
      default: return null;
    }
  }, [data, selectedReport]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      <SectionHeader title="مركز التقارير" subtitle="Reports Center" icon={FileText} />

      {/* Quick Stats */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
        <KpiCard label="التقارير المتاحة" value={REPORT_TEMPLATES.length} icon={FileText} accent="purple" delay={0} />
        <KpiCard label="إجمالي حالات الرصد" value={data.summary.totalIncidents} icon={AlertTriangle} accent="crimson" delay={0.08} />
        <KpiCard label="القطاعات" value={data.summary.totalSectors} icon={Building2} accent="gold" delay={0.16} />
        <KpiCard label="آخر تحديث" value={data.monthly.length} icon={Clock} accent="teal" delay={0.24} subtitle="شهر مرصود" />
      </motion.div>

      {/* Report Templates */}
      {!selectedReport && (
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {REPORT_TEMPLATES.map((report, i) => (
            <motion.div
              key={report.id}
              variants={stagger.item}
              className="kpi-card p-6 cursor-pointer group"
              data-accent={report.accent}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="kpi-icon mb-4" data-accent={report.accent} style={{ width: 48, height: 48, borderRadius: 14 }}>
                <report.icon className="w-6 h-6 relative z-10" style={{ color: report.accent === "crimson" ? "#FF4D6A" : report.accent === "teal" ? "#4ECDC4" : report.accent === "purple" ? "#8B7FD4" : report.accent === "gold" ? "#F0D060" : report.accent === "blue" ? "#5B9BD5" : "#5CB85C" }} />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B7FD4] transition-colors">{report.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{report.description}</p>
              <div className="text-[10px] text-gray-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-3 h-3" /> انقر لعرض التقرير
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Report View */}
      {selectedReport && reportData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">{reportData.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                العودة للقوالب
              </button>
            </div>
          </div>

          {/* Report Header */}
          <div className="glass-card p-4 mb-6 text-center" style={{ background: "rgba(139,127,212,0.05)" }}>
            <div className="text-sm text-gray-400 mb-1">منصة راصد — {reportData.title}</div>
            <div className="text-[10px] text-gray-600">تاريخ الإنشاء: {new Date().toLocaleDateString("en-US")}</div>
          </div>

          {/* Report Content */}
          <div className="space-y-2 mb-6">
            {reportData.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span className="text-sm text-gray-300">{section.label}</span>
                <span className="mono-num text-sm font-medium text-white">{section.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Severity Details */}
          {reportData.details.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">توزيع مستويات التأثير</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {reportData.details.map((d, i) => (
                  <div key={i} className="glass-card p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">{d.label}</div>
                    <div className="mono-num text-xl font-bold" style={{ color: d.color }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-[10px] text-gray-600 pt-4 border-t border-white/5">
            RASID Platform — جميع البيانات من مصادر مفتوحة لأغراض تحليلية
          </div>
        </motion.div>
      )}
    </PageShell>
  );
}

```

---

## `client/src/leaks/pages/atlas/TrendsComparison.tsx`

```tsx
// Leaks Domain
/**
 * TrendsComparison — الاتجاهات والمقارنات
 * Design: Purple/Navy Glassmorphism — Sovereign Premium
 * Timeline, monthly trends, source comparisons, sector evolution
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Calendar, Globe, AlertTriangle, Building2,
  BarChart3, Activity, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, BarChart, Bar, Cell, LineChart, Line,
  Legend, ComposedChart
} from "recharts";
import { useData } from "@/contexts/atlas/DataContext";
import PageShell from "@/components/atlas/PageShell";
import { RASID_ASSETS } from "@/lib/atlas/assets";
import KpiCard from "@/components/atlas/KpiCard";
import SectionHeader from "@/components/atlas/SectionHeader";
import { fmtNum, SEVERITY_COLORS, SOURCE_COLORS, CHART_TOOLTIP_STYLE, stagger, INCIDENT_TO_SUMMARY_SEVERITY } from "@/lib/atlas/design";

// Incident-level severity colors (incidents use حرج/مرتفع/متوسط/منخفض)
const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  "حرج": "#FF4D6A",
  "مرتفع": "#FF8C42",
  "متوسط": "#F0D060",
  "منخفض": "#4ECDC4",
};
const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  "حرج": "واسع النطاق",
  "مرتفع": "مرتفع",
  "متوسط": "متوسط",
  "منخفض": "محدود",
};

export default function TrendsComparison() {
  const { data, loading, allIncidents } = useData();
  const [timeRange, setTimeRange] = useState<"6m" | "12m" | "all">("12m");

  const monthlyData = useMemo(() => {
    if (!data) return [];
    const months = data.monthly;
    if (timeRange === "6m") return months.slice(-6);
    if (timeRange === "12m") return months.slice(-12);
    return months;
  }, [data, timeRange]);

  // Monthly with source breakdown
  const monthlyBySource = useMemo(() => {
    if (!allIncidents.length) return [];
    const map = new Map<string, { month: string; "دارك ويب": number; "تليجرام": number; "مواقع اللصق": number; total: number }>();
    allIncidents.forEach(inc => {
      const month = inc.date?.slice(0, 7) || "غير محدد";
      if (!map.has(month)) map.set(month, { month, "دارك ويب": 0, "تليجرام": 0, "مواقع اللصق": 0, total: 0 });
      const entry = map.get(month)!;
      if (inc.source === "دارك ويب") entry["دارك ويب"]++;
      else if (inc.source === "تليجرام") entry["تليجرام"]++;
      else if (inc.source === "مواقع اللصق") entry["مواقع اللصق"]++;
      entry.total++;
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }, [allIncidents]);

  // Severity trend
  const severityTrend = useMemo(() => {
    if (!allIncidents.length) return [];
    const map = new Map<string, Record<string, number>>();
    allIncidents.forEach(inc => {
      const month = inc.date?.slice(0, 7) || "غير محدد";
      if (!map.has(month)) map.set(month, { month: month } as any);
      const entry = map.get(month)!;
      entry[inc.severity] = (entry[inc.severity] || 0) + 1;
    });
    return Array.from(map.values()).sort((a: any, b: any) => a.month.localeCompare(b.month)).slice(-12);
  }, [allIncidents]);

  // Month-over-month change
  const momChange = useMemo(() => {
    if (monthlyData.length < 2) return { incidents: 0, records: 0, direction: "flat" };
    const last = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];
    const incChange = prev.count > 0 ? Math.round(((last.count - prev.count) / prev.count) * 100) : 0;
    const recChange = prev.records > 0 ? Math.round(((last.records - prev.records) / prev.records) * 100) : 0;
    return { incidents: incChange, records: recChange, direction: incChange > 0 ? "up" : incChange < 0 ? "down" : "flat" };
  }, [monthlyData]);

  // Top growing sectors
  const growingSectors = useMemo(() => {
    if (!data) return [];
    return data.sectors.slice(0, 6).map(s => ({
      name: s.name.length > 14 ? s.name.slice(0, 14) + ".." : s.name,
      count: s.count,
      records: Math.round(s.records / 1000),
    }));
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <img src={RASID_ASSETS.logoBadge} alt="راصد" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      <SectionHeader title="الاتجاهات والمقارنات" subtitle="Trends & Comparisons" icon={TrendingUp} />

      {/* KPIs */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="إجمالي حالات الرصد" value={data.summary.totalIncidents} icon={AlertTriangle} accent="crimson" delay={0} />
        <KpiCard label="الأشهر المرصودة" value={data.monthly.length} icon={Calendar} accent="purple" delay={0.08} />
        <KpiCard
          label="التغير الشهري (حالات رصد)"
          value={Math.abs(momChange.incidents)}
          icon={momChange.direction === "up" ? ArrowUpRight : momChange.direction === "down" ? ArrowDownRight : Minus}
          accent={momChange.direction === "up" ? "crimson" : momChange.direction === "down" ? "green" : "blue"}
          delay={0.16}
          subtitle={`${momChange.incidents > 0 ? "+" : ""}${momChange.incidents}%`}
        />
        <KpiCard label="المصادر النشطة" value={Object.keys(data.summary.sourceDistribution).length} icon={Globe} accent="teal" delay={0.24} />
      </motion.div>

      {/* Time Range Filter */}
      <div className="flex gap-2 mb-6">
        {([{ key: "6m", label: "6 أشهر" }, { key: "12m", label: "12 شهر" }, { key: "all", label: "الكل" }] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setTimeRange(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${timeRange === f.key ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
            style={timeRange === f.key ? { background: "rgba(139,127,212,0.2)", border: "1px solid rgba(139,127,212,0.3)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
        {/* Main Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 lg:col-span-2">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4ECDC4]" />
            الاتجاه الزمني — حالات الرصد والسجلات
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyData}>
              <defs>
                <linearGradient id="gradTrend1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B7FD4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B7FD4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis yAxisId="left" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis yAxisId="right" orientation="left" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontFamily: "Tajawal", fontSize: 12 }} />
              <Area yAxisId="left" type="monotone" dataKey="count" name="حالات رصد" stroke="#8B7FD4" fill="url(#gradTrend1)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="records" name="سجلات" stroke="#FF4D6A" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#8B7FD4]" />
            مقارنة المصادر شهرياً
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyBySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontFamily: "Tajawal", fontSize: 11 }} />
              <Bar dataKey="دارك ويب" stackId="a" fill="#DC3545" radius={[0, 0, 0, 0]} />
              <Bar dataKey="تليجرام" stackId="a" fill="#8B7FD4" radius={[0, 0, 0, 0]} />
              <Bar dataKey="مواقع اللصق" stackId="a" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Severity Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-3 md:p-6">
          <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF8C42]" />
            اتجاه مستويات التأثير
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={severityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontFamily: "Tajawal", fontSize: 11 }} />
              {Object.entries(INCIDENT_SEVERITY_COLORS).map(([name, color]) => (
                <Line key={name} type="monotone" dataKey={name} name={INCIDENT_SEVERITY_LABELS[name] || name} stroke={color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Sectors Comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-3 md:p-6 mb-4 md:mb-8">
        <h3 className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#F0D060]" />
          مقارنة أكبر القطاعات — حالات الرصد مقابل السجلات (بالآلاف)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={growingSectors}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: "#aaa", fontSize: 10, fontFamily: "Tajawal" }} />
            <YAxis tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontFamily: "Tajawal", fontSize: 11 }} />
            <Bar dataKey="count" name="حالات رصد" fill="#8B7FD4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="records" name="سجلات (K)" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </PageShell>
  );
}

```

---

