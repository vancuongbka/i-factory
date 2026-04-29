'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ThemeValue = 'system' | 'light' | 'dark';

const THEME_OPTIONS: { value: ThemeValue; labelKey: 'system' | 'light' | 'dark'; Icon: typeof Monitor }[] = [
  { value: 'system', labelKey: 'system', Icon: Monitor },
  { value: 'light',  labelKey: 'light',  Icon: Sun },
  { value: 'dark',   labelKey: 'dark',   Icon: Moon },
];

export function ThemeSwitch() {
  const t = useTranslations('topbar.theme');
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const active = (theme as ThemeValue) ?? 'system';
  const current = THEME_OPTIONS.find((o) => o.value === active) ?? THEME_OPTIONS[0];
  // Show the resolved icon for `system` so the trigger reflects what the user actually sees.
  const TriggerIcon =
    active === 'system'
      ? (resolvedTheme === 'dark' ? Moon : Sun)
      : current.Icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={`${t('label')}: ${t(current.labelKey)}`}
        aria-expanded={open}
        title={`${t('label')}: ${t(current.labelKey)}`}
      >
        <TriggerIcon className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-20 mt-1 min-w-[10rem] rounded-lg border bg-card shadow-lg">
            <div className="border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('label')}
            </div>
            <div className="p-1">
              {THEME_OPTIONS.map((opt) => {
                const isActive = active === opt.value;
                const Icon = opt.Icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setTheme(opt.value); setOpen(false); }}
                    className={
                      'flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-muted ' +
                      (isActive ? 'font-semibold text-foreground' : 'text-muted-foreground')
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {t(opt.labelKey)}
                    {isActive && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
