import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class GenderIdentitiesService {
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

  async create(createGenderIdentityDto: CreateGenderIdentityDto) {
    const snakeCaseData = this.toSnakeCase(createGenderIdentityDto);
    const result = await this.supabaseService.insert('gender_identity', snakeCaseData);
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
    const columns = 'id, description, active, created_by, updated_by, created_at, updated_at';
    const offset = paginationQuery.getOffset();
    
    // Get paginated data with count
    const { data, count } = await this.supabaseService.selectWithCount(
      'gender_identity',
      columns,
      {},
      paginationQuery.sortBy,
      paginationQuery.sortDirection,
      paginationQuery.pageSize,
      offset
    );

    const mappedData = data?.map(item => this.toCamelCase(item)) || [];
    return new PaginatedResponseDto(mappedData, count || 0, paginationQuery.page, paginationQuery.pageSize);
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select(
      'gender_identity',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async update(id: number, updateGenderIdentityDto: UpdateGenderIdentityDto) {
    const snakeCaseData = this.toSnakeCase(updateGenderIdentityDto);
    const result = await this.supabaseService.update('gender_identity', snakeCaseData, { id });
    return result?.[0] ? this.toCamelCase(result[0]) : null;
  }

  async remove(id: number) {
    await this.supabaseService.delete('gender_identity', { id });
    return { success: true };
  }
}
