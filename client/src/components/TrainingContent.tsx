/**
 * TrainingContent — Interactive training and learning content component.
 * Provides step-by-step tutorials, tips, and contextual help for the platform.
 */
import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TrainingStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  videoUrl?: string;
  imageUrl?: string;
  tips?: string[];
  completed?: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  steps: TrainingStep[];
}

interface TrainingContentProps {
  modules: TrainingModule[];
  className?: string;
  onStepComplete?: (moduleId: string, stepId: string) => void;
  onModuleComplete?: (moduleId: string) => void;
}

const DIFFICULTY_CONFIG = {
  beginner: { label: "مبتدئ", color: "#10b981", icon: "🟢" },
  intermediate: { label: "متوسط", color: "#f59e0b", icon: "🟡" },
  advanced: { label: "متقدم", color: "#ef4444", icon: "🔴" },
};

export function TrainingContent({
  modules,
  className,
  onStepComplete,
  onModuleComplete,
}: TrainingContentProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    () => {
      try {
        const saved = localStorage.getItem("rasid-training-progress");
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch { return new Set(); }
    }
  );

  const saveProgress = useCallback((steps: Set<string>) => {
    try {
      localStorage.setItem("rasid-training-progress", JSON.stringify([...steps]));
    } catch {}
  }, []);

  const markStepComplete = useCallback((moduleId: string, stepId: string) => {
    const key = `${moduleId}:${stepId}`;
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(key);
      saveProgress(next);
      return next;
    });
    onStepComplete?.(moduleId, stepId);

    // Check if module is complete
    const module = modules.find((m) => m.id === moduleId);
    if (module) {
      const allComplete = module.steps.every(
        (s) => completedSteps.has(`${moduleId}:${s.id}`) || s.id === stepId
      );
      if (allComplete) onModuleComplete?.(moduleId);
    }
  }, [modules, completedSteps, onStepComplete, onModuleComplete, saveProgress]);

  const getModuleProgress = useCallback(
    (module: TrainingModule) => {
      const completed = module.steps.filter((s) =>
        completedSteps.has(`${module.id}:${s.id}`)
      ).length;
      return { completed, total: module.steps.length, percentage: Math.round((completed / module.steps.length) * 100) };
    },
    [completedSteps]
  );

  const currentModule = modules.find((m) => m.id === activeModule);
  const currentStep = currentModule?.steps[activeStep];

  if (currentModule && currentStep) {
    // Step view
    const progress = getModuleProgress(currentModule);
    const isCompleted = completedSteps.has(`${currentModule.id}:${currentStep.id}`);

    return (
      <div className={cn("rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)} dir="rtl">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={() => { setActiveModule(null); setActiveStep(0); }}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            → العودة للقائمة
          </button>
          <div className="text-sm text-white/60">
            {activeStep + 1} / {currentModule.steps.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-white/90 mb-2">{currentStep.title}</h2>
          <p className="text-white/60 mb-6 leading-relaxed">{currentStep.description}</p>

          {/* Image */}
          {currentStep.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-white/5">
              <img src={currentStep.imageUrl} alt={currentStep.title} className="w-full" />
            </div>
          )}

          {/* Video */}
          {currentStep.videoUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-white/5 aspect-video bg-black">
              <video src={currentStep.videoUrl} controls className="w-full h-full" />
            </div>
          )}

          {/* Tips */}
          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <h4 className="text-sm font-bold text-cyan-400 mb-2">💡 نصائح</h4>
              <ul className="space-y-1">
                {currentStep.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-white/60 flex gap-2">
                    <span className="text-cyan-400/60">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="px-4 py-2 rounded-lg text-sm bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              ← السابق
            </button>

            <button
              onClick={() => {
                markStepComplete(currentModule.id, currentStep.id);
                if (activeStep < currentModule.steps.length - 1) {
                  setActiveStep(activeStep + 1);
                }
              }}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                isCompleted
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
              )}
            >
              {isCompleted ? "✓ مكتمل" : activeStep < currentModule.steps.length - 1 ? "التالي →" : "إنهاء ✓"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Module list view
  return (
    <div className={cn("rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)} dir="rtl">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-bold text-white/90">📚 مركز التدريب</h2>
        <p className="text-sm text-white/40 mt-1">تعلم كيفية استخدام منصة راصد الذكي</p>
      </div>

      <div className="p-4 space-y-3">
        {modules.map((module) => {
          const progress = getModuleProgress(module);
          const diff = DIFFICULTY_CONFIG[module.difficulty];

          return (
            <div
              key={module.id}
              onClick={() => { setActiveModule(module.id); setActiveStep(0); }}
              className="p-4 rounded-lg border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white/90 group-hover:text-cyan-400 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">{module.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diff.color}15`, color: diff.color }}>
                      {diff.icon} {diff.label}
                    </span>
                    <span className="text-xs text-white/30">⏱ {module.estimatedMinutes} دقيقة</span>
                    <span className="text-xs text-white/30">{module.steps.length} خطوات</span>
                  </div>
                </div>
                <div className="text-left mr-4">
                  <div className="text-lg font-bold" style={{ color: progress.percentage === 100 ? "#10b981" : "#06b6d4" }}>
                    {progress.percentage}%
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.percentage}%`,
                    backgroundColor: progress.percentage === 100 ? "#10b981" : "#06b6d4",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrainingContent;
