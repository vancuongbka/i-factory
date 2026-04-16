import 'reflect-metadata';

import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';

// Glob patterns are resolved relative to CWD.
// CLI scripts in apps/api/package.json always run from the apps/api/ directory.
const entityGlob = isProduction ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts';
const migrationGlob = isProduction
  ? 'dist/database/migrations/**/*.js'
  : 'src/database/migrations/**/*.ts';

// DIRECT_URL bypasses PgBouncer for migrations (DDL statements require a direct connection).
// Falls back to DATABASE_URL, then individual fields for local dev.
const connectionUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(connectionUrl
    ? { url: connectionUrl }
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
  ssl: isProduction || !!connectionUrl ? { rejectUnauthorized: false } : false,
});
