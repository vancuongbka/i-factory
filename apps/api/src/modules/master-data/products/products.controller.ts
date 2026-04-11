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
  createProductCategorySchema,
  updateProductCategorySchema,
  createUomSchema,
  updateUomSchema,
  createProductSchema,
  updateProductSchema,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  CreateUomDto,
  UpdateUomDto,
  CreateProductDto,
  UpdateProductDto,
} from '@i-factory/api-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactoryAccessGuard } from '../../../common/guards/factory-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ProductsService } from './products.service';

const WRITE_ROLES = [UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER];

@ApiTags('Master Data — Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
@Controller('factories/:factoryId')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Categories ──────────────────────────────────────────────────────────────

  @Get('master-data/categories')
  @ApiOperation({ summary: 'List product categories (with children)' })
  findAllCategories(@Param('factoryId') factoryId: string) {
    return this.productsService.findAllCategories(factoryId);
  }

  @Post('master-data/categories')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createProductCategorySchema))
  @ApiOperation({ summary: 'Create product category' })
  createCategory(@Body() dto: CreateProductCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @Patch('master-data/categories/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateProductCategorySchema))
  @ApiOperation({ summary: 'Update product category' })
  updateCategory(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.productsService.updateCategory(id, factoryId, dto);
  }

  @Delete('master-data/categories/:id')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete product category' })
  removeCategory(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.productsService.removeCategory(id, factoryId);
  }

  // ── Units of Measure ────────────────────────────────────────────────────────

  @Get('master-data/uoms')
  @ApiOperation({ summary: 'List units of measure' })
  findAllUoms(@Param('factoryId') factoryId: string) {
    return this.productsService.findAllUoms(factoryId);
  }

  @Post('master-data/uoms')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createUomSchema))
  @ApiOperation({ summary: 'Create unit of measure' })
  createUom(@Body() dto: CreateUomDto) {
    return this.productsService.createUom(dto);
  }

  @Patch('master-data/uoms/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateUomSchema))
  @ApiOperation({ summary: 'Update unit of measure' })
  updateUom(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUomDto,
  ) {
    return this.productsService.updateUom(id, factoryId, dto);
  }

  @Delete('master-data/uoms/:id')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete unit of measure' })
  removeUom(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.productsService.removeUom(id, factoryId);
  }

  // ── Products ────────────────────────────────────────────────────────────────

  @Get('master-data/products')
  @ApiOperation({ summary: 'List products' })
  findAllProducts(@Param('factoryId') factoryId: string) {
    return this.productsService.findAllProducts(factoryId);
  }

  @Post('master-data/products')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(createProductSchema))
  @ApiOperation({ summary: 'Create product' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get('master-data/products/:id')
  @ApiOperation({ summary: 'Get product detail' })
  findProductById(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.productsService.findProductById(id, factoryId);
  }

  @Patch('master-data/products/:id')
  @Roles(...WRITE_ROLES)
  @UsePipes(new ZodValidationPipe(updateProductSchema))
  @ApiOperation({ summary: 'Update product' })
  updateProduct(
    @Param('factoryId') factoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, factoryId, dto);
  }

  @Delete('master-data/products/:id')
  @Roles(UserRole.FACTORY_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete product' })
  removeProduct(@Param('factoryId') factoryId: string, @Param('id') id: string) {
    return this.productsService.removeProduct(id, factoryId);
  }
}
