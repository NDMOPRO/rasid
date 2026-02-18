import { ReactNode } from 'react';

interface RasidButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'accent';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function RasidButton({ children, variant = 'primary', onClick, className = '', disabled }: RasidButtonProps) {
  return (
    <button
      className={`rasid-btn rasid-btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
