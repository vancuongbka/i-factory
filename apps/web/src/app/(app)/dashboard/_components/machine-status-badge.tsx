import type { MachineStatusType } from './dashboard-mock-data';

const STATUS_STYLES: Record<MachineStatusType, string> = {
  healthy: 'bg-green-100 text-green-700',
  lowPerformance: 'bg-orange-100 text-orange-700',
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
