'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCreateBom } from '@/hooks/use-bom';
import { useProducts } from '@/hooks/use-products';
import { useFactory } from '@/hooks/use-factory';

export function CreateBomForm() {
  const t = useTranslations('bom');
  const { factoryId } = useFactory();
  const router = useRouter();
  const createBom = useCreateBom();
  const { data: products } = useProducts();

  const [code, setCode] = useState('');
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [version, setVersion] = useState('1.0');
  const [outputQuantity, setOutputQuantity] = useState('1');
  const [outputUnit, setOutputUnit] = useState('');
  const [isPhantom, setIsPhantom] = useState(false);
  const [notes, setNotes] = useState('');

  // Single initial item (required by V2 schema min(1))
  const [materialId, setMaterialId] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemUnit, setItemUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createBom.mutate(
      {
        factoryId,
        productId: productId || undefined,
        code,
        productName,
        version,
        outputQuantity: Number(outputQuantity),
        outputUnit,
        isPhantom,
        notes: notes || undefined,
        items: [
          {
            materialId,
            sequence: 1,
            quantity: Number(itemQty),
            unit: itemUnit,
            wastePercentage: 0,
          },
        ],
      },
      { onSuccess: (b) => router.push(`/bom/${b.id}`) },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <section className="space-y-4">
        <h2 className="font-semibold">BOM Header</h2>

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
          <label className="text-sm font-medium">{t('fields.productName')}</label>
          <input required value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Link to Product (optional)</label>
          <select value={productId} onChange={(e) => { setProductId(e.target.value); if (e.target.value) { const p = products?.find((x) => x.id === e.target.value); if (p) setProductName(p.name); } }} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">— None —</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.outputQuantity')}</label>
            <input required type="number" min="0.001" step="0.001" value={outputQuantity} onChange={(e) => setOutputQuantity(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.outputUnit')}</label>
            <input required value={outputUnit} onChange={(e) => setOutputUnit(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g. PCS, KG" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPhantom} onChange={(e) => setIsPhantom(e.target.checked)} />
          {t('fields.isPhantom')}
        </label>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.notes')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">First Item (required)</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('items.material')} ID</label>
          <input required value={materialId} onChange={(e) => setMaterialId(e.target.value)} className="w-full rounded-md border px-3 py-2 font-mono text-sm" placeholder="UUID of material" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('items.quantity')}</label>
            <input required type="number" min="0.001" step="0.001" value={itemQty} onChange={(e) => setItemQty(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('items.unit')}</label>
            <input required value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g. KG" />
          </div>
        </div>
      </section>

      {createBom.error && <p className="text-sm text-destructive">{createBom.error.message}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={createBom.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {createBom.isPending ? 'Saving…' : t('actions.create')}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
      </div>
    </form>
  );
}
