import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FactoriesService } from './factories.service';

@ApiTags('Factories')
@ApiBearerAuth()
@Controller('factories')
@UseGuards(JwtAuthGuard)
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách nhà máy' })
  findAll() {
    return this.factoriesService.findAll();
  }
}
