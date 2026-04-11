import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  erpSyncPayloadSchema,
  ErpSyncPayload,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ErpSyncService } from './erp-sync.service';

@ApiTags('Master Data — ERP Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
@Controller('factories/:factoryId/master-data/erp-sync')
export class ErpSyncController {
  constructor(private readonly erpSyncService: ErpSyncService) {}

  @Post()
  @Roles(UserRole.FACTORY_ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ZodValidationPipe(erpSyncPayloadSchema))
  @ApiOperation({ summary: 'Enqueue ERP master data sync job' })
  sync(@Param('factoryId') factoryId: string, @Body() dto: ErpSyncPayload) {
    return this.erpSyncService.enqueue(factoryId, dto);
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Poll ERP sync job status' })
  getStatus(@Param('jobId') jobId: string) {
    return this.erpSyncService.getStatus(jobId);
  }
}
