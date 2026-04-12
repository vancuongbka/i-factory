'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MovementType } from '@i-factory/api-types';
import type { CreateStockMovementDto } from '@i-factory/api-types';
import { useRecordMovement } from '@/hooks/use-inventory';

const ALL_TYPES = Object.values(MovementType);

interface Props {
  /** Pre-select a material ID (e.g. when opened from the material detail). */
  defaultMaterialId?: string;
  onClose: () => void;
}

export function RecordMovementModal({ defaultMaterialId, onClose }: Props) {
  const t = useTranslations('inventory.movements');
  const recordMutation = useRecordMovement();

  const [form, setForm] = useState({
    materialId: defaultMaterialId ?? '',
    type: MovementType.RECEIPT,
    quantity: '',
    unit: '',
    notes: '',
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: Omit<CreateStockMovementDto, 'factoryId'> = {
      materialId: form.materialId,
      type: form.type as MovementType,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      ...(form.notes ? { notes: form.notes } : {}),
    };
    await recordMutation.mutateAsync(dto);
    onClose();
  }

  const inputClass =
    'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
        <h3 className="mb-5 text-base font-semibold">{t('record.title')}</h3>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div>
            <label className={labelClass}>{t('record.materialId')} *</label>
            <input
              className={inputClass}
              value={form.materialId}
              onChange={set('materialId')}
              placeholder="UUID"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('record.type')} *</label>
              <select className={inputClass} value={form.type} onChange={set('type')}>
                {ALL_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`type.${tp}` as Parameters<typeof t>[0])}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('record.unit')} *</label>
              <input className={inputClass} value={form.unit} onChange={set('unit')} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('record.quantity')} *</label>
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
            <label className={labelClass}>{t('record.notes')}</label>
            <textarea rows={2} className={inputClass} value={form.notes} onChange={set('notes')} />
          </div>

          {recordMutation.error && (
            <p className="text-sm text-destructive">{recordMutation.error.message}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {recordMutation.isPending ? 'Saving…' : t('record.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
