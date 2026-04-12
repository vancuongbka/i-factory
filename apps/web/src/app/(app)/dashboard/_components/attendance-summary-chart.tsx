'use client';

import { useTranslations } from 'next-intl';
import type { DashboardResponse } from '@i-factory/api-types';

interface AlertsPanelProps {
  data: DashboardResponse | undefined;
  isLoading: boolean;
}

// ── Alert row components ───────────────────────────────────────────────────

function AlertRow({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {badge && (
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor ?? 'bg-muted text-muted-foreground'}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function WarningIcon({ color }: { color: string }) {
  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${color}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function MachineStatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    BREAKDOWN: 'bg-red-500',
    MAINTENANCE: 'bg-amber-500',
    IDLE: 'bg-gray-400',
    ACTIVE: 'bg-green-500',
  };
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colorMap[status] ?? 'bg-muted'}`}
      aria-hidden="true"
    />
  );
}

export function AttendanceSummaryChart({ data, isLoading }: AlertsPanelProps) {
  const t = useTranslations('dashboard.alerts');

  const lowStock = data?.alerts.lowStock ?? [];
  const qcFailures = data?.alerts.qcFailures ?? [];
  const machineDowntime = data?.alerts.machineDowntime ?? [];

  const totalAlerts = lowStock.length + qcFailures.length + machineDowntime.length;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t('title')}</h2>
        {!isLoading && totalAlerts > 0 && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            {totalAlerts}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : totalAlerts === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-green-600">{t('allClear')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('allClearSub')}</p>
        </div>
      ) : (
        <div className="divide-y max-h-[280px] overflow-y-auto">
          {machineDowntime.map((m) => (
            <AlertRow
              key={m.id}
              icon={<WarningIcon color="bg-red-100 text-red-600" />}
              title={`${m.code} — ${m.name}`}
              subtitle={t('machineDown')}
              badge={m.status}
              badgeColor="bg-red-100 text-red-700"
            />
          ))}
          {lowStock.map((m) => (
            <AlertRow
              key={m.id}
              icon={<WarningIcon color="bg-amber-100 text-amber-600" />}
              title={`${m.code} — ${m.name}`}
              subtitle={`${m.currentStock} / ${m.minStockLevel} ${m.unit}`}
              badge={t('lowStock')}
              badgeColor="bg-amber-100 text-amber-700"
            />
          ))}
          {qcFailures.map((q) => (
            <AlertRow
              key={q.id}
              icon={<WarningIcon color="bg-orange-100 text-orange-600" />}
              title={`${t('qcFailed')} — ${q.result}`}
              subtitle={`${t('failed')}: ${q.failedCount}/${q.sampleSize} · ${new Date(q.inspectedAt).toLocaleDateString()}`}
              badge={q.result}
              badgeColor={q.result === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
            />
          ))}
        </div>
      )}

      {/* Machine status summary strip */}
      {!isLoading && (data?.machineStatusDistribution ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 border-t pt-3">
          {(data?.machineStatusDistribution ?? []).map((entry) => (
            <div key={entry.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MachineStatusDot status={entry.status} />
              <span>{entry.status}</span>
              <span className="font-medium text-foreground">{entry.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
