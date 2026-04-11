import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { ProductionGateway } from './production.gateway';
import { ProductionOrderEntity } from './entities/production-order.entity';
import { ProductionLineEntity } from './entities/production-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionOrderEntity, ProductionLineEntity])],
  controllers: [ProductionController],
  providers: [ProductionService, ProductionGateway],
  exports: [ProductionService],
})
export class ProductionModule {}
