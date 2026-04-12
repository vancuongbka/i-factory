'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { WorkCenterType } from '@i-factory/api-types';
import { useWorkCenters, useCreateWorkCenter, useDeleteWorkCenter } from '@/hooks/use-work-centers';
import { useFactory } from '@/hooks/use-factory';

export function WorkCenterTable() {
  const t = useTranslations('masterData.workCenters');
  const { factoryId } = useFactory();
  const router = useRouter();
  const { data: workCenters, isLoading } = useWorkCenters();
  const createWC = useCreateWorkCenter();
  const deleteWC = useDeleteWorkCenter();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkCenterType>(WorkCenterType.MACHINE);
  const [capacityPerHour, setCapacityPerHour] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createWC.mutate(
      {
        factoryId,
        code,
        name,
        type,
        isActive: true,
        capacityPerHour: capacityPerHour ? Number(capacityPerHour) : undefined,
        description: description || undefined,
      },
      { onSuccess: () => { setShowForm(false); setCode(''); setName(''); setCapacityPerHour(''); setDescription(''); } },
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
              <label className="text-sm font-medium">{t('fields.type')}</label>
              <select value={type} onChange={(e) => setType(e.target.value as WorkCenterType)} className="w-full rounded-md border px-3 py-2 text-sm">
                {Object.values(WorkCenterType).map((v) => (
                  <option key={v} value={v}>{t(`types.${v}`)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.name')}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.capacity')}</label>
            <input type="number" min="0" step="0.01" value={capacityPerHour} onChange={(e) => setCapacityPerHour(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.description')}</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          {createWC.error && <p className="text-sm text-destructive">{createWC.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={createWC.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {createWC.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {!workCenters?.length && !showForm ? (
        <p className="text-muted-foreground">No work centers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('fields.code')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.name')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.type')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.capacity')}</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workCenters?.map((wc) => (
                <tr key={wc.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono">{wc.code}</td>
                  <td className="px-4 py-3">{wc.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{t(`types.${wc.type}`)}</span>
                  </td>
                  <td className="px-4 py-3">{wc.capacityPerHour ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => router.push(`/master-data/work-centers/${wc.id}`)} className="mr-2 text-sm text-primary hover:underline">
                      {t('actions.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm(`Delete "${wc.name}"?`)) deleteWC.mutate(wc.id); }}
                      className="text-sm text-destructive hover:underline"
                    >
                      {t('actions.delete')}
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
