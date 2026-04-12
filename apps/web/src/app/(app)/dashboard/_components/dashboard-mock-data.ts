// Mock data for the dashboard — swap for real API hooks when endpoints are available

export interface MaterialUsageDataPoint {
  day: string;
  used: number;
  available: number;
}

export interface AttendanceDataPoint {
  day: string;
  onTime: number;
  late: number;
  absent: number;
}

export type MachineStatusType = 'healthy' | 'lowPerformance';

export interface ProductionBatch {
  id: string;
  batchId: string;
  garmentType: string;
  targetOutput: number;
  actualOutput: number;
  efficiency: number;
  machineStatus: MachineStatusType;
  materialAvailability: string;
  issuesAlerts: string;
}

export const MATERIAL_USAGE_DATA: MaterialUsageDataPoint[] = [
  { day: 'Sun', used: 45, available: 55 },
  { day: 'Mon', used: 62, available: 38 },
  { day: 'Tue', used: 78, available: 22 },
  { day: 'Wed', used: 55, available: 45 },
  { day: 'Thu', used: 88, available: 12 },
  { day: 'Fri', used: 70, available: 30 },
  { day: 'Sat', used: 40, available: 60 },
];

export const ATTENDANCE_DATA: AttendanceDataPoint[] = [
  { day: 'Sun', onTime: 120, late: 30, absent: 20 },
  { day: 'Mon', onTime: 300, late: 80, absent: 40 },
  { day: 'Tue', onTime: 280, late: 90, absent: 60 },
  { day: 'Wed', onTime: 310, late: 70, absent: 35 },
  { day: 'Thu', onTime: 260, late: 100, absent: 55 },
  { day: 'Fri', onTime: 290, late: 85, absent: 45 },
  { day: 'Sat', onTime: 150, late: 40, absent: 25 },
];

export const PRODUCTION_BATCHES: ProductionBatch[] = [
  {
    id: '1',
    batchId: '#B120',
    garmentType: 'T-Shirts',
    targetOutput: 500,
    actualOutput: 450,
    efficiency: 90,
    machineStatus: 'healthy',
    materialAvailability: 'Sufficient',
    issuesAlerts: 'Under Maintenance',
  },
  {
    id: '2',
    batchId: '#B121',
    garmentType: 'Wallet',
    targetOutput: 300,
    actualOutput: 280,
    efficiency: 92,
    machineStatus: 'healthy',
    materialAvailability: 'Sufficient',
    issuesAlerts: 'N/A',
  },
  {
    id: '3',
    batchId: '#B122',
    garmentType: 'Jeans',
    targetOutput: 600,
    actualOutput: 590,
    efficiency: 85,
    machineStatus: 'lowPerformance',
    materialAvailability: 'Low Stock',
    issuesAlerts: 'Absenteeism',
  },
  {
    id: '4',
    batchId: '#B123',
    garmentType: 'Shirts',
    targetOutput: 480,
    actualOutput: 350,
    efficiency: 93,
    machineStatus: 'lowPerformance',
    materialAvailability: 'Sufficient',
    issuesAlerts: 'Under Maintenance',
  },
  {
    id: '5',
    batchId: '#B124',
    garmentType: 'Jackets',
    targetOutput: 500,
    actualOutput: 480,
    efficiency: 96,
    machineStatus: 'healthy',
    materialAvailability: 'Low Stock',
    issuesAlerts: 'N/A',
  },
  {
    id: '6',
    batchId: '#B125',
    garmentType: 'Shorts',
    targetOutput: 360,
    actualOutput: 180,
    efficiency: 90,
    machineStatus: 'healthy',
    materialAvailability: 'Sufficient',
    issuesAlerts: 'Absenteeism',
  },
];
