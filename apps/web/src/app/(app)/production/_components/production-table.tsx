'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@i-factory/ui';
import { ProductionStatus } from '@i-factory/api-types';
import { useProductionOrders, useDeleteProductionOrder } from '@/hooks/use-production-orders';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

const STATUS_STYLES: Record<ProductionStatus, string> = {
  [ProductionStatus.DRAFT]:       'bg-gray-100 text-gray-800   dark:bg-gray-800   dark:text-gray-300',
  [ProductionStatus.PLANNED]:     'bg-blue-100 text-blue-800   dark:bg-blue-900/60   dark:text-blue-300',
  [ProductionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  [ProductionStatus.PAUSED]:      'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
  [ProductionStatus.COMPLETED]:   'bg-green-100 text-green-800  dark:bg-green-900/60  dark:text-green-300',
  [ProductionStatus.CANCELLED]:   'bg-gray-100 text-gray-600   dark:bg-gray-800   dark:text-gray-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function ProductionTable() {
  const t = useTranslations('production');
  const router = useRouter();
  const { data: orders, isLoading } = useProductionOrders();
  const deleteMutation = useDeleteProductionOrder();
  const { openConfirm, handleConfirm, handleCancel, dialog } = useConfirmDialog();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!orders?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <>
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('columns.code')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.productName')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.quantity')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.status')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.plannedStart')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.plannedEnd')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-mono font-medium">{order.code}</td>
              <td className="px-4 py-3">{order.productName}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {Number(order.quantity).toLocaleString()} {order.unit}
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                    STATUS_STYLES[order.status]
                  }
                >
                  {t(`status.${order.status}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3">{formatDate(order.plannedStartDate)}</td>
              <td className="px-4 py-3">{formatDate(order.plannedEndDate)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/production/${order.id}`)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={t('actions.view')}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openConfirm(`Delete ${order.code}?`, () => deleteMutation.mutate(order.id))}
                    disabled={deleteMutation.isPending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-50"
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
