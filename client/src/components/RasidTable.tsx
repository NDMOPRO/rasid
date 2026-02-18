import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Column {
  key: string;
  label: string;
  align?: 'right' | 'center' | 'left';
}

interface RasidTableProps {
  columns: Column[];
  data: Record<string, ReactNode>[];
  title?: string;
}

export default function RasidTable({ columns, data, title }: RasidTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {title && (
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.875rem',
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
      <div className="lux-table-wrap">
        <table className="lux-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ textAlign: col.align || 'right' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} style={{ textAlign: col.align || 'right' }}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
