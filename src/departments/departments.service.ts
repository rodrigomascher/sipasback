import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto/department.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { Department } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class DepartmentsService extends BaseService<
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto
> {
  protected tableName = 'departments';
  protected columns =
    'id, name, unit_id, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: Department): any {
    return toCamelCase(data);
  }

  protected transformForDb(
    dto: CreateDepartmentDto | UpdateDepartmentDto,
  ): any {
    return toSnakeCase(dto);
  }

  /**
   * Find departments by unit ID
   */
  async findByUnitId(unitId: number): Promise<any[]> {
    const departments = await this.supabaseService.select<Department>(
      this.tableName,
      this.columns,
      { unit_id: unitId },
    );
    return (departments || []).map((d) => this.mapData(d));
  }

  /**
   * Count total departments
   */
  async count(): Promise<number> {
    return this.supabaseService.count(this.tableName);
  }
}
