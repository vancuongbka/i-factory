'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useWorkCenter } from '@/hooks/use-work-centers';
import { MachinesPanel } from './machines-panel';

interface WorkCenterDetailClientProps {
  id: string;
}

export function WorkCenterDetailClient({ id }: WorkCenterDetailClientProps) {
  const t = useTranslations('masterData.workCenters');
  const router = useRouter();
  const { data: wc, isLoading } = useWorkCenter(id);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!wc) return <p className="text-muted-foreground">Work center not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{wc.name}</h1>
          <p className="font-mono text-sm text-muted-foreground">{wc.code}</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back
        </button>
      </div>

      <dl className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.type')}</dt>
          <dd>{t(`types.${wc.type}`)}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.capacity')}</dt>
          <dd>{wc.capacityPerHour ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.isActive')}</dt>
          <dd className={wc.isActive ? 'text-green-600' : 'text-muted-foreground'}>
            {wc.isActive ? 'Active' : 'Inactive'}
          </dd>
        </div>
        {wc.description && (
          <div className="col-span-3">
            <dt className="font-medium text-muted-foreground">{t('fields.description')}</dt>
            <dd>{wc.description}</dd>
          </div>
        )}
      </dl>

      <hr />

      <MachinesPanel workCenterId={id} />
    </div>
  );
}
