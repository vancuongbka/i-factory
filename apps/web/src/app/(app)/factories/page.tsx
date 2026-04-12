import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('factories');
  return { title: t('pageTitle') };
}

export default async function FactoriesPage() {

  return (
    <div>
    </div>
  );
}
