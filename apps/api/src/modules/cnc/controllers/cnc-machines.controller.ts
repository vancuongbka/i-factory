import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CncMachineStatus,
  CreateCncMachineDto,
  UpdateCncMachineDto,
  UserRole,
  createCncMachineSchema,
  updateCncMachineSchema,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { CncMachinesService } from '../services/cnc-machines.service';

const WRITE_ROLES = [UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('CNC Machines')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
@Controller('factories/:factoryId/cnc/machines')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class CncMachinesController {
  constructor(private readonly service: CncMachinesService) {}

  @Get()
  @ApiOperation({ summary: 'List all CNC machines for a factory' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.service.findAll(factoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single CNC machine' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  findById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.service.findById(id, factoryId);
  }

  @Post()
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createCncMachineSchema))
  @ApiOperation({ summary: 'Create a CNC machine' })
  create(@Param('factoryId') factoryId: string, @Body() dto: CreateCncMachineDto) {
    return this.service.create(factoryId, dto);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateCncMachineSchema))
  @ApiOperation({ summary: 'Update a CNC machine' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  update(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCncMachineDto,
  ) {
    return this.service.update(id, factoryId, dto);
  }

  @Delete(':id')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Soft-delete a CNC machine' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  remove(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.service.remove(id, factoryId);
  }

  @Patch(':id/status')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Manually update machine status (e.g. set to MAINTENANCE)' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  updateStatus(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body('status') status: CncMachineStatus,
  ) {
    return this.service.updateStatus(id, factoryId, status);
  }

  @Get('/kpi/summary')
  @ApiOperation({ summary: 'Get KPI summary for all CNC machines on a date' })
  @ApiQuery({ name: 'date', required: true, example: '2026-04-19' })
  getKpiSummary(@Param('factoryId') factoryId: string, @Query('date') date: string) {
    return this.service.getKpiSummary(factoryId, date);
  }
}
