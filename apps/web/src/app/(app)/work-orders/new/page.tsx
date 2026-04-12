import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('workOrders');
  return { title: t('new.pageTitle') };
}

export default async function NewWorkOrderPage() {

  return (
    <div>
      {/* TODO: CreateWorkOrderForm client component */}
    </div>
  );
}
