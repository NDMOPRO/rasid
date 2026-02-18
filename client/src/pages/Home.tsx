import { useState } from 'react';
import { useSkin } from '@/hooks/useSkin';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import KPICard from '@/components/KPICard';
import RasidCard from '@/components/RasidCard';
import RasidTable from '@/components/RasidTable';
import Chart3D from '@/components/Chart3D';
import RasidButton from '@/components/RasidButton';
import RasidInput from '@/components/RasidInput';
import StatusBadge from '@/components/StatusBadge';
import { LOGOS, CHARACTERS } from '@/lib/assets';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, Activity, Database, Users, Bell,
  FileText, Lock, BarChart3, Search, AlertTriangle,
  CheckCircle, Globe, Zap, Server, Wifi, Menu, X
} from 'lucide-react';

/* ============================================================
   DATA — Gold (الرصد) & Silver (الخصوصية)
   ============================================================ */

const goldChartData = [
  { name: 'يناير', value: 42 },
  { name: 'فبراير', value: 58 },
  { name: 'مارس', value: 35 },
  { name: 'أبريل', value: 72 },
  { name: 'مايو', value: 48 },
  { name: 'يونيو', value: 63 },
  { name: 'يوليو', value: 55 },
];

const silverChartData = [
  { name: 'يناير', value: 28 },
  { name: 'فبراير', value: 45 },
  { name: 'مارس', value: 62 },
  { name: 'أبريل', value: 38 },
  { name: 'مايو', value: 55 },
  { name: 'يونيو', value: 71 },
  { name: 'يوليو', value: 49 },
];

const goldTableColumns = [
  { key: 'id', label: '#', align: 'center' as const },
  { key: 'threat', label: 'التهديد' },
  { key: 'source', label: 'المصدر' },
  { key: 'severity', label: 'الخطورة', align: 'center' as const },
  { key: 'status', label: 'الحالة', align: 'center' as const },
  { key: 'date', label: 'التاريخ' },
];

const goldTableData = [
  { id: '١', threat: 'تسريب بيانات حساسة', source: 'دارك ويب', severity: <StatusBadge status="critical" label="حرج" />, status: <StatusBadge status="active" label="نشط" />, date: '٢٠٢٦/٠٢/١٨' },
  { id: '٢', threat: 'محاولة اختراق API', source: 'مصدر خارجي', severity: <StatusBadge status="warning" label="متوسط" />, status: <StatusBadge status="active" label="نشط" />, date: '٢٠٢٦/٠٢/١٧' },
  { id: '٣', threat: 'بيانات مكشوفة على GitHub', source: 'GitHub', severity: <StatusBadge status="warning" label="متوسط" />, status: <StatusBadge status="resolved" label="محلول" />, date: '٢٠٢٦/٠٢/١٦' },
  { id: '٤', threat: 'نشاط مشبوه على تيليجرام', source: 'تيليجرام', severity: <StatusBadge status="active" label="منخفض" />, status: <StatusBadge status="active" label="قيد المراجعة" />, date: '٢٠٢٦/٠٢/١٥' },
  { id: '٥', threat: 'تسريب كلمات مرور', source: 'دارك ويب', severity: <StatusBadge status="critical" label="حرج" />, status: <StatusBadge status="resolved" label="محلول" />, date: '٢٠٢٦/٠٢/١٤' },
];

const silverTableColumns = [
  { key: 'id', label: '#', align: 'center' as const },
  { key: 'policy', label: 'السياسة' },
  { key: 'category', label: 'التصنيف' },
  { key: 'compliance', label: 'الامتثال', align: 'center' as const },
  { key: 'status', label: 'الحالة', align: 'center' as const },
  { key: 'lastAudit', label: 'آخر تدقيق' },
];

const silverTableData = [
  { id: '١', policy: 'سياسة حماية البيانات الشخصية', category: 'PDPL', compliance: <StatusBadge status="active" label="ممتثل" />, status: <StatusBadge status="active" label="نشط" />, lastAudit: '٢٠٢٦/٠٢/١٨' },
  { id: '٢', policy: 'سياسة الاحتفاظ بالبيانات', category: 'حوكمة', compliance: <StatusBadge status="warning" label="جزئي" />, status: <StatusBadge status="active" label="قيد المراجعة" />, lastAudit: '٢٠٢٦/٠٢/١٥' },
  { id: '٣', policy: 'سياسة الوصول والتحكم', category: 'أمن', compliance: <StatusBadge status="active" label="ممتثل" />, status: <StatusBadge status="active" label="نشط" />, lastAudit: '٢٠٢٦/٠٢/١٢' },
  { id: '٤', policy: 'سياسة نقل البيانات عبر الحدود', category: 'PDPL', compliance: <StatusBadge status="critical" label="غير ممتثل" />, status: <StatusBadge status="warning" label="تحذير" />, lastAudit: '٢٠٢٦/٠٢/١٠' },
  { id: '٥', policy: 'سياسة إخفاء الهوية', category: 'خصوصية', compliance: <StatusBadge status="active" label="ممتثل" />, status: <StatusBadge status="active" label="نشط" />, lastAudit: '٢٠٢٦/٠٢/٠٨' },
];

/* ============================================================
   HOME PAGE
   ============================================================ */

export default function Home() {
  const { skin, setSkin } = useSkin();
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const goldKPIs = [
    { title: 'التهديدات النشطة', value: 247, change: 12, icon: <AlertTriangle size={20} />, watermark: <Shield size={80} /> },
    { title: 'عمليات الرصد', value: 1842, change: 8, icon: <Eye size={20} />, watermark: <Eye size={80} /> },
    { title: 'التنبيهات الحرجة', value: 23, change: -5, icon: <Bell size={20} />, watermark: <Bell size={80} /> },
    { title: 'مصادر البيانات', value: 156, change: 15, icon: <Database size={20} />, watermark: <Database size={80} /> },
    { title: 'المستخدمون النشطون', value: 89, change: 3, icon: <Users size={20} />, watermark: <Users size={80} /> },
    { title: 'التقارير المُنشأة', value: 342, change: 22, icon: <FileText size={20} />, watermark: <FileText size={80} /> },
    { title: 'وقت الاستجابة', value: 98, suffix: '%', change: 2, icon: <Zap size={20} />, watermark: <Zap size={80} /> },
    { title: 'صحة النظام', value: 99, suffix: '%', change: 1, icon: <Server size={20} />, watermark: <Server size={80} /> },
  ];

  const silverKPIs = [
    { title: 'السياسات النشطة', value: 42, change: 5, icon: <Shield size={20} />, watermark: <Shield size={80} /> },
    { title: 'طلبات الوصول', value: 156, change: -8, icon: <Lock size={20} />, watermark: <Lock size={80} /> },
    { title: 'نسبة الامتثال', value: 87, suffix: '%', change: 3, icon: <CheckCircle size={20} />, watermark: <CheckCircle size={80} /> },
    { title: 'تقييمات الأثر', value: 28, change: 12, icon: <BarChart3 size={20} />, watermark: <BarChart3 size={80} /> },
    { title: 'الموافقات المعلقة', value: 15, change: -3, icon: <FileText size={20} />, watermark: <FileText size={80} /> },
    { title: 'التدقيقات المكتملة', value: 234, change: 18, icon: <Search size={20} />, watermark: <Search size={80} /> },
    { title: 'البيانات المصنفة', value: 94, suffix: '%', change: 7, icon: <Database size={20} />, watermark: <Database size={80} /> },
    { title: 'الاتصال الآمن', value: 100, suffix: '%', change: 0, icon: <Wifi size={20} />, watermark: <Wifi size={80} /> },
  ];

  const kpis = skin === 'gold' ? goldKPIs : silverKPIs;
  const chartData = skin === 'gold' ? goldChartData : silverChartData;
  const tableColumns = skin === 'gold' ? goldTableColumns : silverTableColumns;
  const tableData = skin === 'gold' ? goldTableData : silverTableData;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-0)' }}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
              zIndex: 39, display: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar skin={skin} activePage={activePage} onPageChange={setActivePage} />
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginRight: sidebarOpen ? 260 : 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin var(--transition-default)',
        minWidth: 0,
      }}>
        <TopBar
          skin={skin}
          onSkinChange={setSkin}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          sidebarOpen={sidebarOpen}
        />

        <main style={{
          flex: 1,
          padding: '1.5rem 2rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={skin}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Page Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1.75rem',
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'var(--accent-glow)',
                    border: '1px solid var(--accent-border)',
                    marginBottom: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--accent-text)',
                    fontWeight: 600,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#34D399',
                      boxShadow: '0 0 8px #34D399',
                    }} />
                    النظام نشط
                  </div>
                  <h1 style={{
                    fontSize: '1.625rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.375rem',
                    letterSpacing: '-0.01em',
                  }}>
                    {skin === 'gold' ? 'لوحة الرصد والمراقبة' : 'لوحة الخصوصية والامتثال'}
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}>
                    {skin === 'gold'
                      ? 'نظرة شاملة على التهديدات وعمليات الرصد النشطة — تحديث مباشر'
                      : 'نظرة شاملة على سياسات الخصوصية ومستوى الامتثال — تحديث مباشر'
                    }
                  </p>
                </div>
                <img
                  src={skin === 'gold' ? LOGOS.calligraphyGold : LOGOS.calligraphyLight}
                  alt="راصد"
                  style={{ height: 44, opacity: 0.15, marginTop: '0.5rem' }}
                />
              </div>

              {/* KPI Cards Grid — 8 cards, 4 columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                {kpis.map((kpi, i) => (
                  <KPICard
                    key={`${skin}-${i}`}
                    title={kpi.title}
                    value={kpi.value}
                    suffix={kpi.suffix}
                    change={kpi.change}
                    icon={kpi.icon}
                    watermarkIcon={kpi.watermark}
                    delay={i * 0.04}
                  />
                ))}
              </div>

              {/* Chart + Assistant Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                <Chart3D
                  data={chartData}
                  title={skin === 'gold' ? 'التهديدات المكتشفة شهرياً' : 'مستوى الامتثال الشهري'}
                  skin={skin}
                />

                <RasidCard delay={0.3}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'var(--accent-glow)',
                          border: '1px solid var(--accent-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Activity size={18} style={{ color: 'var(--accent-text)' }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            مساعد راصد الذكي
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            متصل الآن
                          </span>
                        </div>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.8,
                        marginBottom: '1rem',
                      }}>
                        {skin === 'gold'
                          ? 'مرحباً بك في منصة الرصد. تم اكتشاف ٢٤٧ تهديداً نشطاً يتطلب مراجعتك. النظام يعمل بكفاءة ٩٩٪ مع ١٨٤٢ عملية رصد جارية.'
                          : 'مرحباً بك في منصة الخصوصية. نسبة الامتثال الحالية ٨٧٪. يوجد ١٥ موافقة معلقة و٢٨ تقييم أثر يحتاج مراجعتك.'
                        }
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <RasidButton variant="primary">
                          <Activity size={14} />
                          عرض التفاصيل
                        </RasidButton>
                        <RasidButton variant="ghost">
                          <FileText size={14} />
                          تقرير
                        </RasidButton>
                      </div>
                      <img
                        src={skin === 'gold' ? CHARACTERS.sunglasses : CHARACTERS.waving}
                        alt="مساعد راصد"
                        style={{ height: 110, objectFit: 'contain', opacity: 0.9 }}
                      />
                    </div>
                  </div>
                </RasidCard>
              </div>

              {/* Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <RasidTable
                  columns={tableColumns}
                  data={tableData}
                  title={skin === 'gold' ? 'آخر التهديدات المكتشفة' : 'سياسات الخصوصية'}
                />
              </div>

              {/* Buttons & Inputs Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                {/* Buttons Card */}
                <RasidCard delay={0.35}>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <Zap size={16} style={{ color: 'var(--accent-text)' }} />
                    الأزرار والإجراءات
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                    <RasidButton variant="primary">
                      <Shield size={14} />
                      زر رئيسي
                    </RasidButton>
                    <RasidButton variant="accent">
                      <Zap size={14} />
                      زر مميز
                    </RasidButton>
                    <RasidButton variant="ghost">
                      <Globe size={14} />
                      زر شفاف
                    </RasidButton>
                    <RasidButton variant="primary">
                      <Search size={14} />
                      بحث متقدم
                    </RasidButton>
                    <RasidButton variant="accent">
                      <Bell size={14} />
                      إرسال تنبيه
                    </RasidButton>
                    <RasidButton variant="ghost">
                      <FileText size={14} />
                      تصدير PDF
                    </RasidButton>
                  </div>
                </RasidCard>

                {/* Inputs Card */}
                <RasidCard delay={0.4}>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <FileText size={16} style={{ color: 'var(--accent-text)' }} />
                    حقول الإدخال
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <RasidInput label="اسم المستخدم" placeholder="أدخل اسم المستخدم..." />
                    <RasidInput label="البريد الإلكتروني" placeholder="admin@rasid.sa" type="email" />
                    <RasidInput label="كلمة البحث" placeholder="ابحث في التهديدات..." />
                  </div>
                </RasidCard>
              </div>

              {/* Footer */}
              <div style={{
                textAlign: 'center',
                padding: '1.5rem 0 1rem',
                borderTop: '1px solid rgba(255,255,255,.06)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.375rem',
                }}>
                  <img src={LOGOS.calligraphyLight} alt="راصد" style={{ height: 18, opacity: 0.3 }} />
                  <span style={{ color: 'var(--text-muted)' }}>
                    منصة راصد — مكتب إدارة البيانات الوطنية
                  </span>
                </div>
                <span style={{ opacity: 0.6 }}>
                  Rasid Lux Ultra Premium — جميع الحقوق محفوظة ٢٠٢٦
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
