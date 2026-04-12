import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProductionDetailClient } from '../_components/production-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('production');
  return { title: t('detail.pageTitle') };
}

export default async function ProductionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('production');
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('detail.title')}</h2>
      <ProductionDetailClient id={id} />
    </div>
  );
}
