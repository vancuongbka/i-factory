'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// ---------------------------------------------------------------------------
// Inline SVG icons  (20×20 fill="currentColor" — consistent with codebase)
// ---------------------------------------------------------------------------
function IconDashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>
  );
}
function IconProduction() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
    </svg>
  );
}
function IconWorkOrders() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
    </svg>
  );
}
function IconBOM() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
    </svg>
  );
}
function IconInventory() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/>
    </svg>
  );
}
function IconQC() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
  );
}
function IconReports() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>
  );
}
function IconNotifications() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
    </svg>
  );
}
function IconProducts() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
    </svg>
  );
}
function IconCategories() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
    </svg>
  );
}
function IconUOMs() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
    </svg>
  );
}
function IconWorkCenters() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
    </svg>
  );
}
function IconSkills() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
    </svg>
  );
}
function IconRoutings() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
    </svg>
  );
}
function IconERPSync() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
    </svg>
  );
}
function IconCncMachines() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
    </svg>
  );
}
function IconCncMonitoring() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Nav group type
// ---------------------------------------------------------------------------
interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const NAV_GROUPS: NavGroup[] = [
    {
      groupKey: 'menuGroup',
      items: [
        { href: '/dashboard', labelKey: 'dashboard', icon: <IconDashboard /> },
        { href: '/production', labelKey: 'production', icon: <IconProduction /> },
        { href: '/work-orders', labelKey: 'workOrders', icon: <IconWorkOrders /> },
        { href: '/bom', labelKey: 'bom', icon: <IconBOM /> },
        { href: '/inventory', labelKey: 'inventory', icon: <IconInventory /> },
        { href: '/quality-control', labelKey: 'qualityControl', icon: <IconQC /> },
        { href: '/reports', labelKey: 'reports', icon: <IconReports /> },
        { href: '/notifications', labelKey: 'notifications', icon: <IconNotifications /> },
      ],
    },
    {
      groupKey: 'cncGroup',
      items: [
        { href: '/cnc/machines', labelKey: 'cncMachines', icon: <IconCncMachines /> },
        { href: '/cnc/monitoring', labelKey: 'cncMonitoring', icon: <IconCncMonitoring /> },
      ],
    },
    {
      groupKey: 'masterData',
      items: [
        { href: '/master-data/products', labelKey: 'products', icon: <IconProducts /> },
        { href: '/master-data/categories', labelKey: 'categories', icon: <IconCategories /> },
        { href: '/master-data/uoms', labelKey: 'uoms', icon: <IconUOMs /> },
        { href: '/master-data/work-centers', labelKey: 'workCenters', icon: <IconWorkCenters /> },
        { href: '/master-data/skills', labelKey: 'skills', icon: <IconSkills /> },
        { href: '/master-data/routings', labelKey: 'routings', icon: <IconRoutings /> },
        { href: '/master-data/erp-sync', labelKey: 'erpSync', icon: <IconERPSync /> },
      ],
    },
    {
      groupKey: 'settingsGroup',
      items: [
        { href: '/settings/users', labelKey: 'users', icon: <IconUsers /> },
      ],
    },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center border-b px-5">
        <span className="text-lg font-bold tracking-tight">iFactory</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.groupKey}>
            {/* Separator between groups */}
            {groupIndex > 0 && (
              <div className="my-3 h-px bg-border" />
            )}

            {/* Group label */}
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t(group.groupKey as Parameters<typeof t>[0])}
            </p>

            {/* Items */}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-colors ${
                        active
                          ? 'bg-secondary text-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className={active ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.icon}
                      </span>
                      <span className="truncate">
                        {t(item.labelKey as Parameters<typeof t>[0])}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
