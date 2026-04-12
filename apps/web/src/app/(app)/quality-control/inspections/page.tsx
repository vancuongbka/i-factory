import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { InspectionsTable } from '../_components/inspections-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qualityControl.inspections');
  return { title: t('pageTitle') };
}

export default async function InspectionsPage() {
  const t = await getTranslations('qualityControl.inspections');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Link
          href="/quality-control/inspections/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('actions.create')}
        </Link>
      </div>
      <InspectionsTable />
    </div>
  );
}
