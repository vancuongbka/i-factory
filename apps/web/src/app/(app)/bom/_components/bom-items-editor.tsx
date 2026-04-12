'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAddBomItem, useRemoveBomItem } from '@/hooks/use-bom';

interface BomItem {
  id: string;
  materialId?: string | null;
  childBomId?: string | null;
  sequence: number;
  quantity: number;
  unit: string;
  wastePercentage: number;
  notes?: string | null;
}

interface BomItemsEditorProps {
  bomId: string;
  items: BomItem[];
}

export function BomItemsEditor({ bomId, items }: BomItemsEditorProps) {
  const t = useTranslations('bom.items');
  const addItem = useAddBomItem(bomId);
  const removeItem = useRemoveBomItem(bomId);

  const [showForm, setShowForm] = useState(false);
  const [itemType, setItemType] = useState<'material' | 'childBom'>('material');
  const [refId, setRefId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [wastePercentage, setWastePercentage] = useState('0');
  const [notes, setNotes] = useState('');

  const nextSequence = items.length > 0
    ? Math.max(...items.map((i) => i.sequence)) + 1
    : 1;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addItem.mutate(
      {
        materialId: itemType === 'material' ? refId : undefined,
        childBomId: itemType === 'childBom' ? refId : undefined,
        sequence: nextSequence,
        quantity: Number(quantity),
        unit,
        wastePercentage: Number(wastePercentage),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setRefId('');
          setQuantity('1');
          setUnit('');
          setWastePercentage('0');
          setNotes('');
        },
      },
    );
  };

  const sorted = [...items].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">BOM Items</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          + Add Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-md border p-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="material" checked={itemType === 'material'} onChange={() => setItemType('material')} />
              {t('material')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="childBom" checked={itemType === 'childBom'} onChange={() => setItemType('childBom')} />
              {t('childBom')}
            </label>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{itemType === 'material' ? `${t('material')} ID` : `${t('childBom')} ID`}</label>
            <input required value={refId} onChange={(e) => setRefId(e.target.value)} className="w-full rounded-md border px-3 py-2 font-mono text-sm" placeholder="UUID" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('quantity')}</label>
              <input required type="number" min="0.001" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('unit')}</label>
              <input required value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('waste')}</label>
              <input type="number" min="0" max="100" step="0.1" value={wastePercentage} onChange={(e) => setWastePercentage(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('notes')}</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          {addItem.error && <p className="text-sm text-destructive">{addItem.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={addItem.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {addItem.isPending ? 'Saving…' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">{t('sequence')}</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Reference</th>
                <th className="px-3 py-2 text-left font-medium">{t('quantity')}</th>
                <th className="px-3 py-2 text-left font-medium">{t('unit')}</th>
                <th className="px-3 py-2 text-left font-medium">{t('waste')}</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2">{item.sequence}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {item.materialId ? t('material') : t('childBom')}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {item.materialId ?? item.childBomId}
                  </td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{item.unit}</td>
                  <td className="px-3 py-2">{item.wastePercentage}%</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => { if (confirm('Remove this item?')) removeItem.mutate(item.id); }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
