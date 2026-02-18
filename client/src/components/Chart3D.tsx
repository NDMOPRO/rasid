import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Skin } from '@/hooks/useSkin';

interface Chart3DProps {
  data: { name: string; value: number }[];
  title?: string;
  skin: Skin;
}

const goldColors = ['#D4AF37', '#C5A028', '#E8C84A', '#A68516', '#FFD700', '#B8941F', '#D4AF37'];
const silverColors = ['#B8C8DC', '#9EB4CE', '#D0DCE8', '#8AA4BE', '#C0D0E2', '#A8BCCE', '#B8C8DC'];

export default function Chart3D({ data, title, skin }: Chart3DProps) {
  const colors = skin === 'gold' ? goldColors : silverColors;

  return (
    <motion.div
      className="rasid-chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {title && (
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,.06)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'Tajawal' }}
            axisLine={{ stroke: 'rgba(255,255,255,.08)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'Tajawal' }}
            axisLine={{ stroke: 'rgba(255,255,255,.08)' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-3)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-card)',
              color: 'var(--text-primary)',
              fontFamily: 'Tajawal',
              fontSize: '0.875rem',
            }}
            cursor={{ fill: 'rgba(255,255,255,.04)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
