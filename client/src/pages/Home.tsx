import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Shield, AlertTriangle, BarChart3, ArrowLeft, CheckCircle, Lock, Eye } from "lucide-react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/eAXbruiTdhpCTGaH.png";
const CHARACTER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/bplMgZcUFrzRMDas.png";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img src={LOGO_URL} alt="منصة راصد" className="h-9" />
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => setLocation("/app/overview")}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                الدخول للمنصة
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => { window.location.href = getLoginUrl(); }}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              <span className="text-gold">منصة راصد</span>
              <br />
              <span className="text-foreground">الوطنية</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed">
              المنصة الوطنية الموحدة لرصد امتثال المواقع الإلكترونية لنظام حماية البيانات الشخصية
              ومتابعة وقائع تسرب البيانات الشخصية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <Button
                  size="lg"
                  onClick={() => setLocation("/app/overview")}
                  className="bg-gold text-gold-foreground hover:bg-gold/90 text-lg px-8 shadow-lg shadow-gold/20"
                >
                  الدخول للمنصة
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => { window.location.href = getLoginUrl(); }}
                  className="bg-gold text-gold-foreground hover:bg-gold/90 text-lg px-8 shadow-lg shadow-gold/20"
                >
                  تسجيل الدخول
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/verify")}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                التحقق من وثيقة
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <img
              src={CHARACTER_URL}
              alt="شخصية راصد"
              className="h-64 md:h-80 lg:h-96 w-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">مساحات العمل</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            منصة متكاملة تجمع بين رصد الامتثال ومتابعة وقائع تسرب البيانات الشخصية في مكان واحد
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "الخصوصية",
                description: "رصد امتثال المواقع الإلكترونية لسياسات الخصوصية ونظام حماية البيانات الشخصية",
                color: "text-emerald-400",
                bgColor: "bg-emerald-400/10",
              },
              {
                icon: AlertTriangle,
                title: "التسربات",
                description: "متابعة وقائع تسرب البيانات الشخصية وتقييم الأثر وإدارة الاستجابة",
                color: "text-orange-400",
                bgColor: "bg-orange-400/10",
              },
              {
                icon: CheckCircle,
                title: "المتابعات",
                description: "نظام متابعة شامل مع اعتمادات وإشعارات لضمان الامتثال المستمر",
                color: "text-blue-400",
                bgColor: "bg-blue-400/10",
              },
              {
                icon: BarChart3,
                title: "لوحتي",
                description: "لوحة مؤشرات مخصصة بالسحب والإفلات لبناء تقاريرك الخاصة",
                color: "text-purple-400",
                bgColor: "bg-purple-400/10",
              },
              {
                icon: Eye,
                title: "التقارير",
                description: "تقارير تفصيلية وتحليلية مع إمكانية التصدير بصيغ متعددة",
                color: "text-gold",
                bgColor: "bg-gold/10",
              },
              {
                icon: Lock,
                title: "الإدارة",
                description: "تحكم كامل في المستخدمين والصلاحيات والإعدادات والقوائم",
                color: "text-red-400",
                bgColor: "bg-red-400/10",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 hover:border-gold/30 transition-all">
                <div className={`p-3 rounded-lg ${feature.bgColor} w-fit mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={LOGO_URL} alt="منصة راصد" className="h-7" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} منصة راصد الوطنية — الهيئة الوطنية للبيانات والذكاء الاصطناعي (ندمو)
          </p>
        </div>
      </footer>
    </div>
  );
}
