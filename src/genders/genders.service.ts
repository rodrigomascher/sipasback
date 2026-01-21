import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@Injectable()
export class GendersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createGenderDto: CreateGenderDto) {
    const result = await this.supabaseService.insert('gender', createGenderDto);
    return result;
  }

  async findAll() {
    const result = await this.supabaseService.select(
      'gender',
      'id, description, active, created_by, updated_by, created_at, updated_at'
    );
    return result || [];
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select(
      'gender',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] || null;
  }

  async update(id: number, updateGenderDto: UpdateGenderDto) {
    const result = await this.supabaseService.update('gender', updateGenderDto, { id });
    return result;
  }

  async remove(id: number) {
    await this.supabaseService.delete('gender', { id });
    return { success: true };
  }
}
