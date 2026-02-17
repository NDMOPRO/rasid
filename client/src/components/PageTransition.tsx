import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/* Stagger children animation helper — disabled */
export const staggerContainer = {
  initial: {},
  animate: {},
};

export const staggerItem = {
  initial: {},
  animate: {},
};

export const fadeInUp = {
  initial: {},
  animate: {},
  transition: {},
};

export const fadeInRight = {
  initial: {},
  animate: {},
  transition: {},
};

export const fadeInLeft = {
  initial: {},
  animate: {},
  transition: {},
};

export const scaleIn = {
  initial: {},
  animate: {},
  transition: {},
};
