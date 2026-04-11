import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function Sidebar() {
  const t = await getTranslations('nav');

  const NAV_ITEMS = [
    { href: '/dashboard', label: t('dashboard') },
    { href: '/production', label: t('production') },
    { href: '/work-orders', label: t('workOrders') },
    { href: '/bom', label: t('bom') },
    { href: '/inventory', label: t('inventory') },
    { href: '/quality-control', label: t('qualityControl') },
    { href: '/reports', label: t('reports') },
    { href: '/notifications', label: t('notifications') },
    { href: '/factories', label: t('factories') },
    { href: '/settings/users', label: t('users') },
  ] as const;

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold">i-factory</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
