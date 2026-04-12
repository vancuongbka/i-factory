'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@i-factory/ui';
import { useRoutings, useDeleteRouting } from '@/hooks/use-routings';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

export function RoutingTable() {
  const t = useTranslations('masterData.routings');
  const { data: routings, isLoading } = useRoutings();
  const deleteRouting = useDeleteRouting();
  const router = useRouter();
  const { openConfirm, handleConfirm, handleCancel, dialog } = useConfirmDialog();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!routings?.length) return <p className="text-muted-foreground">No routings found. Create one to get started.</p>;

  return (
    <>
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
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/master-data/routings/${r.id}`)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={t('actions.edit')}
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openConfirm(`Delete routing "${r.name}"?`, () => deleteRouting.mutate(r.id))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={t('actions.delete')}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {dialog && (
      <ConfirmDialog message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={handleConfirm} onCancel={handleCancel} />
    )}
    </>
  );
}
