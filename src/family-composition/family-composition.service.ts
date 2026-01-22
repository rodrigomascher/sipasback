import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateFamilyCompositionDto, UpdateFamilyCompositionDto, FamilyCompositionDto } from './dto/family-composition.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../common/dto/paginated-response.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';

@Injectable()
export class FamilyCompositionService {
  constructor(private supabaseService: SupabaseService) {}

  // Validation: Check if person is not in another family
  private async validatePersonNotInOtherFamily(
    idPerson: number,
    idFamilyComposition: number,
  ): Promise<void> {
    const existing = await this.supabaseService.select(
      'family_composition',
      '*',
      { id_person: idPerson }
    );

    if (existing && existing.length > 0 && existing[0].id_family_composition !== idFamilyComposition) {
      throw new BadRequestException(
        `This person is already linked to another family (ID: ${existing[0].id_family_composition})`,
      );
    }
  }

  async create(dto: CreateFamilyCompositionDto): Promise<FamilyCompositionDto | null> {
    await this.validatePersonNotInOtherFamily(dto.idPerson, dto.idFamilyComposition);

    const snakeCaseData = toSnakeCase({
      ...dto,
      createdAt: new Date(),
    });

    const result = await this.supabaseService.insert('family_composition', snakeCaseData);
    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
    const columns = 'id_family_composition, id_person, id_relationship_degree, responsible, registration_date, created_by, created_at, updated_by, updated_at';
    const offset = paginationQuery.getOffset();
    
    // Get paginated data with count
    const { data, count } = await this.supabaseService.selectWithCount(
      'family_composition',
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

  async findByFamily(idFamilyComposition: number): Promise<FamilyCompositionDto[]> {
    const result = await this.supabaseService.select(
      'family_composition',
      'id_family_composition, id_person, id_relationship_degree, responsible, registration_date, created_by, created_at, updated_by, updated_at',
      { id_family_composition: idFamilyComposition }
    );

    if (!result || result.length === 0) {
      throw new NotFoundException(`Family with ID ${idFamilyComposition} not found`);
    }

    return result.map((item) => toCamelCase(item));
  }

  async findOne(idFamilyComposition: number, idPerson: number): Promise<FamilyCompositionDto> {
    const result = await this.supabaseService.select(
      'family_composition',
      'id_family_composition, id_person, id_relationship_degree, responsible, registration_date, created_by, created_at, updated_by, updated_at',
      { id_family_composition: idFamilyComposition, id_person: idPerson }
    );

    if (!result || result.length === 0) {
      throw new NotFoundException('Family composition not found');
    }

    return toCamelCase(result[0]);
  }

  async update(
    idFamilyComposition: number,
    idPerson: number,
    dto: UpdateFamilyCompositionDto,
  ): Promise<FamilyCompositionDto | null> {
    await this.findOne(idFamilyComposition, idPerson);

    const snakeCaseData = toSnakeCase({
      ...dto,
      updatedAt: new Date(),
    });

    const result = await this.supabaseService.update(
      'family_composition',
      snakeCaseData,
      { id_family_composition: idFamilyComposition, id_person: idPerson }
    );

    return result?.[0] ? toCamelCase(result[0]) : null;
  }

  async remove(idFamilyComposition: number, idPerson: number): Promise<void> {
    await this.findOne(idFamilyComposition, idPerson);

    await this.supabaseService.delete(
      'family_composition',
      { id_family_composition: idFamilyComposition, id_person: idPerson }
    );
  }
}
