/**
 * Ultra Premium Design Enhancement Wrapper — v2.0
 * Provides consistent glass-card gold-sweep styling, gold 3D bevel borders, motion effects,
 * and premium design tokens for all pages across the platform.
 */
import { ReactNode } from "react";

// ─── Page Container with animated entrance ─────────────────────
export function PremiumPageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-6 stagger-children ${className}`}>
      {children}
    </div>
  );
}

// ─── Section Header with premium icon treatment ──────────────────────
export function PremiumSectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: any;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--gold-a10)] to-[var(--gold-a15)] text-[var(--gold-500)] dark:text-[var(--gold-300)] border border-[var(--gold-a15)] shadow-sm" style={{ boxShadow: 'var(--bevel-gold), var(--elev-1)' }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Glass Card with gold 3D bevel ────────────────
export function PremiumCard({
  children,
  className = "",
  hover = true,
  delay = 0,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`glass-card gold-sweep rounded-xl p-5 relative overflow-hidden group ${onClick ? "cursor-pointer active-press" : ""} ${className}`}
      onClick={onClick}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-a10)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Stat Card with premium gradient and gold accents ───────────────────────────────
export function PremiumStatCard({
  label,
  value,
  icon: Icon,
  color = "text-[var(--gold-500)] dark:text-[var(--gold-300)]",
  bgColor = "bg-gradient-to-br from-[var(--gold-a10)] to-[var(--gold-a15)]",
  trend,
  suffix,
  delay = 0,
  onClick,
}: {
  label: string;
  value: number | string;
  icon?: any;
  color?: string;
  bgColor?: string;
  trend?: number;
  suffix?: string;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`glass-card gold-sweep rounded-xl p-4 relative overflow-hidden group ${onClick ? "cursor-pointer active-press" : ""}`}
      onClick={onClick}
    >
      {/* Gold accent corner lines */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[1px] h-10" style={{ background: 'linear-gradient(to bottom, var(--gold-a40), transparent)' }} />
        <div className="absolute top-0 right-0 h-[1px] w-10" style={{ background: 'linear-gradient(to left, var(--gold-a40), transparent)' }} />
      </div>
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-500 bg-[var(--gold-a10)] group-hover:bg-[var(--gold-a15)]" />
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight number-pop">
            {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
            {suffix && <span className="text-sm text-muted-foreground mr-1">{suffix}</span>}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              <span>{trend >= 0 ? "▲" : "▼"}</span>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${bgColor} ${color} border border-[var(--gold-a15)]`} style={{ boxShadow: 'var(--bevel-gold), var(--elev-1)' }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Table wrapper with glass styling ──────────────────────────
export function PremiumTableWrapper({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-table rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ─── Empty State with premium styling ────────────────────────────────
export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center scale-bounce-in">
      {Icon && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--gold-a10)] to-[var(--gold-a15)] mb-4 border border-[var(--gold-a15)]" style={{ boxShadow: 'var(--bevel-gold)' }}>
          <Icon className="h-10 w-10 text-muted-foreground/50" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Animated counter ──────────────────────────────────────────
export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <span key={value} className="number-pop inline-block">
      {value.toLocaleString("ar-SA")}{suffix}
    </span>
  );
}

// ─── Stagger container for lists ───────────────────────────────
export function StaggerContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`stagger-children ${className}`}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// ─── Badge with premium styling ────────────────────────────────────
export function PremiumBadge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default: "bg-[var(--gold-a10)] text-[var(--gold-500)] border-[var(--gold-a20)] dark:text-[var(--gold-300)]",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ─── Gold Divider ──────────────────────────────────────────────
export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`gold-separator ${className}`} />
  );
}
