import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('production');
  return { title: t('detail.pageTitle') };
}

export default async function ProductionDetailPage() {
  return (
    <div>
      {/* TODO: ProductionDetail client component */}
    </div>
  );
}
