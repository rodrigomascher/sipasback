import { Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PaginationQueryBuilder } from '../utils/pagination.builder';
import { GetUser } from '../decorators/get-user.decorator';
import {
  ApiListOperation,
  ApiGetOperation,
  ApiCreateOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
} from '../decorators/api-crud.decorator';

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
export abstract class BaseController<T, CreateDto, UpdateDto> {
  protected service!: any;

  constructor(service?: any) {
    if (service) {
      this.service = service;
    }
  }

  @Get()
  @ApiListOperation()
  async findAll(
    @Query('page') page?: string | number,
    @Query('pageSize') pageSize?: string | number,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
    @Query('search') search?: string,
  ): Promise<PaginatedResponseDto<T>> {
    const paginationQuery = PaginationQueryBuilder.fromQuery({
      page,
      pageSize,
      sortBy,
      sortDirection,
      search,
    });
    return this.service.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiGetOperation()
  async findOne(@Param('id') id: string): Promise<T> {
    return this.service.findOne(this.parseId(id));
  }

  @Post()
  @ApiCreateOperation()
  async create(@Body() dto: CreateDto, @GetUser() user: any): Promise<T> {
    return this.service.create(dto, user?.userId);
  }

  @Put(':id')
  @ApiUpdateOperation()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDto,
    @GetUser() user: any,
  ): Promise<T> {
    return this.service.update(this.parseId(id), dto, user?.userId);
  }

  @Delete(':id')
  @ApiDeleteOperation()
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(this.parseId(id));
    return { success: true };
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
