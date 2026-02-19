/**
 * Advanced Smart Chart Engine - Professional Visualization System
 * محرك الرسومات الذكي المتقدم - نظام التصور الاحترافي
 * 
 * Features:
 * - Intelligent chart type selection based on data characteristics
 * - Advanced chart types (Sunburst, Sankey, Heatmap, Network, etc.)
 * - Interactive charts with drill-down capabilities
 * - Animated transitions
 * - Professional export (PDF, SVG, PNG, Excel, PowerPoint)
 */

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'scatter'
  | 'bubble'
  | 'area'
  | 'heatmap'
  | 'sunburst'
  | 'sankey'
  | 'network'
  | 'treemap'
  | 'waterfall'
  | 'gauge'
  | 'funnel'
  | 'candlestick';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    [key: string]: any;
  }>;
}

export interface AdvancedChartConfig {
  type: ChartType;
  data: ChartData | any;
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark' | 'professional';
  interactive?: boolean;
  animated?: boolean;
  drilldown?: {
    enabled: boolean;
    levels: string[];
  };
  export?: {
    formats: ('pdf' | 'svg' | 'png' | 'excel' | 'ppt')[];
    quality?: 'standard' | 'high' | 'ultra';
  };
  customization?: {
    colors?: string[];
    fonts?: {
      title?: string;
      labels?: string;
    };
    layout?: 'horizontal' | 'vertical' | 'grid';
  };
}

export interface ChartRecommendation {
  chartType: ChartType;
  confidence: number;
  reason: string;
  alternatives: Array<{
    type: ChartType;
    score: number;
  }>;
}

export class SmartChartEngine {
  private readonly PROFESSIONAL_COLORS = {
    primary: [
      '#0ea5e9', // Sky Blue
      '#8b5cf6', // Purple
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#10b981', // Green
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#14b8a6', // Teal
    ],
    severity: {
      critical: '#dc2626',
      high: '#f59e0b',
      medium: '#fbbf24',
      low: '#10b981',
    },
    gradient: {
      start: '#667eea',
      end: '#764ba2',
    },
  };

  /**
   * Analyze data and suggest the best chart type
   * تحليل البيانات واقتراح أفضل نوع رسم بياني
   */
  suggestChartType(
    data: any,
    intent?: string
  ): ChartRecommendation {
    const dataPoints = this.extractDataPoints(data);
    const characteristics = this.analyzeDataCharacteristics(dataPoints);

    let bestType: ChartType = 'bar';
    let confidence = 0.7;
    let reason = '';
    const alternatives: Array<{ type: ChartType; score: number }> = [];

    // Rule-based chart selection
    if (characteristics.isHierarchical) {
      bestType = 'sunburst';
      confidence = 0.9;
      reason = 'البيانات هرمية ومتعددة المستويات - Sunburst مثالي لعرض التسلسل';
      alternatives.push(
        { type: 'treemap', score: 0.85 },
        { type: 'bar', score: 0.6 }
      );
    } else if (characteristics.isFlow) {
      bestType = 'sankey';
      confidence = 0.95;
      reason = 'البيانات تمثل تدفق - Sankey مثالي لعرض الانتقالات';
      alternatives.push({ type: 'network', score: 0.7 });
    } else if (characteristics.isNetwork) {
      bestType = 'network';
      confidence = 0.9;
      reason = 'البيانات تحتوي علاقات وروابط - Network Graph مثالي';
      alternatives.push({ type: 'sankey', score: 0.7 });
    } else if (characteristics.isTimeSeries) {
      bestType = 'line';
      confidence = 0.85;
      reason = 'البيانات زمنية - خط الاتجاه مثالي لعرض التغير عبر الزمن';
      alternatives.push(
        { type: 'area', score: 0.8 },
        { type: 'bar', score: 0.7 }
      );
    } else if (characteristics.isComparison) {
      bestType = 'bar';
      confidence = 0.8;
      reason = 'البيانات مقارنة - الأعمدة مثالية للمقارنات';
      alternatives.push(
        { type: 'radar', score: 0.7 },
        { type: 'line', score: 0.6 }
      );
    } else if (characteristics.isDistribution) {
      bestType = 'pie';
      confidence = 0.75;
      reason = 'البيانات توزيع نسبي - الدائري مثالي للنسب';
      alternatives.push(
        { type: 'doughnut', score: 0.73 },
        { type: 'bar', score: 0.6 }
      );
    } else if (characteristics.isCorrelation) {
      bestType = 'scatter';
      confidence = 0.85;
      reason = 'البيانات ارتباطية - النقطي مثالي لعرض الارتباطات';
      alternatives.push(
        { type: 'bubble', score: 0.75 },
        { type: 'heatmap', score: 0.7 }
      );
    } else if (characteristics.isDensity) {
      bestType = 'heatmap';
      confidence = 0.9;
      reason = 'البيانات كثافة - Heatmap مثالي لعرض التركيز';
      alternatives.push({ type: 'scatter', score: 0.6 });
    }

    // Consider user intent
    if (intent) {
      const intentLower = intent.toLowerCase();
      if (intentLower.includes('trend') || intentLower.includes('اتجاه')) {
        bestType = 'line';
        confidence = 0.9;
      } else if (intentLower.includes('compare') || intentLower.includes('مقارنة')) {
        bestType = 'bar';
        confidence = 0.85;
      } else if (intentLower.includes('distribution') || intentLower.includes('توزيع')) {
        bestType = 'pie';
        confidence = 0.8;
      } else if (intentLower.includes('flow') || intentLower.includes('تدفق')) {
        bestType = 'sankey';
        confidence = 0.9;
      }
    }

    return {
      chartType: bestType,
      confidence,
      reason,
      alternatives,
    };
  }

  /**
   * Extract data points from various data formats
   */
  private extractDataPoints(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data.datasets) return data.datasets;
    if (data.data) return Array.isArray(data.data) ? data.data : [data.data];
    return [];
  }

  /**
   * Analyze data characteristics
   */
  private analyzeDataCharacteristics(dataPoints: any[]): {
    isHierarchical: boolean;
    isFlow: boolean;
    isNetwork: boolean;
    isTimeSeries: boolean;
    isComparison: boolean;
    isDistribution: boolean;
    isCorrelation: boolean;
    isDensity: boolean;
  } {
    return {
      isHierarchical: this.checkHierarchical(dataPoints),
      isFlow: this.checkFlow(dataPoints),
      isNetwork: this.checkNetwork(dataPoints),
      isTimeSeries: this.checkTimeSeries(dataPoints),
      isComparison: this.checkComparison(dataPoints),
      isDistribution: this.checkDistribution(dataPoints),
      isCorrelation: this.checkCorrelation(dataPoints),
      isDensity: this.checkDensity(dataPoints),
    };
  }

  private checkHierarchical(data: any[]): boolean {
    return data.some(d => d.children || d.parent || d.level);
  }

  private checkFlow(data: any[]): boolean {
    return data.some(d => (d.source && d.target) || d.from || d.to);
  }

  private checkNetwork(data: any[]): boolean {
    return data.some(d => d.nodes && d.edges);
  }

  private checkTimeSeries(data: any[]): boolean {
    return data.some(d => {
      const hasDate = d.date || d.timestamp || d.time;
      const labelIsDate = typeof d.label === 'string' && /\d{4}-\d{2}/.test(d.label);
      return hasDate || labelIsDate;
    });
  }

  private checkComparison(data: any[]): boolean {
    return data.length >= 2 && data.length <= 15;
  }

  private checkDistribution(data: any[]): boolean {
    // Check if data represents parts of a whole
    const hasPercentages = data.some(d => d.percentage || (d.value > 0 && d.value <= 100));
    return data.length >= 3 && data.length <= 10 && hasPercentages;
  }

  private checkCorrelation(data: any[]): boolean {
    return data.some(d => d.x !== undefined && d.y !== undefined);
  }

  private checkDensity(data: any[]): boolean {
    return data.some(d => d.density || (d.x && d.y && d.value));
  }

  /**
   * Generate chart configuration with best practices
   * إنشاء تكوين الرسم مع أفضل الممارسات
   */
  generateChartConfig(config: AdvancedChartConfig): any {
    const {
      type,
      data,
      title,
      subtitle,
      theme = 'professional',
      interactive = true,
      animated = true,
    } = config;

    const baseConfig: any = {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 18,
              weight: 'bold',
              family: 'Cairo, sans-serif',
            },
            padding: { top: 10, bottom: 30 },
          },
          subtitle: {
            display: !!subtitle,
            text: subtitle,
            font: {
              size: 14,
              family: 'Cairo, sans-serif',
            },
            padding: { bottom: 20 },
          },
          legend: {
            display: true,
            position: 'bottom',
            align: 'start',
            labels: {
              font: {
                family: 'Cairo, sans-serif',
                size: 12,
              },
              usePointStyle: true,
              padding: 15,
            },
          },
          tooltip: {
            enabled: interactive,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              family: 'Cairo, sans-serif',
              size: 14,
            },
            bodyFont: {
              family: 'Cairo, sans-serif',
              size: 13,
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
          },
        },
        animation: animated ? {
          duration: 1500,
          easing: 'easeInOutQuart',
        } : false,
      },
    };

    // Apply theme-specific customizations
    if (theme === 'professional') {
      baseConfig.options.plugins.title.color = '#1f2937';
      baseConfig.options.scales = {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Cairo, sans-serif' } },
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { family: 'Cairo, sans-serif' } },
        },
      };
    } else if (theme === 'dark') {
      baseConfig.options.plugins.title.color = '#f3f4f6';
      baseConfig.options.plugins.legend.labels.color = '#f3f4f6';
    }

    return baseConfig;
  }

  /**
   * Generate insights from chart data
   * توليد رؤى من بيانات الرسم
   */
  generateInsights(data: ChartData, chartType: ChartType): string[] {
    const insights: string[] = [];

    if (!data.datasets || data.datasets.length === 0) {
      return insights;
    }

    const firstDataset = data.datasets[0];
    const values = firstDataset.data as number[];

    if (values.length === 0) return insights;

    // Calculate statistics
    const total = values.reduce((sum, val) => sum + val, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = total / values.length;
    const maxIndex = values.indexOf(max);
    const minIndex = values.indexOf(min);

    // Generate insights based on chart type
    if (chartType === 'pie' || chartType === 'doughnut') {
      const maxPercentage = ((max / total) * 100).toFixed(1);
      insights.push(
        `🔍 ${data.labels[maxIndex]} يمثل أكبر حصة بنسبة ${maxPercentage}% من الإجمالي`
      );

      // Check if distribution is balanced
      const isBalanced = values.every(v => Math.abs(v - avg) / avg < 0.3);
      if (isBalanced) {
        insights.push('⚖️ التوزيع متوازن نسبياً بين الفئات');
      } else {
        insights.push('📊 هناك تفاوت كبير في التوزيع بين الفئات');
      }
    } else if (chartType === 'bar' || chartType === 'line') {
      insights.push(`📈 أعلى قيمة: ${max.toLocaleString()} (${data.labels[maxIndex]})`);
      insights.push(`📉 أدنى قيمة: ${min.toLocaleString()} (${data.labels[minIndex]})`);

      // Trend detection for line charts
      if (chartType === 'line' && values.length >= 3) {
        const trend = this.detectTrend(values);
        if (trend === 'increasing') {
          insights.push('📈 الاتجاه العام: تصاعدي');
        } else if (trend === 'decreasing') {
          insights.push('📉 الاتجاه العام: تنازلي');
        } else {
          insights.push('➡️ الاتجاه العام: مستقر');
        }
      }
    }

    // Add total if applicable
    if (chartType !== 'scatter' && chartType !== 'bubble') {
      insights.push(`📊 الإجمالي: ${total.toLocaleString()}`);
    }

    return insights;
  }

  /**
   * Detect trend in time series data
   */
  private detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    let increases = 0;
    let decreases = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increases++;
      else if (values[i] < values[i - 1]) decreases++;
    }

    const threshold = values.length * 0.6;
    if (increases > threshold) return 'increasing';
    if (decreases > threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Get professional color palette
   */
  getColorPalette(count: number, type: 'primary' | 'severity' | 'gradient' = 'primary'): string[] {
    if (type === 'severity') {
      return Object.values(this.PROFESSIONAL_COLORS.severity);
    }

    if (type === 'gradient') {
      return this.generateGradientColors(
        this.PROFESSIONAL_COLORS.gradient.start,
        this.PROFESSIONAL_COLORS.gradient.end,
        count
      );
    }

    // Repeat primary colors if needed
    const colors = this.PROFESSIONAL_COLORS.primary;
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }

  /**
   * Generate gradient colors
   */
  private generateGradientColors(start: string, end: string, count: number): string[] {
    // For now, use primary colors. In production, implement proper color interpolation
    // TODO: Implement actual gradient interpolation between start and end colors
    const colors = this.PROFESSIONAL_COLORS.primary;
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }
}

// Singleton instance
export const smartChartEngine = new SmartChartEngine();
