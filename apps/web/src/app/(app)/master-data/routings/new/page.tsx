import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateRoutingForm } from '../_components/create-routing-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.routings.new');
  return { title: t('pageTitle') };
}

export default async function NewRoutingPage() {
  const t = await getTranslations('masterData.routings.new');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <CreateRoutingForm />
    </div>
  );
}
