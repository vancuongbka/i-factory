import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ErpSyncForm } from './_components/erp-sync-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.erpSync');
  return { title: t('pageTitle') };
}

export default async function ErpSyncPage() {

  return (
    <div className="space-y-4">
      <ErpSyncForm />
    </div>
  );
}
