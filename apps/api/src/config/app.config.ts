import { registerAs } from '@nestjs/config';
import { requireEnv } from './env';

export default registerAs('app', () => ({
  nodeEnv: requireEnv('NODE_ENV'),
  port: parseInt(requireEnv('PORT'), 10),
  corsOrigins: requireEnv('CORS_ORIGINS').split(','),
  uploadDest: requireEnv('UPLOAD_DEST'),
  maxFileSizeMb: parseInt(requireEnv('MAX_FILE_SIZE_MB'), 10),
  factorySyncEnabled: requireEnv('FACTORY_SYNC_ENABLED') === 'true',
  factorySyncIntervalSeconds: parseInt(requireEnv('FACTORY_SYNC_INTERVAL_SECONDS'), 10),
}));
