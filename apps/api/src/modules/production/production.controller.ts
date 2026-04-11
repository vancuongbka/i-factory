import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { ProductionService } from './production.service';

@ApiTags('Production')
@ApiBearerAuth()
@Controller('factories/:factoryId/production')
@UseGuards(JwtAuthGuard, FactoryAccessGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách lệnh sản xuất' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.productionService.findAll(factoryId);
  }
}
