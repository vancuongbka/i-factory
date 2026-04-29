import React from 'react';

export type KpiAccent = 'primary' | 'success' | 'warning' | 'critical' | 'none';
export type KpiVariant = 'solid' | 'glass';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  description?: string;
  icon?: React.ReactNode;
  viewReportHref?: string;
  viewReportLabel?: string;
  className?: string;
  /** Coloured accent strip on the left edge (matches dashboard mockup). Defaults to 'none'. */
  accent?: KpiAccent;
  /** 'glass' = backdrop-blur translucent surface (mockup). 'solid' = legacy `bg-card`. */
  variant?: KpiVariant;
  /** Optional secondary content rendered under the main value (sub-metrics, sparkline, progress bar). */
  footer?: React.ReactNode;
}

const ACCENT_BORDER: Record<KpiAccent, string> = {
  primary:  'border-l-4 border-l-primary',
  success:  'border-l-4 border-l-emerald-500',
  warning:  'border-l-4 border-l-amber-500',
  critical: 'border-l-4 border-l-rose-500',
  none:     '',
};

export function KpiCard({
  title,
  value,
  unit,
  trend,
  description,
  icon,
  viewReportHref,
  viewReportLabel,
  className,
  accent = 'none',
  variant = 'solid',
  footer,
}: KpiCardProps) {
  const surfaceClass =
    variant === 'glass'
      ? 'glass-card rounded-xl'
      : 'rounded-lg border bg-card shadow-sm';

  return (
    <div className={`${surfaceClass} ${ACCENT_BORDER[accent]} p-6 ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        {trend && (
          <span
            className={`flex-shrink-0 text-xs font-semibold ${
              trend.direction === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trend.direction === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-muted-foreground'
            }`}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : ''}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {footer && <div className="mt-3">{footer}</div>}
      {(trend?.label ?? viewReportHref) && (
        <div className="mt-2 flex items-center justify-between gap-2">
          {trend?.label && (
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          )}
          {viewReportHref && viewReportLabel && (
            <a
              href={viewReportHref}
              className="ml-auto flex-shrink-0 text-xs font-medium text-primary hover:underline"
            >
              {viewReportLabel} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
