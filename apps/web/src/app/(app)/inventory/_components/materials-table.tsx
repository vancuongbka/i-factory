'use client';

import { useTranslations } from 'next-intl';
import { useMaterials, useDeleteMaterial } from '@/hooks/use-inventory';

export function MaterialsTable() {
  const t = useTranslations('inventory.materials');
  const { data: materials, isLoading } = useMaterials();
  const deleteMutation = useDeleteMaterial();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!materials?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('columns.code')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.name')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.currentStock')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.minStock')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.maxStock')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.unit')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => {
            const isLow = Number(m.currentStock) <= Number(m.minStockLevel);
            return (
              <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-medium">{m.code}</td>
                <td className="px-4 py-3">
                  <span>{m.name}</span>
                  {isLow && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      {t('lowStock')}
                    </span>
                  )}
                </td>
                <td className={`px-4 py-3 text-right tabular-nums font-medium ${isLow ? 'text-red-600' : ''}`}>
                  {Number(m.currentStock).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {Number(m.minStockLevel).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {m.maxStockLevel != null ? Number(m.maxStockLevel).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">{m.unit}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete material ${m.code}?`)) {
                        deleteMutation.mutate(m.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-sm text-destructive hover:underline disabled:opacity-50"
                  >
                    {t('actions.delete')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
