'use client';

import { useTranslations } from 'next-intl';
import { KpiCard } from '@i-factory/ui';
import type { DashboardResponse } from '@i-factory/api-types';

interface DashboardStatsRowProps {
  data: DashboardResponse | undefined;
  isLoading: boolean;
}

// ── Gauge ring (SVG) for OEE ───────────────────────────────────────────────

function GaugeIcon({ value, color }: { value: number; color: string }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
      <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="20" cy="20" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
      </svg>
    </span>
  );
}

export function DashboardStatsRow({ data, isLoading }: DashboardStatsRowProps) {
  const t = useTranslations('dashboard.kpi');

  const oee = data?.oee ?? 0;
  const yieldRate = data?.yieldRate ?? 0;
  const outputActual = data?.outputActual ?? 0;
  const outputPlanned = data?.outputPlanned ?? 0;
  const outputPct = outputPlanned > 0 ? Math.round((outputActual / outputPlanned) * 100) : 0;
  const activeMachines = data?.machines.active ?? 0;
  const totalMachines = data?.machines.total ?? 0;

  const skeleton = 'animate-pulse rounded bg-muted h-8 w-16';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* OEE */}
      <KpiCard
        title={t('oee.title')}
        value={isLoading ? '—' : `${oee}%`}
        description={isLoading ? undefined : t('oee.description')}
        trend={
          isLoading
            ? undefined
            : {
                value: `${oee}%`,
                direction: oee >= 75 ? 'up' : oee >= 50 ? 'neutral' : 'down',
                label: oee >= 75 ? t('oee.good') : oee >= 50 ? t('oee.average') : t('oee.poor'),
              }
        }
        icon={<GaugeIcon value={oee} color={oee >= 75 ? '#16a34a' : oee >= 50 ? '#d97706' : '#dc2626'} />}
        viewReportHref="/reports"
        viewReportLabel={t('viewReport')}
        className={isLoading ? skeleton : ''}
      />

      {/* Actual vs Planned Output */}
      <KpiCard
        title={t('output.title')}
        value={isLoading ? '—' : `${outputPct}%`}
        description={isLoading ? undefined : `${outputActual} / ${outputPlanned} ${t('output.units')}`}
        trend={
          isLoading
            ? undefined
            : {
                value: `${outputPct}%`,
                direction: outputPct >= 80 ? 'up' : outputPct >= 50 ? 'neutral' : 'down',
                label: t('output.label'),
              }
        }
        icon={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </span>
        }
        viewReportHref="/production"
        viewReportLabel={t('viewReport')}
      />

      {/* Yield Rate */}
      <KpiCard
        title={t('yieldRate.title')}
        value={isLoading ? '—' : `${yieldRate}%`}
        description={isLoading ? undefined : t('yieldRate.description')}
        trend={
          isLoading
            ? undefined
            : {
                value: `${yieldRate}%`,
                direction: yieldRate >= 95 ? 'up' : yieldRate >= 80 ? 'neutral' : 'down',
                label: yieldRate >= 95 ? t('yieldRate.good') : t('yieldRate.needsAttention'),
              }
        }
        icon={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        }
        viewReportHref="/quality-control"
        viewReportLabel={t('viewReport')}
      />

      {/* Active Machines */}
      <KpiCard
        title={t('machines.title')}
        value={isLoading ? '—' : `${activeMachines}/${totalMachines}`}
        description={isLoading ? undefined : t('machines.description')}
        trend={
          isLoading || totalMachines === 0
            ? undefined
            : {
                value: totalMachines > 0 ? `${Math.round((activeMachines / totalMachines) * 100)}%` : '0%',
                direction: activeMachines / totalMachines >= 0.8 ? 'up' : 'down',
                label: t('machines.label'),
              }
        }
        icon={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </span>
        }
        viewReportHref="/master-data/work-centers"
        viewReportLabel={t('viewReport')}
      />
    </div>
  );
}
