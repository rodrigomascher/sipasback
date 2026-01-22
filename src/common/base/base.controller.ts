import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../dto/paginated-response.dto';
import { BaseService } from './base.service';

/**
 * BaseController - Abstract base class for CRUD controllers
 * Provides standard CRUD endpoints with pagination support
 *
 * Usage:
 * @Controller('genders')
 * @ApiTags('genders')
 * export class GendersController extends BaseController<GenderDto, CreateGenderDto, UpdateGenderDto> {
 *   constructor(gendersService: GendersService) {
 *     super(gendersService);
 *   }
 * }
 */
export abstract class BaseController<
  T,
  CreateDto,
  UpdateDto,
> {
  protected abstract service: BaseService<T, CreateDto, UpdateDto>;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all items with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'id' })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    type: String,
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of items',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(
    @Query('page') page?: number | string,
    @Query('pageSize') pageSize?: number | string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ): Promise<PaginatedResponseDto<T>> {
    const paginationQuery = this.buildPaginationQuery(
      page,
      pageSize,
      sortBy,
      sortDirection,
    );
    return this.service.findAll(paginationQuery);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Item data',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findOne(@Param('id') id: string): Promise<T> {
    return this.service.findOne(this.parseId(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(@Body() dto: CreateDto): Promise<T> {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update item' })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDto,
  ): Promise<T> {
    return this.service.update(this.parseId(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete item' })
  @ApiResponse({
    status: 200,
    description: 'Item deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(this.parseId(id));
    return { success: true };
  }

  /**
   * Build pagination query from query parameters
   */
  protected buildPaginationQuery(
    page?: number | string,
    pageSize?: number | string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
  ): PaginationQueryDto {
    return new PaginationQueryDto({
      page: this.parseNumber(page, 1),
      pageSize: this.parseNumber(pageSize, 10),
      sortBy: sortBy || 'id',
      sortDirection: sortDirection || 'asc',
    });
  }

  /**
   * Parse string to number with default fallback
   */
  protected parseNumber(value?: number | string, defaultValue: number = 1): number {
    if (!value) return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Parse ID parameter
   */
  protected parseId(id: string): number {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid ID format');
    }
    return parsed;
  }
}
