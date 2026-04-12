import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DashboardClient } from './_components/dashboard-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return { title: t('pageTitle') };
}

export default async function DashboardPage() {
  return <DashboardClient />;
}
