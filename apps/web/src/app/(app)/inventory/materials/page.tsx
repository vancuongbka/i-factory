import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { MaterialsTable } from '../_components/materials-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('inventory.materials');
  return { title: t('pageTitle') };
}

export default async function MaterialsPage() {
  const t = await getTranslations('inventory.materials');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/inventory/movements"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          → Stock Movements
        </Link>
        <Link
          href="/inventory/materials/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('actions.create')}
        </Link>
      </div>
      <MaterialsTable />
    </div>
  );
}
