import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateRoutingForm } from '../_components/create-routing-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.routings');
  return { title: t('pageTitle') };
}

export default async function NewRoutingPage() {

  return (
    <div className="space-y-4">
      <CreateRoutingForm />
    </div>
  );
}
