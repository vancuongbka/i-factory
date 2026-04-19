import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { CncGateway } from './cnc.gateway';
import { CncMachinesService } from './services/cnc-machines.service';
import { DailySchedulesService } from './services/daily-schedules.service';
import { ScheduleEntriesService } from './services/schedule-entries.service';
import { ProductionLogsService } from './services/production-logs.service';
import { MachineDowntimeService } from './services/machine-downtime.service';
import { CncMachinesController } from './controllers/cnc-machines.controller';
import { DailySchedulesController } from './controllers/daily-schedules.controller';
import { ScheduleEntriesController } from './controllers/schedule-entries.controller';
import { ProductionLogsController } from './controllers/production-logs.controller';
import { MachineDowntimeController } from './controllers/machine-downtime.controller';
import { CncShiftTransitionProcessor } from './processors/cnc-shift-transition.processor';
import { CncScheduleArchiveProcessor } from './processors/cnc-schedule-archive.processor';
import { CncSchedulerService } from './cnc-scheduler.service';
import { CncMachineEntity } from './entities/cnc-machine.entity';
import { DailyScheduleEntity } from './entities/daily-schedule.entity';
import { ScheduleEntryEntity } from './entities/schedule-entry.entity';
import { ProductionLogEntity } from './entities/production-log.entity';
import { MachineDowntimeEntity } from './entities/machine-downtime.entity';

@Module({
  imports: [
    NotificationsModule,
    BullModule.registerQueue({ name: 'cnc-shift-transition' }),
    BullModule.registerQueue({ name: 'cnc-schedule-archive' }),
    TypeOrmModule.forFeature([
      CncMachineEntity,
      DailyScheduleEntity,
      ScheduleEntryEntity,
      ProductionLogEntity,
      MachineDowntimeEntity,
    ]),
  ],
  controllers: [
    CncMachinesController,
    DailySchedulesController,
    ScheduleEntriesController,
    ProductionLogsController,
    MachineDowntimeController,
  ],
  providers: [
    CncGateway,
    CncMachinesService,
    DailySchedulesService,
    ScheduleEntriesService,
    ProductionLogsService,
    MachineDowntimeService,
    CncShiftTransitionProcessor,
    CncScheduleArchiveProcessor,
    CncSchedulerService,
  ],
  exports: [CncMachinesService, DailySchedulesService, ScheduleEntriesService],
})
export class CncModule {}
