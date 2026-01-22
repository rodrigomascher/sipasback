import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { Role } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class RolesService extends BaseService<
  Role,
  CreateRoleDto,
  UpdateRoleDto
> {
  protected tableName = 'roles';
  protected columns =
    'id, name, description, is_technician, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: Role): any {
    return toCamelCase(data);
  }

  protected transformForDb(
    dto: CreateRoleDto | UpdateRoleDto,
  ): any {
    return toSnakeCase(dto);
  }

  /**
   * Find roles by technician flag
   */
  async findByTechnician(isTechnician: boolean): Promise<any[]> {
    const roles = await this.supabaseService.select<Role>(
      this.tableName,
      this.columns,
      { is_technician: isTechnician },
    );
    return (roles || []).map((r) => this.mapData(r));
  }


}
