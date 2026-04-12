import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BomDetailClient } from '../_components/bom-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bom.detail');
  return { title: t('pageTitle') };
}

interface BomDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BomDetailPage({ params }: BomDetailPageProps) {
  const { id } = await params;
  return <BomDetailClient id={id} />;
}
