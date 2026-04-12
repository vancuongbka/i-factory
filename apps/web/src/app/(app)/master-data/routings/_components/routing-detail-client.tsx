'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRouting } from '@/hooks/use-routings';
import { RoutingOperationsEditor } from './routing-operations-editor';

interface RoutingDetailClientProps {
  id: string;
}

export function RoutingDetailClient({ id }: RoutingDetailClientProps) {
  const t = useTranslations('masterData.routings');
  const router = useRouter();
  const { data: routing, isLoading } = useRouting(id);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!routing) return <p className="text-muted-foreground">Routing not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-muted-foreground">
            {routing.code} · v{routing.version}
          </p>
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
          <dt className="font-medium text-muted-foreground">{t('fields.isActive')}</dt>
          <dd className={routing.isActive ? 'text-green-600' : 'text-muted-foreground'}>
            {routing.isActive ? 'Active' : 'Inactive'}
          </dd>
        </div>
        {routing.notes && (
          <div className="col-span-2">
            <dt className="font-medium text-muted-foreground">{t('fields.notes')}</dt>
            <dd>{routing.notes}</dd>
          </div>
        )}
      </dl>

      <hr />

      <RoutingOperationsEditor routingId={id} operations={routing.operations ?? []} />
    </div>
  );
}
