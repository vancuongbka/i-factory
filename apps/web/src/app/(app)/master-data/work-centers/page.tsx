import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WorkCenterTable } from './_components/work-center-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.workCenters');
  return { title: t('pageTitle') };
}

export default async function WorkCentersPage() {

  return (
    <div className="space-y-4">
      <WorkCenterTable />
    </div>
  );
}
