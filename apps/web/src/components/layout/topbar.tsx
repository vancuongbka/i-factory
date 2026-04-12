'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { CommandPalette } from '@/components/command-palette';

// ---------------------------------------------------------------------------
// Role display names
// ---------------------------------------------------------------------------
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  FACTORY_ADMIN: 'Factory Admin',
  PRODUCTION_MANAGER: 'Production Manager',
  QC_INSPECTOR: 'QC Inspector',
  WAREHOUSE_STAFF: 'Warehouse Staff',
  OPERATOR: 'Operator',
  VIEWER: 'Viewer',
};

// ---------------------------------------------------------------------------
// Circular flag icons
// ---------------------------------------------------------------------------
function FlagCircle({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block h-5 w-5 flex-shrink-0 overflow-hidden rounded-full border border-border">
      {children}
    </span>
  );
}

function FlagEN() {
  return (
    <FlagCircle>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="60" height="30" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </svg>
    </FlagCircle>
  );
}

function FlagVI() {
  return (
    <FlagCircle>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="30" height="30" fill="#DA251D"/>
        <polygon points="15,5 17.5,12 25,12 19,16.5 21.5,23.5 15,19 8.5,23.5 11,16.5 5,12 12.5,12" fill="#FFFF00"/>
      </svg>
    </FlagCircle>
  );
}

function FlagJP() {
  return (
    <FlagCircle>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="30" height="30" fill="#fff"/>
        <circle cx="15" cy="15" r="7" fill="#BC002D"/>
      </svg>
    </FlagCircle>
  );
}

// ---------------------------------------------------------------------------
// Route → page title map
// ---------------------------------------------------------------------------
const ROUTE_TITLES: { prefix: string; key: string }[] = [
  { prefix: '/dashboard', key: 'dashboard' },
  { prefix: '/production', key: 'production' },
  { prefix: '/work-orders', key: 'workOrders' },
  { prefix: '/bom', key: 'bom' },
  { prefix: '/inventory', key: 'inventory' },
  { prefix: '/quality-control', key: 'qualityControl' },
  { prefix: '/reports', key: 'reports' },
  { prefix: '/notifications', key: 'notifications' },
  { prefix: '/factories', key: 'factories' },
  { prefix: '/settings/users', key: 'users' },
  { prefix: '/master-data', key: 'masterData' },
];

// ---------------------------------------------------------------------------
// Topbar
// ---------------------------------------------------------------------------
export function Topbar() {
  const tTopbar = useTranslations('topbar');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const { logout, user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const LANG_OPTIONS: { locale: 'en' | 'vi' | 'ja'; label: string; flag: React.ReactNode; short: string }[] = [
    { locale: 'en', label: 'English', flag: <FlagEN />, short: 'EN' },
    { locale: 'vi', label: 'Tiếng Việt', flag: <FlagVI />, short: 'VI' },
    { locale: 'ja', label: '日本語', flag: <FlagJP />, short: 'JA' },
  ];

  const currentLang = LANG_OPTIONS.find((o) => o.locale === locale) ?? LANG_OPTIONS[0];

  const match = ROUTE_TITLES.find((r) => pathname.startsWith(r.prefix));
  const pageTitle = match ? tNav(match.key as Parameters<typeof tNav>[0]) : 'iFactory';

  function switchLocale(next: 'en' | 'vi' | 'ja') {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setLangOpen(false);
    router.refresh();
  }

  return (
    <>
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4">
      {/* ── Left ── */}
      <div className="flex items-center gap-3">
        {/* Menu name — fixed width so search never shifts */}
        <div className="w-[200px] flex-shrink-0">
          <h2 className="truncate text-[19px] font-semibold leading-none tracking-tight">
            {pageTitle}
          </h2>
        </div>

        {/* Search — triggers command palette */}
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="relative hidden h-9 w-[21rem] items-center rounded-lg border bg-background px-3 text-sm text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring sm:flex lg:w-[27rem]"
          aria-label={tTopbar('searchPlaceholder')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <span className="flex-1 text-left">{tTopbar('searchPlaceholder')}</span>
          <kbd className="inline-flex h-5 flex-shrink-0 items-center rounded border bg-muted px-1.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setLangOpen((v) => !v); setUserOpen(false); }}
            className="flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Switch language"
            aria-expanded={langOpen}
          >
            {currentLang.flag}
            <span>{currentLang.short}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 z-20 mt-1 min-w-[10rem] rounded-lg border bg-card shadow-lg">
                <div className="p-1">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.locale}
                      type="button"
                      onClick={() => switchLocale(opt.locale)}
                      className={
                        'flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-muted ' +
                        (locale === opt.locale ? 'font-semibold text-foreground' : 'text-muted-foreground')
                      }
                    >
                      {opt.flag}
                      {opt.label}
                      {locale === opt.locale && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-3.5 w-3.5 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notification bell */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setUserOpen((v) => !v); setLangOpen(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="User menu"
            aria-expanded={userOpen}
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user?.fullName?.slice(0, 2).toUpperCase() ?? '??'}
            </span>
          </button>

          {userOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border bg-card shadow-lg">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold">{user?.fullName ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '—'}</p>
                </div>
                <div className="p-1">
                  <a href="/settings/users" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                    </svg>
                    {tTopbar('settings')}
                  </a>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                    </svg>
                    {tTopbar('signOut')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
