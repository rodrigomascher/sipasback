import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentDto } from './dto/department.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(private supabaseService: SupabaseService) {}

  private toCamelCase(obj: any): any {
    if (!obj) return obj;
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }

  /**
   * Get all departments with pagination
   */
  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
    const columns = 'id, name, active, created_by, updated_by, created_at, updated_at';
    const offset = paginationQuery.getOffset();
    
    // Get paginated data with count
    const { data, count } = await this.supabaseService.selectWithCount(
      'department',
      columns,
      {},
      paginationQuery.sortBy,
      paginationQuery.sortDirection,
      paginationQuery.pageSize,
      offset
    );

    const mappedData = data?.map(item => this.toCamelCase(item)) || [];
    return new PaginatedResponseDto(mappedData, count || 0, paginationQuery.page, paginationQuery.pageSize);
  }

  /**
   * Get department by ID
   */
  async findOne(id: number): Promise<DepartmentDto> {
    const departments = await this.supabaseService.select(
      'departments',
      'id, name, unit_id, created_by, updated_by, created_at, updated_at',
      { id },
    );

    if (!departments || departments.length === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.mapToDepartmentDto(departments[0]);
  }

  /**
   * Find departments by unit ID
   */
  async findByUnitId(unitId: number): Promise<DepartmentDto[]> {
    const departments = await this.supabaseService.select(
      'departments',
      'id, name, unit_id, created_by, updated_by, created_at, updated_at',
      { unit_id: unitId },
    );

    return (departments || []).map(this.mapToDepartmentDto);
  }

  /**
   * Create new department
   */
  async create(createDepartmentDto: CreateDepartmentDto, userId: number): Promise<DepartmentDto> {
    const data = {
      name: createDepartmentDto.name,
      unit_id: createDepartmentDto.unitId,
      created_by: userId,
      updated_by: userId,
    };

    const result = await this.supabaseService.insert('departments', data);

    if (!result || result.length === 0) {
      throw new Error('Failed to create department');
    }

    return this.mapToDepartmentDto(result[0]);
  }

  /**
   * Update department
   */
  async update(id: number, updateDepartmentDto: UpdateDepartmentDto, userId: number): Promise<DepartmentDto> {
    // First verify department exists
    await this.findOne(id);

    const data: any = {};
    if (updateDepartmentDto.name) data.name = updateDepartmentDto.name;
    if (updateDepartmentDto.unitId) data.unit_id = updateDepartmentDto.unitId;
    data.updated_by = userId;

    const result = await this.supabaseService.update('departments', data, { id });

    if (!result || result.length === 0) {
      throw new Error('Failed to update department');
    }

    return this.mapToDepartmentDto(result[0]);
  }

  /**
   * Delete department
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verify exists first
    await this.supabaseService.delete('departments', { id });
  }

  /**
   * Get total count of departments
   */
  async count(): Promise<number> {
    return this.supabaseService.count('departments');
  }

  /**
   * Helper to map database response to DTO
   */
  private mapToDepartmentDto(department: any): DepartmentDto {
    return {
      id: department.id,
      name: department.name,
      unitId: department.unit_id,
      createdBy: department.created_by || null,
      updatedBy: department.updated_by || null,
      createdAt: department.created_at,
      updatedAt: department.updated_at,
    };
  }
}
