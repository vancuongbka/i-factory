'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRoutings, useDeleteRouting } from '@/hooks/use-routings';

export function RoutingTable() {
  const t = useTranslations('masterData.routings');
  const { data: routings, isLoading } = useRoutings();
  const deleteRouting = useDeleteRouting();
  const router = useRouter();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!routings?.length) return <p className="text-muted-foreground">No routings found. Create one to get started.</p>;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('fields.code')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.name')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.version')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.isActive')}</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routings.map((r) => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-mono">{r.code}</td>
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3">{r.version}</td>
              <td className="px-4 py-3">
                <span className={r.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                  {r.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => router.push(`/master-data/routings/${r.id}`)}
                  className="mr-2 text-sm text-primary hover:underline"
                >
                  {t('actions.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm(`Delete routing "${r.name}"?`)) deleteRouting.mutate(r.id); }}
                  className="text-sm text-destructive hover:underline"
                >
                  {t('actions.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
