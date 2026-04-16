import 'reflect-metadata';
import { config } from 'dotenv';
config(); // loads .env from cwd — used when running CLI scripts (migrations, seeds)

import { DataSource } from 'typeorm';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

// Glob patterns are resolved relative to CWD.
// CLI scripts in apps/api/package.json always run from the apps/api/ directory.
const entityGlob = isProduction ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts';
const migrationGlob = isProduction
  ? 'dist/database/migrations/**/*.js'
  : 'src/database/migrations/**/*.ts';

const connectionUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(connectionUrl
    ? { url: connectionUrl }
    : {
        host: requireEnv('DATABASE_HOST'),
        port: Number(requireEnv('DATABASE_PORT')),
        database: requireEnv('DATABASE_NAME'),
        username: requireEnv('DATABASE_USER'),
        password: requireEnv('DATABASE_PASSWORD'),
      }),
  entities: [entityGlob],
  migrations: [migrationGlob],
  // Never use synchronize: true in production — all schema changes via migrations.
  synchronize: !isProduction && process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  ssl: isProduction || !!connectionUrl ? { rejectUnauthorized: false } : false,
});
