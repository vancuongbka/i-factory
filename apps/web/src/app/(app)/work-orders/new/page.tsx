import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateWorkOrderForm } from '../_components/create-work-order-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('workOrders');
  return { title: t('new.pageTitle') };
}

export default async function NewWorkOrderPage() {
  const t = await getTranslations('workOrders');
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-semibold">{t('new.title')}</h2>
      <CreateWorkOrderForm />
    </div>
  );
}
