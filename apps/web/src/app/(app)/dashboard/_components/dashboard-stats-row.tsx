'use client';

import { KpiCard } from '@i-factory/ui';

interface StatLabels {
  title: string;
  viewReport: string;
  description: string;
}

interface DashboardStatsRowProps {
  labels: {
    lowPerfMachines: StatLabels;
    malfunctions: StatLabels;
    absenteeism: StatLabels;
    materialShortage: StatLabels;
  };
}

export function DashboardStatsRow({ labels }: DashboardStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title={labels.lowPerfMachines.title}
        value={65}
        trend={{
          value: '+25%',
          direction: 'up',
          label: `+10 ${labels.lowPerfMachines.description}`,
        }}
        icon={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </span>
        }
        viewReportHref="/reports"
        viewReportLabel={labels.lowPerfMachines.viewReport}
      />
      <KpiCard
        title={labels.malfunctions.title}
        value="10%"
        trend={{
          value: '-5.5',
          direction: 'down',
          label: `5.5% ${labels.malfunctions.description}`,
        }}
        icon={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        }
        viewReportHref="/reports"
        viewReportLabel={labels.malfunctions.viewReport}
      />
      <KpiCard
        title={labels.absenteeism.title}
        value={185}
        trend={{
          value: '+25%',
          direction: 'up',
          label: `+50 ${labels.absenteeism.description}`,
        }}
        icon={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
          </span>
        }
        viewReportHref="/reports"
        viewReportLabel={labels.absenteeism.viewReport}
      />
      <KpiCard
        title={labels.materialShortage.title}
        value="4760KG"
        trend={{
          value: '+13%',
          direction: 'up',
          label: `1000kg ${labels.materialShortage.description}`,
        }}
        icon={
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        }
        viewReportHref="/reports"
        viewReportLabel={labels.materialShortage.viewReport}
      />
    </div>
  );
}
