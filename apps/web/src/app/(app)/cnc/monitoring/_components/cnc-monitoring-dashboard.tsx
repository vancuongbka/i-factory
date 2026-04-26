'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CncMachineStatus } from '@i-factory/api-types';
import type { CncMachineResponse } from '@i-factory/api-types';
import { useCncMachines, useCncKpiSummary } from '@/hooks/use-cnc-machines';
import { useCncWebSocket } from '@/hooks/use-cnc-websocket';

const today = new Date().toISOString().slice(0, 10);

const STATUS_STYLES: Record<CncMachineStatus, string> = {
  [CncMachineStatus.RUNNING]:     'bg-green-100 text-green-800 border-green-200   dark:bg-green-900/60  dark:text-green-300  dark:border-green-800',
  [CncMachineStatus.IDLE]:        'bg-gray-100 text-gray-700 border-gray-200     dark:bg-gray-800   dark:text-gray-400   dark:border-gray-700',
  [CncMachineStatus.SETUP]:       'bg-blue-100 text-blue-800 border-blue-200     dark:bg-blue-900/60   dark:text-blue-300   dark:border-blue-800',
  [CncMachineStatus.ERROR]:       'bg-red-100 text-red-800 border-red-200       dark:bg-red-900/60    dark:text-red-400    dark:border-red-800',
  [CncMachineStatus.MAINTENANCE]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/60 dark:text-orange-300 dark:border-orange-800',
};

const STATUS_BORDER: Record<CncMachineStatus, string> = {
  [CncMachineStatus.RUNNING]:     'border-l-green-500',
  [CncMachineStatus.IDLE]:        'border-l-gray-300',
  [CncMachineStatus.SETUP]:       'border-l-blue-500',
  [CncMachineStatus.ERROR]:       'border-l-red-500',
  [CncMachineStatus.MAINTENANCE]: 'border-l-orange-500',
};

function MachineCard({ machine }: { machine: CncMachineResponse }) {
  const t = useTranslations('cnc.machines');
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/cnc/machines/${machine.id}`)}
      className={
        'flex flex-col gap-2 rounded-lg border border-l-4 bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40 ' +
        STATUS_BORDER[machine.currentStatus]
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{machine.code}</p>
          <p className="font-semibold leading-tight">{machine.name}</p>
        </div>
        <span
          className={
            'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ' +
            STATUS_STYLES[machine.currentStatus]
          }
        >
          {t(`status.${machine.currentStatus}` as Parameters<typeof t>[0])}
        </span>
      </div>
      {machine.model && (
        <p className="text-xs text-muted-foreground">{machine.model}</p>
      )}
    </button>
  );
}

export function CncMonitoringDashboard() {
  const t = useTranslations('cnc');
  const tMon = useTranslations('cnc.monitoring');

  useCncWebSocket();

  const { data: machines, isLoading: machinesLoading } = useCncMachines();
  const { data: kpi, isLoading: kpiLoading } = useCncKpiSummary(today);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{tMon('title')}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label={tMon('kpi.total')}
          value={kpi?.totalMachines}
          loading={kpiLoading}
          className="bg-card"
        />
        <KpiCard
          label={tMon('kpi.running')}
          value={kpi?.runningCount}
          loading={kpiLoading}
          className="bg-green-50 text-green-700"
        />
        <KpiCard
          label={tMon('kpi.idle')}
          value={kpi?.idleCount}
          loading={kpiLoading}
          className="bg-gray-50 text-gray-600"
        />
        <KpiCard
          label={tMon('kpi.error')}
          value={kpi?.errorCount}
          loading={kpiLoading}
          className="bg-red-50 text-red-700"
        />
        <KpiCard
          label={tMon('kpi.planned')}
          value={kpi?.totalPlannedQty}
          loading={kpiLoading}
          className="bg-card"
        />
        <KpiCard
          label={tMon('kpi.completed')}
          value={kpi?.totalCompletedQty}
          loading={kpiLoading}
          className="bg-card"
        />
      </div>

      {/* Machine Grid */}
      {machinesLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !machines?.length ? (
        <p className="text-sm text-muted-foreground">{t('machines.noResults')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {machines.map((m) => (
            <MachineCard key={m.id} machine={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  loading,
  className,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${className ?? 'bg-card'}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {loading ? '—' : (value ?? 0)}
      </p>
    </div>
  );
}
