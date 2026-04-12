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
  createRoutingSchema,
  updateRoutingSchema,
  createRoutingOperationSchema,
  updateRoutingOperationSchema,
  CreateRoutingDto,
  UpdateRoutingDto,
  CreateRoutingOperationDto,
  UpdateRoutingOperationDto,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { RoutingsService } from './routings.service';

const WRITE_ROLES = [UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('Master Data — Routings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
@Controller('factories/:factoryId/master-data/routings')
export class RoutingsController {
  constructor(private readonly routingsService: RoutingsService) {}

  @Get()
  @ApiOperation({ summary: 'List routings' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.routingsService.findAllRoutings(factoryId);
  }

  @Post()
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createRoutingSchema))
  @ApiOperation({ summary: 'Create routing with operations' })
  create(@Body() dto: CreateRoutingDto) {
    return this.routingsService.createRouting(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get routing detail with operations' })
  findOne(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.routingsService.findRoutingById(id, factoryId);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateRoutingSchema))
  @ApiOperation({ summary: 'Update routing header' })
  update(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoutingDto,
  ) {
    return this.routingsService.updateRouting(id, factoryId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete routing' })
  remove(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.routingsService.removeRouting(id, factoryId);
  }

  // ── Operations ──────────────────────────────────────────────────────────────

  @Post(':id/operations')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createRoutingOperationSchema))
  @ApiOperation({ summary: 'Add operation to routing' })
  addOperation(
    @Param('factoryId') factoryId: string,
    @Param('id') routingId: string,
    @Body() dto: CreateRoutingOperationDto,
  ) {
    return this.routingsService.addOperation(routingId, factoryId, dto);
  }

  @Patch(':id/operations/:opId')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateRoutingOperationSchema))
  @ApiOperation({ summary: 'Update routing operation' })
  updateOperation(
    @Param('factoryId') factoryId: string,
    @Param('id') routingId: string,
    @Param('opId') opId: string,
    @Body() dto: UpdateRoutingOperationDto,
  ) {
    return this.routingsService.updateOperation(opId, routingId, factoryId, dto);
  }

  @Delete(':id/operations/:opId')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove routing operation' })
  removeOperation(
    @Param('factoryId') factoryId: string,
    @Param('id') routingId: string,
    @Param('opId') opId: string,
  ) {
    return this.routingsService.removeOperation(opId, routingId, factoryId);
  }
}
