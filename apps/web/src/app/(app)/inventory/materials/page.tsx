import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('inventory');
  return { title: t('materials.pageTitle') };
}

export default async function MaterialsPage() {
  const t = await getTranslations('inventory');

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('materials.title')}</h1>
    </div>
  );
}
