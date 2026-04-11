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
  createWorkCenterSchema,
  updateWorkCenterSchema,
  createMachineSchema,
  updateMachineSchema,
  createSkillSchema,
  updateSkillSchema,
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
  CreateMachineDto,
  UpdateMachineDto,
  CreateSkillDto,
  UpdateSkillDto,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { WorkCentersService } from './work-centers.service';

const WRITE_ROLES = [UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('Master Data — Work Centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
@Controller('factories/:factoryId')
export class WorkCentersController {
  constructor(private readonly workCentersService: WorkCentersService) {}

  // ── Work Centers ────────────────────────────────────────────────────────────

  @Get('master-data/work-centers')
  @ApiOperation({ summary: 'List work centers' })
  findAllWorkCenters(@Param('factoryId') factoryId: string) {
    return this.workCentersService.findAllWorkCenters(factoryId);
  }

  @Post('master-data/work-centers')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createWorkCenterSchema))
  @ApiOperation({ summary: 'Create work center' })
  createWorkCenter(@Body() dto: CreateWorkCenterDto) {
    return this.workCentersService.createWorkCenter(dto);
  }

  @Get('master-data/work-centers/:id')
  @ApiOperation({ summary: 'Get work center detail with machines' })
  findWorkCenterById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.workCentersService.findWorkCenterById(id, factoryId);
  }

  @Patch('master-data/work-centers/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateWorkCenterSchema))
  @ApiOperation({ summary: 'Update work center' })
  updateWorkCenter(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkCenterDto,
  ) {
    return this.workCentersService.updateWorkCenter(id, factoryId, dto);
  }

  @Delete('master-data/work-centers/:id')
  @Roles(UserRole.FACTORY_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete work center' })
  removeWorkCenter(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.workCentersService.removeWorkCenter(id, factoryId);
  }

  // ── Machines ────────────────────────────────────────────────────────────────

  @Get('master-data/work-centers/:workCenterId/machines')
  @ApiOperation({ summary: 'List machines in a work center' })
  findAllMachines(
    @Param('factoryId') factoryId: string,
    @Param('workCenterId') workCenterId: string,
  ) {
    return this.workCentersService.findAllMachines(workCenterId, factoryId);
  }

  @Post('master-data/work-centers/:workCenterId/machines')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createMachineSchema))
  @ApiOperation({ summary: 'Add machine to work center' })
  createMachine(@Body() dto: CreateMachineDto) {
    return this.workCentersService.createMachine(dto);
  }

  @Patch('master-data/work-centers/:workCenterId/machines/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateMachineSchema))
  @ApiOperation({ summary: 'Update machine' })
  updateMachine(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMachineDto,
  ) {
    return this.workCentersService.updateMachine(id, factoryId, dto);
  }

  @Delete('master-data/work-centers/:workCenterId/machines/:id')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete machine' })
  removeMachine(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.workCentersService.removeMachine(id, factoryId);
  }

  // ── Skills ──────────────────────────────────────────────────────────────────

  @Get('master-data/skills')
  @ApiOperation({ summary: 'List skills' })
  findAllSkills(@Param('factoryId') factoryId: string) {
    return this.workCentersService.findAllSkills(factoryId);
  }

  @Post('master-data/skills')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createSkillSchema))
  @ApiOperation({ summary: 'Create skill' })
  createSkill(@Body() dto: CreateSkillDto) {
    return this.workCentersService.createSkill(dto);
  }

  @Patch('master-data/skills/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateSkillSchema))
  @ApiOperation({ summary: 'Update skill' })
  updateSkill(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.workCentersService.updateSkill(id, factoryId, dto);
  }

  @Delete('master-data/skills/:id')
  @Roles(UserRole.FACTORY_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete skill' })
  removeSkill(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.workCentersService.removeSkill(id, factoryId);
  }
}
