import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('factories/:factoryId/inventory')
@UseGuards(JwtAuthGuard, FactoryAccessGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('materials')
  @ApiOperation({ summary: 'Danh sách nguyên vật liệu' })
  findAllMaterials(@Param('factoryId') factoryId: string) {
    return this.inventoryService.findAllMaterials(factoryId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Danh sách nguyên liệu sắp hết' })
  findLowStock(@Param('factoryId') factoryId: string) {
    return this.inventoryService.findLowStock(factoryId);
  }
}
