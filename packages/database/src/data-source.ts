import 'reflect-metadata';

import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';

// Glob patterns are resolved relative to CWD.
// CLI scripts in apps/api/package.json always run from the apps/api/ directory.
const entityGlob = isProduction ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts';
const migrationGlob = isProduction
  ? 'dist/database/migrations/**/*.js'
  : 'src/database/migrations/**/*.ts';

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Use DATABASE_URL when provided; fall back to individual fields for local dev.
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: Number(process.env.DATABASE_PORT ?? 6000),
        database: process.env.DATABASE_NAME ?? 'ifactory',
        username: process.env.DATABASE_USER ?? 'ifactory',
        password: process.env.DATABASE_PASSWORD ?? 'ifactory_dev',
      }),
  entities: [entityGlob],
  migrations: [migrationGlob],
  // Never use synchronize: true in production — all schema changes via migrations.
  synchronize: !isProduction && process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
