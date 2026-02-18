interface RasidInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  label?: string;
  className?: string;
}

export default function RasidInput({ placeholder, value, onChange, type = 'text', label, className = '' }: RasidInputProps) {
  return (
    <div className={className}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '0.375rem',
          letterSpacing: '0.02em',
        }}>
          {label}
        </label>
      )}
      <input
        className="lux-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );
}
