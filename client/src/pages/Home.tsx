import { useState } from 'react';
import { useSkin, Skin } from '@/hooks/useSkin';
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
   DATA
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

/* Metallic icon box style — 3D beveled */
const metalIconBox = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: 'linear-gradient(170deg, rgba(55,72,108,.85), rgba(38,52,82,.92))' as const,
  borderWidth: 3,
  borderStyle: 'solid' as const,
  borderColor: 'var(--accent-border)',
  borderTopColor: 'rgba(160,185,235,.42)',
  borderBottomColor: 'rgba(10,16,32,.60)',
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  color: 'var(--accent-text)',
  boxShadow: '0 4px 10px rgba(0,0,0,.40), inset 0 2px 0 rgba(180,200,240,.25), inset 0 -2px 0 rgba(3,6,15,.55), inset 2px 0 0 rgba(160,185,230,.15), inset -2px 0 0 rgba(3,6,15,.40)',
};

/* Section title bar style */
const sectionTitle = {
  fontSize: '1rem' as const,
  fontWeight: 700 as const,
  color: 'var(--text-primary)',
  marginBottom: '1.125rem',
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '0.5rem',
};

const accentBar = {
  width: 4,
  height: 18,
  borderRadius: 2,
  background: 'var(--accent-color)',
  display: 'inline-block' as const,
};

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
    <div style={{ display: 'flex', height: '100dvh' }}>
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
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
              zIndex: 39,
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
        minWidth: 0,
        minHeight: 0,
        height: '100dvh',
        transition: 'margin-right 220ms cubic-bezier(.22,.61,.36,1)',
      }}>
        <TopBar
          skin={skin}
          onSkinChange={setSkin}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          sidebarOpen={sidebarOpen}
        />

        <main className="page-bg" style={{
          flex: '1 1 0%',
          padding: '1.75rem 2rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={skin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {/* ============ Page Header ============ */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '2rem',
              }}>
                <div>
                  {/* Status badge — metallic pill */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.875rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(165deg, rgba(50,65,100,.70), rgba(35,48,78,.80))',
                    border: '2px solid rgba(100,120,160,.18)',
                    borderTopColor: 'rgba(140,165,210,.22)',
                    borderBottomColor: 'rgba(20,30,50,.35)',
                    marginBottom: '0.875rem',
                    fontSize: '0.75rem',
                    color: 'var(--accent-text)',
                    fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(0,0,0,.25), inset 0 1px 0 rgba(160,180,220,.12)',
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#10B981',
                      boxShadow: '0 0 10px #10B981',
                    }} />
                    النظام نشط
                  </div>
                  <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.01em',
                  }}>
                    {skin === 'gold' ? 'لوحة الرصد والمراقبة' : 'لوحة الخصوصية والامتثال'}
                  </h1>
                  <p style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.7,
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
                  style={{ height: 48, opacity: 0.12, marginTop: '0.5rem' }}
                />
              </div>

              {/* ============ KPI Cards Grid — 8 cards, 4 columns ============ */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.125rem',
                marginBottom: '1.75rem',
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
                    delay={i * 0.05}
                  />
                ))}
              </div>

              {/* ============ Chart + Assistant ============ */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: '1.125rem',
                marginBottom: '1.75rem',
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
                    minHeight: 280,
                  }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                      }}>
                        <div style={metalIconBox}>
                          <Activity size={20} style={{ color: 'var(--accent-text)' }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            مساعد راصد الذكي
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            متصل الآن
                          </span>
                        </div>
                      </div>
                      <p style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.9,
                        marginBottom: '1rem',
                      }}>
                        {skin === 'gold'
                          ? 'مرحباً بك في منصة الرصد. تم اكتشاف ٢٤٧ تهديداً نشطاً يتطلب مراجعتك. النظام يعمل بكفاءة ٩٩٪ مع ١٨٤٢ عملية رصد جارية.'
                          : 'مرحباً بك في منصة الخصوصية. نسبة الامتثال الحالية ٨٧٪. يوجد ١٥ موافقة معلقة و٢٨ تقييم أثر يحتاج مراجعتك.'
                        }
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '0.625rem' }}>
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
                        style={{ height: 120, objectFit: 'contain', opacity: 0.85 }}
                      />
                    </div>
                  </div>
                </RasidCard>
              </div>

              {/* ============ Table ============ */}
              <div style={{ marginBottom: '1.75rem' }}>
                <RasidTable
                  columns={tableColumns}
                  data={tableData}
                  title={skin === 'gold' ? 'آخر التهديدات المكتشفة' : 'سياسات الخصوصية'}
                />
              </div>

              {/* ============ Buttons & Inputs Row ============ */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.125rem',
                marginBottom: '1.75rem',
              }}>
                {/* Buttons Card */}
                <RasidCard delay={0.35}>
                  <h3 style={sectionTitle}>
                    <span style={accentBar} />
                    الأزرار والإجراءات
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
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
                  <h3 style={sectionTitle}>
                    <span style={accentBar} />
                    حقول الإدخال
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <RasidInput label="اسم المستخدم" placeholder="أدخل اسم المستخدم..." />
                    <RasidInput label="البريد الإلكتروني" placeholder="admin@rasid.sa" type="email" />
                    <RasidInput label="كلمة البحث" placeholder="ابحث في التهديدات..." />
                  </div>
                </RasidCard>
              </div>

              {/* ============ Footer ============ */}
              <div style={{
                textAlign: 'center',
                padding: '1.75rem 0 1rem',
                borderTop: '2px solid rgba(100,120,160,.10)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}>
                  <img src={LOGOS.calligraphyLight} alt="راصد" style={{ height: 20, opacity: 0.25 }} />
                  <span>منصة راصد — مكتب إدارة البيانات الوطنية</span>
                </div>
                <span style={{ opacity: 0.5 }}>
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
