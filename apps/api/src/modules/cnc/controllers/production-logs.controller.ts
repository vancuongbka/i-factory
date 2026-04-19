import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateProductionLogDto,
  UserRole,
  createProductionLogSchema,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { ProductionLogsService } from '../services/production-logs.service';

const OPERATOR_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.FACTORY_ADMIN,
  UserRole.PRODUCTION_MANAGER,
  UserRole.OPERATOR,
];

@ApiTags('CNC Production Logs')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
@Controller('factories/:factoryId/cnc')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class ProductionLogsController {
  constructor(private readonly service: ProductionLogsService) {}

  @Get('entries/:entryId/logs')
  @ApiOperation({ summary: 'List production logs for a schedule entry' })
  findByEntry(@Param('factoryId') factoryId: string, @Param('entryId') entryId: string) {
    return this.service.findByEntry(entryId, factoryId);
  }

  @Post('production-logs')
  @Roles(...OPERATOR_ROLES)
  @UsePipes(new ZodValidationPipe(createProductionLogSchema))
  @ApiOperation({ summary: 'Submit a production log (operator reports completed units)' })
  @ApiResponse({ status: 404, description: 'Schedule entry not found' })
  @ApiResponse({ status: 422, description: 'Entry is not in RUNNING status' })
  create(
    @Param('factoryId') factoryId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateProductionLogDto,
  ) {
    return this.service.create(factoryId, user.sub, dto);
  }
}
