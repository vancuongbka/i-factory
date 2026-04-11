import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('workOrders');
  return { title: t('new.pageTitle') };
}

export default async function NewWorkOrderPage() {
  const t = await getTranslations('workOrders');

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('new.title')}</h1>
      {/* TODO: CreateWorkOrderForm client component */}
    </div>
  );
}
