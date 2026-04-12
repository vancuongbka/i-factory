import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BomRevisionLog } from '../../_components/bom-revision-log';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bom.revisions');
  return { title: t('pageTitle') };
}

interface BomRevisionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BomRevisionsPage({ params }: BomRevisionsPageProps) {
  const { id } = await params;
  const t = await getTranslations('bom.revisions');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/bom/${id}`} className="text-sm text-muted-foreground hover:underline">
          ← Back to BOM
        </Link>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      <BomRevisionLog bomId={id} />
    </div>
  );
}
