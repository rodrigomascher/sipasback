import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateRoleDto, UpdateRoleDto, RoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all roles
   */
  async findAll(): Promise<RoleDto[]> {
    const roles = await this.supabaseService.select(
      'roles',
      'id, name, description, is_technician, created_by, updated_by, created_at, updated_at',
    );

    return (roles || []).map(this.mapToRoleDto);
  }

  /**
   * Get role by ID
   */
  async findOne(id: number): Promise<RoleDto> {
    const roles = await this.supabaseService.select(
      'roles',
      'id, name, description, is_technician, created_by, updated_by, created_at, updated_at',
      { id },
    );

    if (!roles || roles.length === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return this.mapToRoleDto(roles[0]);
  }

  /**
   * Find roles by technician flag
   */
  async findByTechnician(isTechnician: boolean): Promise<RoleDto[]> {
    const roles = await this.supabaseService.select(
      'roles',
      'id, name, description, is_technician, created_by, updated_by, created_at, updated_at',
      { is_technician: isTechnician },
    );

    return (roles || []).map(this.mapToRoleDto);
  }

  /**
   * Create new role
   */
  async create(createRoleDto: CreateRoleDto, userId: number): Promise<RoleDto> {
    const data = {
      name: createRoleDto.name,
      description: createRoleDto.description || null,
      is_technician: createRoleDto.isTechnician || false,
      created_by: userId,
      updated_by: userId,
    };

    const result = await this.supabaseService.insert('roles', data);

    if (!result || result.length === 0) {
      throw new Error('Failed to create role');
    }

    return this.mapToRoleDto(result[0]);
  }

  /**
   * Update role
   */
  async update(id: number, updateRoleDto: UpdateRoleDto, userId: number): Promise<RoleDto> {
    // First verify role exists
    await this.findOne(id);

    const data: any = {};
    if (updateRoleDto.name) data.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) data.description = updateRoleDto.description;
    if (updateRoleDto.isTechnician !== undefined) data.is_technician = updateRoleDto.isTechnician;
    data.updated_by = userId;

    const result = await this.supabaseService.update('roles', data, { id });

    if (!result || result.length === 0) {
      throw new Error('Failed to update role');
    }

    return this.mapToRoleDto(result[0]);
  }

  /**
   * Delete role
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verify exists first
    await this.supabaseService.delete('roles', { id });
  }

  /**
   * Get total count of roles
   */
  async count(): Promise<number> {
    return this.supabaseService.count('roles');
  }

  /**
   * Helper to map database response to DTO
   */
  private mapToRoleDto(role: any): RoleDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description || null,
      isTechnician: role.is_technician,
      createdBy: role.created_by || null,
      updatedBy: role.updated_by || null,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
    };
  }
}
