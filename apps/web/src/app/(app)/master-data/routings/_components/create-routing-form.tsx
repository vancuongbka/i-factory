'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCreateRouting } from '@/hooks/use-routings';
import { useProducts } from '@/hooks/use-products';
import { useFactory } from '@/hooks/use-factory';
import { useWorkCenters } from '@/hooks/use-work-centers';

export function CreateRoutingForm() {
  const t = useTranslations('masterData.routings');
  const tOp = useTranslations('masterData.routings.operations');
  const { factoryId } = useFactory();
  const router = useRouter();
  const createRouting = useCreateRouting();
  const { data: products } = useProducts();
  const { data: workCenters } = useWorkCenters();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [version, setVersion] = useState('1.0');
  const [notes, setNotes] = useState('');

  // Single initial operation (required by schema min(1))
  const [opName, setOpName] = useState('');
  const [workCenterId, setWorkCenterId] = useState('');
  const [cycleTimeMinutes, setCycleTimeMinutes] = useState('');
  const [setupTimeMinutes, setSetupTimeMinutes] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createRouting.mutate(
      {
        factoryId,
        productId,
        code,
        name,
        version,
        isActive: true,
        notes: notes || undefined,
        operations: [
          {
            sequence: 1,
            name: opName,
            workCenterId,
            cycleTimeMinutes: Number(cycleTimeMinutes),
            setupTimeMinutes: Number(setupTimeMinutes),
            machineIds: [],
            requiredSkills: [],
            isOptional: false,
          },
        ],
      },
      { onSuccess: (r) => router.push(`/master-data/routings/${r.id}`) },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <section className="space-y-4">
        <h2 className="font-semibold">Routing Header</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.code')}</label>
            <input required value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.version')}</label>
            <input required value={version} onChange={(e) => setVersion(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.name')}</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.product')}</label>
          <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">— Select product —</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.notes')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">First Operation (required)</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">{tOp('name')}</label>
          <input required value={opName} onChange={(e) => setOpName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{tOp('workCenter')}</label>
          <select required value={workCenterId} onChange={(e) => setWorkCenterId(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">— Select work center —</option>
            {workCenters?.map((wc) => (
              <option key={wc.id} value={wc.id}>{wc.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">{tOp('cycleTime')}</label>
            <input required type="number" min="0.1" step="0.1" value={cycleTimeMinutes} onChange={(e) => setCycleTimeMinutes(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{tOp('setupTime')}</label>
            <input type="number" min="0" value={setupTimeMinutes} onChange={(e) => setSetupTimeMinutes(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {createRouting.error && <p className="text-sm text-destructive">{createRouting.error.message}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={createRouting.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {createRouting.isPending ? 'Saving…' : t('actions.create')}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
      </div>
    </form>
  );
}
