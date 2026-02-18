import { motion } from 'framer-motion';

interface Column {
  key: string;
  label: string;
  align?: 'right' | 'center' | 'left';
}

interface RasidTableProps {
  columns: Column[];
  data: Record<string, any>[];
  title?: string;
}

export default function RasidTable({ columns, data, title }: RasidTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {title && (
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          {title}
        </h3>
      )}
      <table className="rasid-table">
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
    </motion.div>
  );
}
