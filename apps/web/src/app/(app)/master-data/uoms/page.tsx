import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UomTable } from './_components/uom-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.uoms');
  return { title: t('pageTitle') };
}

export default async function UomsPage() {
  const t = await getTranslations('masterData.uoms');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <UomTable />
    </div>
  );
}
