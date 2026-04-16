import { registerAs } from '@nestjs/config';
import { requireEnv } from './env';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: requireEnv('DATABASE_HOST'),
  port: parseInt(requireEnv('DATABASE_PORT'), 10),
  name: requireEnv('DATABASE_NAME'),
  username: requireEnv('DATABASE_USER'),
  password: requireEnv('DATABASE_PASSWORD'),
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' && process.env.NODE_ENV !== 'production',
  logging: process.env.DATABASE_LOGGING === 'true',
}));
