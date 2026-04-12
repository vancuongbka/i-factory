'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { WorkOrderStatus } from '@i-factory/api-types';
import { useWorkOrder } from '@/hooks/use-work-orders';

const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.PENDING]:     'bg-gray-100 text-gray-700',
  [WorkOrderStatus.ASSIGNED]:    'bg-blue-100 text-blue-700',
  [WorkOrderStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [WorkOrderStatus.ON_HOLD]:     'bg-orange-100 text-orange-700',
  [WorkOrderStatus.COMPLETED]:   'bg-green-100 text-green-700',
  [WorkOrderStatus.REJECTED]:    'bg-red-100 text-red-700',
  [WorkOrderStatus.CANCELLED]:   'bg-gray-100 text-gray-400',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  id: string;
}

export function WorkOrderDetailClient({ id }: Props) {
  const t = useTranslations('workOrders');
  const router = useRouter();
  const { data: wo, isLoading } = useWorkOrder(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!wo) {
    return <p className="text-sm text-muted-foreground">Work order not found.</p>;
  }

  const steps = wo.steps ?? [];
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push('/work-orders')}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {t('title')}
      </button>

      {/* Header card */}
      <div className="rounded-md border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('columns.code')}</p>
            <p className="text-2xl font-bold font-mono">{wo.code}</p>
          </div>
          <span
            className={
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ' +
              STATUS_STYLES[wo.status]
            }
          >
            {t(`status.${wo.status}` as Parameters<typeof t>[0])}
          </span>
        </div>

        {wo.description && (
          <p className="text-sm text-muted-foreground">{wo.description}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('columns.productionOrder')}</p>
            <p className="mt-1 font-mono text-sm">{wo.productionOrderId.slice(0, 8)}…</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('columns.plannedStart')}</p>
            <p className="mt-1 text-sm">{formatDate(wo.plannedStartDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('columns.plannedEnd')}</p>
            <p className="mt-1 text-sm">{formatDate(wo.plannedEndDate)}</p>
          </div>
          {wo.actualStartDate && (
            <div>
              <p className="text-xs text-muted-foreground">Actual Start</p>
              <p className="mt-1 text-sm">{formatDate(wo.actualStartDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {steps.length > 0 && (
        <div className="rounded-md border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{t('steps.title')}</p>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{steps.length} {t('steps.completed').toLowerCase()}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps table */}
      <div className="rounded-md border bg-card">
        <div className="border-b px-6 py-4">
          <p className="font-medium">{t('steps.title')}</p>
        </div>
        {steps.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground text-center">{t('steps.noSteps')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">{t('steps.stepNumber')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('steps.name')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('steps.workCenter')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('steps.estimatedMinutes')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('steps.requiredSkills')}</th>
                  <th className="px-4 py-3 text-center font-medium w-28">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...steps]
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((step) => (
                    <tr key={step.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-center font-mono">{step.stepNumber}</td>
                      <td className="px-4 py-3 font-medium">{step.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {step.workCenterId ? (
                          <span className="font-mono text-xs">{step.workCenterId.slice(0, 8)}…</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {step.estimatedMinutes ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {step.requiredSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {step.requiredSkills.map((sk) => (
                              <span
                                key={sk}
                                className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {step.isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            {t('steps.completed')}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {t('steps.pending')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
