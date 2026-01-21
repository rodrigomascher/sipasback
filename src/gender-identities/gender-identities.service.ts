import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../core/supabase/supabase.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';

@Injectable()
export class GenderIdentitiesService {
  constructor(private supabase: SupabaseService) {}

  async create(createGenderIdentityDto: CreateGenderIdentityDto) {
    const { data, error } = await this.supabase.client
      .from('gender_identity')
      .insert([this.toCamelCase(createGenderIdentityDto)])
      .select();

    if (error) throw new Error(error.message);
    return data?.[0] ? this.toSnakeCase(data[0]) : null;
  }

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('gender_identity')
      .select('*')
      .order('description', { ascending: true });

    if (error) throw new Error(error.message);
    return data?.map(item => this.toSnakeCase(item)) || [];
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase.client
      .from('gender_identity')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? this.toSnakeCase(data) : null;
  }

  async update(id: number, updateGenderIdentityDto: UpdateGenderIdentityDto) {
    const { data, error } = await this.supabase.client
      .from('gender_identity')
      .update(this.toCamelCase(updateGenderIdentityDto))
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data ? this.toSnakeCase(data) : null;
  }

  async remove(id: number) {
    const { error } = await this.supabase.client
      .from('gender_identity')
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
