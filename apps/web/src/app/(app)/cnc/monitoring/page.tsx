import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CncMonitoringDashboard } from './_components/cnc-monitoring-dashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cnc.monitoring');
  return { title: t('pageTitle') };
}

export default async function CncMonitoringPage() {
  return <CncMonitoringDashboard />;
}
