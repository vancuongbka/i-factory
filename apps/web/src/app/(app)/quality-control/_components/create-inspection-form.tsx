'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { QCResult } from '@i-factory/api-types';
import type { CreateQCInspectionDto } from '@i-factory/api-types';
import { useCreateInspection } from '@/hooks/use-qc';

export function CreateInspectionForm() {
  const t = useTranslations('qualityControl.inspections');
  const router = useRouter();
  const createMutation = useCreateInspection();

  const [form, setForm] = useState({
    inspectorId: '',
    inspectedAt: new Date().toISOString().slice(0, 16),
    workOrderId: '',
    productionOrderId: '',
    sampleSize: '1',
    passedCount: '0',
    failedCount: '0',
    notes: '',
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: Omit<CreateQCInspectionDto, 'factoryId'> = {
      inspectorId: form.inspectorId,
      inspectedAt: new Date(form.inspectedAt).toISOString(),
      sampleSize: parseInt(form.sampleSize),
      passedCount: parseInt(form.passedCount),
      failedCount: parseInt(form.failedCount),
      result: QCResult.PENDING,
      ...(form.workOrderId ? { workOrderId: form.workOrderId } : {}),
      ...(form.productionOrderId ? { productionOrderId: form.productionOrderId } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    };
    const inspection = await createMutation.mutateAsync(dto);
    router.push(`/quality-control/inspections/${inspection.id}`);
  }

  const inputClass =
    'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.inspectorId')} *</label>
          <input className={inputClass} value={form.inspectorId} onChange={set('inspectorId')} required placeholder="UUID" />
        </div>
        <div>
          <label className={labelClass}>{t('form.inspectedAt')} *</label>
          <input type="datetime-local" className={inputClass} value={form.inspectedAt} onChange={set('inspectedAt')} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.workOrderId')}</label>
          <input className={inputClass} value={form.workOrderId} onChange={set('workOrderId')} placeholder="UUID" />
        </div>
        <div>
          <label className={labelClass}>{t('form.productionOrderId')}</label>
          <input className={inputClass} value={form.productionOrderId} onChange={set('productionOrderId')} placeholder="UUID" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>{t('form.sampleSize')} *</label>
          <input type="number" min="1" className={inputClass} value={form.sampleSize} onChange={set('sampleSize')} required />
        </div>
        <div>
          <label className={labelClass}>{t('form.passedCount')} *</label>
          <input type="number" min="0" className={inputClass} value={form.passedCount} onChange={set('passedCount')} required />
        </div>
        <div>
          <label className={labelClass}>{t('form.failedCount')} *</label>
          <input type="number" min="0" className={inputClass} value={form.failedCount} onChange={set('failedCount')} required />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('form.notes')}</label>
        <textarea rows={3} className={inputClass} value={form.notes} onChange={set('notes')} />
      </div>

      {createMutation.error && (
        <p className="text-sm text-destructive">{createMutation.error.message}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Saving…' : t('actions.createSubmit')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
