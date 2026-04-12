import React from 'react';

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
}

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
}: KpiCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 shadow-sm ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        {trend && (
          <span
            className={`flex-shrink-0 text-xs font-semibold ${
              trend.direction === 'up'
                ? 'text-green-600'
                : trend.direction === 'down'
                  ? 'text-red-600'
                  : 'text-gray-500'
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
