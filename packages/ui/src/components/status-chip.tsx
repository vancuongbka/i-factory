import React from 'react';

import { ProductionStatus, QCResult, WorkOrderStatus } from '@i-factory/api-types';

type StatusValue = ProductionStatus | WorkOrderStatus | QCResult | string;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // ProductionStatus
  [ProductionStatus.DRAFT]: { label: 'Nháp', className: 'bg-gray-100 text-gray-700' },
  [ProductionStatus.PLANNED]: { label: 'Kế hoạch', className: 'bg-blue-100 text-blue-700' },
  [ProductionStatus.IN_PROGRESS]: { label: 'Đang chạy', className: 'bg-yellow-100 text-yellow-700' },
  [ProductionStatus.PAUSED]: { label: 'Tạm dừng', className: 'bg-orange-100 text-orange-700' },
  [ProductionStatus.COMPLETED]: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
  [ProductionStatus.CANCELLED]: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
  // WorkOrderStatus
  [WorkOrderStatus.PENDING]: { label: 'Chờ', className: 'bg-gray-100 text-gray-700' },
  [WorkOrderStatus.ASSIGNED]: { label: 'Đã phân công', className: 'bg-blue-100 text-blue-700' },
  [WorkOrderStatus.ON_HOLD]: { label: 'Tạm giữ', className: 'bg-orange-100 text-orange-700' },
  [WorkOrderStatus.REJECTED]: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
  // QCResult
  [QCResult.PASS]: { label: 'Đạt', className: 'bg-green-100 text-green-700' },
  [QCResult.FAIL]: { label: 'Không đạt', className: 'bg-red-100 text-red-700' },
  [QCResult.CONDITIONAL]: { label: 'Có điều kiện', className: 'bg-yellow-100 text-yellow-700' },
};

interface StatusChipProps {
  status: StatusValue;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className ?? ''}`}
    >
      {config.label}
    </span>
  );
}
