import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkCenterEntity } from './entities/work-center.entity';
import { MachineEntity } from './entities/machine.entity';
import { SkillEntity } from './entities/skill.entity';
import { WorkCentersService } from './work-centers.service';
import { WorkCentersController } from './work-centers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkCenterEntity, MachineEntity, SkillEntity])],
  controllers: [WorkCentersController],
  providers: [WorkCentersService],
  exports: [WorkCentersService, TypeOrmModule],
})
export class WorkCentersModule {}
