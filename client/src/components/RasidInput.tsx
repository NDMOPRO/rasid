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
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          marginBottom: '0.375rem'
        }}>
          {label}
        </label>
      )}
      <input
        className="rasid-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );
}
