/**
 * Performance Metrics Display Component
 * عرض مؤشرات الأداء لردود راصد الذكي
 */

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Database, Zap, TrendingUp, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerformanceMetricsData {
  responseTimeMs: number;
  responseSource: 'ai' | 'fallback' | 'cache';
  incidentsAnalyzed: number;
  confidenceScore: number;
  toolsUsed: string[];
  cacheHit?: boolean;
  fallbackUsed?: boolean;
}

export interface PerformanceMetricsDisplayProps {
  metrics: PerformanceMetricsData;
  className?: string;
  compact?: boolean;
}

export function PerformanceMetricsDisplay({
  metrics,
  className,
  compact = false,
}: PerformanceMetricsDisplayProps) {
  const {
    responseTimeMs,
    responseSource,
    incidentsAnalyzed,
    confidenceScore,
    toolsUsed,
  } = metrics;

  // Format response time
  const formattedTime =
    responseTimeMs < 1000
      ? `${responseTimeMs}ms`
      : `${(responseTimeMs / 1000).toFixed(2)}s`;

  // Source badge config
  const sourceConfig = {
    ai: {
      icon: <Sparkles className="h-3 w-3" />,
      label: 'الذكاء الاصطناعي',
      variant: 'default' as const,
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    cache: {
      icon: <Zap className="h-3 w-3" />,
      label: 'التخزين المؤقت',
      variant: 'secondary' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    fallback: {
      icon: <Shield className="h-3 w-3" />,
      label: 'النظام الاحتياطي',
      variant: 'outline' as const,
      className: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
  };

  const source = sourceConfig[responseSource];

  // Confidence color
  const confidenceColor =
    confidenceScore >= 80
      ? 'text-green-600 dark:text-green-400'
      : confidenceScore >= 60
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          {source.icon}
          <span>{source.label}</span>
        </div>
        {confidenceScore > 0 && (
          <div className={cn('flex items-center gap-1 font-medium', confidenceColor)}>
            <TrendingUp className="h-3 w-3" />
            <span>{confidenceScore}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('p-3 bg-muted/30 border-muted', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">مؤشرات الأداء</h4>
          <Badge className={source.className}>
            <span className="flex items-center gap-1">
              {source.icon}
              {source.label}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {/* Response Time */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">وقت الاستجابة</div>
              <div className="font-medium">{formattedTime}</div>
            </div>
          </div>

          {/* Confidence Score */}
          {confidenceScore > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">مستوى الثقة</div>
                <div className={cn('font-medium', confidenceColor)}>
                  {confidenceScore}%
                </div>
              </div>
            </div>
          )}

          {/* Incidents Analyzed */}
          {incidentsAnalyzed > 0 && (
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">الحوادث المحللة</div>
                <div className="font-medium">{incidentsAnalyzed}</div>
              </div>
            </div>
          )}

          {/* Tools Used */}
          {toolsUsed && toolsUsed.length > 0 && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">الأدوات المستخدمة</div>
                <div className="font-medium">{toolsUsed.length}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tools detail */}
        {toolsUsed && toolsUsed.length > 0 && (
          <div className="pt-2 border-t border-muted">
            <div className="flex flex-wrap gap-1">
              {toolsUsed.map((tool, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Import this icon properly
import { Sparkles } from "lucide-react";
