'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, Trash2 } from 'lucide-react';
import { CncMachineStatus } from '@i-factory/api-types';
import { useCncMachines, useDeleteCncMachine } from '@/hooks/use-cnc-machines';
import type { CncMachineResponse } from '@i-factory/api-types';

const STATUS_STYLES: Record<CncMachineStatus, string> = {
  [CncMachineStatus.RUNNING]:     'bg-green-100 text-green-800  dark:bg-green-900/60  dark:text-green-300',
  [CncMachineStatus.IDLE]:        'bg-gray-100 text-gray-700   dark:bg-gray-800   dark:text-gray-400',
  [CncMachineStatus.SETUP]:       'bg-blue-100 text-blue-800   dark:bg-blue-900/60   dark:text-blue-300',
  [CncMachineStatus.ERROR]:       'bg-red-100 text-red-800     dark:bg-red-900/60    dark:text-red-400',
  [CncMachineStatus.MAINTENANCE]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
};

export function CncMachinesTable() {
  const t = useTranslations('cnc.machines');
  const router = useRouter();
  const { data: machines, isLoading } = useCncMachines();
  const deleteMutation = useDeleteCncMachine();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!machines?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  function handleDelete(machine: CncMachineResponse) {
    if (!confirm(t('actions.confirmDelete', { code: machine.code }))) return;
    deleteMutation.mutate(machine.id);
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('columns.code')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.name')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.model')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.axes')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.status')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <tr key={machine.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-mono font-medium">{machine.code}</td>
              <td className="px-4 py-3">{machine.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{machine.model ?? '—'}</td>
              <td className="px-4 py-3 text-center">{machine.numberOfAxes ?? '—'}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                    STATUS_STYLES[machine.currentStatus]
                  }
                >
                  {t(`status.${machine.currentStatus}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/cnc/machines/${machine.id}`)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={t('actions.view')}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(machine)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={t('actions.delete')}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
