'use client';

import { useTranslations } from 'next-intl';
import { StackedBarChart } from '@i-factory/ui';
import { ATTENDANCE_DATA } from './dashboard-mock-data';

const SERIES_COLORS = {
  onTime: '#1D4ED8',
  late: '#60A5FA',
  absent: '#BFDBFE',
};

export function AttendanceSummaryChart() {
  const t = useTranslations('dashboard');

  const series = [
    { dataKey: 'onTime', color: SERIES_COLORS.onTime, label: t('attendanceSummary.seriesOnTime') },
    { dataKey: 'late', color: SERIES_COLORS.late, label: t('attendanceSummary.seriesLate') },
    { dataKey: 'absent', color: SERIES_COLORS.absent, label: t('attendanceSummary.seriesAbsent') },
  ];

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t('attendanceSummary.title')}</h2>
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue="lastWeek"
          aria-label={t('periodSelector.lastWeek')}
        >
          <option value="lastWeek">{t('periodSelector.lastWeek')}</option>
        </select>
      </div>
      <StackedBarChart
        data={ATTENDANCE_DATA}
        series={series}
        xAxisKey="day"
        yAxisDomain={[0, 500]}
        height={280}
      />
    </div>
  );
}
