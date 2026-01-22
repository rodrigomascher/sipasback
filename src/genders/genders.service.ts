import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../common/dto/paginated-response.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';

@Injectable()
export class GendersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createGenderDto: CreateGenderDto) {
    const snakeCaseData = toSnakeCase(createGenderDto);
    const result = await this.supabaseService.insert('gender', snakeCaseData);
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
    const columns = 'id, description, active, created_by, updated_by, created_at, updated_at';
    const offset = paginationQuery.getOffset();
    
    // Get paginated data with count
    const { data, count } = await this.supabaseService.selectWithCount(
      'gender',
      columns,
      {},
      paginationQuery.sortBy,
      paginationQuery.sortDirection,
      paginationQuery.pageSize,
      offset
    );

    const mappedData = data?.map(item => toCamelCase(item)) || [];
    return new PaginatedResponseDto(mappedData, count || 0, paginationQuery.page, paginationQuery.pageSize);
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select(
      'gender',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async update(id: number, updateGenderDto: UpdateGenderDto) {
    const snakeCaseData = toSnakeCase(updateGenderDto);
    const result = await this.supabaseService.update('gender', snakeCaseData, { id });
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async remove(id: number) {
    await this.supabaseService.delete('gender', { id });
    return { success: true };
  }
}
