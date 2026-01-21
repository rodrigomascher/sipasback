import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateUnitDto, UpdateUnitDto, UnitDto } from './dto/unit.dto';

@Injectable()
export class UnitsService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all units
   */
  async findAll(): Promise<UnitDto[]> {
    const units = await this.supabaseService.select(
      'units',
      'id, name, type, is_armored, city, state, created_by, updated_by, created_at, updated_at',
    );

    return (units || []).map(this.mapToUnitDto);
  }

  /**
   * Get unit by ID
   */
  async findOne(id: number): Promise<UnitDto> {
    const units = await this.supabaseService.select(
      'units',
      'id, name, type, is_armored, city, state, created_by, updated_by, created_at, updated_at',
      { id },
    );

    if (!units || units.length === 0) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return this.mapToUnitDto(units[0]);
  }

  /**
   * Find units by city
   */
  async findByCity(city: string): Promise<UnitDto[]> {
    const units = await this.supabaseService.select(
      'units',
      'id, name, type, is_armored, city, state, created_by, updated_by, created_at, updated_at',
      { city },
    );

    return (units || []).map(this.mapToUnitDto);
  }

  /**
   * Find units by state
   */
  async findByState(state: string): Promise<UnitDto[]> {
    const units = await this.supabaseService.select(
      'units',
      'id, name, type, is_armored, city, state, created_by, updated_by, created_at, updated_at',
      { state },
    );

    return (units || []).map(this.mapToUnitDto);
  }

  /**
   * Create new unit
   */
  async create(createUnitDto: CreateUnitDto, userId: number): Promise<UnitDto> {
    const data = {
      name: createUnitDto.name,
      type: createUnitDto.type,
      is_armored: createUnitDto.isArmored || false,
      city: createUnitDto.city,
      state: createUnitDto.state.toUpperCase(),
      created_by: userId,
      updated_by: userId,
    };

    const result = await this.supabaseService.insert('units', data);

    if (!result || result.length === 0) {
      throw new Error('Failed to create unit');
    }

    return this.mapToUnitDto(result[0]);
  }

  /**
   * Update unit
   */
  async update(id: number, updateUnitDto: UpdateUnitDto, userId: number): Promise<UnitDto> {
    // First verify unit exists
    await this.findOne(id);

    const data: any = {};
    if (updateUnitDto.name) data.name = updateUnitDto.name;
    if (updateUnitDto.type) data.type = updateUnitDto.type;
    if (updateUnitDto.isArmored !== undefined) data.is_armored = updateUnitDto.isArmored;
    if (updateUnitDto.city) data.city = updateUnitDto.city;
    if (updateUnitDto.state) data.state = updateUnitDto.state.toUpperCase();
    data.updated_by = userId;

    const result = await this.supabaseService.update('units', data, { id });

    if (!result || result.length === 0) {
      throw new Error('Failed to update unit');
    }

    return this.mapToUnitDto(result[0]);
  }

  /**
   * Delete unit
   */
  async remove(id: number): Promise<void> {
    // First verify unit exists
    await this.findOne(id);

    await this.supabaseService.delete('units', { id });
  }

  /**
   * Count total units
   */
  async count(): Promise<number> {
    return this.supabaseService.count('units');
  }

  /**
   * Helper to map database response to DTO
   */
  private mapToUnitDto(unit: any): UnitDto {
    return {
      id: unit.id,
      name: unit.name,
      type: unit.type,
      isArmored: unit.is_armored,
      city: unit.city,
      state: unit.state,
      createdBy: unit.created_by || null,
      updatedBy: unit.updated_by || null,
      createdAt: unit.created_at,
      updatedAt: unit.updated_at,
    };
  }
}
