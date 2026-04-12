'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardStatsRow } from './dashboard-stats-row';
import { MaterialUsageChart } from './material-usage-chart';
import { AttendanceSummaryChart } from './attendance-summary-chart';
import { ProductionMonitoringTable } from './production-monitoring-table';

export function DashboardClient() {
  const { data, isLoading, error } = useDashboard();

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-destructive">{String(error)}</p>
      )}

      {/* Row 1 — KPI cards */}
      <DashboardStatsRow data={data} isLoading={isLoading} />

      {/* Row 2 — Throughput trend + Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MaterialUsageChart data={data?.throughputTrend} isLoading={isLoading} />
        <AttendanceSummaryChart data={data} isLoading={isLoading} />
      </div>

      {/* Row 3 — Active work orders */}
      <ProductionMonitoringTable data={data?.activeWorkOrders} isLoading={isLoading} />
    </div>
  );
}
