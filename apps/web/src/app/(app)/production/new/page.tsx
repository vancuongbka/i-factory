import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateProductionForm } from '../_components/create-production-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('production');
  return { title: t('new.pageTitle') };
}

export default async function NewProductionPage() {
  const t = await getTranslations('production');
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-semibold">{t('new.title')}</h2>
      <CreateProductionForm />
    </div>
  );
}
