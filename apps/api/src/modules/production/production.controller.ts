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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  createProductionOrderSchema,
  updateProductionOrderSchema,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProductionService } from './production.service';

const WRITE_ROLES = [UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('Production')
@ApiBearerAuth()
@Controller('factories/:factoryId/production')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  @ApiOperation({ summary: 'List all production orders for a factory' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.productionService.findAll(factoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single production order' })
  findById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.productionService.findById(id, factoryId);
  }

  @Post()
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createProductionOrderSchema))
  @ApiOperation({ summary: 'Create a production order' })
  create(@Param('factoryId') factoryId: string, @Body() dto: CreateProductionOrderDto) {
    return this.productionService.create(factoryId, dto);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateProductionOrderSchema))
  @ApiOperation({ summary: 'Update a production order' })
  update(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductionOrderDto,
  ) {
    return this.productionService.update(id, factoryId, dto);
  }

  @Delete(':id')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a production order' })
  remove(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.productionService.remove(id, factoryId);
  }
}
