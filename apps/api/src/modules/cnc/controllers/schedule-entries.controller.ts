import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AdvanceEntryStatusDto,
  CreateScheduleEntryDto,
  ReorderScheduleEntriesDto,
  UpdateScheduleEntryDto,
  UserRole,
  advanceEntryStatusSchema,
  createScheduleEntrySchema,
  reorderScheduleEntriesSchema,
  updateScheduleEntrySchema,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ScheduleEntriesService } from '../services/schedule-entries.service';

const WRITE_ROLES = [UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];
const OPERATOR_ROLES = [...WRITE_ROLES, UserRole.OPERATOR];

@ApiTags('CNC Schedule Entries')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
@Controller('factories/:factoryId/cnc')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class ScheduleEntriesController {
  constructor(private readonly service: ScheduleEntriesService) {}

  @Get('schedules/:scheduleId/entries')
  @ApiOperation({ summary: 'List all entries for a daily schedule' })
  findBySchedule(
    @Param('factoryId') factoryId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.service.findBySchedule(scheduleId, factoryId);
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'Get a single schedule entry with computed progress' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  findById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.service.findById(id, factoryId);
  }

  @Post('entries')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createScheduleEntrySchema))
  @ApiOperation({ summary: 'Create a schedule entry — checks for machine time conflicts' })
  @ApiResponse({ status: 409, description: 'Time conflict with an existing entry on this machine' })
  create(@Param('factoryId') factoryId: string, @Body() dto: CreateScheduleEntryDto) {
    return this.service.create(factoryId, dto);
  }

  @Patch('entries/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateScheduleEntrySchema))
  @ApiOperation({ summary: 'Update a PENDING or SETUP schedule entry' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiResponse({ status: 409, description: 'Time conflict with an existing entry on this machine' })
  @ApiResponse({ status: 422, description: 'Entry is not in PENDING or SETUP status' })
  update(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleEntryDto,
  ) {
    return this.service.update(id, factoryId, dto);
  }

  @Delete('entries/:id')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Soft-delete a PENDING schedule entry' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiResponse({ status: 422, description: 'Only PENDING entries can be deleted' })
  remove(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.service.remove(id, factoryId);
  }

  @Post('entries/:id/advance-status')
  @Roles(...OPERATOR_ROLES)
  @UsePipes(new ZodValidationPipe(advanceEntryStatusSchema))
  @ApiOperation({ summary: 'Advance entry status through the state machine' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiResponse({ status: 422, description: 'Invalid status transition' })
  advanceStatus(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: AdvanceEntryStatusDto,
  ) {
    return this.service.advanceStatus(id, factoryId, dto);
  }

  @Post('entries/reorder')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(reorderScheduleEntriesSchema))
  @ApiOperation({ summary: 'Bulk-update sortOrder for entries on a machine' })
  reorder(@Param('factoryId') factoryId: string, @Body() dto: ReorderScheduleEntriesDto) {
    return this.service.reorder(factoryId, dto);
  }
}
