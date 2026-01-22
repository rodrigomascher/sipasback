import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import {
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto,
} from './dto/family-composition.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { FamilyComposition } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class FamilyCompositionService extends BaseService<
  FamilyComposition,
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto
> {
  protected tableName = 'family_composition';
  protected columns =
    'id_family_composition, id_person, id_relationship_degree, responsible, registration_date, created_by, created_at, updated_by, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: FamilyComposition): any {
    return toCamelCase(data);
  }

  protected transformForDb(
    dto: CreateFamilyCompositionDto | UpdateFamilyCompositionDto,
  ): any {
    return toSnakeCase(dto);
  }

  /**
   * Validation: Check if person is not in another family
   */
  private async validatePersonNotInOtherFamily(
    idPerson: number,
    idFamilyComposition: number,
  ): Promise<void> {
    const existing = await this.supabaseService.select<FamilyComposition>(
      this.tableName,
      '*',
      { id_person: idPerson },
    );

    if (
      existing &&
      existing.length > 0 &&
      (existing[0] as any).id_family_composition !== idFamilyComposition
    ) {
      throw new BadRequestException(
        `This person is already linked to another family (ID: ${(existing[0] as any).id_family_composition})`,
      );
    }
  }

  /**
   * Override create to add validation
   */
  async create(dto: CreateFamilyCompositionDto): Promise<any> {
    await this.validatePersonNotInOtherFamily(
      dto.idPerson,
      dto.idFamilyComposition,
    );
    return super.create(dto);
  }

  /**
   * Find by family ID
   */
  async findByFamily(idFamilyComposition: number): Promise<any[]> {
    const result = await this.supabaseService.select<FamilyComposition>(
      this.tableName,
      this.columns,
      { id_family_composition: idFamilyComposition },
    );
    return (result || []).map((r) => this.mapData(r));
  }
}
