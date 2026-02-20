/**
 * Home — الصفحة الرئيسية
 * تركز على ما بعد الرصد (منصة التسريبات) وعرض الامتثال (منصة الخصوصية)
 */
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() => import("./Dashboard"));
const LeadershipDashboard = lazy(() => import("./LeadershipDashboard"));

export default function Home() {
  const workspace = localStorage.getItem("rasid_workspace") || "leaks";

  if (workspace === "privacy") {
    return (
      <div className="overflow-x-hidden max-w-full">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">جاري تحميل لوحة الخصوصية...</span>
          </div>
        }>
          <LeadershipDashboard />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden max-w-full">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">جاري تحميل لوحة المؤشرات...</span>
        </div>
      }>
        <Dashboard />
      </Suspense>
    </div>
  );
}
