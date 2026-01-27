import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import {
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto,
} from './dto/family-composition.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { FamilyComposition } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';
import { RelatedEntityPaginator, RelatedEntityPaginationOptions, PaginatedRelatedEntities } from '../common/utils/related-entity-paginator';

/**
 * FamilyCompositionService - Manages family structure and relationships
 * 
 * Handles:
 * - Family unit creation and management
 * - Person-to-family relationships
 * - Validation of family membership
 * - Paginated member retrieval
 * 
 * @class FamilyCompositionService
 * @extends {BaseService<FamilyComposition, CreateFamilyCompositionDto, UpdateFamilyCompositionDto>}
 */
@Injectable()
export class FamilyCompositionService extends BaseService<
  FamilyComposition,
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto
> {
  protected tableName = 'family_composition';
  protected columns =
    'id, id_family_composition, id_person, id_relationship_degree, responsible, registration_date, created_by, created_at, updated_by, updated_at';

  /**
   * Create a new FamilyCompositionService instance
   * @param {SupabaseService} supabaseService - Database service
   */
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Transform database record to camelCase API response
   * @protected
   * @param {FamilyComposition} data - Database record with snake_case fields
   * @returns {any} API response with camelCase fields
   */
  protected mapData(data: FamilyComposition): any {
    return toCamelCase(data);
  }

  /**
   * Transform DTO to snake_case for database insert/update
   * @protected
   * @param {CreateFamilyCompositionDto | UpdateFamilyCompositionDto} dto - Request DTO
   * @returns {any} Database record with snake_case fields
   */
  protected transformForDb(
    dto: CreateFamilyCompositionDto | UpdateFamilyCompositionDto,
  ): any {
    return toSnakeCase(dto);
  }

  /**
   * Validate that a person is not already in another family
   * 
   * Ensures business rule: each person can belong to only one family unit.
   * 
   * @private
   * @param {number} idPerson - Person ID
   * @param {number} idFamilyComposition - Family composition ID
   * @throws {BadRequestException} If person is already linked to another family
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
   * Create a family composition record with validation
   * 
   * Validates that person is not already in another family.
   * 
   * @param {CreateFamilyCompositionDto} dto - Family composition creation data
   * @returns {Promise<any>} Created family composition record
   * @throws {BadRequestException} If person already belongs to another family
   * 
   * @example
   * const family = await familyCompositionService.create({
   *   idPerson: 1,
   *   idFamilyComposition: 10,
   *   idRelationshipDegree: 1
   * });
   */
  async create(dto: CreateFamilyCompositionDto): Promise<any> {
    await this.validatePersonNotInOtherFamily(
      dto.idPerson,
      dto.idFamilyComposition,
    );
    return super.create(dto);
  }

  /**
   * Find all members of a family by family ID
   * 
   * Retrieves all persons linked to a specific family unit.
   * 
   * @param {number} idFamilyComposition - Family composition ID
   * @returns {Promise<any[]>} Array of family members
   * 
   * @example
   * const members = await familyCompositionService.findByFamily(10);
   * // Returns: [
   * //   { id: 1, idPerson: 5, idRelationshipDegree: 1, ... },
   * //   { id: 2, idPerson: 6, idRelationshipDegree: 2, ... }
   * // ]
   */
  async findByFamily(idFamilyComposition: number): Promise<any[]> {
    const result = await this.supabaseService.select<FamilyComposition>(
      this.tableName,
      this.columns,
      { id_family_composition: idFamilyComposition },
    );
    return (result || []).map((r) => this.mapData(r));
  }

  /**
   * Get paginated family members for a person with optional sorting
   * 
   * Returns all family relationships for a person, paginated and sorted.
   * Useful for displaying family member lists.
   * 
   * @param {number} idPerson - Person ID
   * @param {RelatedEntityPaginationOptions} [paginationOptions] - Pagination options
   * @returns {Promise<PaginatedRelatedEntities<any>>} Paginated family members
   * 
   * @example
   * const members = await familyCompositionService.getFamilyMembersPaginated(1, {
   *   page: 1,
   *   pageSize: 10,
   *   sortBy: 'registration_date',
   *   sortDirection: 'desc'
   * });
   * // Returns: { data: [...], total: 5, page: 1, pageSize: 10, totalPages: 1 }
   */
  async getFamilyMembersPaginated(
    idPerson: number,
    paginationOptions?: RelatedEntityPaginationOptions,
  ): Promise<PaginatedRelatedEntities<any>> {
    const members = await this.supabaseService.select<FamilyComposition>(
      this.tableName,
      this.columns,
      { id_person: idPerson },
    );

    const mapped = (members || []).map((m) => this.mapData(m));
    return RelatedEntityPaginator.paginate(mapped, paginationOptions);
  }

  /**
   * Get paginated members of a family with optional sorting
   * 
   * Retrieves all persons belonging to a family, paginated and sorted.
   * 
   * @param {number} idFamily - Family ID
   * @param {RelatedEntityPaginationOptions} [paginationOptions] - Pagination options
   * @returns {Promise<PaginatedRelatedEntities<any>>} Paginated family members
   * 
   * @example
   * const members = await familyCompositionService.getFamilyPaginated(10, {
   *   page: 1,
   *   pageSize: 20,
   *   sortBy: 'idPerson'
   * });
   */
  async getFamilyPaginated(
    idFamily: number,
    paginationOptions?: RelatedEntityPaginationOptions,
  ): Promise<PaginatedRelatedEntities<any>> {
    const members = await this.findByFamily(idFamily);
    return RelatedEntityPaginator.paginate(members, paginationOptions);
  }
}
