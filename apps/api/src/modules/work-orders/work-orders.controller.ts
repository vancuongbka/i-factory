import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('Work Orders')
@ApiBearerAuth()
@Controller('factories/:factoryId/work-orders')
@UseGuards(JwtAuthGuard, FactoryAccessGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách lệnh công việc' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.workOrdersService.findAll(factoryId);
  }
}
