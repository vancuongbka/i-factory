import React from 'react';

interface LiveIndicatorProps {
  online: boolean;
  label?: string;
  className?: string;
}

export function LiveIndicator({ online, label, className }: LiveIndicatorProps) {
  const tone = online
    ? { dot: 'bg-emerald-500', halo: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' }
    : { dot: 'bg-rose-500',    halo: 'bg-rose-400',    text: 'text-rose-600 dark:text-rose-400' };

  const text = label ?? (online ? 'Online' : 'Offline');

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <span className="relative flex h-2 w-2">
        {online && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${tone.halo}`}
            aria-hidden="true"
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${tone.dot}`} aria-hidden="true" />
      </span>
      <span className={`text-xs font-semibold ${tone.text}`}>{text}</span>
    </span>
  );
}
