import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactoriesController } from './factories.controller';
import { FactoriesService } from './factories.service';
import { FactoryEntity } from './entities/factory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FactoryEntity])],
  controllers: [FactoriesController],
  providers: [FactoriesService],
  exports: [FactoriesService],
})
export class FactoriesModule {}
