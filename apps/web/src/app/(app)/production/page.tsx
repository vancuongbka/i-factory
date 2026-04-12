import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ProductionTable } from './_components/production-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('production');
  return { title: t('pageTitle') };
}

export default async function ProductionPage() {
  const t = await getTranslations('production');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Link
          href="/production/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('actions.create')}
        </Link>
      </div>
      <ProductionTable />
    </div>
  );
}
