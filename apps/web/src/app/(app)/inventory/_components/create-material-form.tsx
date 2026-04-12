'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { CreateMaterialDto } from '@i-factory/api-types';
import { useCreateMaterial } from '@/hooks/use-inventory';

export function CreateMaterialForm() {
  const t = useTranslations('inventory.materials');
  const router = useRouter();
  const createMutation = useCreateMaterial();

  const [form, setForm] = useState({
    code: '',
    name: '',
    unit: '',
    currentStock: '0',
    minStockLevel: '0',
    maxStockLevel: '',
    warehouseId: '',
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: Omit<CreateMaterialDto, 'factoryId'> = {
      code: form.code,
      name: form.name,
      unit: form.unit,
      currentStock: parseFloat(form.currentStock) || 0,
      minStockLevel: parseFloat(form.minStockLevel) || 0,
      ...(form.maxStockLevel ? { maxStockLevel: parseFloat(form.maxStockLevel) } : {}),
      ...(form.warehouseId ? { warehouseId: form.warehouseId } : {}),
    };
    await createMutation.mutateAsync(dto);
    router.push('/inventory/materials');
  }

  const inputClass =
    'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.code')} *</label>
          <input className={inputClass} value={form.code} onChange={set('code')} required />
        </div>
        <div>
          <label className={labelClass}>{t('form.name')} *</label>
          <input className={inputClass} value={form.name} onChange={set('name')} required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>{t('form.unit')} *</label>
          <input className={inputClass} value={form.unit} onChange={set('unit')} required placeholder="pcs, kg, L…" />
        </div>
        <div>
          <label className={labelClass}>{t('form.currentStock')}</label>
          <input type="number" min="0" step="0.001" className={inputClass} value={form.currentStock} onChange={set('currentStock')} />
        </div>
        <div>
          <label className={labelClass}>{t('form.minStockLevel')}</label>
          <input type="number" min="0" step="0.001" className={inputClass} value={form.minStockLevel} onChange={set('minStockLevel')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.maxStockLevel')}</label>
          <input type="number" min="0" step="0.001" className={inputClass} value={form.maxStockLevel} onChange={set('maxStockLevel')} />
        </div>
        <div>
          <label className={labelClass}>{t('form.warehouseId')}</label>
          <input className={inputClass} value={form.warehouseId} onChange={set('warehouseId')} />
        </div>
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
