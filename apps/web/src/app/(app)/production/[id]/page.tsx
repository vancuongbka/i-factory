import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('production');
  return { title: t('detail.pageTitle') };
}

export default async function ProductionDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('production');

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('detail.title', { id })}</h1>
      {/* TODO: ProductionDetail client component */}
    </div>
  );
}
