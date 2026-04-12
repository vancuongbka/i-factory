'use client';

import { useTranslations } from 'next-intl';
import { LineChart } from '@i-factory/ui';
import type { DashboardResponse } from '@i-factory/api-types';

interface ThroughputTrendChartProps {
  data: DashboardResponse['throughputTrend'] | undefined;
  isLoading: boolean;
}

// Format "2024-04-13" → "Apr 13"
function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function MaterialUsageChart({ data, isLoading }: ThroughputTrendChartProps) {
  const t = useTranslations('dashboard.throughput');

  const chartData = (data ?? []).map((p) => ({
    ...p,
    date: shortDate(p.date),
  }));

  const series = [
    { dataKey: 'completed', color: '#0D9488', label: t('seriesCompleted') },
    { dataKey: 'planned', color: '#94A3B8', label: t('seriesPlanned'), dashed: true },
  ];

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{t('title')}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[280px] animate-pulse rounded-lg bg-muted" />
      ) : chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          {t('noData')}
        </div>
      ) : (
        <LineChart data={chartData} series={series} xAxisKey="date" height={280} />
      )}
    </div>
  );
}
