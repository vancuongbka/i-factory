import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CncMachineDetail } from './_components/cnc-machine-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cnc.machines.detail');
  return { title: t('pageTitle') };
}

export default async function CncMachineDetailPage({ params }: Props) {
  const { id } = await params;
  return <CncMachineDetail machineId={id} />;
}
