import type { MachineStatusType } from './dashboard-mock-data';

const STATUS_STYLES: Record<MachineStatusType, string> = {
  healthy:        'bg-green-100 text-green-800  dark:bg-green-900/60  dark:text-green-300',
  lowPerformance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
};

interface MachineStatusBadgeProps {
  status: MachineStatusType;
  labels: Record<MachineStatusType, string>;
}

export function MachineStatusBadge({ status, labels }: MachineStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {labels[status]}
    </span>
  );
}
