import { Body, Controller, Get, Param, Patch, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateCncDowntimeDto,
  ResolveCncDowntimeDto,
  UserRole,
  createCncDowntimeSchema,
  resolveCncDowntimeSchema,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { MachineDowntimeService } from '../services/machine-downtime.service';

const OPERATOR_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.FACTORY_ADMIN,
  UserRole.PRODUCTION_MANAGER,
  UserRole.OPERATOR,
];

@ApiTags('CNC Machine Downtime')
@ApiBearerAuth()
@Controller('factories/:factoryId/cnc')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class MachineDowntimeController {
  constructor(private readonly service: MachineDowntimeService) {}

  @Get('downtime/active')
  @ApiOperation({ summary: 'List all unresolved downtime events for a factory' })
  findActive(@Param('factoryId') factoryId: string) {
    return this.service.findActive(factoryId);
  }

  @Get('machines/:machineId/downtime')
  @ApiOperation({ summary: 'List downtime history for a specific CNC machine' })
  findByMachine(
    @Param('factoryId') factoryId: string,
    @Param('machineId') machineId: string,
  ) {
    return this.service.findByMachine(machineId, factoryId);
  }

  @Post('downtime')
  @Roles(...OPERATOR_ROLES)
  @UsePipes(new ZodValidationPipe(createCncDowntimeSchema))
  @ApiOperation({ summary: 'Raise a downtime event — sets machine status to ERROR' })
  raise(
    @Param('factoryId') factoryId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCncDowntimeDto,
  ) {
    return this.service.raise(factoryId, user.sub, dto);
  }

  @Patch('downtime/:id/resolve')
  @Roles(...OPERATOR_ROLES)
  @UsePipes(new ZodValidationPipe(resolveCncDowntimeSchema))
  @ApiOperation({ summary: 'Resolve a downtime event — sets machine status to IDLE' })
  resolve(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ResolveCncDowntimeDto,
  ) {
    return this.service.resolve(id, factoryId, user.sub, dto);
  }
}
