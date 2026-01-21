import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all employees
   */
  async findAll(): Promise<EmployeeDto[]> {
    const employees = await this.supabaseService.select(
      'employees',
      'id, employee_id, full_name, unit_id, department_id, role_id, is_technician, created_by, updated_by, created_at, updated_at',
    );

    return (employees || []).map(this.mapToEmployeeDto);
  }

  /**
   * Get employee by ID
   */
  async findOne(id: number): Promise<EmployeeDto> {
    const employees = await this.supabaseService.select(
      'employees',
      'id, employee_id, full_name, unit_id, department_id, role_id, is_technician, created_by, updated_by, created_at, updated_at',
      { id },
    );

    if (!employees || employees.length === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.mapToEmployeeDto(employees[0]);
  }

  /**
   * Find employees by unit ID
   */
  async findByUnitId(unitId: number): Promise<EmployeeDto[]> {
    const employees = await this.supabaseService.select(
      'employees',
      'id, employee_id, full_name, unit_id, department_id, role_id, is_technician, created_by, updated_by, created_at, updated_at',
      { unit_id: unitId },
    );

    return (employees || []).map(this.mapToEmployeeDto);
  }

  /**
   * Find employees by department ID
   */
  async findByDepartmentId(departmentId: number): Promise<EmployeeDto[]> {
    const employees = await this.supabaseService.select(
      'employees',
      'id, employee_id, full_name, unit_id, department_id, role_id, is_technician, created_by, updated_by, created_at, updated_at',
      { department_id: departmentId },
    );

    return (employees || []).map(this.mapToEmployeeDto);
  }

  /**
   * Find employees by role ID
   */
  async findByRoleId(roleId: number): Promise<EmployeeDto[]> {
    const employees = await this.supabaseService.select(
      'employees',
      'id, employee_id, full_name, unit_id, department_id, role_id, is_technician, created_by, updated_by, created_at, updated_at',
      { role_id: roleId },
    );

    return (employees || []).map(this.mapToEmployeeDto);
  }

  /**
   * Create new employee
   */
  async create(createEmployeeDto: CreateEmployeeDto, userId: number): Promise<EmployeeDto> {
    const data = {
      employee_id: createEmployeeDto.employeeId,
      full_name: createEmployeeDto.fullName,
      unit_id: createEmployeeDto.unitId,
      department_id: createEmployeeDto.departmentId,
      role_id: createEmployeeDto.roleId || null,
      is_technician: createEmployeeDto.isTechnician || false,
      created_by: userId,
      updated_by: userId,
    };

    const result = await this.supabaseService.insert('employees', data);

    if (!result || result.length === 0) {
      throw new Error('Failed to create employee');
    }

    return this.mapToEmployeeDto(result[0]);
  }

  /**
   * Update employee
   */
  async update(id: number, updateEmployeeDto: UpdateEmployeeDto, userId: number): Promise<EmployeeDto> {
    // First verify employee exists
    await this.findOne(id);

    const data: any = {};
    if (updateEmployeeDto.employeeId) data.employee_id = updateEmployeeDto.employeeId;
    if (updateEmployeeDto.fullName) data.full_name = updateEmployeeDto.fullName;
    if (updateEmployeeDto.unitId) data.unit_id = updateEmployeeDto.unitId;
    if (updateEmployeeDto.departmentId) data.department_id = updateEmployeeDto.departmentId;
    if (updateEmployeeDto.roleId !== undefined) data.role_id = updateEmployeeDto.roleId;
    if (updateEmployeeDto.isTechnician !== undefined) data.is_technician = updateEmployeeDto.isTechnician;
    data.updated_by = userId;

    const result = await this.supabaseService.update('employees', data, { id });

    if (!result || result.length === 0) {
      throw new Error('Failed to update employee');
    }

    return this.mapToEmployeeDto(result[0]);
  }

  /**
   * Delete employee
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verify exists first
    await this.supabaseService.delete('employees', { id });
  }

  /**
   * Get total count of employees
   */
  async count(): Promise<number> {
    return this.supabaseService.count('employees');
  }

  /**
   * Helper to map database response to DTO
   */
  private mapToEmployeeDto(employee: any): EmployeeDto {
    return {
      id: employee.id,
      employeeId: employee.employee_id,
      fullName: employee.full_name,
      unitId: employee.unit_id,
      departmentId: employee.department_id,
      roleId: employee.role_id || null,
      isTechnician: employee.is_technician,
      createdBy: employee.created_by || null,
      updatedBy: employee.updated_by || null,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at,
    };
  }
}
