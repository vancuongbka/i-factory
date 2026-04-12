import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WorkOrderDetailClient } from '../_components/work-order-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('workOrders');
  return { title: t('detail.pageTitle') };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <WorkOrderDetailClient id={id} />;
}
