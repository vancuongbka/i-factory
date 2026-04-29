'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CncMachineStatus } from '@i-factory/api-types';
import type { CncMachineResponse } from '@i-factory/api-types';
import { KpiCard, StatusDot, type StatusTone } from '@i-factory/ui';
import { useCncMachines, useCncKpiSummary } from '@/hooks/use-cnc-machines';
import { useCncWebSocket } from '@/hooks/use-cnc-websocket';

const today = new Date().toISOString().slice(0, 10);

const STATUS_TONE: Record<CncMachineStatus, StatusTone> = {
  [CncMachineStatus.RUNNING]:     'running',
  [CncMachineStatus.IDLE]:        'idle',
  [CncMachineStatus.SETUP]:       'planned',
  [CncMachineStatus.ERROR]:       'critical',
  [CncMachineStatus.MAINTENANCE]: 'warning',
};

const STATUS_TOP_BORDER: Record<CncMachineStatus, string> = {
  [CncMachineStatus.RUNNING]:     'border-t-emerald-500',
  [CncMachineStatus.IDLE]:        'border-t-slate-400',
  [CncMachineStatus.SETUP]:       'border-t-indigo-500',
  [CncMachineStatus.ERROR]:       'border-t-rose-500',
  [CncMachineStatus.MAINTENANCE]: 'border-t-amber-500',
};

function MachineCard({ machine }: { machine: CncMachineResponse }) {
  const t = useTranslations('cnc.machines');
  const router = useRouter();
  const tone = STATUS_TONE[machine.currentStatus];

  return (
    <button
      type="button"
      onClick={() => router.push(`/cnc/machines/${machine.id}`)}
      className={[
        'glass-card flex flex-col gap-2 rounded-xl border-t-4 p-4 text-left transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring',
        STATUS_TOP_BORDER[machine.currentStatus],
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {machine.code}
          </p>
          <p className="truncate text-sm font-bold text-foreground">{machine.name}</p>
        </div>
        <StatusDot
          tone={tone}
          pulse={machine.currentStatus === CncMachineStatus.ERROR}
          glow
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {machine.model ? (
          <span className="truncate">{machine.model}</span>
        ) : (
          <span className="opacity-50">—</span>
        )}
        <span className="ml-auto font-semibold uppercase tracking-wider">
          {t(`status.${machine.currentStatus}` as Parameters<typeof t>[0])}
        </span>
      </div>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          variant="glass"
          title={tMon('kpi.total')}
          value={kpiLoading ? '—' : (kpi?.totalMachines ?? 0)}
        />
        <KpiCard
          variant="glass"
          accent="success"
          title={tMon('kpi.running')}
          value={kpiLoading ? '—' : (kpi?.runningCount ?? 0)}
        />
        <KpiCard
          variant="glass"
          title={tMon('kpi.idle')}
          value={kpiLoading ? '—' : (kpi?.idleCount ?? 0)}
        />
        <KpiCard
          variant="glass"
          accent="critical"
          title={tMon('kpi.error')}
          value={kpiLoading ? '—' : (kpi?.errorCount ?? 0)}
        />
        <KpiCard
          variant="glass"
          title={tMon('kpi.planned')}
          value={kpiLoading ? '—' : (kpi?.totalPlannedQty ?? 0)}
        />
        <KpiCard
          variant="glass"
          title={tMon('kpi.completed')}
          value={kpiLoading ? '—' : (kpi?.totalCompletedQty ?? 0)}
        />
      </div>

      {/* Machine Grid */}
      {machinesLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !machines?.length ? (
        <p className="text-sm text-muted-foreground">{t('machines.noResults')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {machines.map((m) => (
            <MachineCard key={m.id} machine={m} />
          ))}
        </div>
      )}
    </div>
  );
}
