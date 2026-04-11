import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
  uploadDest: process.env.UPLOAD_DEST ?? './uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
  factorySyncEnabled: process.env.FACTORY_SYNC_ENABLED === 'true',
  factorySyncIntervalSeconds: parseInt(process.env.FACTORY_SYNC_INTERVAL_SECONDS ?? '300', 10),
}));
