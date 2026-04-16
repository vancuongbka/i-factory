'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

const THEME_OPTIONS = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after client mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const current = THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[0];
  const { Icon } = current;

  function cycleTheme() {
    const idx = THEME_OPTIONS.findIndex((o) => o.value === theme);
    const next = THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length];
    setTheme(next.value);
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Theme: ${current.label}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={`Switch theme (current: ${current.label})`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
