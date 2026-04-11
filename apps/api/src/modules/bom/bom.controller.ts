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
  createBomV2Schema,
  updateBomV2Schema,
  addBomItemSchema,
  createBomRevisionSchema,
  CreateBomV2Dto,
  UpdateBomV2Dto,
  AddBomItemDto,
  CreateBomRevisionDto,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../common/guards/factory-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BomService } from './bom.service';

const WRITE_ROLES = [UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('BOM')
@ApiBearerAuth()
@Controller('factories/:factoryId/bom')
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Get()
  @ApiOperation({ summary: 'List BOMs' })
  findAll(@Param('factoryId') factoryId: string) {
    return this.bomService.findAll(factoryId);
  }

  @Post()
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createBomV2Schema))
  @ApiOperation({ summary: 'Create BOM with items' })
  create(@Body() dto: CreateBomV2Dto) {
    return this.bomService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BOM detail with items' })
  findOne(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.bomService.findById(id, factoryId);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateBomV2Schema))
  @ApiOperation({ summary: 'Update BOM header' })
  update(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBomV2Dto,
  ) {
    return this.bomService.update(id, factoryId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.FACTORY_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete BOM' })
  remove(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.bomService.remove(id, factoryId);
  }

  // ── Items ───────────────────────────────────────────────────────────────────

  @Post(':id/items')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(addBomItemSchema))
  @ApiOperation({ summary: 'Add item to BOM' })
  addItem(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: AddBomItemDto,
  ) {
    return this.bomService.addItem(id, factoryId, dto);
  }

  @Patch(':id/items/:itemId')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Update BOM item' })
  updateItem(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: Partial<AddBomItemDto>,
  ) {
    return this.bomService.updateItem(id, itemId, factoryId, dto);
  }

  @Delete(':id/items/:itemId')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove BOM item' })
  removeItem(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.bomService.removeItem(id, itemId, factoryId);
  }

  // ── Revisions ───────────────────────────────────────────────────────────────

  @Get(':id/revisions')
  @ApiOperation({ summary: 'List BOM revision history' })
  getRevisions(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.bomService.findRevisions(id, factoryId);
  }

  @Post(':id/revise')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createBomRevisionSchema))
  @ApiOperation({ summary: 'Create BOM revision (snapshots current state, bumps version)' })
  createRevision(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: CreateBomRevisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.bomService.createRevision(id, factoryId, user.sub, dto);
  }
}
