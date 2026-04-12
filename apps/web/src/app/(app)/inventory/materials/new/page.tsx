import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateMaterialForm } from '../../_components/create-material-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('inventory.materials');
  return { title: t('new.pageTitle') };
}

export default async function NewMaterialPage() {
  const t = await getTranslations('inventory.materials');
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">{t('new.title')}</h2>
      <CreateMaterialForm />
    </div>
  );
}
