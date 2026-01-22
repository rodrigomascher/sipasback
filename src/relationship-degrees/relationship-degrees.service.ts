import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../common/dto/paginated-response.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';

@Injectable()
export class RelationshipDegreesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createRelationshipDegreeDto: CreateRelationshipDegreeDto) {
    const snakeCaseData = toSnakeCase(createRelationshipDegreeDto);
    const result = await this.supabaseService.insert('relationship_degree', snakeCaseData);
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
    const columns = 'id, description, active, created_by, updated_by, created_at, updated_at';
    const offset = paginationQuery.getOffset();
    
    // Get paginated data with count
    const { data, count } = await this.supabaseService.selectWithCount(
      'relationship_degree',
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
      'relationship_degree',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id }
    );
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async update(id: number, updateRelationshipDegreeDto: UpdateRelationshipDegreeDto) {
    const snakeCaseData = toSnakeCase(updateRelationshipDegreeDto);
    const result = await this.supabaseService.update(
      'relationship_degree',
      snakeCaseData,
      { id }
    );
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async remove(id: number) {
    return await this.supabaseService.delete('relationship_degree', { id });
  }
}
