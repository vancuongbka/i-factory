import { registerAs } from '@nestjs/config';

export default registerAs('bull', () => ({
  boardUsername: process.env.BULL_BOARD_USERNAME ?? 'admin',
  boardPassword: process.env.BULL_BOARD_PASSWORD ?? 'changeme',
  queues: {
    reports: 'reports',
    factorySync: 'factory-sync',
    notifications: 'notifications',
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
}));
