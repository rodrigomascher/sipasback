import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { Employee } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class EmployeesService extends BaseService<
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto
> {
  protected tableName = 'employees';
  protected columns =
    'id, employee_id, full_name, unit_id, department_id, role_id, is_technician, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: Employee): any {
    return toCamelCase(data);
  }

  protected transformForDb(dto: CreateEmployeeDto | UpdateEmployeeDto): any {
    return toSnakeCase(dto);
  }

  /**
   * Find employees by unit ID
   */
  async findByUnitId(unitId: number): Promise<any[]> {
    const employees = await this.supabaseService.select<Employee>(
      this.tableName,
      this.columns,
      { unit_id: unitId },
    );
    return (employees || []).map((e) => this.mapData(e));
  }

  /**
   * Find employees by department ID
   */
  async findByDepartmentId(departmentId: number): Promise<any[]> {
    const employees = await this.supabaseService.select<Employee>(
      this.tableName,
      this.columns,
      { department_id: departmentId },
    );
    return (employees || []).map((e) => this.mapData(e));
  }

  /**
   * Find employees by role ID
   */
  async findByRoleId(roleId: number): Promise<any[]> {
    const employees = await this.supabaseService.select<Employee>(
      this.tableName,
      this.columns,
      { role_id: roleId },
    );
    return (employees || []).map((e) => this.mapData(e));
  }
}
