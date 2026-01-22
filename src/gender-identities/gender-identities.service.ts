import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/paginated-response.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { GenderIdentity } from '../common/types/database.types';

@Injectable()
export class GenderIdentitiesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createGenderIdentityDto: CreateGenderIdentityDto) {
    const snakeCaseData = toSnakeCase(createGenderIdentityDto);
    const result = await this.supabaseService.insert<GenderIdentity>(
      'gender_identity',
      snakeCaseData,
    );
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    const columns =
      'id, description, active, created_by, updated_by, created_at, updated_at';
    const offset = paginationQuery.getOffset();

    // Get paginated data with count
    const { data, count } =
      await this.supabaseService.selectWithCount<GenderIdentity>(
        'gender_identity',
        columns,
        {},
        paginationQuery.sortBy,
        paginationQuery.sortDirection,
        paginationQuery.pageSize,
        offset,
      );

    const mappedData =
      data?.map((item: GenderIdentity) => toCamelCase(item)) || [];
    return new PaginatedResponseDto(
      mappedData,
      count || 0,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
  }

  async findOne(id: number) {
    const result = await this.supabaseService.select<GenderIdentity>(
      'gender_identity',
      'id, description, active, created_by, updated_by, created_at, updated_at',
      { id },
    );
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async update(id: number, updateGenderIdentityDto: UpdateGenderIdentityDto) {
    const snakeCaseData = toSnakeCase(updateGenderIdentityDto);
    const result = await this.supabaseService.update<GenderIdentity>(
      'gender_identity',
      snakeCaseData,
      { id },
    );
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async remove(id: number) {
    await this.supabaseService.delete('gender_identity', { id });
    return { success: true };
  }
}
