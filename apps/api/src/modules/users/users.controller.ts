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
import { UserRole, createUserSchema, updateUserSchema, CreateUserDto, UpdateUserDto } from '@i-factory/api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN)
  @ApiOperation({ summary: 'List all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN)
  @ApiOperation({ summary: 'Get a single user' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  @ApiOperation({ summary: 'Create a user' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @ApiOperation({ summary: 'Update a user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a user (SUPER_ADMIN only)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
