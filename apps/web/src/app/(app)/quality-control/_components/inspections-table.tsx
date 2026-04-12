'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { QCResult } from '@i-factory/api-types';
import { useInspections } from '@/hooks/use-qc';

const RESULT_STYLES: Record<QCResult, string> = {
  [QCResult.PASS]:        'bg-green-100 text-green-700',
  [QCResult.FAIL]:        'bg-red-100 text-red-700',
  [QCResult.CONDITIONAL]: 'bg-yellow-100 text-yellow-800',
  [QCResult.PENDING]:     'bg-gray-100 text-gray-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function InspectionsTable() {
  const t = useTranslations('qualityControl.inspections');
  const router = useRouter();
  const { data: inspections, isLoading } = useInspections();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!inspections?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('columns.inspectedAt')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.result')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.sample')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.passed')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.failed')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.defects')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.order')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((insp) => {
            const linkedOrder = insp.workOrderId ?? insp.productionOrderId;
            return (
              <tr key={insp.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{formatDate(insp.inspectedAt)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                      RESULT_STYLES[insp.result]
                    }
                  >
                    {t(`result.${insp.result}` as Parameters<typeof t>[0])}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{insp.sampleSize}</td>
                <td className="px-4 py-3 text-right tabular-nums text-green-600">{insp.passedCount}</td>
                <td className="px-4 py-3 text-right tabular-nums text-red-600">{insp.failedCount}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {insp.defects?.length ?? 0}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {linkedOrder ? `${linkedOrder.slice(0, 8)}…` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => router.push(`/quality-control/inspections/${insp.id}`)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={t('actions.view')}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
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
