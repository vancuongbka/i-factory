import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('workOrders');
  return { title: t('pageTitle') };
}

export default async function WorkOrdersPage() {
  const t = await getTranslations('workOrders');

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('title')}</h1>
    </div>
  );
}
