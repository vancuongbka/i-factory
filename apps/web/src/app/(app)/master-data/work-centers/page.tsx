import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WorkCenterTable } from './_components/work-center-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.workCenters');
  return { title: t('pageTitle') };
}

export default async function WorkCentersPage() {
  const t = await getTranslations('masterData.workCenters');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <WorkCenterTable />
    </div>
  );
}
