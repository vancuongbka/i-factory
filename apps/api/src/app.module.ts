import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import bullConfig from './config/bull.config';

import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

// Domain modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FactoriesModule } from './modules/factories/factories.module';
import { ProductionModule } from './modules/production/production.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { BomModule } from './modules/bom/bom.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { QualityControlModule } from './modules/quality-control/qc.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SyncModule } from './modules/sync/sync.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CncModule } from './modules/cnc/cnc.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, bullConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // BullMQ global Redis connection
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string | undefined>('redis.password'),
        },
      }),
    }),

    // Infrastructure
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,

    // Domain modules
    AuthModule,
    UsersModule,
    FactoriesModule,
    ProductionModule,
    WorkOrdersModule,
    BomModule,
    InventoryModule,
    QualityControlModule,
    ReportsModule,
    NotificationsModule,
    SyncModule,
    MasterDataModule,
    DashboardModule,
    CncModule,
  ],
})
export class AppModule {}
