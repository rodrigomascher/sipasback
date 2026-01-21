import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';

@Injectable()
export class GenderIdentitiesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createGenderIdentityDto: CreateGenderIdentityDto) {
    const result = await this.supabaseService.insert('gender_identity', createGenderIdentityDto);
    return result;
  }

  async findAll() {
    const result = await this.supabaseService.select(
      'gender_identity',
      'id, description, active, created_by, updated_by, created_at, updated_at'
    );
    return result || [];
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select(
      'gender_identity',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] || null;
  }

  async update(id: number, updateGenderIdentityDto: UpdateGenderIdentityDto) {
    const result = await this.supabaseService.update('gender_identity', updateGenderIdentityDto, { id });
    return result;
  }

  async remove(id: number) {
    await this.supabaseService.delete('gender_identity', { id });
    return { success: true };
  }
}
