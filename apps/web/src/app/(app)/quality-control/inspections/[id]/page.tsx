import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { InspectionDetailClient } from '../../_components/inspection-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qualityControl.inspections');
  return { title: t('detail.pageTitle') };
}

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('qualityControl.inspections');
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('detail.title')}</h2>
      <InspectionDetailClient id={id} />
    </div>
  );
}
