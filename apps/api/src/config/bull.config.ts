import { registerAs } from '@nestjs/config';
import { requireEnv } from './env';

export default registerAs('bull', () => ({
  boardUsername: requireEnv('BULL_BOARD_USERNAME'),
  boardPassword: requireEnv('BULL_BOARD_PASSWORD'),
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
