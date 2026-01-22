import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../dto/paginated-response.dto';

/**
 * BaseService - Abstract base class for CRUD services
 * Provides standard CRUD operations with pagination support
 *
 * Usage:
 * @Injectable()
 * export class GendersService extends BaseService<Gender, CreateGenderDto, UpdateGenderDto> {
 *   protected tableName = 'gender';
 *   protected columns = 'id, description, active, created_by, updated_by, created_at, updated_at';
 *
 *   constructor(supabaseService: SupabaseService) {
 *     super(supabaseService);
 *   }
 *
 *   protected mapData(data: Gender): any {
 *     return toCamelCase(data);
 *   }
 *
 *   protected transformForDb(dto: CreateGenderDto | UpdateGenderDto): any {
 *     return toSnakeCase(dto);
 *   }
 * }
 */
@Injectable()
export abstract class BaseService<T, CreateDto, UpdateDto> {
  protected abstract tableName: string;
  protected abstract columns: string;

  constructor(protected supabaseService: SupabaseService) {}

  /**
   * Find all items with pagination
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<T>> {
    const offset = paginationQuery.getOffset();

    const { data, count } = await this.supabaseService.selectWithCount<T>(
      this.tableName,
      this.columns,
      {},
      paginationQuery.sortBy,
      paginationQuery.sortDirection,
      paginationQuery.pageSize,
      offset,
    );

    const mappedData = data?.map((item) => this.mapData(item)) || [];

    return new PaginatedResponseDto(
      mappedData,
      count || 0,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
  }

  /**
   * Find single item by ID
   */
  async findOne(id: number): Promise<T> {
    const result = await this.supabaseService.select<T>(
      this.tableName,
      this.columns,
      { id },
    );

    if (!result || result.length === 0) {
      throw new NotFoundException(
        `${this.tableName} with ID ${id} not found`,
      );
    }

    return this.mapData(result[0]);
  }

  /**
   * Create new item
   */
  async create(dto: CreateDto): Promise<T> {
    const data = this.transformForDb(dto);

    const result = await this.supabaseService.insert<T>(
      this.tableName,
      data,
    );

    if (!result || result.length === 0) {
      throw new Error(`Failed to create ${this.tableName}`);
    }

    return this.mapData(result[0]);
  }

  /**
   * Update item
   */
  async update(id: number, dto: UpdateDto): Promise<T> {
    // Verify item exists first
    await this.findOne(id);

    const data = this.transformForDb(dto);

    const result = await this.supabaseService.update<T>(
      this.tableName,
      data,
      { id },
    );

    if (!result || result.length === 0) {
      throw new Error(`Failed to update ${this.tableName}`);
    }

    return this.mapData(result[0]);
  }

  /**
   * Remove item by ID
   */
  async remove(id: number): Promise<boolean> {
    // Verify item exists first
    await this.findOne(id);

    await this.supabaseService.delete(this.tableName, { id });
    return true;
  }

  /**
   * Get total count of items
   */
  async count(): Promise<number> {
    const { count } = await this.supabaseService.selectWithCount(
      this.tableName,
      'id',
      {},
    );
    return count || 0;
  }

  /**
   * Map database response to DTO
   * Override in subclass to add custom mapping logic
   */
  protected abstract mapData(data: T): any;

  /**
   * Transform DTO to database format
   * Override in subclass to add custom transformation logic
   */
  protected abstract transformForDb(dto: CreateDto | UpdateDto): any;
}
