import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';

@Injectable()
export class RelationshipDegreesService {
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

  async create(createRelationshipDegreeDto: CreateRelationshipDegreeDto) {
    const snakeCaseData = this.toSnakeCase(createRelationshipDegreeDto);
    const result = await this.supabaseService.insert('relationship_degree', snakeCaseData);
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async findAll() {
    const result = await this.supabaseService.select(
      'relationship_degree',
      'id, description, active, created_by, updated_by, created_at, updated_at'
    );
    return result?.map(item => this.toCamelCase(item)) || [];
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select(
      'relationship_degree',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async update(id: number, updateRelationshipDegreeDto: UpdateRelationshipDegreeDto) {
    const snakeCaseData = this.toSnakeCase(updateRelationshipDegreeDto);
    const result = await this.supabaseService.update(
      'relationship_degree',
      snakeCaseData,
      { id }
    );
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async remove(id: number) {
    return await this.supabaseService.delete('relationship_degree', { id });
  }
}
