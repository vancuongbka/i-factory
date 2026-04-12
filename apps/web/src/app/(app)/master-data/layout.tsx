import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function MasterDataLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('nav');

  const SUB_NAV = [
    { href: '/master-data/products', label: t('products') },
    { href: '/master-data/categories', label: t('categories') },
    { href: '/master-data/uoms', label: t('uoms') },
    { href: '/master-data/work-centers', label: t('workCenters') },
    { href: '/master-data/skills', label: t('skills') },
    { href: '/master-data/routings', label: t('routings') },
    { href: '/master-data/erp-sync', label: t('erpSync') },
  ] as const;

  return (
    <div className="flex h-full flex-col gap-4">
      <nav className="flex gap-1 border-b pb-3">
        {SUB_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
