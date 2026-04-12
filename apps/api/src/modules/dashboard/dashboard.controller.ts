import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('factories/:factoryId/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get aggregated dashboard metrics for a factory' })
  getDashboard(@Param('factoryId') factoryId: string) {
    return this.dashboardService.getDashboard(factoryId);
  }
}
