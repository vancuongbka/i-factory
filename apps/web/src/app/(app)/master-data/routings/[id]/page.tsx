import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RoutingDetailClient } from '../_components/routing-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.routings.detail');
  return { title: t('pageTitle') };
}

interface RoutingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoutingDetailPage({ params }: RoutingDetailPageProps) {
  const { id } = await params;
  return <RoutingDetailClient id={id} />;
}
