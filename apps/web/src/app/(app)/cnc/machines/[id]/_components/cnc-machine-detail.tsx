'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CncMachineStatus } from '@i-factory/api-types';
import type { CncDowntimeResponse } from '@i-factory/api-types';
import { useCncMachine } from '@/hooks/use-cnc-machines';
import {
  useMachineDowntime,
  useRaiseDowntime,
  useResolveDowntime,
} from '@/hooks/use-cnc';

const STATUS_STYLES: Record<CncMachineStatus, string> = {
  [CncMachineStatus.RUNNING]:     'bg-green-100 text-green-800  dark:bg-green-900/60  dark:text-green-300',
  [CncMachineStatus.IDLE]:        'bg-gray-100 text-gray-700   dark:bg-gray-800   dark:text-gray-400',
  [CncMachineStatus.SETUP]:       'bg-blue-100 text-blue-800   dark:bg-blue-900/60   dark:text-blue-300',
  [CncMachineStatus.ERROR]:       'bg-red-100 text-red-800     dark:bg-red-900/60    dark:text-red-400',
  [CncMachineStatus.MAINTENANCE]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
};

function RaiseDowntimeForm({
  machineId,
  onClose,
}: {
  machineId: string;
  onClose: () => void;
}) {
  const t = useTranslations('cnc.downtime');
  const raise = useRaiseDowntime();
  const [faultCode, setFaultCode] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    raise.mutate(
      {
        cncMachineId: machineId,
        startedAt: new Date().toISOString(),
        faultCode,
        description,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <p className="font-medium">{t('raiseTitle')}</p>
      <div className="space-y-1">
        <label className="text-xs font-medium">{t('fields.faultCode')}</label>
        <input
          required
          value={faultCode}
          onChange={(e) => setFaultCode(e.target.value)}
          className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">{t('fields.description')}</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={raise.isPending}
          className="rounded-md bg-destructive px-4 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
        >
          {raise.isPending ? t('raising') : t('actions.raise')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border px-4 py-1.5 text-sm font-medium hover:bg-muted"
        >
          {t('actions.cancel')}
        </button>
      </div>
    </form>
  );
}

function ResolveDowntimeForm({
  downtimeId,
  onClose,
}: {
  downtimeId: string;
  onClose: () => void;
}) {
  const t = useTranslations('cnc.downtime');
  const resolve = useResolveDowntime();
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resolve.mutate(
      {
        id: downtimeId,
        body: {
          resolvedAt: new Date().toISOString(),
          rootCause: rootCause || undefined,
          correctiveAction: correctiveAction || undefined,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="font-medium text-green-800">{t('resolveTitle')}</p>
      <div className="space-y-1">
        <label className="text-xs font-medium">{t('fields.rootCause')}</label>
        <textarea
          rows={2}
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
          className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">{t('fields.correctiveAction')}</label>
        <textarea
          rows={2}
          value={correctiveAction}
          onChange={(e) => setCorrectiveAction(e.target.value)}
          className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={resolve.isPending}
          className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {resolve.isPending ? t('resolving') : t('actions.resolve')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border px-4 py-1.5 text-sm font-medium hover:bg-muted"
        >
          {t('actions.cancel')}
        </button>
      </div>
    </form>
  );
}

function DowntimeRow({ dt }: { dt: CncDowntimeResponse }) {
  const t = useTranslations('cnc.downtime');
  const [resolving, setResolving] = useState(false);
  const isActive = !dt.resolvedAt;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2 rounded-lg border p-3 text-sm">
        <div className="space-y-0.5">
          <p className="font-medium">{dt.faultCode}</p>
          <p className="text-muted-foreground">{dt.description}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(dt.startedAt).toLocaleString()}
            {dt.durationMinutes != null && ` · ${dt.durationMinutes} min`}
          </p>
        </div>
        <span
          className={
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
            (isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')
          }
        >
          {isActive ? t('status.active') : t('status.resolved')}
        </span>
      </div>
      {isActive && !resolving && (
        <button
          type="button"
          onClick={() => setResolving(true)}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          {t('actions.resolve')}
        </button>
      )}
      {isActive && resolving && (
        <ResolveDowntimeForm downtimeId={dt.id} onClose={() => setResolving(false)} />
      )}
    </div>
  );
}

export function CncMachineDetail({ machineId }: { machineId: string }) {
  const t = useTranslations('cnc.machines');
  const tDetail = useTranslations('cnc.machines.detail');
  const tDt = useTranslations('cnc.downtime');
  const router = useRouter();

  const [raisingDowntime, setRaisingDowntime] = useState(false);

  const { data: machine, isLoading: machineLoading } = useCncMachine(machineId);
  const { data: downtimes, isLoading: downtimeLoading } = useMachineDowntime(machineId);

  if (machineLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!machine) {
    return <p className="text-sm text-muted-foreground">{tDetail('notFound')}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="font-mono text-xs text-muted-foreground">{machine.code}</p>
          <h1 className="text-xl font-semibold">{machine.name}</h1>
        </div>
        <span
          className={
            'ml-auto rounded-full px-3 py-1 text-sm font-medium ' +
            STATUS_STYLES[machine.currentStatus]
          }
        >
          {t(`status.${machine.currentStatus}` as Parameters<typeof t>[0])}
        </span>
      </div>

      {/* Machine Info */}
      <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
        <InfoItem label={t('fields.model')} value={machine.model ?? '—'} />
        <InfoItem
          label={t('fields.maxSpindleRpm')}
          value={machine.maxSpindleRpm != null ? String(machine.maxSpindleRpm) : '—'}
        />
        <InfoItem
          label={t('fields.numberOfAxes')}
          value={machine.numberOfAxes != null ? String(machine.numberOfAxes) : '—'}
        />
      </div>

      {/* Downtime Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{tDetail('downtimeHistory')}</h2>
          {!raisingDowntime && (
            <button
              type="button"
              onClick={() => setRaisingDowntime(true)}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <AlertTriangle className="h-4 w-4 text-red-500" />
              {tDt('actions.raise')}
            </button>
          )}
        </div>

        {raisingDowntime && (
          <RaiseDowntimeForm machineId={machineId} onClose={() => setRaisingDowntime(false)} />
        )}

        {downtimeLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !downtimes?.length ? (
          <p className="text-sm text-muted-foreground">{tDt('noHistory')}</p>
        ) : (
          <div className="space-y-2">
            {downtimes.map((dt) => (
              <DowntimeRow key={dt.id} dt={dt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
