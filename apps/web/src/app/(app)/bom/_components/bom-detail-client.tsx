'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useBom, useCreateBomRevision } from '@/hooks/use-bom';
import { BomItemsEditor } from './bom-items-editor';

interface BomDetailClientProps {
  id: string;
}

export function BomDetailClient({ id }: BomDetailClientProps) {
  const t = useTranslations('bom');
  const router = useRouter();
  const { data: bom, isLoading } = useBom(id);
  const createRevision = useCreateBomRevision(id);

  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!bom) return <p className="text-muted-foreground">BOM not found.</p>;

  const handleRevise = (e: React.FormEvent) => {
    e.preventDefault();
    createRevision.mutate(
      { changeNotes: changeNotes || undefined },
      { onSuccess: () => { setShowRevisionForm(false); setChangeNotes(''); } },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{bom.productName}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/bom/${id}/revisions`}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            {t('revisions.title')}
          </Link>
          <button
            type="button"
            onClick={() => setShowRevisionForm(!showRevisionForm)}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            {t('actions.revise')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>

      {showRevisionForm && (
        <form onSubmit={handleRevise} className="max-w-md space-y-3 rounded-md border p-4">
          <p className="text-sm font-medium">Create a new revision snapshot</p>
          <div className="space-y-1">
            <label className="text-sm">Change notes (optional)</label>
            <textarea
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          {createRevision.error && (
            <p className="text-sm text-destructive">{createRevision.error.message}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={createRevision.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {createRevision.isPending ? 'Saving…' : 'Create Revision'}
            </button>
            <button type="button" onClick={() => setShowRevisionForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      <dl className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.version')}</dt>
          <dd>{bom.version}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.outputQuantity')}</dt>
          <dd>{bom.outputQuantity} {bom.outputUnit}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.isActive')}</dt>
          <dd className={bom.isActive ? 'text-green-600' : 'text-muted-foreground'}>
            {bom.isActive ? 'Active' : 'Inactive'}
          </dd>
        </div>
      </dl>

      <hr />

      <BomItemsEditor bomId={id} items={(bom as unknown as { items?: Parameters<typeof BomItemsEditor>[0]['items'] }).items ?? []} />
    </div>
  );
}
