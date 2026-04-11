export enum QCResult {
  PASS = 'PASS',             // Đạt
  FAIL = 'FAIL',             // Không đạt
  CONDITIONAL = 'CONDITIONAL', // Đạt có điều kiện
  PENDING = 'PENDING',       // Chờ kiểm tra
}

export enum DefectSeverity {
  CRITICAL = 'CRITICAL',     // Nghiêm trọng — dừng sản xuất
  MAJOR = 'MAJOR',           // Lớn — cần sửa ngay
  MINOR = 'MINOR',           // Nhỏ — ghi nhận
}
