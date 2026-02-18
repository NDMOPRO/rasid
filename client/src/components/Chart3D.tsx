import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Rectangle } from 'recharts';
import { motion } from 'framer-motion';

type SkinType = 'gold' | 'silver';

interface Chart3DProps {
  data: { name: string; value: number }[];
  title?: string;
  skin: SkinType;
}

const goldPalette = {
  main: '#D4AF37',
  light: '#F0D060',
  dark: '#8B7320',
  face: '#C5A028',
  top: '#E8D070',
  side: '#9A8520',
};
const silverPalette = {
  main: '#B0C4DE',
  light: '#D0DCE8',
  dark: '#6A7F98',
  face: '#9AB0C8',
  top: '#C8D8E8',
  side: '#7A8FA8',
};

/* Custom 3D bar shape — front face + top face + side face */
function Bar3DShape(props: any) {
  const { x, y, width, height, skin } = props;
  const pal = skin === 'gold' ? goldPalette : silverPalette;
  const depth = 14; // 3D depth offset — thicker for more dramatic 3D
  
  if (height <= 0) return null;

  return (
    <g>
      {/* Side face (right side for RTL) */}
      <polygon
        points={`
          ${x + width},${y}
          ${x + width + depth},${y - depth}
          ${x + width + depth},${y + height - depth}
          ${x + width},${y + height}
        `}
        fill={pal.side}
        opacity={0.75}
        stroke={pal.dark}
        strokeWidth={0.5}
      />
      {/* Top face */}
      <polygon
        points={`
          ${x},${y}
          ${x + depth},${y - depth}
          ${x + width + depth},${y - depth}
          ${x + width},${y}
        `}
        fill={pal.top}
        opacity={0.85}
        stroke={pal.dark}
        strokeWidth={0.5}
      />
      {/* Front face — main gradient */}
      <defs>
        <linearGradient id={`bar3d-front-${skin}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.light} stopOpacity={0.95} />
          <stop offset="40%" stopColor={pal.main} stopOpacity={0.90} />
          <stop offset="100%" stopColor={pal.dark} stopOpacity={0.80} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={2}
        fill={`url(#bar3d-front-${skin})`}
        stroke={pal.dark}
        strokeWidth={0.5}
        strokeOpacity={0.4}
      />
      {/* Front face highlight — metallic shine strip */}
      <rect
        x={x + 2}
        y={y}
        width={Math.max(width * 0.25, 4)}
        height={height}
        rx={1}
        fill="rgba(255,255,255,0.16)"
      />
      {/* Front face edge highlight — right edge metallic */}
      <rect
        x={x + width - 3}
        y={y}
        width={2}
        height={height}
        fill="rgba(255,255,255,0.06)"
      />
    </g>
  );
}

export default function Chart3D({ data, title, skin }: Chart3DProps) {
  const pal = skin === 'gold' ? goldPalette : silverPalette;

  return (
    <motion.div
      className="lux-chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {title && (
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{
            width: 4,
            height: 18,
            borderRadius: 2,
            background: 'var(--accent-color)',
            display: 'inline-block',
          }} />
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barCategoryGap="18%" margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(120,140,175,.10)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'Tajawal' }}
            axisLine={{ stroke: 'rgba(120,140,175,.12)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'Tajawal' }}
            axisLine={{ stroke: 'rgba(120,140,175,.12)' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'linear-gradient(165deg, rgba(50,65,100,.92), rgba(38,52,82,.95))',
              border: '2px solid rgba(100,120,160,.25)',
              borderTopColor: 'rgba(140,165,210,.30)',
              borderBottomColor: 'rgba(20,30,50,.45)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,.45), inset 0 1px 0 rgba(160,180,220,.15)',
              color: 'var(--text-primary)',
              fontFamily: 'Tajawal',
              fontSize: '0.875rem',
            }}
            cursor={{ fill: 'rgba(120,140,175,.06)' }}
          />
          <Bar
            dataKey="value"
            shape={(props: any) => <Bar3DShape {...props} skin={skin} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
