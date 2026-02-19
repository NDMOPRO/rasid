import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() => import("./Dashboard"));

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">جاري تحميل لوحة المؤشرات...</span>
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}
