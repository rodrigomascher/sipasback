import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { Unit } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class UnitsService extends BaseService<
  Unit,
  CreateUnitDto,
  UpdateUnitDto
> {
  protected tableName = 'units';
  protected columns =
    'id, name, type, is_armored, city, state, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: Unit): any {
    return toCamelCase(data);
  }

  protected transformForDb(dto: CreateUnitDto | UpdateUnitDto): any {
    const transformed = toSnakeCase(dto);
    // Handle specific field transformations
    if ('state' in dto && dto.state) {
      transformed.state = dto.state.toUpperCase();
    }
    return transformed;
  }

  /**
   * Find units by city
   */
  async findByCity(city: string): Promise<any[]> {
    const units = await this.supabaseService.select<Unit>(
      this.tableName,
      this.columns,
      { city },
    );
    return (units || []).map((u) => this.mapData(u));
  }

  /**
   * Find units by state
   */
  async findByState(state: string): Promise<any[]> {
    const units = await this.supabaseService.select<Unit>(
      this.tableName,
      this.columns,
      { state },
    );
    return (units || []).map((u) => this.mapData(u));
  }
}
