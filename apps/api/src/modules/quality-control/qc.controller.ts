import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  QCResult,
  createQCInspectionSchema,
  updateQCInspectionSchema,
  createDefectSchema,
  CreateQCInspectionDto,
  UpdateQCInspectionDto,
  CreateDefectDto,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { QCService } from './qc.service';

const WRITE_ROLES = [
  UserRole.FACTORY_ADMIN,
  UserRole.PRODUCTION_MANAGER,
  UserRole.QC_INSPECTOR,
];

@ApiTags('Quality Control')
@ApiBearerAuth()
@Controller('factories/:factoryId/qc')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class QCController {
  constructor(private readonly qcService: QCService) {}

  @Get('inspections')
  @ApiOperation({ summary: 'List all QC inspections for a factory' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.qcService.findAll(factoryId);
  }

  @Get('inspections/:id')
  @ApiOperation({ summary: 'Get a single QC inspection with defects' })
  findById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.qcService.findById(id, factoryId);
  }

  @Post('inspections')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createQCInspectionSchema))
  @ApiOperation({ summary: 'Create a QC inspection' })
  create(
    @Param('factoryId') factoryId: string,
    @Body() dto: CreateQCInspectionDto,
  ) {
    return this.qcService.create(factoryId, dto);
  }

  @Patch('inspections/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateQCInspectionSchema))
  @ApiOperation({ summary: 'Update a QC inspection' })
  update(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateQCInspectionDto,
  ) {
    return this.qcService.update(id, factoryId, dto);
  }

  @Delete('inspections/:id')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a QC inspection' })
  remove(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.qcService.remove(id, factoryId);
  }

  @Post('inspections/:id/defects')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createDefectSchema))
  @ApiOperation({ summary: 'Add a defect to an inspection' })
  addDefect(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: CreateDefectDto,
  ) {
    return this.qcService.addDefect(id, factoryId, dto);
  }

  @Patch('inspections/:id/approve')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set inspection result to PASS' })
  approve(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.qcService.setResult(id, factoryId, QCResult.PASS);
  }

  @Patch('inspections/:id/reject')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set inspection result to FAIL' })
  reject(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.qcService.setResult(id, factoryId, QCResult.FAIL);
  }
}
