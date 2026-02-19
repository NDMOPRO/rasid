import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import {
  Brain,
  Send,
  Search,
  Shield,
  BarChart3,
  FileText,
  AlertTriangle,
  Database,
  RefreshCw,
  Sparkles,
  Clock,
  Zap,
  Globe,
  Eye,
  TrendingUp,
  Loader2,
  MessageSquare,
  Plus,
  History,
  Bot,
  Network,
  Users,
  MapPin,
  Crosshair,
  Link2,
  Mic,
  Paperclip,
  ChevronDown,
  ChevronRight,
  Wand2,
  Activity,
  BookOpen,
  Layers,
  Terminal,
  Cpu,
  Copy,
  Check,
  Star,
  Crown,
  Workflow,
  CircleDot,
  CheckCircle2,
  XCircle,
  GitBranch,
  ScanSearch,
  UserCheck,
  FileSearch,
  BarChart2,
  Fingerprint,
  Radio,
  Radar,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { soundManager } from "@/lib/soundManager";
import { Save, Trash2, FolderOpen, Download, X, MessageCircle, Archive, Timer, Table2, FileDown, Lightbulb } from "lucide-react";
const RasidChart = lazy(() => import("@/components/RasidChart"));
const RasidDashboard = lazy(() => import("@/components/RasidDashboard"));

// ═══ CONSTANTS ═══
const RASID_CHARACTER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/rCKQyRDoubhdjHel.png"; // Transparent background character
const RASID_FACE_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/nceygigNBuUkNsBp.png"; // Professional 3D character (small)
const RASID_CHARACTER_ELEGANT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/PFaAwpCdMWpRxWDd.png"; // Elegant composition character

interface ThinkingStep {
  id: string;
  agent: string;
  action: string;
  description: string;
  status: "running" | "completed" | "error";
  timestamp: string;
  result?: string;
  durationMs?: number;
  toolCategory?: "read" | "execute" | "personality" | "analysis";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  thinkingSteps?: ThinkingStep[];
  rating?: number;
  userQuery?: string;
  followUpSuggestions?: string[];
  processingMeta?: { totalDurationMs: number; toolCount: number; agentsUsed: string[] };
  chartData?: { chartConfig: any; summary?: string };
  dashboardData?: { title: string; dashboardType: string; kpis: any; charts: any[]; summary?: string };
  isStreaming?: boolean;
}

const quickCommands = [
  { label: "ملخص لوحة المعلومات", icon: BarChart3, color: "text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/20", query: "أعطني ملخص شامل للوحة المعلومات مع تحليل" },
  { label: "حالات رصد واسعة النطاق", icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", query: "ما هي الحالات رصد واسعة النطاق الحالية؟ أعطني تفاصيل كل واحد" },
  { label: "تحليل ارتباطات", icon: GitBranch, color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", query: "أجرِ تحليل ارتباطات شامل: ربط البائعين بالقطاعات، أنماط زمنية، واكتشاف الأنماط غير المعتادة" },
  { label: "حالة الحماية", icon: Shield, color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20", query: "ما حالة حماية البيانات الشخصية؟ وما مستوى التهديدات الحالي والتوصيات؟" },
  { label: "نشاط المستخدمين", icon: UserCheck, color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20", query: "حلل نشاط المستخدمين اليوم: من فعل ماذا؟ كم عملية نُفذت؟" },
  { label: "خريطة التهديدات", icon: MapPin, color: "text-indigo-400", bgColor: "bg-indigo-500/10 border-indigo-500/20", query: "اعرض خريطة التهديدات الجغرافية والتوزيع حسب المناطق" },
  { label: "التقارير والمستندات", icon: FileSearch, color: "text-teal-400", bgColor: "bg-teal-500/10 border-teal-500/20", query: "اعرض لي كل التقارير والمستندات المتاحة مع روابطها" },
  { label: "قواعد الكشف", icon: Crosshair, color: "text-rose-400", bgColor: "bg-rose-500/10 border-rose-500/20", query: "اعرض قواعد صيد التهديدات النشطة وأداءها" },
  { label: "مخطط حالات الرصد", icon: BarChart3, color: "text-sky-400", bgColor: "bg-sky-500/10 border-sky-500/20", query: "ارسم لي مخطط يوضح توزيع حالات الرصد حسب القطاعات ومستوى التأثير" },
  { label: "لوحة تنفيذية", icon: Eye, color: "text-violet-400", bgColor: "bg-violet-500/10 border-violet-500/20", query: "أنشئ لي لوحة مؤشرات تنفيذية شاملة مع مخططات وإحصائيات" },
];

const capabilities = [
  { icon: BarChart3, label: "تحليل لوحة القيادة", desc: "إحصائيات وتقارير شاملة" },
  { icon: Search, label: "البحث في حالات الرصد", desc: "بحث متقدم بكل الفلاتر" },
  { icon: Shield, label: "حماية البيانات", desc: "نظام PDPL والتوصيات" },
  { icon: Globe, label: "الدارك ويب واللصق", desc: "رصد المصادر المظلمة" },
  { icon: Users, label: "البائعون والتهديدات", desc: "ملفات تعريف المهددين" },
  { icon: GitBranch, label: "تحليل الارتباطات", desc: "ربط البيانات واكتشاف الأنماط" },
  { icon: UserCheck, label: "مراقبة الأنشطة", desc: "تتبع نشاط الموظفين" },
  { icon: BookOpen, label: "قاعدة المعرفة", desc: "مقالات وسياسات وإرشادات" },
  { icon: FileSearch, label: "إدارة الملفات", desc: "جلب التقارير والمستندات" },
  { icon: Network, label: "رسم المعرفة", desc: "شبكة العلاقات والروابط" },
  { icon: Activity, label: "المراقبة والتنبيهات", desc: "حالة مهام الرصد" },
  { icon: BarChart2, label: "تحليل الاتجاهات", desc: "أنماط زمنية وتوزيعات" },
  { icon: Crosshair, label: "صيد التهديدات", desc: "قواعد YARA-like" },
  { icon: Link2, label: "سلسلة الأدلة", desc: "توثيق وحفظ الأدلة" },
  { icon: HeartHandshake, label: "الشخصية التفاعلية", desc: "ترحيب ذكي واحترام القادة" },
];

// Tool name to Arabic label mapping
const toolLabels: Record<string, string> = {
  query_leaks: "استعلام حالات الرصد",
  get_leak_details: "ادعاءات البائع",
  get_dashboard_stats: "إحصائيات لوحة القيادة",
  get_channels_info: "معلومات القنوات",
  get_monitoring_status: "حالة المراقبة",
  get_alert_info: "معلومات التنبيهات",
  get_sellers_info: "البائعون المرصودون",
  get_evidence_info: "الأدلة الرقمية",
  get_threat_rules_info: "قواعد التهديدات",
  get_darkweb_pastes: "الدارك ويب واللصق",
  get_feedback_accuracy: "مقاييس الدقة",
  get_knowledge_graph: "رسم المعرفة",
  get_osint_info: "استخبارات OSINT",
  get_reports_and_documents: "التقارير والمستندات",
  get_threat_map: "خريطة التهديدات",
  get_audit_log: "سجل المراجعة",
  get_system_health: "صحة النظام",
  analyze_trends: "تحليل الاتجاهات",
  get_platform_guide: "الدليل الإرشادي",
  analyze_user_activity: "تحليل نشاط المستخدمين",
  search_knowledge_base: "البحث في قاعدة المعرفة",
  get_correlations: "تحليل الارتباطات",
  get_platform_users_info: "معلومات المستخدمين",
  get_personality_greeting: "ترحيب شخصي",
  check_leader_mention: "فحص إشارة لقائد",
  manage_personality_scenarios: "إدارة سيناريوهات الشخصية",
  generate_chart: "توليد مخطط بياني",
  generate_dashboard: "إنشاء لوحة مؤشرات",
};

// Agent icons mapping
const agentIcons: Record<string, typeof Brain> = {
  "راصد الذكي": Radar,
  "الوكيل التنفيذي": Zap,
  "وكيل التحليلات": BarChart2,
  "وكيل سجل المراجعة": Eye,
  "وكيل المعرفة": BookOpen,
  "وكيل الملفات": FileSearch,
  "وكيل الشخصية": HeartHandshake,
};

const agentColors: Record<string, string> = {
  "راصد الذكي": "text-cyan-400",
  "الوكيل التنفيذي": "text-emerald-400",
  "وكيل التحليلات": "text-violet-400",
  "وكيل سجل المراجعة": "text-orange-400",
  "وكيل المعرفة": "text-blue-400",
  "وكيل الملفات": "text-teal-400",
  "وكيل الشخصية": "text-pink-400",
};

// Tool category badges configuration
const toolCategoryConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Brain }> = {
  read: { label: "قراءة", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", icon: Database },
  execute: { label: "تنفيذ", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", icon: Zap },
  analysis: { label: "تحليل", color: "text-violet-400", bgColor: "bg-violet-500/10 border-violet-500/20", icon: BarChart2 },
  personality: { label: "شخصية", color: "text-pink-400", bgColor: "bg-pink-500/10 border-pink-500/20", icon: HeartHandshake },
};

// ═══ MATRIX RAIN BACKGROUND ═══
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01راصدحمايةبياناتأمنسيبرانيرصدحالة رصدكشف";
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 15, 28, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 200, 180, 0.08)";
      ctx.font = `${fontSize}px 'Tajawal', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    />
  );
}

// ═══ SCANNING LINE EFFECT ═══
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none z-10"
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ═══ PULSE RING EFFECT ═══
function PulseRings({ size = 80 }: { size?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-500/20"
          style={{ width: size + i * 30, height: size + i * 30 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ═══ THINKING STEPS COMPONENT — Enhanced Console Style with Timing & Categories ═══
function ThinkingStepsDisplay({ steps, isExpanded, onToggle }: { steps: ThinkingStep[]; isExpanded: boolean; onToggle: () => void }) {
  if (!steps || steps.length === 0) return null;

  const completedCount = steps.filter(s => s.status === "completed").length;
  const errorCount = steps.filter(s => s.status === "error").length;
  const totalDuration = steps.reduce((sum, s) => sum + (s.durationMs || 0), 0);
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  // Collect unique categories used
  const categoriesUsed = Array.from(new Set(steps.map(s => s.toolCategory).filter(Boolean))) as string[];

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg bg-[#0a1628]/80 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all w-full font-mono"
      >
        <Terminal className="w-3.5 h-3.5 animate-pulse" />
        <span className="font-medium tracking-wide">THINKING_PROCESS</span>
        <span className="text-[10px] text-cyan-400/60">
          [{completedCount}/{steps.length}]{errorCount > 0 ? ` ERR:${errorCount}` : ""}
        </span>
        {/* Category badges */}
        <div className="flex items-center gap-1">
          {categoriesUsed.map((cat) => {
            const config = toolCategoryConfig[cat];
            if (!config) return null;
            const CatIcon = config.icon;
            return (
              <span key={cat} className={`inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.color} border`}>
                <CatIcon className="w-2.5 h-2.5" />
                {config.label}
              </span>
            );
          })}
        </div>
        {totalDuration > 0 && (
          <span className="text-[9px] text-cyan-400/50 flex items-center gap-0.5">
            <Timer className="w-2.5 h-2.5" />
            {totalDuration < 1000 ? `${totalDuration}ms` : `${(totalDuration / 1000).toFixed(1)}s`}
          </span>
        )}
        <div className="flex-1" />
        <span className="text-[9px] text-cyan-500/40 font-mono">
          {isExpanded ? "▼ COLLAPSE" : "▶ EXPAND"}
        </span>
      </button>

      {/* Progress bar */}
      <div className="h-0.5 mt-0.5 rounded-full bg-[#0a1628] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${errorCount > 0 ? 'bg-gradient-to-r from-emerald-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-1 bg-[#060d1b]/90 border border-cyan-500/10 rounded-lg p-3 font-mono text-[11px] space-y-1">
              {steps.map((step, idx) => {
                const AgentIcon = agentIcons[step.agent] || Brain;
                const agentColor = agentColors[step.agent] || "text-cyan-400";
                const statusSymbol = step.status === "completed" ? "✓" : step.status === "error" ? "✗" : "◉";
                const statusColor = step.status === "completed" ? "text-emerald-400" : step.status === "error" ? "text-red-400" : "text-amber-400";
                const catConfig = step.toolCategory ? toolCategoryConfig[step.toolCategory] : null;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-start gap-2 py-1 group"
                  >
                    <span className={`${statusColor} w-4 text-center flex-shrink-0`}>{statusSymbol}</span>
                    <AgentIcon className={`w-3 h-3 ${agentColor} flex-shrink-0 mt-0.5`} />
                    <span className={`${agentColor} min-w-[80px]`}>{step.agent}</span>
                    <span className="text-slate-500">→</span>
                    {catConfig && (
                      <span className={`text-[8px] px-1 py-0 rounded ${catConfig.bgColor} ${catConfig.color} border flex-shrink-0`}>
                        {catConfig.label}
                      </span>
                    )}
                    <span className="text-slate-300 flex-1">{step.description}</span>
                    {step.durationMs !== undefined && step.durationMs > 0 && (
                      <span className="text-[9px] text-cyan-500/40 flex items-center gap-0.5 flex-shrink-0">
                        <Timer className="w-2 h-2" />
                        {step.durationMs < 1000 ? `${step.durationMs}ms` : `${(step.durationMs / 1000).toFixed(1)}s`}
                      </span>
                    )}
                    {step.result && (
                      <span className="text-slate-600 truncate group-hover:whitespace-normal max-w-[200px] flex-shrink-0">
                        // {step.result}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ VIP LEADER DETECTION & CARD ═══
const VIP_LEADERS_CLIENT = [
  {
    keywords: ["الربدي", "المعالي", "معالي القائد", "قائد المبادرة"],
    name: "الربدي",
    title: "معالي قائد مبادرة راصد الوطنية",
    subtitle: "قائد مبادرة راصد الوطنية — حفظه الله",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/FLeZwTnxoiqwcAUU.png",
    showImageDuration: 5000,
    respectPhrase: "كلنا في خدمة هذا القائد البطل ورهن إشارته 🫡",
    type: "leader" as const,
    gradient: "from-amber-500/20 via-yellow-500/10 to-amber-600/20",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/30",
    titleColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    badgeLabel: "معالي القائد",
    animation: "salute" as const,
  },
  {
    keywords: ["السرحان", "مشعل السرحان", "مشعل", "نائب المعالي", "سعادة النائب"],
    name: "مشعل السرحان",
    title: "سعادة النائب البطل",
    subtitle: "سعادة نائب معالي قائد المبادرة",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/TtePDHRidHFQWMVE.jpg",
    showImageDuration: 5000,
    respectPhrase: "أهلاً وسهلاً بسعادة النائب البطل.. نفتخر بقيادته 🫡",
    type: "deputy" as const,
    gradient: "from-cyan-500/20 via-teal-500/10 to-cyan-600/20",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/30",
    titleColor: "text-cyan-300",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    badgeLabel: "سعادة النائب",
    animation: "welcome" as const,
  },
  {
    keywords: ["الرحيلي", "محمد الرحيلي"],
    name: "محمد الرحيلي",
    title: "الأستاذ والأب الروحي",
    subtitle: "الأب الروحي لراصد",
    imageUrl: null,
    showImageDuration: 0,
    respectPhrase: "إلا الأستاذ والأب الروحي لنا.. ما نقدر نتكلم عنه عشان ما يرصدنا براصد 😄🔍",
    type: "team" as const,
    gradient: "from-emerald-500/20 via-green-500/10 to-emerald-600/20",
    borderColor: "border-emerald-500/40",
    glowColor: "shadow-emerald-500/30",
    titleColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    badgeLabel: "الأب الروحي",
    animation: "rasid-character" as const,
  },
  {
    keywords: ["المعتاز", "منال المعتاز", "منال"],
    name: "منال المعتاز",
    title: "مديرتنا الجديدة",
    subtitle: "المديرة العامة الجديدة",
    imageUrl: null,
    showImageDuration: 0,
    respectPhrase: "هذي مديرتنا الجديدة.. نرحب فيها ونتمنى لها التوفيق في قيادة الفريق 🌟",
    type: "team" as const,
    gradient: "from-purple-500/20 via-violet-500/10 to-purple-600/20",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/30",
    titleColor: "text-purple-300",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    badgeLabel: "المديرة العامة",
    animation: "welcome" as const,
  },
];

function detectVipLeader(content: string): typeof VIP_LEADERS_CLIENT[0] | null {
  const lower = content.toLowerCase();
  for (const leader of VIP_LEADERS_CLIENT) {
    for (const keyword of leader.keywords) {
      if (lower.includes(keyword)) return leader;
    }
  }
  return null;
}

function VipLeaderCard({ leader }: { leader: typeof VIP_LEADERS_CLIENT[0] }) {
  const [showImage, setShowImage] = useState(true);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);

  useEffect(() => {
    if (leader.showImageDuration && leader.showImageDuration > 0) {
      const timer = setTimeout(() => setShowImage(false), leader.showImageDuration);
      return () => clearTimeout(timer);
    }
  }, [leader.showImageDuration]);

  // Matrix rain effect for hacking style (الرحيلي)
  useEffect(() => {
    if (leader.animation !== "rasid-character") return;
    const chars = "01アイウエオカキクケコ>_{}[]|/\\";
    const interval = setInterval(() => {
      setMatrixChars(Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]));
    }, 150);
    return () => clearInterval(interval);
  }, [leader.animation]);

  const isRoyal = leader.type === "leader" || leader.type === "deputy";
  const isHacker = leader.animation === "rasid-character";

  // ═══ ROYAL GOLD LUXURY CARD (الربدي + السرحان) ═══
  if (isRoyal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl mb-4"
      >
        {/* Outer gold border with animated glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.1), inset 0 0 20px rgba(212,175,55,0.05)",
              "0 0 35px rgba(212,175,55,0.5), 0 0 60px rgba(212,175,55,0.2), inset 0 0 30px rgba(212,175,55,0.1)",
              "0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.1), inset 0 0 20px rgba(212,175,55,0.05)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Gold border frame */}
        <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/50" />
        <motion.div
          className="absolute inset-[1px] rounded-2xl border border-amber-300/20"
          animate={{ borderColor: ["rgba(252,211,77,0.1)", "rgba(252,211,77,0.4)", "rgba(252,211,77,0.1)"] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-yellow-950/60 to-amber-900/70 rounded-2xl" />

        {/* Gold shimmer sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />

        {/* Corner ornaments */}
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400/40 rounded-tr-lg" />
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400/40 rounded-tl-lg" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400/40 rounded-br-lg" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400/40 rounded-bl-lg" />

        <div className="relative p-5">
          {/* Top section: Large Image + Info side by side */}
          <div className="flex items-start gap-4">
            {/* Large Leader Photo with gold frame */}
            {leader.imageUrl && showImage ? (
              <motion.div
                initial={{ scale: 0, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 12 }}
                className="relative flex-shrink-0"
              >
                {/* Animated gold ring */}
                <motion.div
                  className="absolute -inset-1 rounded-2xl"
                  animate={{
                    background: [
                      "linear-gradient(0deg, #d4af37, #f5d060, #d4af37)",
                      "linear-gradient(120deg, #d4af37, #f5d060, #d4af37)",
                      "linear-gradient(240deg, #d4af37, #f5d060, #d4af37)",
                      "linear-gradient(360deg, #d4af37, #f5d060, #d4af37)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ padding: "2px" }}
                />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-2xl shadow-amber-500/30">
                  <img
                    src={leader.imageUrl}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Gold overlay shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-amber-500/15 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                {/* Crown badge on image */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40"
                >
                  <Crown className="w-4 h-4 text-amber-950" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-2xl border-2 border-amber-400/50 shadow-xl shadow-amber-500/20 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-900/60 to-yellow-900/40"
              >
                <Crown className="w-10 h-10 text-amber-400" />
              </motion.div>
            )}

            {/* Info section */}
            <div className="flex-1 min-w-0 pt-1">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-2"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border border-amber-400/40 font-bold tracking-wide"
                >
                  {leader.badgeLabel}
                </motion.span>
              </motion.div>
              {/* Name */}
              <motion.h3
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-bold bg-gradient-to-l from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
              >
                {leader.name}
              </motion.h3>
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[11px] text-amber-400/60 mt-0.5"
              >
                {leader.subtitle || leader.title}
              </motion.p>
            </div>

            {/* Salute animation */}
            <motion.div
              animate={{ rotate: [0, -20, 0], y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: 3, repeatDelay: 0.8 }}
              className="text-3xl pt-2"
            >
              🫡
            </motion.div>
          </div>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="my-3 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
          />

          {/* Respect Phrase in gold box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="px-4 py-3 rounded-xl bg-gradient-to-l from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-400/25"
          >
            <p className="text-[13px] font-medium text-amber-200/90 text-center leading-relaxed">
              {leader.respectPhrase}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ═══ HACKING / CYBER CARD (الرحيلي) ═══
  if (isHacker) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl mb-4 border border-emerald-500/30"
      >
        {/* Dark cyber background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-emerald-950/40 to-gray-950 rounded-2xl" />

        {/* Matrix rain overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
          {matrixChars.map((char, i) => (
            <motion.span
              key={i}
              className="absolute text-emerald-400 font-mono text-[10px]"
              style={{ left: `${(i / 20) * 100}%`, top: 0 }}
              animate={{ y: [0, 200], opacity: [1, 0] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 h-px bg-emerald-400/30"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 15px rgba(16,185,129,0.15), inset 0 0 15px rgba(16,185,129,0.03)",
              "0 0 30px rgba(16,185,129,0.3), inset 0 0 25px rgba(16,185,129,0.06)",
              "0 0 15px rgba(16,185,129,0.15), inset 0 0 15px rgba(16,185,129,0.03)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        <div className="relative p-5">
          {/* Terminal header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/20"
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[9px] font-mono text-emerald-500/50 mr-auto">RASID_VIP_DETECT.sh</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-[9px] font-mono text-emerald-400"
            >
              █
            </motion.span>
          </motion.div>

          {/* Content row: Rasid Character + Info */}
          <div className="flex items-start gap-4">
            {/* Large Rasid Character with cyber frame */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 12 }}
              className="relative flex-shrink-0"
            >
              {/* Cyber ring */}
              <motion.div
                className="absolute -inset-1.5 rounded-2xl border border-emerald-400/30"
                animate={{ borderColor: ["rgba(16,185,129,0.2)", "rgba(16,185,129,0.5)", "rgba(16,185,129,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-950/80 to-gray-950">
                <img
                  src={RASID_CHARACTER_ELEGANT}
                  alt="راصد"
                  className="w-full h-full object-contain"
                />
                {/* Scan overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 to-emerald-400/10"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              {/* Terminal badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500/20 border border-emerald-400/40 rounded-lg flex items-center justify-center"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              </motion.div>
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-2"
              >
                <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  {leader.badgeLabel}
                </span>
              </motion.div>
              {/* Name */}
              <motion.h3
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-bold text-emerald-300 font-mono"
              >
                {leader.name}
              </motion.h3>
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[11px] text-emerald-500/60 mt-0.5 font-mono"
              >
                {leader.subtitle || leader.title}
              </motion.p>
            </div>

            {/* Hacking icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="pt-2"
            >
              <Radar className="w-7 h-7 text-emerald-400/60" />
            </motion.div>
          </div>

          {/* Cyber divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="my-3 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
          />

          {/* Respect Phrase in terminal box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 font-mono"
          >
            <p className="text-[12px] font-medium text-emerald-300/90 text-center leading-relaxed">
              <span className="text-emerald-500/50">&gt; </span>{leader.respectPhrase}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ═══ DEFAULT CARD (المعتاز and others) ═══
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl mb-4 border-2 ${leader.borderColor} bg-gradient-to-br ${leader.gradient} shadow-xl ${leader.glowColor}`}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
      />

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: [
            `0 0 15px rgba(168,85,247,0.2)`,
            `0 0 30px rgba(168,85,247,0.4)`,
            `0 0 15px rgba(168,85,247,0.2)`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`w-16 h-16 rounded-2xl border-2 ${leader.borderColor} shadow-xl ${leader.glowColor} flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${leader.gradient}`}
          >
            <Crown className={`w-8 h-8 ${leader.titleColor}`} />
          </motion.div>

          <div className="flex-1 min-w-0 pt-1">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-2"
            >
              <span className={`text-[10px] px-3 py-1 rounded-full border ${leader.badgeColor} font-bold`}>
                {leader.badgeLabel}
              </span>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-lg font-bold ${leader.titleColor}`}
            >
              {leader.name}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[11px] text-slate-400 mt-0.5"
            >
              {leader.subtitle || leader.title}
            </motion.p>
          </div>

          <motion.div
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <Crown className={`w-7 h-7 ${leader.titleColor} opacity-70`} />
          </motion.div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="my-3 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className={`px-4 py-3 rounded-xl bg-gradient-to-l ${leader.gradient} border ${leader.borderColor}`}
        >
          <p className={`text-[13px] font-medium ${leader.titleColor} text-center leading-relaxed`}>
            {leader.respectPhrase}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══ TYPEWRITER STREAMDOWN ═══
function TypewriterStreamdown({ children, isNew }: { children: string; isNew: boolean }) {
  const [displayedContent, setDisplayedContent] = useState(isNew ? "" : children);
  const [isTyping, setIsTyping] = useState(isNew);
  const contentRef = useRef(children);
  const indexRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isNew) {
      setDisplayedContent(children);
      return;
    }
    contentRef.current = children;
    indexRef.current = 0;
    setIsTyping(true);
    setDisplayedContent("");

    // Fast streaming typewriter — word-aware chunks for natural feel
    const baseCharsPerTick = 4;
    const tickInterval = 8; // Very fast ticks
    let lastTime = 0;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= tickInterval) {
        lastTime = timestamp;
        const content = contentRef.current;
        let nextIdx = indexRef.current + baseCharsPerTick;

        // Advance to end of current word for natural breaks
        while (nextIdx < content.length && content[nextIdx] !== ' ' && content[nextIdx] !== '\n' && (nextIdx - indexRef.current) < 12) {
          nextIdx++;
        }

        indexRef.current = nextIdx;

        if (indexRef.current >= content.length) {
          setDisplayedContent(content);
          setIsTyping(false);
          return;
        }
        setDisplayedContent(content.slice(0, indexRef.current));
        // Dispatch scroll event every few ticks for auto-scroll
        if (indexRef.current % 20 < baseCharsPerTick) {
          window.dispatchEvent(new Event("rasid-typewriter-tick"));
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [children, isNew]);

  return (
    <>
      <Streamdown>{displayedContent}</Streamdown>
      {isTyping && (
        <motion.span
          animate={{ opacity: [1, 0.3] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 align-middle rounded-sm shadow-[0_0_8px_rgba(61,177,172,0.6)]"
        />
      )}
    </>
  );
}

// ═══ MAIN COMPONENT ═══
export default function SmartRasid() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drillLeakId, setDrillLeakId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratingHover, setRatingHover] = useState<{ msgId: string; star: number } | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [loadingSteps, setLoadingSteps] = useState<ThinkingStep[]>([]);
  const [isMuted, setIsMuted] = useState(soundManager.muted);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationId] = useState(() => `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

  // Chat history queries/mutations
  const historyQuery = trpc.chatHistory.list.useQuery(undefined, { enabled: showHistory });
  const saveMutation = trpc.chatHistory.save.useMutation();
  const deleteMutation = trpc.chatHistory.delete.useMutation();
  const loadConvQuery = trpc.chatHistory.get.useQuery(
    { conversationId: "" },
    { enabled: false }
  );

  // Sound preference sync
  useEffect(() => {
    const unsub = soundManager.onChange(() => setIsMuted(soundManager.muted));
    return () => { unsub(); };
  }, []);

  const rateMutation = trpc.aiRatings.rate.useMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const chatMutation = trpc.smartRasid.chat.useMutation();

  // Auto-scroll to bottom — also triggered by typing animation via custom event
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Also trigger global auto-scroll for the DashboardLayout main container
    window.dispatchEvent(new Event("rasid-auto-scroll"));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingSteps, scrollToBottom]);

  // Listen for typewriter scroll events
  useEffect(() => {
    const handler = () => scrollToBottom();
    window.addEventListener("rasid-typewriter-tick", handler);
    return () => window.removeEventListener("rasid-typewriter-tick", handler);
  }, [scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [inputValue]);

  // Debounced suggestions
  const fetchSuggestions = useCallback(async (partial: string) => {
    if (partial.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/trpc/smartRasid.suggestions?input=${encodeURIComponent(JSON.stringify({ partial }))}`);
      const data = await res.json();
      const result = data?.result?.data;
      if (result?.suggestions?.length > 0) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);
    suggestionsTimeoutRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const sendMessage = async (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(true);
    soundManager.playSend();

    setLoadingSteps([
      {
        id: "loading-1",
        agent: "راصد الذكي",
        action: "analyze_intent",
        description: "تحليل نية المستخدم وتحديد الوكيل المختص",
        status: "running",
        timestamp: new Date().toISOString(),
      },
    ]);

    const history = messages.slice(-16).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Create a placeholder assistant message for streaming
    const assistantId = `assistant-${Date.now()}`;
    let streamedContent = "";
    let streamedToolsUsed: string[] = [];
    let streamedThinkingSteps: ThinkingStep[] = [];
    let streamedFollowUp: string[] = [];
    let streamedProcessingMeta: any = null;
    let streamedChartData: ChatMessage['chartData'] = undefined;
    let streamedDashboardData: ChatMessage['dashboardData'] = undefined;

    try {
      // Try SSE streaming first
      const response = await fetch("/api/rasid/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: msg, history }),
      });

      if (!response.ok || !response.body) {
        throw new Error("SSE not available");
      }

      // Add placeholder message
      const placeholderMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        userQuery: msg,
        isStreaming: true,
      };
      setMessages(prev => [...prev, placeholderMsg]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("event: ")) {
            const eventType = trimmed.slice(7);
            // Next line should be data
            continue;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              // Determine event type from the previous event line
              // We'll parse event+data pairs
              handleSSEData(data);
            } catch {
              // Skip malformed data
            }
          }
        }
      }

      // Finalize the streamed message
      setLoadingSteps([]);
      soundManager.playMessageReceived();

      setMessages(prev => prev.map(m => m.id === assistantId ? {
        ...m,
        content: streamedContent,
        toolsUsed: streamedToolsUsed,
        thinkingSteps: streamedThinkingSteps,
        followUpSuggestions: streamedFollowUp,
        processingMeta: streamedProcessingMeta,
        chartData: streamedChartData,
        dashboardData: streamedDashboardData,
        isStreaming: false,
      } : m));

      setNewMessageIds(prev => new Set(prev).add(assistantId));

    } catch (sseErr) {
      // Fallback to tRPC mutation if SSE fails
      console.warn("[SmartRasid] SSE failed, falling back to tRPC:", sseErr);
      
      // Remove placeholder if it was added
      setMessages(prev => prev.filter(m => m.id !== assistantId));

      try {
        const result = await chatMutation.mutateAsync({
          message: msg,
          history: history as Array<{ role: "user" | "assistant"; content: string }>,
        });

        setLoadingSteps([]);
        soundManager.playMessageReceived();

        let chartData: ChatMessage['chartData'] = undefined;
        let dashboardData: ChatMessage['dashboardData'] = undefined;
        const toolResults = (result as any).toolResults || [];
        for (const tr of toolResults) {
          if (tr?.__type === 'chart') {
            chartData = { chartConfig: tr.chartConfig, summary: tr.summary };
          } else if (tr?.__type === 'dashboard') {
            dashboardData = { title: tr.title, dashboardType: tr.dashboardType, kpis: tr.kpis, charts: tr.charts, summary: tr.summary };
          }
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: (typeof result.response === 'string' ? result.response : '') as string,
          timestamp: new Date(),
          toolsUsed: (result as any).toolsUsed,
          thinkingSteps: (result as any).thinkingSteps,
          userQuery: msg,
          followUpSuggestions: (result as any).followUpSuggestions || [],
          processingMeta: (result as any).processingMeta,
          chartData,
          dashboardData,
        };

        setNewMessageIds(prev => new Set(prev).add(assistantMessage.id));
        setMessages(prev => [...prev, assistantMessage]);
      } catch (fallbackErr: any) {
        setLoadingSteps([]);
        soundManager.playError();
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        toast.error("حدث خطأ في الاتصال");
      }
    } finally {
      setIsLoading(false);
    }

    // SSE event handler
    function handleSSEData(data: any) {
      // Token event
      if (data.text !== undefined) {
        streamedContent += data.text;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: streamedContent } : m));
        scrollToBottom();
        return;
      }

      // Thinking step event
      if (data.agent && data.action) {
        streamedThinkingSteps.push(data);
        setLoadingSteps(prev => {
          const updated = [...prev];
          const existing = updated.findIndex(s => s.id === data.id);
          if (existing >= 0) {
            updated[existing] = data;
          } else {
            updated.push(data);
          }
          return updated;
        });
        return;
      }

      // Tool event
      if (data.name && data.status) {
        if (data.status === "running") {
          streamedToolsUsed.push(data.name);
        }
        return;
      }

      // Tool result (chart/dashboard)
      if (data.__type === 'chart') {
        streamedChartData = { chartConfig: data.chartConfig, summary: data.summary };
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, chartData: streamedChartData } : m));
        return;
      }
      if (data.__type === 'dashboard') {
        streamedDashboardData = { title: data.title, dashboardType: data.dashboardType, kpis: data.kpis, charts: data.charts, summary: data.summary };
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, dashboardData: streamedDashboardData } : m));
        return;
      }

      // Meta event (follow-up suggestions)
      if (data.followUpSuggestions) {
        streamedFollowUp = data.followUpSuggestions;
        return;
      }

      // Done event
      if (data.response !== undefined && data.toolsUsed) {
        streamedContent = data.response;
        streamedToolsUsed = data.toolsUsed;
        streamedThinkingSteps = data.thinkingSteps || [];
        streamedFollowUp = data.followUpSuggestions || [];
        streamedProcessingMeta = data.processingMeta;
        const toolResults = data.toolResults || [];
        for (const tr of toolResults) {
          if (tr?.__type === 'chart') {
            streamedChartData = { chartConfig: tr.chartConfig, summary: tr.summary };
          } else if (tr?.__type === 'dashboard') {
            streamedDashboardData = { title: tr.title, dashboardType: tr.dashboardType, kpis: tr.kpis, charts: tr.charts, summary: tr.summary };
          }
        }
        return;
      }

      // Error event
      if (data.message && !data.agent) {
        toast.error(data.message);
        return;
      }
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInputValue("");
    setExpandedThinking({});
    inputRef.current?.focus();
  };

  // Save current conversation
  const saveConversation = async () => {
    if (messages.length === 0) {
      toast.error("لا توجد رسائل لحفظها");
      return;
    }
    setIsSaving(true);
    try {
      const firstUserMsg = messages.find(m => m.role === "user");
      const title = firstUserMsg?.content.slice(0, 100) || "محادثة جديدة";
      await saveMutation.mutateAsync({
        conversationId,
        title,
        messages: messages.map(m => ({
          messageId: m.id,
          role: m.role,
          content: m.content,
          toolsUsed: m.toolsUsed || [],
          thinkingSteps: m.thinkingSteps || [],
          rating: m.rating,
        })),
      });
      soundManager.playSuccess();
      toast.success("تم حفظ المحادثة بنجاح");
      historyQuery.refetch();
    } catch {
      toast.error("فشل في حفظ المحادثة");
    } finally {
      setIsSaving(false);
    }
  };

  // Load a saved conversation
  const loadConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/trpc/chatHistory.get?input=${encodeURIComponent(JSON.stringify({ conversationId: convId }))}`);
      const data = await res.json();
      const result = data?.result?.data;
      if (result?.messages) {
        setMessages(result.messages.map((m: any) => ({
          id: m.messageId,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt),
          toolsUsed: m.toolsUsed,
          thinkingSteps: m.thinkingSteps,
          rating: m.rating,
        })));
        setShowHistory(false);
        soundManager.playMessageReceived();
        toast.success("تم تحميل المحادثة");
      }
    } catch {
      toast.error("فشل في تحميل المحادثة");
    }
  };

  // Delete a saved conversation
  const deleteConversation = async (convId: string) => {
    try {
      await deleteMutation.mutateAsync({ conversationId: convId });
      toast.success("تم حذف المحادثة");
      historyQuery.refetch();
    } catch {
      toast.error("فشل في حذف المحادثة");
    }
  };

  // Export conversation as text report
  const exportConversation = () => {
    if (messages.length === 0) {
      toast.error("لا توجد رسائل للتصدير");
      return;
    }
    setIsExporting(true);
    try {
      const lines: string[] = [
        "═══════════════════════════════════════════════════",
        "  تقرير محادثة راصد الذكي",
        "  Smart Rasid AI Conversation Report",
        "═══════════════════════════════════════════════════",
        "",
        `التاريخ: ${new Date().toLocaleDateString("ar-SA")}`,
        `الوقت: ${new Date().toLocaleTimeString("ar-SA")}`,
        `عدد الرسائل: ${messages.length}`,
        "",
        "───────────────────────────────────────────────────",
        "",
      ];

      messages.forEach((m, i) => {
        const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString("ar-SA") : "";
        const role = m.role === "user" ? "👤 المستخدم" : "🤖 راصد الذكي";
        lines.push(`[${time}] ${role}:`);
        lines.push(m.content);
        if (m.toolsUsed && m.toolsUsed.length > 0) {
          lines.push(`  الأدوات المستخدمة: ${m.toolsUsed.join("، ")}`);
        }
        if (m.rating) {
          lines.push(`  التقييم: ${"⭐".repeat(m.rating)}`);
        }
        lines.push("");
        if (i < messages.length - 1) {
          lines.push("- - - - - - - - - - - - - - - - - - - - - - - - -");
          lines.push("");
        }
      });

      lines.push("═══════════════════════════════════════════════════");
      lines.push("  نهاية التقرير — منصة راصد");
      lines.push("═══════════════════════════════════════════════════");

      const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rasid-chat-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      soundManager.playSuccess();
      toast.success("تم تصدير المحادثة بنجاح");
    } catch {
      toast.error("فشل في تصدير المحادثة");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRating = async (msg: ChatMessage, star: number) => {
    try {
      await rateMutation.mutateAsync({
        messageId: msg.id,
        rating: star,
        userMessage: msg.userQuery || "",
        aiResponse: msg.content,
        toolsUsed: msg.toolsUsed || [],
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, rating: star } : m));
      toast.success(`تم التقييم بنجاح (${star}/5)`);
    } catch {
      toast.error("فشل في حفظ التقييم");
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("تم النسخ");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  const extractLeakIds = (content: string): string[] => {
    const matches = content.match(/LK-\d{4}-\d{4}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const toggleThinking = (msgId: string) => {
    setExpandedThinking(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" dir="rtl">
      {/* ═══ BACKGROUND EFFECTS ═══ */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060d1b] via-[#0a1628] to-[#0d1a30] z-0" />
      <MatrixRain />
      <ScanLine />

      {/* ═══ HEADER — Console Style with Rasid Character ═══ */}
      <div className="flex-shrink-0 border-b border-cyan-500/15 bg-[#0a1628]/80 backdrop-blur-2xl z-20 relative">
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Rasid Character Avatar with glow */}
            <div className="relative group">
              <motion.div
                animate={{ boxShadow: ["0 0 15px rgba(0,200,180,0.2)", "0 0 30px rgba(0,200,180,0.4)", "0 0 15px rgba(0,200,180,0.2)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 border-cyan-500/30 relative"
              >
                <img
                  src={RASID_FACE_URL}
                  alt="راصد الذكي"
                  className="w-full h-full object-contain character-breathe"
                  style={{ filter: "drop-shadow(0 2px 8px rgba(61, 177, 172, 0.2))" }}
                />
              </motion.div>
              {/* Online indicator */}
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2.5px] border-[#0a1628] shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              />
            </div>

            <div>
              <h1 className="text-[15px] font-bold text-white flex items-center gap-2 font-[Tajawal]">
                <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                  راصد الذكي
                </span>
                <span className="text-[9px] font-mono font-normal bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 tracking-wider">
                  v6.0
                </span>
              </h1>
              <p className="text-[11px] text-cyan-400/60 font-mono tracking-wide">
                SMART_RASID // {Object.keys(toolLabels).length} TOOLS · 7 AGENTS · ACTIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Status indicators */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#060d1b]/60 border border-cyan-500/10 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                ONLINE
              </span>
              <span className="text-cyan-500/30">|</span>
              <span className="text-cyan-400/50">{Object.keys(toolLabels).length} أداة</span>
            </div>

            {/* Sound Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newMuted = soundManager.toggleMute();
                toast.info(newMuted ? "تم كتم الصوت" : "تم تفعيل الصوت");
              }}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg border text-xs transition-all font-mono ${
                isMuted
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
              title={isMuted ? "تفعيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </motion.button>

            {/* Save Conversation */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveConversation}
              disabled={isSaving || messages.length === 0}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-xs transition-all font-mono disabled:opacity-30"
              title="حفظ المحادثة"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            </motion.button>

            {/* Export */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportConversation}
              disabled={messages.length === 0}
              className="hidden sm:flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 text-xs transition-all font-mono disabled:opacity-30"
              title="تصدير المحادثة"
            >
              <Download className="w-3.5 h-3.5" />
            </motion.button>

            {/* History */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg border text-xs transition-all font-mono ${
                showHistory
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
              }`}
              title="سجل المحادثات"
            >
              <Archive className="w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 text-xs transition-all font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline tracking-wide">NEW_SESSION</span>
            </motion.button>
          </div>
        </div>

        {/* Quick Commands — Console-style chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] text-cyan-500/40 whitespace-nowrap flex items-center gap-1 font-mono">
            <Terminal className="w-3 h-3" />
            CMD &gt;
          </span>
          {quickCommands.map((cmd, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => sendMessage(cmd.query)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${cmd.bgColor} border text-xs ${cmd.color} whitespace-nowrap transition-all font-mono hover:shadow-lg`}
            >
              <cmd.icon className="w-3 h-3" />
              {cmd.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ═══ CHAT AREA ═══ */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 z-10 relative">
        {messages.length === 0 ? (
          /* ═══ WELCOME SCREEN — Console Style ═══ */
          <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-2">
            {/* Rasid Character with effects */}
            <div className="relative mb-8">
              <PulseRings size={100} />

              {/* Rotating tech ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] rounded-full border border-dashed border-cyan-500/15"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,200,180,0.6)]" />
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-35px] rounded-full border border-dashed border-teal-500/8"
              >
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-teal-400/60" />
              </motion.div>

              {/* Character image */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-visible flex items-center justify-center">
                  <img
                    src={RASID_CHARACTER_URL}
                    alt="راصد الذكي"
                    className="w-full h-full object-contain character-float drop-shadow-2xl"
                    style={{ filter: "drop-shadow(0 8px 24px rgba(61, 177, 172, 0.2))" }}
                  />
                </div>

                {/* Sparkle badge */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center border-[3px] border-[#0a1628] shadow-[0_0_15px_rgba(0,200,180,0.4)]"
                >
                  <Radar className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
            </div>

            {/* Title with typewriter effect */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-2"
            >
              <h2 className="text-2xl sm:text-3xl font-bold font-[Tajawal] mb-1">
                <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                  راصد الذكي
                </span>
              </h2>
              <div className="flex items-center justify-center gap-2 text-cyan-400/60 font-mono text-xs">
                <motion.span
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="text-cyan-400"
                >
                  _
                </motion.span>
                <span>SMART RASID AI ASSISTANT</span>
                <motion.span
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="text-cyan-400"
                >
                  _
                </motion.span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-slate-400 mb-4 text-center max-w-lg font-[Tajawal]"
            >
              كبير محللي حماية البيانات الشخصية — يحلل، يستنتج، يربط، وينفذ
            </motion.p>

            {/* Agent Architecture — Console Display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#060d1b]/80 border border-cyan-500/15 font-mono text-[9px] sm:text-[10px] flex-wrap justify-center"
            >
              <Radar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">RASID</span>
              <span className="text-cyan-500/30">→</span>
              {[
                { icon: Zap, label: "تنفيذي", color: "text-emerald-400" },
                { icon: BarChart2, label: "تحليلات", color: "text-violet-400" },
                { icon: Eye, label: "مراجعة", color: "text-orange-400" },
                { icon: BookOpen, label: "معرفة", color: "text-blue-400" },
                { icon: FileSearch, label: "ملفات", color: "text-teal-400" },
                { icon: HeartHandshake, label: "شخصية", color: "text-pink-400" },
              ].map((agent, i) => (
                <div key={i} className={`flex items-center gap-1 ${agent.color}`}>
                  <agent.icon className="w-3 h-3" />
                  <span>{agent.label}</span>
                  {i < 5 && <span className="text-cyan-500/20 mr-1">·</span>}
                </div>
              ))}
            </motion.div>

            {/* Capabilities Grid — Console Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full rounded-xl border border-cyan-500/15 bg-[#060d1b]/60 backdrop-blur-xl p-5 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <p className="text-sm font-medium text-white font-[Tajawal]">قدرات راصد الذكي</p>
                <span className="text-[10px] text-cyan-400/50 font-mono bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                  {Object.keys(toolLabels).length} TOOLS · 7 AGENTS
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.03 }}
                    whileHover={{ scale: 1.03, borderColor: "rgba(0,200,180,0.3)" }}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0a1628]/80 border border-cyan-500/10 hover:bg-cyan-500/5 transition-all cursor-default group"
                  >
                    <cap.icon className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-300 transition-colors flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-slate-200 block truncate font-[Tajawal]">{cap.label}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{cap.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full"
            >
              <p className="text-xs text-slate-500 mb-3 text-center font-mono">// ابدأ بأحد هذه الأوامر أو اكتب أي سؤال</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickCommands.slice(0, 4).map((cmd, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(cmd.query)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0a1628]/60 hover:bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/25 transition-all group`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cmd.bgColor} border flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <cmd.icon className={`w-5 h-5 ${cmd.color}`} />
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-[Tajawal]">{cmd.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* ═══ MESSAGE LIST ═══ */
          <>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "assistant" ? (
                    <motion.div
                      animate={{ boxShadow: ["0 0 8px rgba(0,200,180,0.15)", "0 0 16px rgba(0,200,180,0.3)", "0 0 8px rgba(0,200,180,0.15)"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/30"
                    >
                      <img src={RASID_FACE_URL} alt="راصد" className="w-full h-full object-contain character-breathe" style={{ filter: "drop-shadow(0 1px 4px rgba(61, 177, 172, 0.15))" }} />
                    </motion.div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30">
                      <span className="text-xs text-white font-bold">
                        {user?.name?.charAt(0) || (user as any)?.displayName?.charAt(0) || "م"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] lg:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Thinking Steps */}
                  {msg.role === "assistant" && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                    <ThinkingStepsDisplay
                      steps={msg.thinkingSteps}
                      isExpanded={expandedThinking[msg.id] ?? false}
                      onToggle={() => toggleThinking(msg.id)}
                    />
                  )}

                  {/* Tool usage indicator with category badges */}
                  {msg.role === "assistant" && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {msg.toolsUsed.map((tool, i) => {
                        // Determine tool category from thinking steps
                        const stepForTool = msg.thinkingSteps?.find(s => s.action === tool);
                        const catConfig = stepForTool?.toolCategory ? toolCategoryConfig[stepForTool.toolCategory] : null;
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border font-mono ${
                              catConfig ? `${catConfig.bgColor} ${catConfig.color}` : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/15'
                            }`}
                          >
                            {catConfig ? <catConfig.icon className="w-2.5 h-2.5" /> : <Terminal className="w-2.5 h-2.5" />}
                            {toolLabels[tool] || tool}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Processing meta info */}
                  {msg.role === "assistant" && msg.processingMeta && msg.processingMeta.totalDurationMs > 0 && (
                    <div className="flex items-center gap-2 mb-2 text-[9px] text-slate-500 font-mono">
                      <span className="flex items-center gap-0.5">
                        <Timer className="w-2.5 h-2.5" />
                        {msg.processingMeta.totalDurationMs < 1000
                          ? `${msg.processingMeta.totalDurationMs}ms`
                          : `${(msg.processingMeta.totalDurationMs / 1000).toFixed(1)}s`}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span>{msg.processingMeta.toolCount} أداة</span>
                      <span className="text-slate-700">·</span>
                      <span>{msg.processingMeta.agentsUsed.length} وكيل</span>
                    </div>
                  )}

                  <div
                    className={`rounded-xl px-4 py-3 relative group ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 text-slate-100"
                        : "bg-[#0a1628]/80 border border-cyan-500/10 text-slate-200"
                    }`}
                  >
                    {/* Action buttons */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="p-1 rounded-md hover:bg-white/10"
                        title="نسخ"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                      {/* Table export buttons - only show if content has tables */}
                      {msg.role === "assistant" && msg.content.includes("|") && msg.content.includes("---") && (
                        <>
                          <button
                            onClick={() => {
                              const tables = extractMarkdownTables(msg.content);
                              if (tables.length === 0) { toast.error("لا توجد جداول"); return; }
                              const csv = tablesToCsv(tables);
                              downloadFile(csv, `rasid-table-${Date.now()}.csv`, "text/csv;charset=utf-8");
                              toast.success("تم تصدير الجدول ك CSV");
                            }}
                            className="p-1 rounded-md hover:bg-white/10"
                            title="تصدير CSV"
                          >
                            <Table2 className="w-3 h-3 text-slate-500" />
                          </button>
                          <button
                            onClick={() => {
                              const tables = extractMarkdownTables(msg.content);
                              if (tables.length === 0) { toast.error("لا توجد جداول"); return; }
                              downloadFile(tables.join("\n\n"), `rasid-table-${Date.now()}.md`, "text/markdown;charset=utf-8");
                              toast.success("تم تصدير الجدول ك Markdown");
                            }}
                            className="p-1 rounded-md hover:bg-white/10"
                            title="تصدير Markdown"
                          >
                            <FileDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </>
                      )}
                    </div>

                    {msg.role === "assistant" ? (
                      <div className="rasid-response prose prose-invert max-w-none text-[13px] leading-[1.7] [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-cyan-200 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-cyan-200 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-cyan-300 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h4]:text-[12px] [&_h4]:font-semibold [&_h4]:text-teal-300 [&_h4]:mt-2 [&_h4]:mb-1 [&_p]:text-[13px] [&_p]:text-slate-300 [&_p]:leading-[1.7] [&_p]:mb-2 [&_li]:text-[12px] [&_li]:text-slate-300 [&_li]:leading-[1.6] [&_ul]:space-y-0.5 [&_ol]:space-y-0.5 [&_table]:text-[11px] [&_table]:w-full [&_table]:border-collapse [&_th]:bg-cyan-500/10 [&_th]:text-cyan-300 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:border [&_th]:border-cyan-500/15 [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:border [&_td]:border-cyan-500/10 [&_td]:text-slate-400 [&_a]:text-cyan-400 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-cyan-200 [&_strong]:font-semibold [&_em]:text-teal-300 [&_code]:text-[11px] [&_code]:text-cyan-300 [&_code]:bg-cyan-500/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:text-[11px] [&_pre]:bg-[#060d1b] [&_pre]:border [&_pre]:border-cyan-500/10 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_blockquote]:border-r-2 [&_blockquote]:border-cyan-400/40 [&_blockquote]:pr-3 [&_blockquote]:pl-0 [&_blockquote]:text-[12px] [&_blockquote]:text-cyan-200/80 [&_blockquote]:italic [&_blockquote]:my-2 [&_hr]:border-cyan-500/15 [&_hr]:my-3 [&_img]:rounded-lg [&_img]:border [&_img]:border-cyan-500/20 [&_img]:shadow-lg [&_img]:shadow-cyan-500/5 [&_img]:max-w-full [&_img]:my-3">
                        {/* VIP Leader Card */}
                        {(() => {
                          const vipLeader = detectVipLeader(msg.content);
                          return vipLeader ? <VipLeaderCard leader={vipLeader} /> : null;
                        })()}
                        {msg.isStreaming ? (
                          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                            <Streamdown>{msg.content}</Streamdown>
                            <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5 rounded-sm" />
                          </div>
                        ) : (
                          <TypewriterStreamdown isNew={newMessageIds.has(msg.id)}>{msg.content}</TypewriterStreamdown>
                        )}
                        {/* Chart Rendering */}
                        {msg.chartData && (
                          <Suspense fallback={<div className="h-[360px] flex items-center justify-center text-slate-500"><RefreshCw className="w-5 h-5 animate-spin" /></div>}>
                            <RasidChart chartConfig={msg.chartData.chartConfig} summary={msg.chartData.summary} />
                          </Suspense>
                        )}
                        {/* Dashboard Rendering */}
                        {msg.dashboardData && (
                          <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-slate-500"><RefreshCw className="w-5 h-5 animate-spin" /></div>}>
                            <RasidDashboard
                              title={msg.dashboardData.title}
                              dashboardType={msg.dashboardData.dashboardType}
                              kpis={msg.dashboardData.kpis}
                              charts={msg.dashboardData.charts}
                              summary={msg.dashboardData.summary}
                            />
                          </Suspense>
                        )}
                        {/* Clickable Leak IDs */}
                        {extractLeakIds(msg.content).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-cyan-500/10 flex flex-wrap gap-2">
                            <span className="text-[10px] text-slate-500">عرض تفاصيل:</span>
                            {extractLeakIds(msg.content).map(id => (
                              <button
                                key={id}
                                onClick={() => setDrillLeakId(id)}
                                className="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/15 transition-colors font-mono"
                              >
                                {id}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[13px] leading-relaxed font-[Tajawal]">{msg.content}</p>
                    )}
                  </div>

                  {/* Timestamp + Rating */}
                  <div className={`flex items-center gap-1.5 mt-1.5 ${msg.role === "user" ? "justify-end" : "justify-between"}`}>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-2.5 h-2.5 text-slate-600" />
                      <span className="text-[10px] text-slate-600 font-mono">{formatTime(msg.timestamp)}</span>
                      {msg.role === "assistant" && (
                        <span className="text-[10px] text-emerald-500/70 flex items-center gap-0.5 font-mono">
                          <CheckCircle2 className="w-2.5 h-2.5" /> DONE
                        </span>
                      )}
                    </div>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-0.5" onMouseLeave={() => setRatingHover(null)}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = msg.rating ? star <= msg.rating : (ratingHover?.msgId === msg.id && star <= ratingHover.star);
                          return (
                            <button
                              key={star}
                              onClick={() => !msg.rating && handleRating(msg, star)}
                              onMouseEnter={() => !msg.rating && setRatingHover({ msgId: msg.id, star })}
                              className={`transition-all duration-150 ${msg.rating ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
                              title={msg.rating ? `تم التقييم: ${msg.rating}/5` : `تقييم ${star}/5`}
                              disabled={!!msg.rating}
                            >
                              <Star
                                className={`w-3.5 h-3.5 transition-colors ${
                                  isActive
                                    ? 'text-cyan-400 fill-cyan-400'
                                    : 'text-slate-700 hover:text-cyan-400/50'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dynamic follow-up suggestions from LLM */}
                  {msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {((msg.followUpSuggestions && msg.followUpSuggestions.length > 0)
                        ? msg.followUpSuggestions
                        : getFollowUpSuggestions(msg.content)
                      ).map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => sendMessage(suggestion)}
                          className="text-[11px] px-3 py-1.5 rounded-lg bg-[#0a1628]/60 hover:bg-cyan-500/10 border border-cyan-500/10 hover:border-cyan-500/25 text-slate-400 hover:text-cyan-300 transition-all font-mono flex items-center gap-1.5"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-400/60" />
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Loading Indicator — Console Style */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <motion.div
                    animate={{ boxShadow: ["0 0 8px rgba(0,200,180,0.2)", "0 0 20px rgba(0,200,180,0.4)", "0 0 8px rgba(0,200,180,0.2)"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40"
                  >
                    <img src={RASID_FACE_URL} alt="راصد" className="w-full h-full object-contain character-breathe" style={{ filter: "drop-shadow(0 2px 6px rgba(61, 177, 172, 0.2))" }} />
                  </motion.div>
                  <div className="bg-[#0a1628]/80 border border-cyan-500/15 rounded-xl px-4 py-3 max-w-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-cyan-400" />
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-teal-400" />
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-cyan-400/80 font-mono">جاري المعالجة...</span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          طلب من {user?.name || (user as any)?.displayName || "المستخدم"}
                        </span>
                      </div>
                    </div>
                    {/* Animated progress bar */}
                    <div className="h-0.5 rounded-full bg-[#060d1b] overflow-hidden mb-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ width: "50%" }}
                      />
                    </div>
                    {loadingSteps.length > 0 && (
                      <div className="space-y-1 mt-2 border-t border-cyan-500/10 pt-2 font-mono text-[10px]">
                        {loadingSteps.map((step) => (
                          <div key={step.id} className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Radar className="w-3 h-3 text-cyan-400" />
                            </motion.div>
                            <span className="text-cyan-400">{step.agent}</span>
                            <span className="text-cyan-500/30">→</span>
                            <span className="text-slate-500">{step.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ═══ INPUT AREA — Console Style ═══ */}
      <div className="flex-shrink-0 border-t border-cyan-500/15 bg-[#0a1628]/90 backdrop-blur-2xl p-4 z-20 relative">
        {/* Bottom accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mb-2 bg-[#060d1b]/95 border border-cyan-500/15 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-right px-4 py-2.5 text-sm text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300 transition-colors flex items-center gap-2 border-b border-cyan-500/5 last:border-0 font-[Tajawal]"
                >
                  <Search className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span>{s}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              {/* Console prompt indicator */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/30 font-mono text-xs pointer-events-none">
                &gt;_
              </div>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="اسأل راصد الذكي أي شيء — تحليل، تنفيذ، مراقبة، استعلام..."
                rows={1}
                className="w-full bg-[#060d1b]/80 border border-cyan-500/15 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:shadow-[0_0_15px_rgba(0,200,180,0.1)] transition-all resize-none overflow-hidden font-[Tajawal]"
                disabled={isLoading}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,200,180,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white disabled:opacity-30 shadow-lg shadow-cyan-500/20 hover:shadow-xl transition-all flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </motion.button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-slate-600 flex items-center gap-1 font-mono">
              <Radar className="w-3 h-3 text-cyan-500/40" />
              SMART_RASID v6.0 // {Object.keys(toolLabels).length} TOOLS · 7 AGENTS
            </p>
            <p className="text-[10px] text-slate-600 font-mono">
              Enter ↵ · Shift+Enter ⏎
            </p>
          </div>
        </div>
      </div>

      {/* ═══ HISTORY SIDEBAR PANEL ═══ */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-72 sm:w-80 bg-[#0a1628]/95 backdrop-blur-2xl border-l border-cyan-500/20 z-50 flex flex-col shadow-2xl shadow-cyan-500/5"
            dir="rtl"
          >
            {/* History Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/15">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-[Tajawal]">سجل المحادثات</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {historyQuery.isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              ) : !historyQuery.data || historyQuery.data.length === 0 ? (
                <div className="text-center py-10">
                  <MessageCircle className="w-8 h-8 text-cyan-500/20 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-[Tajawal]">لا توجد محادثات محفوظة</p>
                </div>
              ) : (
                historyQuery.data.map((conv: any) => (
                  <motion.div
                    key={conv.conversationId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group p-3 rounded-xl bg-[#060d1b]/60 border border-cyan-500/10 hover:border-cyan-500/25 transition-all cursor-pointer"
                    onClick={() => loadConversation(conv.conversationId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate font-[Tajawal]">
                          {conv.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-cyan-400/50 font-mono">
                            {conv.messageCount} رسالة
                          </span>
                          <span className="text-cyan-500/20">·</span>
                          <span className="text-[10px] text-cyan-400/50 font-mono">
                            {new Date(conv.createdAt).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.conversationId);
                        }}
                        className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* History Footer */}
            <div className="px-4 py-3 border-t border-cyan-500/15">
              <p className="text-[10px] text-cyan-500/40 font-mono text-center">
                CHAT_ARCHIVE // {historyQuery.data?.length || 0} SAVED
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leak Detail Drilldown */}
      <LeakDetailDrilldown
        leak={drillLeakId ? { leakId: drillLeakId } : null}
        open={!!drillLeakId}
        onClose={() => setDrillLeakId(null)}
      />
    </div>
  );
}

// ═══ TABLE EXPORT UTILITIES ═══
function extractMarkdownTables(content: string): string[] {
  const tables: string[] = [];
  const lines = content.split("\n");
  let currentTable: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      currentTable.push(trimmed);
      inTable = true;
    } else {
      if (inTable && currentTable.length >= 3) {
        tables.push(currentTable.join("\n"));
      }
      currentTable = [];
      inTable = false;
    }
  }
  if (inTable && currentTable.length >= 3) {
    tables.push(currentTable.join("\n"));
  }
  return tables;
}

function tablesToCsv(tables: string[]): string {
  return tables.map(table => {
    const rows = table.split("\n")
      .filter(row => !row.match(/^\|[\s-:|]+\|$/)) // Remove separator rows
      .map(row =>
        row.split("|").slice(1, -1).map(cell => {
          const cleaned = cell.trim().replace(/"/g, '""');
          return `"${cleaned}"`;
        }).join(",")
      );
    return rows.join("\n");
  }).join("\n\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Generate follow-up suggestions based on the last assistant message
function getFollowUpSuggestions(content: string): string[] {
  const suggestions: string[] = [];
  const lower = content.toLowerCase();

  if (lower.includes("حالة رصد") || lower.includes("leak")) {
    suggestions.push("تفاصيل أكثر عن الحالات رصد واسعة النطاق");
    suggestions.push("ما التوصيات الأمنية؟");
  }
  if (lower.includes("ملخص") || lower.includes("لوحة") || lower.includes("إحصائي")) {
    suggestions.push("تحليل الاتجاهات الشهرية");
    suggestions.push("تحليل الارتباطات");
  }
  if (lower.includes("تقرير") || lower.includes("مستند")) {
    suggestions.push("تفاصيل التقارير المجدولة");
    suggestions.push("سجل التوثيقات الرسمية");
  }
  if (lower.includes("حماية") || lower.includes("pdpl") || lower.includes("خصوصية") || lower.includes("تهديد")) {
    suggestions.push("ما مواد PDPL ذات الصلة؟");
    suggestions.push("أفضل الممارسات الأمنية");
  }
  if (lower.includes("بائع") || lower.includes("seller")) {
    suggestions.push("البائعون عاليو التأثير");
    suggestions.push("تحليل ارتباطات البائعين بالقطاعات");
  }
  if (lower.includes("تحليل") || lower.includes("اتجاه") || lower.includes("trend") || lower.includes("ارتباط")) {
    suggestions.push("توزيع حالات الرصد حسب القطاع");
    suggestions.push("اكتشاف الأنماط غير العادية");
  }
  if (lower.includes("نشاط") || lower.includes("مستخدم") || lower.includes("موظف")) {
    suggestions.push("سجل المراجعة الكامل");
    suggestions.push("من أصدر تقارير اليوم؟");
  }
  if (lower.includes("معرفة") || lower.includes("knowledge") || lower.includes("سياسة")) {
    suggestions.push("البحث في قاعدة المعرفة");
    suggestions.push("ما هو نظام PDPL؟");
  }

  if (suggestions.length === 0) {
    suggestions.push("ملخص لوحة المعلومات");
    suggestions.push("تحليل ارتباطات شامل");
    suggestions.push("دليل استخدام المنصة");
  }

  return suggestions.slice(0, 3);
}
