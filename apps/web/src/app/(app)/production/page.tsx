import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('production');
  return { title: t('pageTitle') };
}

// Server Component — fetch initial data from API
export default async function ProductionPage() {
  // TODO: fetch production orders from API
  // const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/factories/{factoryId}/production`, { ... })

  return (
    <div>
      {/* TODO: ProductionTable client component */}
    </div>
  );
}
