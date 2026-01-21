import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@Injectable()
export class GendersService {
  constructor(private supabaseService: SupabaseService) {}

  private toSnakeCase(obj: any): any {
    if (!obj) return obj;
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    }
    return result;
  }

  private toCamelCase(obj: any): any {
    if (!obj) return obj;
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }

  async create(createGenderDto: CreateGenderDto) {
    const snakeCaseData = this.toSnakeCase(createGenderDto);
    const result = await this.supabaseService.insert('gender', snakeCaseData);
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async findAll() {
    const result = await this.supabaseService.select(
      'gender',
      'id, description, active, created_by, updated_by, created_at, updated_at'
    );
    return result?.map(item => this.toCamelCase(item)) || [];
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select(
      'gender',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async update(id: number, updateGenderDto: UpdateGenderDto) {
    const snakeCaseData = this.toSnakeCase(updateGenderDto);
    const result = await this.supabaseService.update('gender', snakeCaseData, { id });
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async remove(id: number) {
    await this.supabaseService.delete('gender', { id });
    return { success: true };
  }
}
