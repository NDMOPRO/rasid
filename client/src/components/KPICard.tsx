import { ReactNode } from 'react';
import RasidCard from './RasidCard';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
      {/* Header row: icon + change badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        {/* Metallic icon container — 3D beveled */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(170deg, rgba(55,72,108,.85), rgba(38,52,82,.92))',
          borderWidth: 3,
          borderStyle: 'solid',
          borderColor: 'var(--accent-border)',
          borderTopColor: 'rgba(160,185,235,.42)',
          borderBottomColor: 'rgba(10,16,32,.60)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-text)',
          boxShadow: `
            0 4px 10px rgba(0,0,0,.40),
            inset 0 2px 0 rgba(180,200,240,.25),
            inset 0 -2px 0 rgba(3,6,15,.55),
            inset 2px 0 0 rgba(160,185,230,.15),
            inset -2px 0 0 rgba(3,6,15,.40)
          `,
        }}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`kpi-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}`}>
            {change > 0 ? <TrendingUp size={11} /> : change < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
            {change !== 0 ? `${Math.abs(change)}%` : '—'}
          </span>
        )}
      </div>

      {/* Number */}
      <div className="kpi-number">
        {animatedValue.toLocaleString('ar-SA')}{suffix && <span style={{ fontSize: '0.65em', opacity: 0.7, marginRight: 2 }}>{suffix}</span>}
      </div>

      {/* Label */}
      <div className="kpi-label">{title}</div>
    </RasidCard>
  );
}
