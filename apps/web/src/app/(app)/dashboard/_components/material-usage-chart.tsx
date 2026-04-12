'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GroupedBarChart } from '@i-factory/ui';
import { MATERIAL_USAGE_DATA } from './dashboard-mock-data';

const SERIES_COLORS = { used: '#0D9488', available: '#F59E0B' };

export function MaterialUsageChart() {
  const t = useTranslations('dashboard');
  const [_category, setCategory] = useState('all');

  const series = [
    { dataKey: 'used', color: SERIES_COLORS.used, label: t('materialUsage.seriesUsed') },
    { dataKey: 'available', color: SERIES_COLORS.available, label: t('materialUsage.seriesAvailable') },
  ];

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t('materialUsage.title')}</h2>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={_category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={t('materialUsage.categoryLabel')}
          >
            <option value="all">{t('materialUsage.categoryLabel')}</option>
          </select>
          <select
            className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue="lastWeek"
            aria-label={t('periodSelector.lastWeek')}
          >
            <option value="lastWeek">{t('periodSelector.lastWeek')}</option>
          </select>
        </div>
      </div>
      <GroupedBarChart
        data={MATERIAL_USAGE_DATA}
        series={series}
        xAxisKey="day"
        yAxisUnit="%"
        yAxisDomain={[0, 100]}
        height={280}
      />
    </div>
  );
}
