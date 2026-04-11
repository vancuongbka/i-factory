import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { QCService } from './qc.service';

@ApiTags('Quality Control')
@ApiBearerAuth()
@Controller('factories/:factoryId/qc')
@UseGuards(JwtAuthGuard, FactoryAccessGuard)
export class QCController {
  constructor(private readonly qcService: QCService) {}

  @Get('inspections')
  @ApiOperation({ summary: 'Danh sách phiếu kiểm tra chất lượng' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.qcService.findAll(factoryId);
  }
}
