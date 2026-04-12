'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { CreateProductionOrderDto } from '@i-factory/api-types';
import { useCreateProductionOrder } from '@/hooks/use-production-orders';

export function CreateProductionForm() {
  const t = useTranslations('production');
  const router = useRouter();
  const createMutation = useCreateProductionOrder();

  const [form, setForm] = useState({
    code: '',
    productName: '',
    quantity: '',
    unit: 'pcs',
    plannedStartDate: '',
    plannedEndDate: '',
    productionLineId: '',
    bomId: '',
    notes: '',
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: Omit<CreateProductionOrderDto, 'factoryId'> = {
      code: form.code,
      productName: form.productName,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      plannedStartDate: new Date(form.plannedStartDate).toISOString(),
      plannedEndDate: new Date(form.plannedEndDate).toISOString(),
      ...(form.productionLineId ? { productionLineId: form.productionLineId } : {}),
      ...(form.bomId ? { bomId: form.bomId } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    };
    await createMutation.mutateAsync(dto);
    router.push('/production');
  }

  const inputClass =
    'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.code')} *</label>
          <input className={inputClass} value={form.code} onChange={set('code')} required />
        </div>
        <div>
          <label className={labelClass}>{t('form.productName')} *</label>
          <input className={inputClass} value={form.productName} onChange={set('productName')} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.quantity')} *</label>
          <input
            type="number"
            min="0.001"
            step="0.001"
            className={inputClass}
            value={form.quantity}
            onChange={set('quantity')}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{t('form.unit')} *</label>
          <input className={inputClass} value={form.unit} onChange={set('unit')} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.plannedStartDate')} *</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.plannedStartDate}
            onChange={set('plannedStartDate')}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{t('form.plannedEndDate')} *</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.plannedEndDate}
            onChange={set('plannedEndDate')}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.productionLineId')}</label>
          <input className={inputClass} value={form.productionLineId} onChange={set('productionLineId')} />
        </div>
        <div>
          <label className={labelClass}>{t('form.bomId')}</label>
          <input className={inputClass} value={form.bomId} onChange={set('bomId')} />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('form.notes')}</label>
        <textarea
          rows={3}
          className={inputClass}
          value={form.notes}
          onChange={set('notes')}
        />
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
