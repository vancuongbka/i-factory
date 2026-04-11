export enum WorkOrderStatus {
  PENDING = 'PENDING',       // Chờ xử lý
  ASSIGNED = 'ASSIGNED',     // Đã phân công
  IN_PROGRESS = 'IN_PROGRESS', // Đang thực hiện
  ON_HOLD = 'ON_HOLD',       // Tạm giữ
  COMPLETED = 'COMPLETED',   // Hoàn thành
  REJECTED = 'REJECTED',     // Bị từ chối (QC fail)
  CANCELLED = 'CANCELLED',   // Đã hủy
}
