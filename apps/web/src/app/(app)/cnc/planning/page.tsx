import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CncGanttChart } from './_components/cnc-gantt-chart';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cnc.planning');
  return { title: t('pageTitle') };
}

export default async function CncPlanningPage() {
  return <CncGanttChart />;
}
