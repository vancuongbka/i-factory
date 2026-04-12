import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MovementsPageClient } from './_components/movements-page-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('inventory.movements');
  return { title: t('pageTitle') };
}

export default async function MovementsPage() {
  return <MovementsPageClient />;
}
