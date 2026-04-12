'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@i-factory/ui';
import { useBoms, useDeleteBom } from '@/hooks/use-bom';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

export function BomTable() {
  const t = useTranslations('bom');
  const { data: boms, isLoading } = useBoms();
  const deleteBom = useDeleteBom();
  const router = useRouter();
  const { openConfirm, handleConfirm, handleCancel, dialog } = useConfirmDialog();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!boms?.length) return <p className="text-muted-foreground">No BOMs found. Create one to get started.</p>;

  return (
    <>
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('fields.code')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.productName')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.version')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.isActive')}</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {boms.map((bom) => (
            <tr key={bom.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-mono">{bom.code}</td>
              <td className="px-4 py-3">{bom.productName}</td>
              <td className="px-4 py-3">{bom.version}</td>
              <td className="px-4 py-3">
                <span className={bom.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                  {bom.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/bom/${bom.id}`)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={t('actions.view')}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openConfirm(`Delete BOM "${bom.code}"?`, () => deleteBom.mutate(bom.id))}
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
