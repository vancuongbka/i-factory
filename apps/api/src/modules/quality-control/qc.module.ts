import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QCController } from './qc.controller';
import { QCService } from './qc.service';
import { QCInspectionEntity } from './entities/qc-inspection.entity';
import { QCDefectEntity } from './entities/qc-defect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QCInspectionEntity, QCDefectEntity])],
  controllers: [QCController],
  providers: [QCService],
  exports: [QCService],
})
export class QualityControlModule {}
