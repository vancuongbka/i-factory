'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { WorkOrderStatus } from '@i-factory/api-types';
import { useWorkOrders } from '@/hooks/use-work-orders';
import type { WorkOrderWithSteps } from '@/lib/api-client';

const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.PENDING]:     'bg-gray-100 text-gray-800   dark:bg-gray-800   dark:text-gray-300',
  [WorkOrderStatus.ASSIGNED]:    'bg-blue-100 text-blue-800   dark:bg-blue-900/60   dark:text-blue-300',
  [WorkOrderStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  [WorkOrderStatus.ON_HOLD]:     'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
  [WorkOrderStatus.COMPLETED]:   'bg-green-100 text-green-800  dark:bg-green-900/60  dark:text-green-300',
  [WorkOrderStatus.REJECTED]:    'bg-red-100 text-red-800     dark:bg-red-900/60    dark:text-red-400',
  [WorkOrderStatus.CANCELLED]:   'bg-gray-100 text-gray-600   dark:bg-gray-800   dark:text-gray-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function StepProgress({ wo }: { wo: WorkOrderWithSteps }) {
  const steps = wo.steps ?? [];
  if (steps.length === 0) return <span className="text-muted-foreground">—</span>;
  const done = steps.filter((s) => s.isCompleted).length;
  return (
    <span className="text-sm">
      {done}/{steps.length}
    </span>
  );
}

export function WorkOrdersTable() {
  const t = useTranslations('workOrders');
  const router = useRouter();
  const { data: workOrders, isLoading } = useWorkOrders();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!workOrders?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('columns.code')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.productionOrder')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.status')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.plannedStart')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.plannedEnd')}</th>
            <th className="px-4 py-3 text-center font-medium">{t('columns.steps')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((wo) => (
            <tr key={wo.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-mono font-medium">{wo.code}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {wo.productionOrderId.slice(0, 8)}…
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                    STATUS_STYLES[wo.status]
                  }
                >
                  {t(`status.${wo.status}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{formatDate(wo.plannedStartDate)}</td>
              <td className="px-4 py-3 text-sm">{formatDate(wo.plannedEndDate)}</td>
              <td className="px-4 py-3 text-center">
                <StepProgress wo={wo} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => router.push(`/work-orders/${wo.id}`)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                  title={t('actions.view')}
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
