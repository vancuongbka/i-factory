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
  CreateDailyScheduleDto,
  UpdateDailyScheduleDto,
  UserRole,
  createDailyScheduleSchema,
  updateDailyScheduleSchema,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { DailySchedulesService } from '../services/daily-schedules.service';

const WRITE_ROLES = [UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('CNC Daily Schedules')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
@Controller('factories/:factoryId/cnc/schedules')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class DailySchedulesController {
  constructor(private readonly service: DailySchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'List all daily schedules for a factory' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.service.findAll(factoryId);
  }

  @Get('by-date/:date')
  @ApiOperation({ summary: 'Get the schedule for a specific date (YYYY-MM-DD)' })
  @ApiResponse({ status: 404, description: 'No schedule found for this date' })
  findByDate(@Param('factoryId') factoryId: string, @Param('date') date: string) {
    return this.service.findByDate(factoryId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a daily schedule with its entries' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.service.findById(id, factoryId);
  }

  @Post()
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createDailyScheduleSchema))
  @ApiOperation({ summary: 'Create a daily schedule (starts as DRAFT)' })
  create(
    @Param('factoryId') factoryId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateDailyScheduleDto,
  ) {
    return this.service.create(factoryId, user.sub, dto);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateDailyScheduleSchema))
  @ApiOperation({ summary: 'Update a DRAFT daily schedule' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 422, description: 'Schedule is not in DRAFT status' })
  update(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDailyScheduleDto,
  ) {
    return this.service.update(id, factoryId, dto);
  }

  @Post(':id/publish')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Publish a DRAFT schedule — transitions status to PUBLISHED' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 422, description: 'Schedule is not in DRAFT status' })
  publish(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.publish(id, factoryId, user.sub);
  }

  @Delete(':id')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Soft-delete a DRAFT daily schedule' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 422, description: 'Schedule is not in DRAFT status' })
  remove(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.service.remove(id, factoryId);
  }
}
