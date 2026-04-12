'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProductionStatus } from '@i-factory/api-types';
import { useProductionOrders, useDeleteProductionOrder } from '@/hooks/use-production-orders';

const STATUS_STYLES: Record<ProductionStatus, string> = {
  [ProductionStatus.DRAFT]:       'bg-gray-100 text-gray-700',
  [ProductionStatus.PLANNED]:     'bg-blue-100 text-blue-700',
  [ProductionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [ProductionStatus.PAUSED]:      'bg-orange-100 text-orange-700',
  [ProductionStatus.COMPLETED]:   'bg-green-100 text-green-700',
  [ProductionStatus.CANCELLED]:   'bg-gray-100 text-gray-400',
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

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!orders?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
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
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/production/${order.id}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('actions.view')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete ${order.code}?`)) {
                        deleteMutation.mutate(order.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-sm text-destructive hover:underline disabled:opacity-50"
                  >
                    {t('actions.delete')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
