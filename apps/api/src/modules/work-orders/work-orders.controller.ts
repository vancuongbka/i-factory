import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, createWorkOrderSchema, CreateWorkOrderDto } from '@i-factory/api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { WorkOrdersService } from './work-orders.service';

const WRITE_ROLES = [UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('Work Orders')
@ApiBearerAuth()
@Controller('factories/:factoryId/work-orders')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all work orders for a factory' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.workOrdersService.findAll(factoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single work order with steps' })
  findById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.workOrdersService.findById(id, factoryId);
  }

  @Post()
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createWorkOrderSchema))
  @ApiOperation({ summary: 'Create a work order with explicit steps' })
  create(@Param('factoryId') factoryId: string, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(factoryId, dto);
  }

  @Post(':productionOrderId/from-routing')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createWorkOrderSchema))
  @ApiOperation({
    summary: 'Create a work order from routing — auto-generates steps from the active routing for the production order product',
  })
  createFromProductionOrder(
    @Param('factoryId') factoryId: string,
    @Param('productionOrderId') productionOrderId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrdersService.createFromProductionOrder(productionOrderId, factoryId, dto);
  }
}
