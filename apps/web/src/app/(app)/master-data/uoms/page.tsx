import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UomTable } from './_components/uom-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.uoms');
  return { title: t('pageTitle') };
}

export default async function UomsPage() {

  return (
    <div className="space-y-4">
      <UomTable />
    </div>
  );
}
