import React from 'react';

export type StatusTone = 'running' | 'warning' | 'critical' | 'idle' | 'planned';

interface StatusDotProps {
  tone: StatusTone;
  pulse?: boolean;
  glow?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

const TONE_CLASS: Record<StatusTone, { bg: string; glow: string; text: string }> = {
  running:  { bg: 'bg-emerald-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.8)]',  text: 'text-emerald-500' },
  warning:  { bg: 'bg-amber-500',   glow: 'shadow-[0_0_8px_rgba(245,158,11,0.8)]',  text: 'text-amber-500' },
  critical: { bg: 'bg-rose-500',    glow: 'shadow-[0_0_8px_rgba(244,63,94,0.8)]',   text: 'text-rose-500' },
  idle:     { bg: 'bg-slate-400',   glow: 'shadow-[0_0_8px_rgba(148,163,184,0.6)]', text: 'text-slate-500' },
  planned:  { bg: 'bg-indigo-500',  glow: 'shadow-[0_0_8px_rgba(99,102,241,0.8)]',  text: 'text-indigo-500' },
};

export function StatusDot({
  tone,
  pulse = false,
  glow = true,
  size = 'sm',
  className,
  label,
}: StatusDotProps) {
  const cfg = TONE_CLASS[tone];
  const sizeClass = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3';

  const dot = (
    <span
      className={`inline-block rounded-full ${cfg.bg} ${sizeClass} ${glow ? cfg.glow : ''} ${pulse ? 'animate-pulse' : ''}`}
      aria-hidden="true"
    />
  );

  if (!label) {
    return <span className={className}>{dot}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      {dot}
      <span className={`text-xs font-semibold ${cfg.text}`}>{label}</span>
    </span>
  );
}
