'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { QCResult, DefectSeverity } from '@i-factory/api-types';
import type { CreateDefectDto } from '@i-factory/api-types';
import {
  useInspection,
  useApproveInspection,
  useRejectInspection,
  useAddDefect,
} from '@/hooks/use-qc';

const RESULT_STYLES: Record<QCResult, string> = {
  [QCResult.PASS]:         'bg-green-100 text-green-700',
  [QCResult.FAIL]:         'bg-red-100 text-red-700',
  [QCResult.CONDITIONAL]:  'bg-yellow-100 text-yellow-800',
  [QCResult.PENDING]:      'bg-gray-100 text-gray-500',
};

const SEVERITY_STYLES: Record<DefectSeverity, string> = {
  [DefectSeverity.CRITICAL]: 'bg-red-100 text-red-700',
  [DefectSeverity.MAJOR]:    'bg-orange-100 text-orange-700',
  [DefectSeverity.MINOR]:    'bg-yellow-100 text-yellow-800',
};

const ALL_SEVERITIES = Object.values(DefectSeverity);

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function AddDefectForm({ inspectionId }: { inspectionId: string }) {
  const t = useTranslations('qualityControl.inspections');
  const addMutation = useAddDefect();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', severity: DefectSeverity.MINOR,
    quantity: '1', rootCause: '', correctiveAction: '',
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Omit<CreateDefectDto, 'factoryId' | 'inspectionId'> = {
      description: form.description,
      severity: form.severity as DefectSeverity,
      quantity: parseInt(form.quantity),
      ...(form.code ? { code: form.code } : {}),
      ...(form.rootCause ? { rootCause: form.rootCause } : {}),
      ...(form.correctiveAction ? { correctiveAction: form.correctiveAction } : {}),
    };
    await addMutation.mutateAsync({ inspectionId, body });
    setOpen(false);
    setForm({ code: '', description: '', severity: DefectSeverity.MINOR, quantity: '1', rootCause: '', correctiveAction: '' });
  }

  const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
      >
        + {t('defects.add')}
      </button>
    );
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">{t('defects.form.code')}</label>
          <input className={inputClass} value={form.code} onChange={set('code')} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t('defects.form.severity')} *</label>
          <select className={inputClass} value={form.severity} onChange={set('severity')}>
            {ALL_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {t(`defects.severity.${s}` as Parameters<typeof t>[0])}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1">{t('defects.form.description')} *</label>
          <input className={inputClass} value={form.description} onChange={set('description')} required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t('defects.form.quantity')} *</label>
          <input type="number" min="1" className={inputClass} value={form.quantity} onChange={set('quantity')} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">{t('defects.form.rootCause')}</label>
          <input className={inputClass} value={form.rootCause} onChange={set('rootCause')} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t('defects.form.correctiveAction')}</label>
          <input className={inputClass} value={form.correctiveAction} onChange={set('correctiveAction')} />
        </div>
      </div>
      {addMutation.error && <p className="text-xs text-destructive">{addMutation.error.message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={addMutation.isPending}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {addMutation.isPending ? 'Saving…' : t('defects.form.submit')}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function InspectionDetailClient({ id }: { id: string }) {
  const t = useTranslations('qualityControl.inspections');
  const { data: insp, isLoading } = useInspection(id);
  const approveMutation = useApproveInspection();
  const rejectMutation = useRejectInspection();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!insp) return <p className="text-sm text-destructive">Inspection not found.</p>;

  const passRate = insp.sampleSize > 0
    ? Math.round((insp.passedCount / insp.sampleSize) * 100)
    : 0;
  const isPending = insp.result === QCResult.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{formatDateTime(insp.inspectedAt)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Inspector: <span className="font-mono">{insp.inspectorId.slice(0, 8)}…</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ' +
              RESULT_STYLES[insp.result]
            }>
              {t(`result.${insp.result}` as Parameters<typeof t>[0])}
            </span>
            {isPending && (
              <>
                <button
                  type="button"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(id)}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {t('actions.approve')}
                </button>
                <button
                  type="button"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate(id)}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {t('actions.reject')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('columns.sample'), value: insp.sampleSize.toString() },
          { label: t('columns.passed'), value: insp.passedCount.toString(), className: 'text-green-600' },
          { label: t('columns.failed'), value: insp.failedCount.toString(), className: 'text-red-600' },
          { label: 'Pass Rate', value: `${passRate}%`, className: passRate >= 90 ? 'text-green-600' : 'text-red-600' },
        ].map(({ label, value, className }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${className ?? ''}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Linked orders */}
      {(insp.workOrderId ?? insp.productionOrderId) && (
        <div className="rounded-lg border bg-card px-4 py-3 text-sm space-y-1">
          {insp.workOrderId && <p>Work Order: <span className="font-mono">{insp.workOrderId}</span></p>}
          {insp.productionOrderId && <p>Production Order: <span className="font-mono">{insp.productionOrderId}</span></p>}
        </div>
      )}

      {/* Notes */}
      {insp.notes && (
        <div className="rounded-lg border bg-card px-4 py-3 text-sm">
          <p className="font-medium mb-1">Notes</p>
          <p className="text-muted-foreground">{insp.notes}</p>
        </div>
      )}

      {/* Defects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t('defects.title')} ({insp.defects?.length ?? 0})</h3>
          <AddDefectForm inspectionId={id} />
        </div>

        {!insp.defects?.length ? (
          <p className="text-sm text-muted-foreground">{t('defects.noDefects')}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">{t('defects.columns.code')}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('defects.columns.description')}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('defects.columns.severity')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('defects.columns.quantity')}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('defects.columns.rootCause')}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('defects.columns.corrective')}</th>
                </tr>
              </thead>
              <tbody>
                {insp.defects.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{d.code ?? '—'}</td>
                    <td className="px-3 py-2">{d.description}</td>
                    <td className="px-3 py-2">
                      <span className={
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
                        SEVERITY_STYLES[d.severity]
                      }>
                        {t(`defects.severity.${d.severity}` as Parameters<typeof t>[0])}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{d.quantity}</td>
                    <td className="px-3 py-2 text-muted-foreground max-w-xs truncate">{d.rootCause ?? '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground max-w-xs truncate">{d.correctiveAction ?? '—'}</td>
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
