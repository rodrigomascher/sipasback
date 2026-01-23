import { Injectable, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { BaseService } from '../common/base/base.service';
import { RelatedEntityPaginator, RelatedEntityPaginationOptions, PaginatedRelatedEntities } from '../common/utils/related-entity-paginator';

/**
 * PersonsService - Manages person records and related data
 * 
 * Extends BaseService with domain-specific logic for:
 * - CPF validation and uniqueness checks
 * - Full-text search by name, CPF, or NIS
 * - Family relationship pagination
 * - Person data enrichment with related entities
 * 
 * @class PersonsService
 * @extends {BaseService<Person, CreatePersonDto, UpdatePersonDto>}
 */
@Injectable()
export class PersonsService extends BaseService<
  Person,
  CreatePersonDto,
  UpdatePersonDto
> {
  protected tableName = 'person';
  protected columns =
    'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';

  /**
   * Create a new PersonsService instance
   * @param {SupabaseService} supabaseService - Database service
   */
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Transform database record to camelCase API response
   * @protected
   * @param {any} data - Database record with snake_case fields
   * @returns {any} API response with camelCase fields
   */
  protected mapData(data: any): any {
    return toCamelCase(data);
  }

  /**
   * Transform DTO to snake_case for database insert/update
   * @protected
   * @param {CreatePersonDto | UpdatePersonDto} dto - Request DTO
   * @returns {any} Database record with snake_case fields
   */
  protected transformForDb(dto: CreatePersonDto | UpdatePersonDto): any {
    const transformed = toSnakeCase(dto);

    // Convert empty CPF to null
    if (transformed.cpf === '') {
      transformed.cpf = null;
    }

    // Filter out empty numeric fields (like monthlyIncome)
    const filtered: any = {};
    for (const [key, value] of Object.entries(transformed)) {
      // Skip empty string values for numeric fields
      if (
        value === '' &&
        (key === 'monthly_income' || key === 'annual_income')
      ) {
        continue;
      }
      filtered[key] = value;
    }

    return filtered;
  }

  /**
   * Create a new person with CPF uniqueness validation
   * 
   * Ensures no duplicate CPF values exist in the database.
   * CPF is a Brazilian individual identification number.
   * 
   * @param {CreatePersonDto} createPersonDto - Person creation data
   * @returns {Promise<any>} Created person record
   * @throws {ConflictException} If person with same CPF already exists
   * 
   * @example
   * const newPerson = await personsService.create({
   *   firstName: 'João',
   *   lastName: 'Silva',
   *   cpf: '12345678901'
   * });
   */
  async create(createPersonDto: CreatePersonDto): Promise<any> {
    // Check for duplicate CPF if provided
    if (createPersonDto.cpf && createPersonDto.cpf.trim() !== '') {
      const existing = await this.supabaseService.select('person', 'id', {
        cpf: createPersonDto.cpf,
      });
      if (existing && existing.length > 0) {
        throw new ConflictException(
          `Person with CPF ${createPersonDto.cpf} already exists`,
        );
      }
    }
    return super.create(createPersonDto);
  }

  /**
   * Update a person record with CPF uniqueness validation
   * 
   * Prevents changing CPF to a value already used by another person.
   * 
   * @param {number} id - Person ID
   * @param {UpdatePersonDto} updatePersonDto - Person update data
   * @returns {Promise<any>} Updated person record
   * @throws {ConflictException} If new CPF is already used by another person
   * 
   * @example
   * const updated = await personsService.update(1, {
   *   firstName: 'João Silva'
   * });
   */
  async update(id: number, updatePersonDto: UpdatePersonDto): Promise<any> {
    // Check if person exists
    await this.findOne(id);

    // Check for duplicate CPF (if being updated)
    if (updatePersonDto.cpf) {
      const existing = await this.supabaseService.select('person', 'id', {
        cpf: updatePersonDto.cpf,
      });
      if (existing && existing.length > 0 && (existing[0] as any).id !== id) {
        throw new ConflictException(
          `Person with CPF ${updatePersonDto.cpf} already exists`,
        );
      }
    }
    return super.update(id, updatePersonDto);
  }

  /**
   * Search persons by name, CPF, or NIS
   * 
   * Performs full-text search across multiple fields.
   * Requires minimum 2 characters for search term.
   * Results include key identification fields only.
   * 
   * @param {string} searchTerm - Search term (name, CPF, or NIS)
   * @returns {Promise<Person[]>} Matching persons or empty array
   * 
   * @example
   * const results = await personsService.search('João');
   * // Returns: [{ id: 1, firstName: 'João', cpf: '...' }, ...]
   * 
   * @example
   * const results = await personsService.search('12345678901');
   * // Returns person(s) with matching CPF
   */
  async search(searchTerm: string): Promise<Person[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const query = 'id, first_name, last_name, cpf, nis, nisn, birth_date';
    const persons = await this.supabaseService.select('person', query, {});

    // Client-side filtering
    const term = searchTerm.toLowerCase();
    return (persons || [])
      .filter(
        (p: any) =>
          p.first_name?.toLowerCase().includes(term) ||
          p.last_name?.toLowerCase().includes(term) ||
          p.cpf?.includes(searchTerm) ||
          p.nis?.includes(searchTerm) ||
          p.nisn?.includes(searchTerm),
      )
      .map((p) => this.mapData(p));
  }

  /**
   * Get paginated family composition members for a person
   * 
   * Retrieves all family members linked to this person with pagination support.
   * Allows sorting and filtering through pagination options.
   * 
   * @param {number} personId - The person ID
   * @param {RelatedEntityPaginationOptions} [paginationOptions] - Pagination options
   * @returns {Promise<PaginatedRelatedEntities<any>>} Paginated family members
   * 
   * @example
   * const page1 = await personsService.getPersonFamilyMembersPaginated(1, {
   *   page: 1,
   *   pageSize: 10,
   *   sortBy: 'created_at',
   *   sortDirection: 'desc'
   * });
   * // Returns: { data: [...], total: 25, page: 1, pageSize: 10, totalPages: 3 }
   */
  async getPersonFamilyMembersPaginated(
    personId: number,
    paginationOptions?: RelatedEntityPaginationOptions,
  ): Promise<PaginatedRelatedEntities<any>> {
    // Fetch all family composition records for this person
    const familyMembers = await this.supabaseService.select(
      'family_composition',
      'id, person_id, related_person_id, relationship_degree_id, created_at, updated_at',
      { person_id: personId },
    );

    // Apply pagination
    return RelatedEntityPaginator.paginate(familyMembers || [], paginationOptions);
  }

  /**
   * Get person with paginated family members and related data
   * 
   * Returns complete person record with paginated family relationships.
   * Useful for detailed person view screens.
   * 
   * @param {number} personId - The person ID
   * @param {RelatedEntityPaginationOptions} [paginationOptions] - Pagination options
   * @returns {Promise<any>} Person record with paginated familyComposition field
   * 
   * @example
   * const person = await personsService.getPersonWithFamilyMembersPaginated(1, {
   *   page: 1,
   *   pageSize: 5,
   *   sortBy: 'created_at'
   * });
   * // Returns: {
   * //   id: 1,
   * //   firstName: 'João',
   * //   familyComposition: { data: [...], total: 10, page: 1, ... }
   * // }
   */
  async getPersonWithFamilyMembersPaginated(
    personId: number,
    paginationOptions?: RelatedEntityPaginationOptions,
  ): Promise<any> {
    const person = await this.findOne(personId);
    const familyMembers = await this.getPersonFamilyMembersPaginated(
      personId,
      paginationOptions,
    );

    return {
      ...person,
      familyComposition: familyMembers,
    };
  }
}
