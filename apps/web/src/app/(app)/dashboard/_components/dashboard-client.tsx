'use client';

import { useTranslations } from 'next-intl';
import { DashboardStatsRow } from './dashboard-stats-row';
import { MaterialUsageChart } from './material-usage-chart';
import { AttendanceSummaryChart } from './attendance-summary-chart';
import { ProductionMonitoringTable } from './production-monitoring-table';

export function DashboardClient() {
  const t = useTranslations('dashboard');

  const statsLabels = {
    lowPerfMachines: {
      title: t('kpi.lowPerformanceMachines.title'),
      viewReport: t('kpi.lowPerformanceMachines.viewReport'),
      description: t('kpi.lowPerformanceMachines.description'),
    },
    malfunctions: {
      title: t('kpi.machineMalfunctions.title'),
      viewReport: t('kpi.machineMalfunctions.viewReport'),
      description: t('kpi.machineMalfunctions.description'),
    },
    absenteeism: {
      title: t('kpi.employeeAbsenteeism.title'),
      viewReport: t('kpi.employeeAbsenteeism.viewReport'),
      description: t('kpi.employeeAbsenteeism.description'),
    },
    materialShortage: {
      title: t('kpi.materialShortage.title'),
      viewReport: t('kpi.materialShortage.viewReport'),
      description: t('kpi.materialShortage.description'),
    },
  };

  return (
    <div className="space-y-6">
      <DashboardStatsRow labels={statsLabels} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MaterialUsageChart />
        <AttendanceSummaryChart />
      </div>
      <ProductionMonitoringTable />
    </div>
  );
}
