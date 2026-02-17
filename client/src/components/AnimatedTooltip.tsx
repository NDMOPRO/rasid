import { useState, type ReactNode } from 'react';

interface AnimatedTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positionStyles = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
};

const motionOrigin = {
  top: { initial: { opacity: 0, y: 8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
  bottom: { initial: { opacity: 0, y: -8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
  left: { initial: { opacity: 0, x: 8, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } },
  right: { initial: { opacity: 0, x: -8, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } },
};

export function AnimatedTooltip({
  children,
  content,
  position = 'top',
  className = '',
}: AnimatedTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      
        {show && (
          <div
            className="absolute z-50 px-3 py-2 text-sm rounded-xl whitespace-nowrap pointer-events-none glass-card gold-sweep"
            style={positionStyles[position]}
            initial={motionOrigin[position].initial}
            animate={motionOrigin[position].animate}
          >
            {content}
          </div>
        )}
      
    </div>
  );
}
