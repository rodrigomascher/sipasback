import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../core/supabase/supabase.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';

@Injectable()
export class SexualOrientationsService {
  constructor(private supabase: SupabaseService) {}

  async create(createSexualOrientationDto: CreateSexualOrientationDto) {
    const { data, error } = await this.supabase.client
      .from('sexual_orientation')
      .insert([this.toCamelCase(createSexualOrientationDto)])
      .select();

    if (error) throw new Error(error.message);
    return data?.[0] ? this.toSnakeCase(data[0]) : null;
  }

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('sexual_orientation')
      .select('*')
      .order('description', { ascending: true });

    if (error) throw new Error(error.message);
    return data?.map(item => this.toSnakeCase(item)) || [];
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase.client
      .from('sexual_orientation')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? this.toSnakeCase(data) : null;
  }

  async update(id: number, updateSexualOrientationDto: UpdateSexualOrientationDto) {
    const { data, error } = await this.supabase.client
      .from('sexual_orientation')
      .update(this.toCamelCase(updateSexualOrientationDto))
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data ? this.toSnakeCase(data) : null;
  }

  async remove(id: number) {
    const { error } = await this.supabase.client
      .from('sexual_orientation')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  private toCamelCase(obj: any): any {
    if (!obj) return obj;
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  private toSnakeCase(obj: any): any {
    if (!obj) return obj;
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }
}
