import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WorkCenterDetailClient } from '../_components/work-center-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.workCenters.detail');
  return { title: t('pageTitle') };
}

interface WorkCenterDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkCenterDetailPage({ params }: WorkCenterDetailPageProps) {
  const { id } = await params;
  return <WorkCenterDetailClient id={id} />;
}
