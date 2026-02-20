import { useParams, useSearch } from "wouter";
import ScanExecutionScreen from "@/components/ScanExecutionScreen";
import { useMemo } from "react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

/**
 * Standalone page for scan execution - opens in a popup window.
 * Reads job parameters from URL search params.
 * Route: /scan-execution/:jobId
 */
export default function ScanExecution() {
  const { playClick, playHover } = useSoundEffects();
  const params = useParams<{ jobId: string }>();
  const searchString = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const jobId = parseInt(params.jobId || "0", 10);
  const totalUrls = parseInt(searchParams.get("totalUrls") || "0", 10);
  const jobName = searchParams.get("jobName") || "فحص متقدم";

  // Parse options from URL
  const options = useMemo(() => ({
    deepScan: searchParams.get("deepScan") === "1",
    parallelScan: searchParams.get("parallelScan") !== "0",
    captureScreenshots: searchParams.get("captureScreenshots") !== "0",
    extractText: searchParams.get("extractText") !== "0",
    scanApps: searchParams.get("scanApps") === "1",
    bypassDynamic: searchParams.get("bypassDynamic") === "1",
    scanDepth: parseInt(searchParams.get("scanDepth") || "1", 10),
    timeout: parseInt(searchParams.get("timeout") || "30", 10),
  }), [searchParams]);

  const handleClose = () => {
    // If opened as popup, close the window
    if (window.opener) {
      window.close();
    } else {
      // Fallback: navigate to advanced scan
      window.location.href = "/advanced-scan";
    }
  };

  const handleNewScan = () => {
    if (window.opener) {
      // Focus the parent window and navigate it to advanced scan
      window.opener.focus();
      window.close();
    } else {
      window.location.href = "/advanced-scan";
    }
  };

  if (!jobId) {
    return (
    <div className="overflow-x-hidden max-w-full fixed inset-0 bg-[#0a0e1a] flex items-center justify-center text-white" dir="rtl">
        <div className="text-center">
          <p className="text-xl mb-4">⚠️ لم يتم العثور على معرف الفحص</p>
          <button onClick={handleClose} className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <ScanExecutionScreen
      jobId={jobId}
      totalUrls={totalUrls}
      jobName={jobName}
      options={options}
      onClose={handleClose}
      onNewScan={handleNewScan}
    />
  );
}
