import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { BaseService } from '../common/base/base.service';
import { CreateUserUnitDto, UpdateUserUnitDto } from './dto';

export interface UserUnit {
  id: number;
  userId: number;
  unitId: number;
  createdAt: Date;
}

@Injectable()
export class UserUnitsService extends BaseService<
  UserUnit,
  CreateUserUnitDto,
  UpdateUserUnitDto
> {
  protected tableName = 'user_units';
  protected columns =
    'id, user_id as "userId", unit_id as "unitId", created_at as "createdAt"';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: any): UserUnit {
    return {
      id: data.id,
      userId: data.userId || data.user_id,
      unitId: data.unitId || data.unit_id,
      createdAt: data.createdAt || data.created_at,
    };
  }

  protected transformForDb(
    dto: CreateUserUnitDto | UpdateUserUnitDto,
  ): any {
    return {
      user_id: dto.userId,
      unit_id: dto.unitId,
    };
  }

  /**
   * Get all units for a specific user
   */
  async getUnitsForUser(userId: number): Promise<any[]> {
    const userUnits = await this.supabaseService.select<any>(
      this.tableName,
      'unit_id, created_at',
      { user_id: userId },
    );

    if (!userUnits || userUnits.length === 0) {
      return [];
    }

    // Fetch unit details for each unit_id
    const unitIds = userUnits.map((uu) => uu.unit_id);

    if (unitIds.length === 0) {
      return [];
    }

    // Fetch only the units that this user has
    const units = await this.supabaseService.select(
      'units',
      'id, name, type, city, state',
      {},
    );

    // Filter and map units
    const userUnitsFiltered = units.filter((unit: any) =>
      unitIds.includes(unit.id),
    );

    // Return units with camelCase keys
    return userUnitsFiltered.map((unit: any) => ({
      id: unit.id,
      name: unit.name,
      type: unit.type,
      city: unit.city,
      state: unit.state,
    }));
  }

  /**
   * Add unit to user
   */
  async addUnitToUser(userId: number, unitId: number): Promise<void> {
    try {
      await this.supabaseService.insert(this.tableName, {
        user_id: userId,
        unit_id: unitId,
      });
    } catch (error) {
      // Ignore duplicate key errors (already assigned)
      if (error.message?.includes('duplicate')) {
        return;
      }
      throw error;
    }
  }

  /**
   * Remove unit from user
   */
  async removeUnitFromUser(userId: number, unitId: number): Promise<void> {
    await this.supabaseService.delete(this.tableName, {
      user_id: userId,
      unit_id: unitId,
    });
  }

  /**
   * Replace all units for a user (used during update)
   */
  async setUnitsForUser(userId: number, unitIds: number[]): Promise<void> {
    // Delete all existing units
    await this.supabaseService.delete(this.tableName, { user_id: userId });

    // Add new units
    if (unitIds && unitIds.length > 0) {
      for (const unitId of unitIds) {
        await this.addUnitToUser(userId, unitId);
      }
    }
  }
}
