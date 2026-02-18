import { ReactNode } from 'react';
import RasidCard from './RasidCard';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  change?: number;
  icon: ReactNode;
  watermarkIcon?: ReactNode;
  delay?: number;
}

export default function KPICard({ title, value, suffix = '', change, icon, watermarkIcon, delay = 0 }: KPICardProps) {
  const animatedValue = useAnimatedNumber(value);

  return (
    <RasidCard watermarkIcon={watermarkIcon} delay={delay}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2" style={{ color: 'var(--accent-text)' }}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`kpi-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="kpi-number">
        {animatedValue.toLocaleString('ar-SA')}{suffix}
      </div>
      <div className="kpi-label">{title}</div>
    </RasidCard>
  );
}
