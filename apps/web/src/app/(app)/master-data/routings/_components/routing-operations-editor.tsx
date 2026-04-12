'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { RoutingOperationResponse } from '@i-factory/api-types';
import { ConfirmDialog } from '@i-factory/ui';
import {
  useAddRoutingOperation,
  useDeleteRoutingOperation,
} from '@/hooks/use-routings';
import { useWorkCenters } from '@/hooks/use-work-centers';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

interface RoutingOperationsEditorProps {
  routingId: string;
  operations: RoutingOperationResponse[];
}

export function RoutingOperationsEditor({ routingId, operations }: RoutingOperationsEditorProps) {
  const t = useTranslations('masterData.routings.operations');
  const { data: workCenters } = useWorkCenters();
  const addOp = useAddRoutingOperation(routingId);
  const deleteOp = useDeleteRoutingOperation(routingId);
  const { openConfirm, handleConfirm, handleCancel, dialog } = useConfirmDialog();

  const [showForm, setShowForm] = useState(false);
  const [opName, setOpName] = useState('');
  const [workCenterId, setWorkCenterId] = useState('');
  const [cycleTimeMinutes, setCycleTimeMinutes] = useState('');
  const [setupTimeMinutes, setSetupTimeMinutes] = useState('0');
  const [isOptional, setIsOptional] = useState(false);
  const [workInstructions, setWorkInstructions] = useState('');

  const nextSequence = operations.length > 0
    ? Math.max(...operations.map((o) => o.sequence)) + 1
    : 1;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addOp.mutate(
      {
        sequence: nextSequence,
        name: opName,
        workCenterId,
        cycleTimeMinutes: Number(cycleTimeMinutes),
        setupTimeMinutes: Number(setupTimeMinutes),
        isOptional,
        workInstructions: workInstructions || undefined,
        machineIds: [],
        requiredSkills: [],
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setOpName('');
          setWorkCenterId('');
          setCycleTimeMinutes('');
          setSetupTimeMinutes('0');
          setIsOptional(false);
          setWorkInstructions('');
        },
      },
    );
  };

  const sorted = [...operations].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('title')}</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          + {t('title').slice(0, -1)} {/* "Add Operation" */}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-md border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('name')}</label>
              <input required value={opName} onChange={(e) => setOpName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('workCenter')}</label>
              <select required value={workCenterId} onChange={(e) => setWorkCenterId(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">— Select —</option>
                {workCenters?.map((wc) => (
                  <option key={wc.id} value={wc.id}>{wc.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('cycleTime')}</label>
              <input required type="number" min="0.1" step="0.1" value={cycleTimeMinutes} onChange={(e) => setCycleTimeMinutes(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('setupTime')}</label>
              <input type="number" min="0" value={setupTimeMinutes} onChange={(e) => setSetupTimeMinutes(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('instructions')}</label>
            <textarea value={workInstructions} onChange={(e) => setWorkInstructions(e.target.value)} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isOptional} onChange={(e) => setIsOptional(e.target.checked)} />
            {t('isOptional')}
          </label>
          {addOp.error && <p className="text-sm text-destructive">{addOp.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={addOp.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {addOp.isPending ? 'Saving…' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">No operations yet.</p>
      )}

      <ol className="space-y-2">
        {sorted.map((op) => (
          <li key={op.id} className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              {op.sequence}
            </span>
            <div className="flex-1">
              <p className="font-medium">{op.name}</p>
              <p className="text-xs text-muted-foreground">
                {t('cycleTime')}: {op.cycleTimeMinutes} min · {t('setupTime')}: {op.setupTimeMinutes} min
                {op.isOptional && ' · Optional'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openConfirm(`Remove operation "${op.name}"?`, () => deleteOp.mutate(op.id), { confirmLabel: 'Remove' })}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
    {dialog && (
      <ConfirmDialog message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={handleConfirm} onCancel={handleCancel} />
    )}
    </div>
  );
}
