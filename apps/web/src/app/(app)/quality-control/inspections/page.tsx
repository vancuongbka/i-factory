import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qualityControl');
  return { title: t('inspections.pageTitle') };
}

export default async function InspectionsPage() {
  const t = await getTranslations('qualityControl');

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('inspections.title')}</h1>
    </div>
  );
}
