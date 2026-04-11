import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutingEntity } from './entities/routing.entity';
import { RoutingOperationEntity } from './entities/routing-operation.entity';
import { RoutingsService } from './routings.service';
import { RoutingsController } from './routings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoutingEntity, RoutingOperationEntity])],
  controllers: [RoutingsController],
  providers: [RoutingsService],
  exports: [RoutingsService, TypeOrmModule],
})
export class RoutingsModule {}
