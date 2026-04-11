export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',       // Quản trị toàn hệ thống
  FACTORY_ADMIN = 'FACTORY_ADMIN',   // Quản trị nhà máy
  PRODUCTION_MANAGER = 'PRODUCTION_MANAGER', // Quản lý sản xuất
  QC_INSPECTOR = 'QC_INSPECTOR',     // Kiểm tra chất lượng
  WAREHOUSE_STAFF = 'WAREHOUSE_STAFF', // Nhân viên kho
  OPERATOR = 'OPERATOR',             // Công nhân vận hành
  VIEWER = 'VIEWER',                 // Chỉ xem báo cáo
}
