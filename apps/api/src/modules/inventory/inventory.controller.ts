import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  createMaterialSchema,
  updateMaterialSchema,
  createStockMovementSchema,
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateStockMovementDto,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { InventoryService } from './inventory.service';

const WRITE_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.FACTORY_ADMIN,
  UserRole.PRODUCTION_MANAGER,
  UserRole.WAREHOUSE_STAFF,
];

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('factories/:factoryId/inventory')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── Materials ─────────────────────────────────────────────────────────────

  @Get('materials')
  @ApiOperation({ summary: 'List all materials for a factory' })
  findAllMaterials(@Param('factoryId') factoryId: string) {
    return this.inventoryService.findAllMaterials(factoryId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'List materials below min stock level' })
  findLowStock(@Param('factoryId') factoryId: string) {
    return this.inventoryService.findLowStock(factoryId);
  }

  @Get('materials/:id')
  @ApiOperation({ summary: 'Get a single material' })
  findMaterialById(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
  ) {
    return this.inventoryService.findMaterialById(id, factoryId);
  }

  @Post('materials')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createMaterialSchema))
  @ApiOperation({ summary: 'Create a material' })
  createMaterial(
    @Param('factoryId') factoryId: string,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.inventoryService.create(factoryId, dto);
  }

  @Patch('materials/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateMaterialSchema))
  @ApiOperation({ summary: 'Update a material' })
  updateMaterial(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.inventoryService.update(id, factoryId, dto);
  }

  @Delete('materials/:id')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a material' })
  removeMaterial(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
  ) {
    return this.inventoryService.remove(id, factoryId);
  }

  // ── Movements ─────────────────────────────────────────────────────────────

  @Get('movements')
  @ApiOperation({ summary: 'List stock movements, optionally filtered by material' })
  @ApiQuery({ name: 'materialId', required: false })
  findMovements(
    @Param('factoryId') factoryId: string,
    @Query('materialId') materialId?: string,
  ) {
    return this.inventoryService.findMovements(factoryId, materialId);
  }

  @Post('movements')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createStockMovementSchema))
  @ApiOperation({ summary: 'Record a stock movement and update material current stock' })
  recordMovement(
    @Param('factoryId') factoryId: string,
    @Body() dto: CreateStockMovementDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.inventoryService.recordMovement(factoryId, dto, user.sub);
  }
}
