import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '6000', 10),
  name: process.env.DATABASE_NAME ?? 'ifactory',
  username: process.env.DATABASE_USER ?? 'ifactory',
  password: process.env.DATABASE_PASSWORD ?? 'ifactory_dev',
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' && process.env.NODE_ENV !== 'production',
  logging: process.env.DATABASE_LOGGING === 'true',
}));
