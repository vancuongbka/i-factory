'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@i-factory/ui';
import { useUoms, useCreateUom, useDeleteUom } from '@/hooks/use-uoms';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useFactory } from '@/hooks/use-factory';

export function UomTable() {
  const t = useTranslations('masterData.uoms');
  const { factoryId } = useFactory();
  const { data: uoms, isLoading } = useUoms();
  const createUom = useCreateUom();
  const deleteUom = useDeleteUom();
  const { openConfirm, handleConfirm, handleCancel, dialog } = useConfirmDialog();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [isBase, setIsBase] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createUom.mutate(
      { factoryId, code, name, symbol, isBase },
      { onSuccess: () => { setShowForm(false); setCode(''); setName(''); setSymbol(''); setIsBase(false); } },
    );
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t('actions.create')}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="max-w-md space-y-3 rounded-md border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.code')}</label>
              <input required value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.symbol')}</label>
              <input required value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.name')}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isBase} onChange={(e) => setIsBase(e.target.checked)} />
            {t('fields.isBase')}
          </label>
          {createUom.error && <p className="text-sm text-destructive">{createUom.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={createUom.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {createUom.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {!uoms?.length && !showForm ? (
        <p className="text-muted-foreground">No units of measure found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('fields.code')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.name')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.symbol')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.isBase')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.isActive')}</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uoms?.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono">{u.code}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.symbol}</td>
                  <td className="px-4 py-3">{u.isBase ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <span className={u.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openConfirm(`Delete "${u.name}"?`, () => deleteUom.mutate(u.id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      title={t('actions.delete')}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog && (
        <ConfirmDialog message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
}
