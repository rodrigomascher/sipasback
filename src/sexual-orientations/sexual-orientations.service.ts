import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../common/dto/paginated-response.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';

@Injectable()
export class SexualOrientationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createSexualOrientationDto: CreateSexualOrientationDto) {
    const snakeCaseData = toSnakeCase(createSexualOrientationDto);
    const result = await this.supabaseService.insert('sexual_orientation', snakeCaseData);
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
    const columns = 'id, description, active, created_by, updated_by, created_at, updated_at';
    const offset = paginationQuery.getOffset();
    
    // Get paginated data with count
    const { data, count } = await this.supabaseService.selectWithCount(
      'sexual_orientation',
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
      'sexual_orientation',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async update(id: number, updateSexualOrientationDto: UpdateSexualOrientationDto) {
    const snakeCaseData = toSnakeCase(updateSexualOrientationDto);
    const result = await this.supabaseService.update('sexual_orientation', snakeCaseData, { id });
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async remove(id: number) {
    await this.supabaseService.delete('sexual_orientation', { id });
    return { success: true };
  }
}
