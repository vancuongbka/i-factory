'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { MachineStatus } from '@i-factory/api-types';
import { ConfirmDialog } from '@i-factory/ui';
import { useMachines, useCreateMachine, useDeleteMachine } from '@/hooks/use-work-centers';
import { useFactory } from '@/hooks/use-factory';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

interface MachinesPanelProps {
  workCenterId: string;
}

export function MachinesPanel({ workCenterId }: MachinesPanelProps) {
  const t = useTranslations('masterData.workCenters.machines');
  const { factoryId } = useFactory();
  const { data: machines, isLoading } = useMachines(workCenterId);
  const createMachine = useCreateMachine(workCenterId);
  const deleteMachine = useDeleteMachine(workCenterId);
  const { openConfirm, handleConfirm, handleCancel, dialog } = useConfirmDialog();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacityPerHour, setCapacityPerHour] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createMachine.mutate(
      {
        factoryId,
        workCenterId,
        code,
        name,
        model: model || undefined,
        serialNumber: serialNumber || undefined,
        status: MachineStatus.IDLE,
        capacityPerHour: capacityPerHour ? Number(capacityPerHour) : undefined,
      },
      { onSuccess: () => { setShowForm(false); setCode(''); setName(''); setModel(''); setSerialNumber(''); setCapacityPerHour(''); } },
    );
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('title')}</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          {t('actions.add')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-md border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.code')}</label>
              <input required value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.name')}</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.model')}</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.serialNumber')}</label>
              <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.capacity')}</label>
              <input type="number" min="0" step="0.01" value={capacityPerHour} onChange={(e) => setCapacityPerHour(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
          </div>
          {createMachine.error && <p className="text-sm text-destructive">{createMachine.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={createMachine.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {createMachine.isPending ? 'Saving…' : 'Add Machine'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {!machines?.length && !showForm ? (
        <p className="text-sm text-muted-foreground">No machines registered.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('fields.code')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.name')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.model')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.status')}</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines?.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono">{m.code}</td>
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.model ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      m.status === MachineStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                      m.status === MachineStatus.BREAKDOWN ? 'bg-red-100 text-red-700' :
                      m.status === MachineStatus.MAINTENANCE ? 'bg-yellow-100 text-yellow-700' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {t(`statuses.${m.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openConfirm(`Remove machine "${m.name}"?`, () => deleteMachine.mutate(m.id), { confirmLabel: 'Remove' })}
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
