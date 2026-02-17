/**
 * Smart Recommendations Display Component
 * عرض التوصيات الذكية من محرك التوصيات
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertCircle, HelpCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Recommendation {
  id: string;
  type: 'analysis' | 'action' | 'question' | 'relationship' | 'alert';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    type: string;
    params: Record<string, any>;
  };
}

export interface SmartRecommendationsProps {
  recommendations: Recommendation[];
  onSelectRecommendation?: (rec: Recommendation) => void;
  className?: string;
  maxDisplay?: number;
}

export function SmartRecommendations({
  recommendations,
  onSelectRecommendation,
  className,
  maxDisplay = 3,
}: SmartRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const displayedRecs = recommendations.slice(0, maxDisplay);

  const typeConfig = {
    analysis: {
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'تحليل',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    action: {
      icon: <Lightbulb className="h-4 w-4" />,
      label: 'إجراء',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    question: {
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'سؤال',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    relationship: {
      icon: <Link2 className="h-4 w-4" />,
      label: 'علاقة',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    alert: {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'تنبيه',
      color: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
  };

  const priorityConfig = {
    low: { variant: 'outline' as const, color: 'text-gray-500' },
    medium: { variant: 'secondary' as const, color: 'text-amber-500' },
    high: { variant: 'default' as const, color: 'text-orange-500' },
    critical: { variant: 'destructive' as const, color: 'text-red-500' },
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span>توصيات ذكية</span>
        {recommendations.length > maxDisplay && (
          <Badge variant="secondary" className="text-xs">
            +{recommendations.length - maxDisplay}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {displayedRecs.map((rec) => {
          const typeInfo = typeConfig[rec.type];
          const priorityInfo = priorityConfig[rec.priority];

          return (
            <Card
              key={rec.id}
              className={cn(
                'p-3 hover:shadow-md transition-shadow cursor-pointer',
                typeInfo.color
              )}
              onClick={() => onSelectRecommendation?.(rec)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {typeInfo.icon}
                    <h4 className="text-sm font-semibold leading-tight">
                      {rec.title}
                    </h4>
                  </div>
                  <Badge variant={priorityInfo.variant} className="text-xs shrink-0">
                    {rec.priority === 'low' && 'عادي'}
                    {rec.priority === 'medium' && 'متوسط'}
                    {rec.priority === 'high' && 'مهم'}
                    {rec.priority === 'critical' && 'حرج'}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>الثقة:</span>
                      <span className="font-medium">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {rec.action && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecommendation?.(rec);
                      }}
                    >
                      تطبيق
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Suggested Questions Component
 * عرض الأسئلة المقترحة
 */
export interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion?: (question: string) => void;
  className?: string;
  maxDisplay?: number;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
  className,
  maxDisplay = 4,
}: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  const displayedQuestions = questions.slice(0, maxDisplay);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <HelpCircle className="h-4 w-4" />
        <span>أسئلة مقترحة</span>
      </div>

      <div className="grid gap-2">
        {displayedQuestions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="justify-start text-right h-auto p-3 hover:bg-accent"
            onClick={() => onSelectQuestion?.(question)}
          >
            <span className="text-sm leading-relaxed">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
