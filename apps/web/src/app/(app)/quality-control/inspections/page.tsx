import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qualityControl');
  return { title: t('inspections.pageTitle') };
}

export default async function InspectionsPage() {

  return (
    <div>
    </div>
  );
}
