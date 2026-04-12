import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qualityControl');
  return { title: t('pageTitle') };
}

export default async function QualityControlPage() {

  return (
    <div>
    </div>
  );
}
