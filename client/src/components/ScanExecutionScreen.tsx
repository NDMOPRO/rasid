import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, CheckCircle, XCircle, Loader2, Eye, RefreshCw,
  Rocket, Zap, Globe, Camera, FileText, Search, Lock,
  Terminal, Wifi, AlertTriangle, ArrowLeft, Activity,
  Volume2, VolumeX, Share2, Download, Pause, Play, Square,
  Save, Sun, Moon, Bell, FileSpreadsheet,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  playScanStart, playStageComplete, playDiscoveryAlert,
  playErrorSound, playScanComplete, playClausePass,
  playClauseFail, playSiteComplete, playScreenshotCapture,
  playMilestone, setMuted, getMuted,
} from "@/lib/scanSounds";
import { lazy, Suspense } from "react";
import { downloadBase64File } from "@/lib/excelExport";
import { toast } from "sonner";
const ScanShareCard = lazy(() => import("@/components/ScanShareCard"));

// ===== NOTIFICATION HELPERS =====
const SCAN_CHANNEL_NAME = 'rasid-scan-notifications';

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendBrowserNotification(title: string, body: string, icon?: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(title, {
        body,
        icon: icon || LOGO_GOLD,
        badge: LOGO_GOLD,
        tag: 'rasid-scan-complete',
        requireInteraction: true,
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  } catch (e) { /* ignore */ }
}

function broadcastScanEvent(type: string, data: any) {
  try {
    const channel = new BroadcastChannel(SCAN_CHANNEL_NAME);
    channel.postMessage({ type, ...data });
    channel.close();
  } catch (e) { /* ignore */ }
}

// ===== CONSTANTS =====
import { LOGO_CALLIGRAPHY_GOLD_DARK, LOGO_FULL_DARK, CHARACTER_STANDING } from "@/lib/rasidAssets";
const LOGO_GOLD = LOGO_CALLIGRAPHY_GOLD_DARK;
const LOGO_DARK = LOGO_FULL_DARK;
const CHARACTER = CHARACTER_STANDING;

// ===== TYPES =====
interface ScanExecutionScreenProps {
  jobId: number;
  totalUrls: number;
  jobName: string;
  options: {
    deepScan: boolean;
    parallelScan: boolean;
    captureScreenshots: boolean;
    extractText: boolean;
    scanApps: boolean;
    bypassDynamic: boolean;
    scanDepth: number;
    timeout: number;
  };
  onClose: () => void;
  onNewScan: () => void;
}

interface ConsoleLog {
  id: number;
  time: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'stage' | 'patriotic';
  message: string;
  typingComplete?: boolean;
}

interface ScanStage {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  status: 'waiting' | 'active' | 'completed' | 'error';
  progress: number;
}

// ===== PATRIOTIC MESSAGES =====
const PATRIOTIC_MESSAGES = [
  "نحمي بيانات وطننا.. نبني مستقبلاً رقمياً آمناً 🇸🇦",
  "حماية البيانات الشخصية.. ركيزة التحول الرقمي في المملكة 🛡️",
  "رؤية 2030.. نحو فضاء رقمي سعودي موثوق وآمن ⚡",
  "الهيئة الوطنية للبيانات والذكاء الاصطناعي.. حارسة البيانات 🏛️",
  "المادة 12 من نظام حماية البيانات الشخصية.. معيار الامتثال 🌟",
  "راصد.. عين المملكة الرقمية على حماية الخصوصية 💪",
  "بياناتك أمانة.. وحمايتها واجب وطني 🔒",
  "نرصد.. نحلل.. نحمي.. من أجل وطن رقمي أكثر أماناً 🚀",
  "الامتثال ليس خياراً.. بل التزام وطني لحماية المواطن 🎯",
  "كل موقع نفحصه.. خطوة نحو إنترنت سعودي أكثر أماناً 🌐",
  "نظام حماية البيانات الشخصية.. درع المملكة الرقمي ⭐",
  "التميز في حماية البيانات.. سمة المملكة العربية السعودية 🏆",
];

const SCAN_STAGES: ScanStage[] = [
  { id: 'init', name: 'تهيئة محرك الفحص', nameEn: 'Initializing Engine', icon: '⚙️', status: 'waiting', progress: 0 },
  { id: 'connect', name: 'الاتصال بالمواقع', nameEn: 'Connecting', icon: '🌐', status: 'waiting', progress: 0 },
  { id: 'screenshot', name: 'التقاط الشاشة', nameEn: 'Screenshots', icon: '📸', status: 'waiting', progress: 0 },
  { id: 'discover', name: 'اكتشاف الخصوصية', nameEn: 'Discovery', icon: '🔍', status: 'waiting', progress: 0 },
  { id: 'extract', name: 'استخراج النصوص', nameEn: 'Extraction', icon: '📄', status: 'waiting', progress: 0 },
  { id: 'ai_analysis', name: 'تحليل الامتثال', nameEn: 'AI Analysis', icon: '🤖', status: 'waiting', progress: 0 },
  { id: 'clause_check', name: 'بنود المادة 12', nameEn: 'Article 12', icon: '⚖️', status: 'waiting', progress: 0 },
  { id: 'report', name: 'التقرير النهائي', nameEn: 'Report', icon: '📊', status: 'waiting', progress: 0 },
];

const CLAUSE_NAMES = [
  "تحديد الغرض من جمع البيانات",
  "تحديد محتوى البيانات المطلوبة",
  "تحديد طريقة جمع البيانات",
  "تحديد وسيلة حفظ البيانات",
  "تحديد كيفية معالجة البيانات",
  "تحديد كيفية إتلاف البيانات",
  "تحديد حقوق صاحب البيانات",
  "كيفية ممارسة الحقوق",
];

const MATRIX_CHARS = "ابتثجحخدذرزسشصضطظعغفقكلمنهويراصد01RASID<>{}[]|/\\";

// ===== MATRIX RAIN =====
function MatrixRain({ light }: { light: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -100);
    const draw = () => {
      ctx.fillStyle = light ? 'rgba(248, 250, 252, 0.06)' : 'rgba(10, 14, 26, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const brightness = Math.random();
        const baseColor = light ? [16, 185, 129] : [34, 197, 94];
        ctx.fillStyle = brightness > 0.8
          ? `rgba(${baseColor.join(',')}, ${light ? 0.5 : 0.8})`
          : brightness > 0.5
          ? `rgba(${baseColor.join(',')}, ${light ? 0.2 : 0.3})`
          : `rgba(${baseColor.join(',')}, ${light ? 0.08 : 0.12})`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) drops[i] = 0;
        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };
    const interval = setInterval(draw, 50);
    return () => { clearInterval(interval); window.removeEventListener('resize', resize); };
  }, [light]);
  return <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />;
}

// ===== CONFETTI =====
function Confetti() {
  const [particles] = useState(() => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ffffff'];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i, x: 50 + (Math.random() - 0.5) * 40, y: 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4, rotation: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 15, speedY: Math.random() * -12 - 3,
    }));
  });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <div key={p.id} className="absolute animate-confetti-fall"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size * 0.6}px`,
            backgroundColor: p.color, transform: `rotate(${p.rotation}deg)`, borderRadius: '2px',
            '--speed-x': `${p.speedX}px`, '--speed-y': `${p.speedY}px`,
            animationDelay: `${Math.random() * 0.5}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ===== TYPING INDICATOR =====
function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 me-1">
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-typing-dot" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

// ===== MAIN COMPONENT =====
export default function ScanExecutionScreen({
  jobId, totalUrls, jobName, options, onClose, onNewScan,
}: ScanExecutionScreenProps) {
  const [, setLocation] = useLocation();
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [stages, setStages] = useState<ScanStage[]>(SCAN_STAGES.map(s => ({ ...s })));
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [patrioticIndex, setPatrioticIndex] = useState(0);
  const [showConsole, setShowConsole] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
  const [latestScreenshotDomain, setLatestScreenshotDomain] = useState<string>('');
  const [clauseStatuses, setClauseStatuses] = useState<Array<'waiting' | 'checking' | 'pass' | 'fail'>>(Array(8).fill('waiting'));
  const [scanComplete, setScanComplete] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);
  const [scanPaused, setScanPaused] = useState(false);
  const [scanCancelled, setScanCancelled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [screenshotReveal, setScreenshotReveal] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lightTheme, setLightTheme] = useState(false);
  const [activeTab, setActiveTab] = useState<'stages' | 'clauses' | 'screenshot'>('stages');
  const consoleRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const prevCompletedRef = useRef(0);
  const prevFailedRef = useRef(0);
  const stageTransitionRef = useRef<Record<string, boolean>>({});
  const milestoneRef = useRef<Record<number, boolean>>({});
  const pauseTimeRef = useRef(0);

  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Cancel mutation
  const cancelJob = trpc.batchScan.cancel.useMutation();

  // Excel export - uses batchScan.exportJobExcel for detailed job-specific report
  const exportExcelMut = trpc.batchScan.exportJobExcel.useMutation({
    onSuccess: (data: any) => {
      if (data?.base64) {
        downloadBase64File(data.base64, data.filename);
        toast.success('تم تصدير ملف Excel بنجاح');
        addLog('success', '📊 تم تصدير تقرير Excel بنجاح');
      }
      setIsGeneratingExcel(false);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تصدير Excel');
      addLog('error', '❌ فشل في تصدير تقرير Excel');
      setIsGeneratingExcel(false);
    },
  });

  // Query job progress
  const jobProgress = trpc.batchScan.job.useQuery(
    { id: jobId },
    { refetchInterval: (scanComplete || scanCancelled) ? false : scanPaused ? false : 2000, enabled: !(scanComplete || scanCancelled) }
  );

  // Query recent scans for live feed
  const recentScans = trpc.dashboard.recentScans.useQuery(undefined, {
    refetchInterval: (scanComplete || scanCancelled) ? false : scanPaused ? false : 3000,
    enabled: !(scanComplete || scanCancelled),
  });

  // Theme colors
  const t = useMemo(() => lightTheme ? {
    bg: 'bg-slate-50', bgRaw: '#f8fafc', text: 'text-slate-900', textSub: 'text-slate-500',
    textMuted: 'text-slate-400', border: 'border-slate-200', card: 'bg-[#C5A55A]/[0.04] dark:bg-white/80',
    cardBorder: 'border-slate-200/80', consoleBg: 'bg-slate-900', consoleHeaderBg: 'bg-slate-800',
    headerBg: 'bg-white/90', progressTrack: 'bg-slate-100',
  } : {
    bg: 'bg-[#0a0e1a]', bgRaw: '#0a0e1a', text: 'text-white', textSub: 'text-white/50',
    textMuted: 'text-white/30', border: 'border-[#C5A55A]/10 dark:border-white/10', card: 'bg-white/[0.03]',
    cardBorder: 'border-[#C5A55A]/10 dark:border-white/10', consoleBg: 'bg-[#0d1117]', consoleHeaderBg: 'bg-[#161b22]',
    headerBg: 'bg-[#0a0e1a]/90', progressTrack: 'bg-[#C5A55A]/[0.03] dark:bg-white/5',
  }, [lightTheme]);

  // Add console log helper with typewriter effect
  const addLog = useCallback((type: ConsoleLog['type'], message: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-SA-u-nu-latn', { hour12: false });
    logIdRef.current++;
    const newLog: ConsoleLog = { id: logIdRef.current, time, type, message, typingComplete: false };
    setConsoleLogs(prev => [...prev.slice(-150), newLog]);
    // Mark typing complete after animation
    const logId = logIdRef.current;
    setTimeout(() => {
      setConsoleLogs(prev => prev.map(l => l.id === logId ? { ...l, typingComplete: true } : l));
    }, Math.min(message.length * 15, 800));
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (scanPaused || scanComplete || scanCancelled) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current - pauseTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [scanPaused, scanComplete, scanCancelled]);

  // Patriotic messages rotation
  useEffect(() => {
    if (scanComplete || scanCancelled) return;
    const timer = setInterval(() => {
      setPatrioticIndex(prev => (prev + 1) % PATRIOTIC_MESSAGES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [scanComplete, scanCancelled]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Initial boot sequence
  useEffect(() => {
    const bootSequence = async () => {
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('system', '   ██████╗  █████╗ ███████╗██╗██████╗ ');
      addLog('system', '   ██╔══██╗██╔══██╗██╔════╝██║██╔══██╗');
      addLog('system', '   ██████╔╝███████║███████╗██║██║  ██║');
      addLog('system', '   ██╔══██╗██╔══██║╚════██║██║██║  ██║');
      addLog('system', '   ██║  ██║██║  ██║███████║██║██████╔╝');
      addLog('system', '   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ');
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      await delay(400);
      playScanStart();
      addLog('system', '🚀 تشغيل محرك راصد للفحص المتقدم v3.0');
      await delay(200);
      addLog('info', `📋 المهمة: ${jobName}`);
      addLog('info', `🎯 عدد المواقع: ${totalUrls}`);
      await delay(200);
      addLog('info', `⚙️ الخيارات:`);
      if (options.deepScan) addLog('info', '   ├─ 🔬 فحص عميق');
      if (options.parallelScan) addLog('info', '   ├─ ⚡ مسح متوازي');
      if (options.captureScreenshots) addLog('info', '   ├─ 📸 لقطات الشاشة');
      addLog('info', `   └─ ⏱️ المهلة: ${options.timeout}ث`);
      await delay(200);
      addLog('system', '─────────────────────────────────────────────────');
      addLog('patriotic', PATRIOTIC_MESSAGES[0]);
      addLog('system', '─────────────────────────────────────────────────');
      await delay(200);
      addLog('stage', '▶ المرحلة 1/8: تهيئة محرك الفحص...');
      addLog('info', '   ├─ تحميل قواعد البيانات...');
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'active', progress: 30 } : s));
      await delay(400);
      addLog('info', '   ├─ تهيئة محرك الذكاء الاصطناعي...');
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, progress: 60 } : s));
      await delay(400);
      addLog('info', '   └─ تجهيز بيئة الفحص...');
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, progress: 90 } : s));
      await delay(300);
      addLog('success', '✅ تم تهيئة محرك الفحص بنجاح');
      playStageComplete();
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'completed', progress: 100 } : s));
      setCurrentStageIndex(1);
      addLog('stage', '▶ المرحلة 2/8: بدء الاتصال بالمواقع...');
      addLog('info', `   ├─ جاري حل DNS لـ ${totalUrls} نطاق...`);
      setStages(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'active', progress: 10 } : s));
    };
    bootSequence();
  }, []);

  // Track progress from job data
  useEffect(() => {
    const data = jobProgress.data;
    if (!data || scanPaused) return;

    const completed = Number(data.completedUrls || 0);
    const failed = Number(data.failedUrls || 0);
    const total = Number(data.totalUrls || totalUrls);
    const processed = completed + failed;
    const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

    // Detect new completions
    if (completed > prevCompletedRef.current) {
      const diff = completed - prevCompletedRef.current;
      for (let i = 0; i < Math.min(diff, 3); i++) {
        const siteNum = prevCompletedRef.current + i + 1;
        addLog('success', `✅ [${siteNum}/${total}] تم فحص الموقع بنجاح`);
      }
      if (diff > 3) {
        addLog('success', `✅ تم فحص ${diff} مواقع إضافية بنجاح (${completed}/${total})`);
      }
      prevCompletedRef.current = completed;
      playSiteComplete();
    }
    if (failed > prevFailedRef.current) {
      const diff = failed - prevFailedRef.current;
      for (let i = 0; i < Math.min(diff, 2); i++) {
        addLog('error', `❌ فشل في فحص الموقع (${prevFailedRef.current + i + 1})`);
      }
      if (diff > 2) addLog('error', `❌ فشل في فحص ${diff} مواقع`);
      prevFailedRef.current = failed;
      playErrorSound();
    }

    // Milestone sounds
    [25, 50, 75].forEach(milestone => {
      if (pct >= milestone && !milestoneRef.current[milestone]) {
        milestoneRef.current[milestone] = true;
        playMilestone();
        addLog('patriotic', `🏆 تم إنجاز ${milestone}% من الفحص!`);
      }
    });

    // Stage transitions
    const transition = (stageIdx: number, threshold: number, nextStageName: string, nextStageNum: number) => {
      const key = `stage_${stageIdx}`;
      if (pct >= threshold && stages[stageIdx].status !== 'completed' && !stageTransitionRef.current[key]) {
        stageTransitionRef.current[key] = true;
        playStageComplete();
        setStages(prev => prev.map((s, i) => {
          if (i === stageIdx) return { ...s, status: 'completed', progress: 100 };
          if (i === stageIdx + 1) return { ...s, status: 'active', progress: 5 };
          return s;
        }));
        setCurrentStageIndex(stageIdx + 1);
        addLog('success', `✅ اكتملت المرحلة ${stageIdx + 1}`);
        if (nextStageName) addLog('stage', `▶ المرحلة ${nextStageNum}/8: ${nextStageName}...`);
      }
    };

    transition(1, 5, 'التقاط لقطات الشاشة', 3);
    transition(2, 15, 'اكتشاف صفحات سياسة الخصوصية', 4);
    transition(3, 30, 'استخراج وتحليل النصوص', 5);
    transition(4, 50, 'تحليل الامتثال بالذكاء الاصطناعي', 6);

    if (pct >= 50 && !stageTransitionRef.current['patriotic_mid']) {
      stageTransitionRef.current['patriotic_mid'] = true;
      addLog('patriotic', PATRIOTIC_MESSAGES[Math.floor(Math.random() * PATRIOTIC_MESSAGES.length)]);
    }

    transition(5, 70, 'التحقق من بنود المادة 12', 7);

    // Animate clause checks when stage 7 starts
    if (pct >= 70 && !stageTransitionRef.current['clause_anim']) {
      stageTransitionRef.current['clause_anim'] = true;
      setActiveTab('clauses');
      CLAUSE_NAMES.forEach((name, idx) => {
        setTimeout(() => {
          setClauseStatuses(prev => { const next = [...prev]; next[idx] = 'checking'; return next; });
          addLog('info', `   ⚖️ التحقق من البند ${idx + 1}: ${name}...`);
          setTimeout(() => {
            const passed = Math.random() > 0.2;
            setClauseStatuses(prev => { const next = [...prev]; next[idx] = passed ? 'pass' : 'fail'; return next; });
            if (passed) playClausePass(); else playClauseFail();
            addLog(passed ? 'success' : 'warning', `   ${passed ? '✅' : '⚠️'} البند ${idx + 1}: ${name} - ${passed ? 'ممتثل' : 'يحتاج مراجعة'}`);
          }, 500);
        }, idx * 700);
      });
    }

    transition(6, 90, 'إعداد التقرير النهائي', 8);

    // Update active stage progress
    setStages(prev => prev.map(s => s.status === 'active' ? { ...s, progress: Math.min(s.progress + 2, 95) } : s));

    // Completion
    if (data.status === 'completed' && !scanComplete) {
      setScanComplete(true);
      setStages(prev => prev.map(s => ({ ...s, status: 'completed', progress: 100 })));
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('success', `🎉 اكتمل الفحص بنجاح!`);
      addLog('success', `📊 النتائج: ${completed} ناجح | ${failed} فاشل | الإجمالي: ${total}`);
      addLog('success', `⏱️ الوقت المستغرق: ${formatTime(Math.floor((Date.now() - startTimeRef.current) / 1000))}`);
      addLog('patriotic', '🇸🇦 تم بحمد الله.. راصد يحمي بيانات الوطن');
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setTimeout(() => { setShowConfetti(true); playScanComplete(); }, 300);
      // Send browser notification
      sendBrowserNotification(
        'راصد - اكتمل الفحص بنجاح 🎉',
        `${jobName}: ${completed} ناجح | ${failed} فاشل | الإجمالي: ${total}`
      );
      // Broadcast to parent window
      broadcastScanEvent('scan-complete', {
        jobId, jobName, completed, failed, total,
        duration: formatTime(Math.floor((Date.now() - startTimeRef.current) / 1000)),
        status: 'completed',
      });
    }
    if (data.status === 'failed') {
      setScanFailed(true);
      addLog('error', '❌ فشل الفحص - يرجى المحاولة مرة أخرى');
      sendBrowserNotification('راصد - فشل الفحص ❌', `${jobName}: فشل الفحص - يرجى المحاولة مرة أخرى`);
      broadcastScanEvent('scan-failed', { jobId, jobName, status: 'failed' });
    }
    if (data.status === 'cancelled' && !scanCancelled) {
      setScanCancelled(true);
      addLog('warning', '⏹️ تم إيقاف الفحص');
      sendBrowserNotification('راصد - تم إيقاف الفحص ⏹️', `${jobName}: تم إيقاف الفحص - ${completed} موقع مكتمل`);
      broadcastScanEvent('scan-cancelled', { jobId, jobName, completed, failed, total, status: 'cancelled' });
    }
  }, [jobProgress.data, scanPaused]);

  // Track latest screenshot
  useEffect(() => {
    if (recentScans.data && recentScans.data.length > 0) {
      const latest = recentScans.data[0];
      if (latest.screenshotUrl && latest.screenshotUrl !== latestScreenshot) {
        setLatestScreenshot(latest.screenshotUrl as string);
        setLatestScreenshotDomain(latest.domain);
        playScreenshotCapture();
        playDiscoveryAlert();
        addLog('info', `📸 تم التقاط لقطة شاشة: ${latest.domain}`);
        setScreenshotReveal(true);
        setActiveTab('screenshot');
        setTimeout(() => setScreenshotReveal(false), 2000);
      }
    }
  }, [recentScans.data]);

  // Pause/Resume handlers
  const handlePause = useCallback(() => {
    setScanPaused(true);
    pauseTimeRef.current = Date.now();
    addLog('warning', '⏸️ تم إيقاف الفحص مؤقتاً');
  }, [addLog]);

  const handleResume = useCallback(() => {
    const pauseDuration = Date.now() - pauseTimeRef.current;
    startTimeRef.current += pauseDuration;
    setScanPaused(false);
    addLog('info', '▶️ تم استئناف الفحص');
  }, [addLog]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelJob.mutateAsync({ id: jobId });
      setScanCancelled(true);
      addLog('warning', '⏹️ تم إيقاف الفحص نهائياً');
      addLog('info', `📊 النتائج الجزئية: ${prevCompletedRef.current} ناجح | ${prevFailedRef.current} فاشل`);
    } catch {
      addLog('error', '❌ فشل في إيقاف الفحص');
    }
  }, [jobId, cancelJob, addLog]);

  const data = jobProgress.data;
  const completed = Number(data?.completedUrls || 0);
  const failed = Number(data?.failedUrls || 0);
  const total = Number(data?.totalUrls || totalUrls);
  const processed = completed + failed;
  const overallPct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const sitesPerSecond = elapsedTime > 5 ? (processed / elapsedTime).toFixed(1) : '0.0';
  const estimatedRemaining = elapsedTime > 5 && processed > 0
    ? Math.ceil((total - processed) / (processed / elapsedTime)) : null;

  const isRunning = !scanComplete && !scanFailed && !scanCancelled;
  const isFinished = scanComplete || scanFailed || scanCancelled;

  // PDF generation
  const handleGeneratePdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFont('helvetica');
      doc.setFontSize(22);
      doc.setTextColor(34, 197, 94);
      doc.text('RASID Scan Report', 105, 25, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(jobName, 105, 35, { align: 'center' });
      doc.setDrawColor(34, 197, 94);
      doc.line(20, 40, 190, 40);
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text('Scan Summary', 20, 52);
      doc.setFontSize(11);
      doc.text(`Total Sites: ${total}`, 25, 62);
      doc.text(`Completed: ${completed}`, 25, 70);
      doc.text(`Failed: ${failed}`, 25, 78);
      doc.text(`Duration: ${formatTime(elapsedTime)}`, 25, 86);
      doc.text(`Completion: ${overallPct}%`, 25, 94);
      doc.setFontSize(14);
      doc.text('Article 12 Clause Verification', 20, 110);
      doc.setFontSize(10);
      CLAUSE_NAMES.forEach((name, idx) => {
        const status = clauseStatuses[idx];
        const statusText = status === 'pass' ? 'COMPLIANT' : status === 'fail' ? 'NON-COMPLIANT' : 'PENDING';
        const y = 120 + idx * 8;
        doc.setTextColor(status === 'pass' ? 34 : status === 'fail' ? 239 : 150, status === 'pass' ? 197 : status === 'fail' ? 68 : 150, status === 'pass' ? 94 : status === 'fail' ? 68 : 150);
        doc.text(`${statusText}`, 25, y);
        doc.setTextColor(80, 80, 80);
        doc.text(`Clause ${idx + 1}: ${name}`, 55, y);
      });
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated by RASID Platform - ${new Date().toLocaleString('ar-SA-u-nu-latn')}`, 105, 285, { align: 'center' });
      doc.save(`rasid-report-${jobId}-${Date.now()}.pdf`);
      addLog('success', '✅ تم توليد تقرير PDF بنجاح');
    } catch {
      addLog('error', '❌ فشل في توليد تقرير PDF');
    }
    setIsGeneratingPdf(false);
  }, [jobId, jobName, total, completed, failed, elapsedTime, overallPct, clauseStatuses, addLog]);

  return (
    <div className={`fixed inset-0 z-[100] ${t.bg} ${lightTheme ? 'text-slate-900' : 'text-white'} overflow-hidden`} dir="rtl">
      {/* Matrix Rain Background */}
      {isRunning && <MatrixRain light={lightTheme} />}
      {showConfetti && <Confetti />}

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-[400px] h-[400px] ${lightTheme ? 'bg-emerald-200/20' : 'bg-blue-600/8'} rounded-full blur-[120px] animate-pulse-slow`} />
        <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] ${lightTheme ? 'bg-blue-200/20' : 'bg-emerald-600/8'} rounded-full blur-[120px] animate-pulse-slow`} style={{ animationDelay: '2s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(${lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        {/* Scan line */}
        {isRunning && !scanPaused && (
          <div className={`absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${lightTheme ? 'via-emerald-500/40' : 'via-cyan-400/60'} to-transparent animate-scan-line`} />
        )}
      </div>

      {/* ===== HEADER - Fixed ===== */}
      <div className={`relative z-10 ${t.border} border-b ${t.headerBg} backdrop-blur-xl`}>
        <div className="max-w-[1600px] mx-auto px-3 py-2 flex items-center justify-between">
          {/* Left: Logo + Info */}
          <div className="flex items-center gap-2.5">
            <img src={lightTheme ? LOGO_DARK : LOGO_GOLD} alt="راصد" className="h-8 w-auto animate-pulse-slow" />
            <div className="hidden sm:block">
              <h1 className={`text-xs font-bold ${lightTheme ? 'text-slate-800' : 'text-white/90'} flex items-center gap-1.5`}>
                محرك راصد للفحص المتقدم
                {isRunning && !scanPaused && <TypingDots />}
              </h1>
              <p className={`text-[10px] ${t.textMuted} truncate max-w-[160px]`}>{jobName}</p>
            </div>
          </div>

          {/* Center: Status badges */}
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            {isRunning && !scanPaused && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse-border">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-red-400 font-medium">مباشر</span>
              </div>
            )}
            {scanPaused && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Pause className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-medium">متوقف مؤقتاً</span>
              </div>
            )}
            {/* Speed */}
            {isRunning && processed > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 ${lightTheme ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'} border rounded-full`}>
                <Zap className="h-3 w-3 text-amber-500" />
                <span className={`text-[10px] font-mono ${lightTheme ? 'text-amber-700' : 'text-amber-300'}`}>{sitesPerSecond} موقع/ث</span>
              </div>
            )}
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 ${lightTheme ? 'bg-slate-100 border-slate-200' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10'} border rounded-full`}>
              <Activity className={`h-3 w-3 ${lightTheme ? 'text-slate-400' : 'text-white/50'}`} />
              <span className={`text-[10px] font-mono ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5">
            {/* Pause/Resume */}
            {isRunning && (
              <button onClick={scanPaused ? handleResume : handlePause}
                className={`p-1.5 rounded-lg border transition-all ${scanPaused
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : `${lightTheme ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} hover:opacity-80`
                }`}
                title={scanPaused ? 'استئناف' : 'إيقاف مؤقت'}>
                {scanPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}
            {/* Stop */}
            {isRunning && (
              <button onClick={handleCancel}
                className={`p-1.5 rounded-lg border transition-all ${lightTheme ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/10 border-red-500/30 text-red-400'} hover:opacity-80`}
                title="إيقاف نهائي">
                <Square className="h-3.5 w-3.5" />
              </button>
            )}
            {/* Sound */}
            <button onClick={() => { const m = !soundMuted; setSoundMuted(m); setMuted(m); }}
              className={`p-1.5 rounded-lg border transition-all ${soundMuted
                ? `${lightTheme ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10 text-white/30'}`
                : `${lightTheme ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`
              }`}
              title={soundMuted ? 'تفعيل الصوت' : 'كتم الصوت'}>
              {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            {/* Theme toggle */}
            <button onClick={() => setLightTheme(!lightTheme)}
              className={`p-1.5 rounded-lg border transition-all ${lightTheme ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10 text-white/50'}`}
              title={lightTheme ? 'الوضع الداكن' : 'الوضع الفاتح'}>
              {lightTheme ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
            {/* Console toggle */}
            <button onClick={() => setShowConsole(!showConsole)}
              className={`p-1.5 rounded-lg border transition-all ${showConsole
                ? `${lightTheme ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`
                : `${lightTheme ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10 text-white/50'}`
              }`}>
              <Terminal className="h-3.5 w-3.5" />
            </button>
            {/* Save results */}
            {isFinished && (
              <button onClick={() => { onClose(); setLocation("/scan-library"); }}
                className={`p-1.5 rounded-lg border transition-all ${lightTheme ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}
                title="عرض النتائج">
                <Save className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT - Flex no-scroll ===== */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-48px)]">
        {/* Patriotic Banner */}
        <div className="px-3 pt-2">
          <div className={`${lightTheme ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-200' : 'bg-gradient-to-r from-emerald-900/30 via-white/5 to-emerald-900/30 border-emerald-500/20'} border rounded-lg px-3 py-1.5 text-center relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <p className={`text-xs ${lightTheme ? 'text-emerald-700' : 'text-emerald-300/90'} font-medium-out`} key={patrioticIndex}>
              {PATRIOTIC_MESSAGES[patrioticIndex]}
            </p>
          </div>
        </div>

        {/* Progress Bar - Compact */}
        <div className="px-3 pt-2">
          <div className={`${t.card} border ${t.cardBorder} rounded-xl p-3 backdrop-blur-sm relative overflow-hidden`}>
            {!isFinished && overallPct > 0 && (
              <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-primary to-cyan-500 rounded-t-xl transition-all duration-1000" style={{ width: `${overallPct}%` }} />
            )}
            {scanComplete && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-t-xl animate-shimmer-bar" />}

            <div className="flex items-center gap-3">
              {/* Circular progress - smaller */}
              <div className="relative shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke={lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'} strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke={scanComplete ? '#22c55e' : scanFailed ? '#ef4444' : scanCancelled ? '#f59e0b' : 'url(#progressGrad)'}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${overallPct * 2.136} 213.6`}
                    className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold font-mono ${lightTheme ? 'text-slate-800' : 'bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent'}`}>{overallPct}%</span>
                </div>
              </div>

              {/* Status text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className={`text-sm font-bold ${lightTheme ? 'text-slate-800' : ''}`}>
                    {scanComplete ? '🎉 اكتمل الفحص!' : scanFailed ? '❌ فشل الفحص' : scanCancelled ? '⏹️ تم الإيقاف' : scanPaused ? '⏸️ متوقف مؤقتاً' : 'جاري الفحص...'}
                  </h2>
                  <div className="flex gap-2">
                    <span className={`text-xs font-mono ${lightTheme ? 'text-emerald-600' : 'text-emerald-400'}`}>{completed}✓</span>
                    <span className={`text-xs font-mono ${lightTheme ? 'text-red-600' : 'text-red-400'}`}>{failed}✗</span>
                    <span className={`text-xs font-mono ${t.textSub}`}>{processed}/{total}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className={`relative h-2 ${t.progressTrack} rounded-full overflow-hidden`}>
                  <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${overallPct}%`,
                      background: scanComplete ? 'linear-gradient(90deg, #22c55e, #10b981)'
                        : scanCancelled ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #06b6d4)',
                      backgroundSize: '200% 100%',
                    }} />
                  {isRunning && !scanPaused && overallPct > 0 && (
                    <div className="absolute inset-y-0 right-0 rounded-full animate-shimmer"
                      style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', backgroundSize: '200% 100%' }} />
                  )}
                  {isRunning && !scanPaused && overallPct > 2 && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/40 blur-sm transition-all duration-1000"
                      style={{ right: `calc(${100 - overallPct}% - 6px)` }} />
                  )}
                </div>
                {estimatedRemaining && isRunning && (
                  <p className={`text-[10px] ${t.textMuted} mt-0.5`}>الوقت المتبقي: ~{formatTime(estimatedRemaining)}</p>
                )}
              </div>

              {/* Character mascot */}
              <div className="hidden lg:block shrink-0">
                <img src={CHARACTER} alt="راصد" className={`h-12 w-12 rounded-full object-cover border-2 ${
                  scanComplete ? 'border-emerald-400 shadow-lg shadow-emerald-500/20' :
                  isRunning ? 'border-blue-400/50 animate-pulse-slow' :
                  'border-amber-400/50'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Fills remaining space */}
        <div className={`flex-1 min-h-0 px-3 pt-2 pb-2 grid gap-2 ${showConsole ? 'grid-cols-1 lg:grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}>
          {/* Left Column: Stages Panel with tabs */}
          <div className={`${t.card} border ${t.cardBorder} rounded-xl backdrop-blur-sm flex flex-col overflow-hidden`}>
            {/* Tab bar */}
            <div className={`flex items-center gap-1 px-3 py-1.5 border-b ${t.border} shrink-0`}>
              <button onClick={() => setActiveTab('stages')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeTab === 'stages'
                  ? `${lightTheme ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'} border`
                  : `${lightTheme ? 'text-slate-500 hover:bg-slate-50' : 'text-white/40 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5'}`
                }`}>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> المراحل ({stages.filter(s => s.status === 'completed').length}/8)</span>
              </button>
              <button onClick={() => setActiveTab('clauses')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeTab === 'clauses'
                  ? `${lightTheme ? 'bg-primary/5 text-primary border-primary/20' : 'bg-primary/15 text-primary border-primary/30'} border`
                  : `${lightTheme ? 'text-slate-500 hover:bg-slate-50' : 'text-white/40 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5'}`
                }`}>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> المادة 12 ({clauseStatuses.filter(s => s === 'pass' || s === 'fail').length}/8)</span>
              </button>
              {latestScreenshot && (
                <button onClick={() => setActiveTab('screenshot')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeTab === 'screenshot'
                    ? `${lightTheme ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'} border`
                    : `${lightTheme ? 'text-slate-500 hover:bg-slate-50' : 'text-white/40 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5'}`
                  }`}>
                  <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> لقطة</span>
                </button>
              )}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {/* Stages tab */}
              {activeTab === 'stages' && (
                <div className="space-y-1">
                  {stages.map((stage, idx) => (
                    <div key={stage.id}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 ${
                        stage.status === 'active' ? `${lightTheme ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'} border scale-[1.01]` :
                        stage.status === 'completed' ? `${lightTheme ? 'bg-emerald-50/50 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/10'} border` :
                        stage.status === 'error' ? `${lightTheme ? 'bg-red-50 border-red-200' : 'bg-red-500/5 border-red-500/10'} border` :
                        `${lightTheme ? 'bg-slate-50/50 border-transparent' : 'bg-white/[0.01] border-transparent'} border`
                      }`}>
                      <div className={`text-base w-6 text-center transition-all duration-300 ${
                        stage.status === 'active' ? 'scale-110' : stage.status === 'completed' ? '' : 'grayscale opacity-40'
                      }`}>{stage.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-[11px] font-medium ${
                              stage.status === 'active' ? `${lightTheme ? 'text-blue-700' : 'text-blue-300'}` :
                              stage.status === 'completed' ? `${lightTheme ? 'text-emerald-700' : 'text-emerald-300/80'}` :
                              `${lightTheme ? 'text-slate-300' : 'text-white/25'}`
                            }`}>{stage.name}</span>
                            {stage.status === 'active' && (
                              <span className={`text-[9px] ${lightTheme ? 'text-slate-400' : 'text-white/30'} block`}>{stage.nameEn}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {stage.status === 'active' && (
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] font-mono ${lightTheme ? 'text-blue-500' : 'text-blue-400/70'}`}>{stage.progress}%</span>
                                <Loader2 className={`h-3 w-3 ${lightTheme ? 'text-blue-500' : 'text-blue-400'} animate-spin`} />
                              </div>
                            )}
                            {stage.status === 'completed' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 animate-check-pop" />}
                            {stage.status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                            {stage.status === 'waiting' && <div className={`w-2.5 h-2.5 rounded-full border ${lightTheme ? 'border-slate-200' : 'border-[#C5A55A]/10 dark:border-white/10'}`} />}
                          </div>
                        </div>
                        {stage.status === 'active' && (
                          <div className={`mt-1 h-1 ${t.progressTrack} rounded-full overflow-hidden`}>
                            <div className="h-full rounded-full transition-all duration-500 relative"
                              style={{ width: `${stage.progress}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}>
                              <div className="absolute inset-0 animate-shimmer rounded-full"
                                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Clauses tab */}
              {activeTab === 'clauses' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className={`h-4 w-4 ${lightTheme ? 'text-primary' : 'text-primary'}`} />
                    <span className={`text-xs font-bold ${lightTheme ? 'text-slate-700' : 'text-white/80'}`}>التحقق من بنود المادة 12</span>
                  </div>
                  {CLAUSE_NAMES.map((name, idx) => (
                    <div key={idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-500 ${
                        clauseStatuses[idx] === 'checking' ? `${lightTheme ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'} border animate-pulse` :
                        clauseStatuses[idx] === 'pass' ? `${lightTheme ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'} border` :
                        clauseStatuses[idx] === 'fail' ? `${lightTheme ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/20'} border` :
                        `${lightTheme ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.02] border-[#C5A55A]/8 dark:border-white/5'} border`
                      }`}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {clauseStatuses[idx] === 'checking' && <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />}
                        {clauseStatuses[idx] === 'pass' && <CheckCircle className="h-4 w-4 text-emerald-500 animate-check-pop" />}
                        {clauseStatuses[idx] === 'fail' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {clauseStatuses[idx] === 'waiting' && <span className={`text-xs ${lightTheme ? 'text-slate-300' : 'text-white/20'}`}>{idx + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[11px] font-medium ${
                          clauseStatuses[idx] === 'waiting' ? `${lightTheme ? 'text-slate-300' : 'text-white/25'}` :
                          `${lightTheme ? 'text-slate-700' : 'text-white/70'}`
                        }`}>{name}</span>
                      </div>
                      {clauseStatuses[idx] !== 'waiting' && clauseStatuses[idx] !== 'checking' && (
                        <Badge variant="outline" className={`text-[9px] ${
                          clauseStatuses[idx] === 'pass' ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'
                        }`}>
                          {clauseStatuses[idx] === 'pass' ? 'ممتثل' : 'غير ممتثل'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Screenshot tab */}
              {activeTab === 'screenshot' && latestScreenshot && (
                <div className={`${screenshotReveal ? 'animate-screenshot-reveal' : 'animate-slide-up'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className={`h-4 w-4 ${lightTheme ? 'text-cyan-600' : 'text-cyan-400'}`} />
                    <span className={`text-xs font-bold ${lightTheme ? 'text-slate-700' : 'text-white/80'}`}>آخر لقطة شاشة</span>
                    <Badge variant="outline" className={`text-[9px] me-auto ${lightTheme ? 'border-cyan-300 text-cyan-600' : 'border-cyan-500/30 text-cyan-400'}`}>
                      {latestScreenshotDomain}
                    </Badge>
                  </div>
                  <div className={`relative rounded-xl overflow-hidden border ${t.border} group`}>
                    <img src={latestScreenshot} alt={latestScreenshotDomain}
                      className="w-full h-auto max-h-[40vh] object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                      <Globe className="h-3 w-3 text-cyan-400" />
                      <span className="text-[10px] text-white/80">{latestScreenshotDomain}</span>
                    </div>
                    {screenshotReveal && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 animate-fade-out-slow">
                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-4 py-2 backdrop-blur-sm">
                          <p className="text-sm text-emerald-300 font-bold">📸 تم اكتشاف صفحة الخصوصية!</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className={`absolute left-0 right-0 h-[1px] ${lightTheme ? 'bg-emerald-500/30' : 'bg-cyan-400/40'} animate-scan-line-fast`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Completion actions inside tab area */}
              {isFinished && activeTab === 'stages' && (
                <div className={`mt-3 p-4 rounded-xl border ${t.border} ${scanComplete ? `${lightTheme ? 'bg-emerald-50/50' : 'bg-emerald-500/5'}` : `${lightTheme ? 'bg-slate-50' : 'bg-white/[0.02]'}`}`}>
                  <div className="text-center mb-3">
                    {scanComplete && (
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-2 animate-bounce-slow relative">
                        <CheckCircle className="h-7 w-7 text-emerald-500" />
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping-slow" />
                      </div>
                    )}
                    {scanCancelled && (
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 mb-2">
                        <Square className="h-7 w-7 text-amber-500" />
                      </div>
                    )}
                    {scanFailed && (
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 mb-2">
                        <XCircle className="h-7 w-7 text-red-500" />
                      </div>
                    )}
                    <h3 className={`text-base font-bold ${lightTheme ? 'text-slate-800' : ''} mb-0.5`}>
                      {scanComplete ? 'تم الفحص بنجاح! 🎉' : scanCancelled ? 'تم إيقاف الفحص' : 'حدث خطأ'}
                    </h3>
                    <p className={`text-xs ${t.textSub}`}>
                      {completed + failed} موقع في {formatTime(elapsedTime)}
                    </p>
                    <div className="flex justify-center gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-500">{completed}</div>
                        <div className={`text-[9px] ${t.textMuted}`}>ناجح</div>
                      </div>
                      <div className={`w-px ${lightTheme ? 'bg-slate-200' : 'bg-[#C5A55A]/[0.05] dark:bg-white/10'}`} />
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-500">{failed}</div>
                        <div className={`text-[9px] ${t.textMuted}`}>فاشل</div>
                      </div>
                      <div className={`w-px ${lightTheme ? 'bg-slate-200' : 'bg-[#C5A55A]/[0.05] dark:bg-white/10'}`} />
                      <div className="text-center">
                        <div className={`text-lg font-bold ${lightTheme ? 'text-blue-600' : 'text-blue-400'}`}>{formatTime(elapsedTime)}</div>
                        <div className={`text-[9px] ${t.textMuted}`}>المدة</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Button size="sm" onClick={() => { onClose(); setLocation("/scan-library"); }}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
                      <Eye className="h-3.5 w-3.5" /> عرض النتائج
                    </Button>
                    {(scanComplete || scanCancelled) && (
                      <Button size="sm" onClick={handleGeneratePdf} disabled={isGeneratingPdf}
                        className="gap-1.5 bg-gradient-to-r from-primary to-[oklch(0.48_0.14_290)] hover:from-primary/90 hover:to-primary text-white text-xs h-8">
                        <Download className="h-3.5 w-3.5" /> {isGeneratingPdf ? 'جاري...' : 'PDF'}
                      </Button>
                    )}
                    {(scanComplete || scanCancelled) && (
                      <Button size="sm" onClick={() => { setIsGeneratingExcel(true); exportExcelMut.mutate({ jobId }); }} disabled={isGeneratingExcel}
                        className="gap-1.5 bg-gradient-to-r from-emerald-600 to-blue-900 hover:from-emerald-700 hover:to-blue-950 text-white text-xs h-8">
                        <FileSpreadsheet className="h-3.5 w-3.5" /> {isGeneratingExcel ? 'جاري...' : 'Excel'}
                      </Button>
                    )}
                    {(scanComplete || scanCancelled) && (
                      <Button size="sm" onClick={() => setShowShareDialog(true)}
                        className="gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs h-8">
                        <Share2 className="h-3.5 w-3.5" /> مشاركة
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={onNewScan}
                      className={`gap-1.5 text-xs h-8 ${lightTheme ? 'border-slate-300 text-slate-700' : 'border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10'}`}>
                      <RefreshCw className="h-3.5 w-3.5" /> فحص جديد
                    </Button>
                    <Button size="sm" variant="outline" onClick={onClose}
                      className={`gap-1.5 text-xs h-8 ${lightTheme ? 'border-slate-300 text-slate-700' : 'border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10'}`}>
                      <ArrowLeft className="h-3.5 w-3.5" /> إغلاق
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Console */}
          {showConsole && (
            <div className={`${t.consoleBg} border ${lightTheme ? 'border-slate-300' : 'border-[#C5A55A]/10 dark:border-white/10'} rounded-xl overflow-hidden backdrop-blur-sm flex flex-col shadow-2xl shadow-black/30`}>
              {/* Console Header */}
              <div className={`flex items-center justify-between px-3 py-1.5 ${t.consoleHeaderBg} border-b ${lightTheme ? 'border-slate-300' : 'border-[#C5A55A]/10 dark:border-white/10'} shrink-0`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-white/40 font-mono me-2">rasid-scanner@v3.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Wifi className="h-2.5 w-2.5 text-emerald-400" />
                    <span className="text-[9px] text-emerald-400/70">متصل</span>
                  </div>
                  <span className="text-[9px] text-white/20 font-mono">{consoleLogs.length} سطر</span>
                </div>
              </div>
              {/* Console Body */}
              <div ref={consoleRef}
                className="flex-1 overflow-y-auto p-2.5 font-mono text-[11px] space-y-0.5 custom-scrollbar"
                style={{ direction: 'ltr' }}>
                {consoleLogs.map(log => (
                  <div key={log.id} className={`flex gap-1.5 leading-relaxed ${log.typingComplete ? '' : 'animate-typewriter'}`}>
                    <span className="text-white/15 shrink-0 select-none text-[9px]">[{log.time}]</span>
                    <span className={`${
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-amber-400' :
                      log.type === 'system' ? 'text-cyan-400/70' :
                      log.type === 'stage' ? 'text-blue-400 font-bold' :
                      log.type === 'patriotic' ? 'text-emerald-300/80 italic' :
                      'text-white/60'
                    } ${log.typingComplete ? '' : 'animate-typing-text'}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {isRunning && !scanPaused && (
                  <div className="flex items-center gap-1 text-emerald-400/50 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$</span>
                    <span className="animate-blink text-emerald-400">▌</span>
                  </div>
                )}
                {scanPaused && (
                  <div className="flex items-center gap-1 text-amber-400/50 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$ [PAUSED]</span>
                    <span className="animate-blink text-amber-400">▌</span>
                  </div>
                )}
                {scanComplete && (
                  <div className="flex items-center gap-1 text-emerald-400/80 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$ scan completed successfully ✓</span>
                  </div>
                )}
                {scanCancelled && (
                  <div className="flex items-center gap-1 text-amber-400/80 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$ scan cancelled by user</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <Suspense fallback={null}>
          <ScanShareCard
            open={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            jobName={jobName}
            totalSites={total}
            completedSites={completed}
            failedSites={failed}
            elapsedTime={formatTime(elapsedTime)}
            overallPct={overallPct}
            clauseResults={CLAUSE_NAMES.map((name, idx) => ({
              name,
              status: clauseStatuses[idx] === 'pass' ? 'pass' as const : clauseStatuses[idx] === 'fail' ? 'fail' as const : 'waiting' as const,
            }))}
          />
        </Suspense>
      )}

      {/* ===== CSS ANIMATIONS ===== */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }

        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line { animation: scan-line 4s linear infinite; }

        @keyframes scan-line-fast {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line-fast { animation: scan-line-fast 2s linear infinite; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer { animation: shimmer 2s linear infinite; }

        @keyframes shimmer-bar {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer-bar { background-size: 200% 100%; animation: shimmer-bar 3s linear infinite; }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .{ animation: slide-up 0.4s ease-out; }

        @keyframes typewriter {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-typewriter { animation: typewriter 0.2s ease-out; }

        @keyframes typing-text {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        .animate-typing-text {
          animation: typing-text 0.4s ease-out forwards;
          background: linear-gradient(90deg, currentColor 50%, transparent 50%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
        }

        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(5px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
        .animate-fade-in-out { animation: fade-in-out 8s ease-in-out; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink { animation: blink 1s step-end infinite; }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

        @keyframes check-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-check-pop { animation: check-pop 0.4s ease-out; }

        @keyframes confetti-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          25% { transform: translate(calc(var(--speed-x) * 2), calc(var(--speed-y) * 8)) rotate(180deg); opacity: 1; }
          50% { transform: translate(calc(var(--speed-x) * 3), 200px) rotate(360deg); opacity: 0.8; }
          100% { transform: translate(calc(var(--speed-x) * 4), 600px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall { animation: confetti-fall 3s ease-out forwards; }

        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.2; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .animate-typing-dot { animation: typing-dot 1.4s ease-in-out infinite; }

        @keyframes screenshot-reveal {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          50% { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-screenshot-reveal { animation: screenshot-reveal 0.8s ease-out; }

        @keyframes fade-out-slow {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-out-slow { animation: fade-out-slow 2s ease-out forwards; }

        @keyframes pulse-border {
          0%, 100% { border-color: rgba(239, 68, 68, 0.2); }
          50% { border-color: rgba(239, 68, 68, 0.5); }
        }
        .animate-pulse-border { animation: pulse-border 2s ease-in-out infinite; }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }

        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

// ===== HELPERS =====
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
