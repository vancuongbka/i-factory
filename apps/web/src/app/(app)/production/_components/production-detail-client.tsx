'use client';

import { useTranslations } from 'next-intl';
import { ProductionStatus } from '@i-factory/api-types';
import { useProductionOrder } from '@/hooks/use-production-orders';

const STATUS_STYLES: Record<ProductionStatus, string> = {
  [ProductionStatus.DRAFT]:       'bg-gray-100 text-gray-700',
  [ProductionStatus.PLANNED]:     'bg-blue-100 text-blue-700',
  [ProductionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [ProductionStatus.PAUSED]:      'bg-orange-100 text-orange-700',
  [ProductionStatus.COMPLETED]:   'bg-green-100 text-green-700',
  [ProductionStatus.CANCELLED]:   'bg-gray-100 text-gray-400',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProductionDetailClient({ id }: { id: string }) {
  const t = useTranslations('production');
  const { data: order, isLoading } = useProductionOrder(id);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!order) return <p className="text-sm text-destructive">Production order not found.</p>;

  const completedPct =
    order.quantity > 0
      ? Math.round((Number(order.completedQuantity) / Number(order.quantity)) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold font-mono">{order.code}</h2>
            <p className="mt-1 text-muted-foreground">{order.productName}</p>
          </div>
          <span
            className={
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ' +
              STATUS_STYLES[order.status]
            }
          >
            {t(`status.${order.status}` as Parameters<typeof t>[0])}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailCard label={t('columns.quantity')}>
          {Number(order.quantity).toLocaleString()} {order.unit}
        </DetailCard>
        <DetailCard label="Completed Quantity">
          {Number(order.completedQuantity).toLocaleString()} {order.unit}
        </DetailCard>
        <DetailCard label={t('columns.plannedStart')}>{formatDate(order.plannedStartDate)}</DetailCard>
        <DetailCard label={t('columns.plannedEnd')}>{formatDate(order.plannedEndDate)}</DetailCard>
        <DetailCard label="Actual Start">{formatDate(order.actualStartDate)}</DetailCard>
        <DetailCard label="Actual End">{formatDate(order.actualEndDate)}</DetailCard>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Production Progress</span>
          <span className="text-muted-foreground">{completedPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${completedPct}%` }}
          />
        </div>
      </div>

      {/* Optional IDs */}
      {(order.bomId ?? order.productionLineId) && (
        <div className="rounded-lg border bg-card p-4 text-sm space-y-1">
          {order.bomId && (
            <p>
              <span className="font-medium">BOM ID:</span>{' '}
              <span className="font-mono text-muted-foreground">{order.bomId}</span>
            </p>
          )}
          {order.productionLineId && (
            <p>
              <span className="font-medium">Production Line ID:</span>{' '}
              <span className="font-mono text-muted-foreground">{order.productionLineId}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{children}</p>
    </div>
  );
}
