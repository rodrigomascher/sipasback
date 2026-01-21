import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';

@Injectable()
export class SexualOrientationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createSexualOrientationDto: CreateSexualOrientationDto) {
    const result = await this.supabaseService.insert('sexual_orientation', createSexualOrientationDto);
    return result;
  }

  async findAll() {
    const result = await this.supabaseService.select(
      'sexual_orientation',
      'id, description, active, created_by, updated_by, created_at, updated_at'
    );
    return result || [];
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select(
      'sexual_orientation',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] || null;
  }

  async update(id: number, updateSexualOrientationDto: UpdateSexualOrientationDto) {
    const result = await this.supabaseService.update('sexual_orientation', updateSexualOrientationDto, { id });
    return result;
  }

  async remove(id: number) {
    await this.supabaseService.delete('sexual_orientation', { id });
    return { success: true };
  }
}
