import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BomController } from './bom.controller';
import { BomService } from './bom.service';
import { BomEntity } from './entities/bom.entity';
import { BomItemEntity } from './entities/bom-item.entity';
import { BomRevisionEntity } from './entities/bom-revision.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BomEntity, BomItemEntity, BomRevisionEntity])],
  controllers: [BomController],
  providers: [BomService],
  exports: [BomService],
})
export class BomModule {}
