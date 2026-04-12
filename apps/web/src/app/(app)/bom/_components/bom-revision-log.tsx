'use client';

import { useTranslations } from 'next-intl';
import { useBomRevisions } from '@/hooks/use-bom';

interface BomRevisionLogProps {
  bomId: string;
}

export function BomRevisionLog({ bomId }: BomRevisionLogProps) {
  const t = useTranslations('bom.revisions');
  const { data: revisions, isLoading } = useBomRevisions(bomId);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!revisions?.length) return <p className="text-muted-foreground">No revisions yet.</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <ol className="space-y-2">
        {[...revisions].reverse().map((rev) => (
          <li key={rev.id} className="rounded-md border px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                v{rev.fromVersion} → v{rev.toVersion}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(rev.createdAt).toLocaleString()}
              </span>
            </div>
            {rev.changeNotes && (
              <p className="mt-1 text-muted-foreground">{rev.changeNotes}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
