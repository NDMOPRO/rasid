interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  className = '',
}: TypewriterTextProps) {
  return (
    <span className={className}>
      {text}
    </span>
  );
}
