import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

export interface UserUnit {
  id: number;
  userId: number;
  unitId: number;
  createdAt: Date;
}

@Injectable()
export class UserUnitsService {
  private tableName = 'user_units';

  constructor(private supabaseService: SupabaseService) {}

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
    const units = await this.supabaseService.select(
      'units',
      'id, name, type, city, state',
      {},
    );

    // Filter units that the user has access to
    return units.filter((unit: any) => unitIds.includes(unit.id));
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
