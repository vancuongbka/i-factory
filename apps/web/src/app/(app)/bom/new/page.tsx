import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateBomForm } from '../_components/create-bom-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bom.new');
  return { title: t('pageTitle') };
}

export default async function NewBomPage() {
  const t = await getTranslations('bom.new');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <CreateBomForm />
    </div>
  );
}
