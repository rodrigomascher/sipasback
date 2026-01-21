import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../core/supabase/supabase.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@Injectable()
export class GendersService {
  constructor(private supabase: SupabaseService) {}

  async create(createGenderDto: CreateGenderDto) {
    const { data, error } = await this.supabase.client
      .from('gender')
      .insert([this.toCamelCase(createGenderDto)])
      .select();

    if (error) throw new Error(error.message);
    return data?.[0] ? this.toSnakeCase(data[0]) : null;
  }

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('gender')
      .select('*')
      .order('description', { ascending: true });

    if (error) throw new Error(error.message);
    return data?.map(item => this.toSnakeCase(item)) || [];
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase.client
      .from('gender')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? this.toSnakeCase(data) : null;
  }

  async update(id: number, updateGenderDto: UpdateGenderDto) {
    const { data, error } = await this.supabase.client
      .from('gender')
      .update(this.toCamelCase(updateGenderDto))
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data ? this.toSnakeCase(data) : null;
  }

  async remove(id: number) {
    const { error } = await this.supabase.client
      .from('gender')
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
