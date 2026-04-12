import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reports');
  return { title: t('pageTitle') };
}

// Server Component — good for SEO + SSR before client hydration
export default async function ReportsPage() {
  const t = await getTranslations('reports');

  return (
    <div>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
    </div>
  );
}
