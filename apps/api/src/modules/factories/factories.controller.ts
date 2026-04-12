import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FactoriesService } from './factories.service';

@ApiTags('Factories')
@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  // Public — required by FactoryProvider to bootstrap single-factory mode without auth.
  @Get()
  @ApiOperation({ summary: 'List factories (public)' })
  findAll() {
    return this.factoriesService.findAll();
  }
}
