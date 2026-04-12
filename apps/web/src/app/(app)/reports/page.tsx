import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ReportsClient } from './_components/reports-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reports');
  return { title: t('pageTitle') };
}

export default async function ReportsPage() {
  const t = await getTranslations('reports');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>
      <ReportsClient />
    </div>
  );
}
