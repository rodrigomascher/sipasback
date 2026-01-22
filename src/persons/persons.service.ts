import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/paginated-response.dto';
import { toCamelCase } from '../common/utils/transform.utils';

@Injectable()
export class PersonsService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all persons with optional search and pagination
   */
  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
    const query =
      'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';

    const offset = paginationQuery.getOffset();

    const { data, count } = await this.supabaseService.selectWithCount(
      'person',
      query,
      {},
      paginationQuery.sortBy,
      paginationQuery.sortDirection,
      paginationQuery.pageSize,
      offset,
    );

    const mappedData = data?.map((item) => toCamelCase(item)) || [];
    return new PaginatedResponseDto(
      mappedData,
      count || 0,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
  }

  /**
   * Search persons by name, cpf, or nis
   */
  async search(searchTerm: string): Promise<Person[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const query = 'id, first_name, last_name, cpf, nis, nisn, birth_date';
    const persons = await this.supabaseService.select('person', query, {});

    // Client-side filtering since Supabase doesn't support OR easily
    const term = searchTerm.toLowerCase();
    return persons
      .filter(
        (p: any) =>
          p.first_name?.toLowerCase().includes(term) ||
          p.last_name?.toLowerCase().includes(term) ||
          p.cpf?.includes(searchTerm) ||
          p.nis?.includes(searchTerm) ||
          p.nisn?.includes(searchTerm),
      )
      .map((p) => this.mapPerson(p));
  }

  /**
   * Get person by ID
   */
  async findOne(id: number): Promise<Person> {
    const query =
      'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';

    const persons = await this.supabaseService.select('person', query, { id });

    if (!persons || persons.length === 0) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    return this.mapPerson(persons[0]);
  }

  /**
   * Create a new person
   */
  async create(createPersonDto: CreatePersonDto, userId: number): Promise<Person> {
    // Check for duplicate CPF if provided and not empty
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

    const data = this.dtoToData(createPersonDto);
    data.created_at = new Date();
    data.created_by = userId; // Automatically set from authenticated user
    data.updated_by = userId; // Initially set to same as created_by

    const result = await this.supabaseService.insert('person', data);
    return this.mapPerson(result[0]);
  }

  /**
   * Update a person
   */
  async update(id: number, updatePersonDto: UpdatePersonDto, userId: number): Promise<Person> {
    // Check if person exists
    await this.findOne(id);

    // Check for duplicate CPF (if cpf is being updated)
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

    const data = this.dtoToData(updatePersonDto);
    data.updated_at = new Date();
    data.updated_by = userId; // Update audit timestamp and user, created_by remains unchanged

    const result = await this.supabaseService.update('person', data, { id });
    return this.mapPerson(result[0]);
  }

  /**
   * Delete a person
   */
  async remove(id: number): Promise<boolean> {
    await this.findOne(id);
    await this.supabaseService.delete('person', { id });
    return true;
  }

  /**
   * Convert DTO to database format (camelCase to snake_case)
   * Filters out null/undefined values and empty strings for numeric and date fields
   * Converts empty strings for unique constraint fields (like CPF) to NULL
   */
  private dtoToData(
    dto: CreatePersonDto | UpdatePersonDto,
  ): Record<string, any> {
    const data: Record<string, any> = {};
    
    const numericFields = new Set([
      'sex', 'genderId', 'genderIdentityId', 'raceId', 'ethnicityId', 'communityId',
      'maritalStatusId', 'nationality', 'originCountryId', 'motherPersonId', 'fatherPersonId',
      'motherResidenceOrder', 'fatherResidenceOrder', 'nis', 'susNumber', 'rgIssuingOrgId',
      'photoId', 'certStandardNew', 'certPage', 'voterIdZone', 'voterIdSection', 'profCardNumber',
      'incomeTypeId', 'monthlyIncome', 'annualIncome', 'educationLevelId', 'completionYear',
      'currentlyStudying', 'deceased', 'createdUnitId', 'updatedUnitId', 'referredUnitId',
    ]);
    
    const dateFields = new Set([
      'birthDate', 'arrivalDateBrazil', 'rgIssuanceDate', 'certIssuanceDate',
      'voterIdIssuanceDate', 'profCardIssuanceDate', 'militaryIssuanceDate', 'deathCertIssuanceDate',
    ]);
    
    // Fields with unique constraints that should be NULL when empty
    const uniqueConstraintFields = new Set(['cpf', 'nis', 'nisn']);

    Object.keys(dto).forEach((key) => {
      const value = (dto as any)[key];
      
      // Skip undefined and null values
      if (value === undefined || value === null) {
        return;
      }
      
      // Handle empty strings
      if (value === '' || value === '') {
        if (numericFields.has(key) || dateFields.has(key)) {
          return; // Skip numeric and date fields with empty strings
        }
        
        // Convert empty strings to NULL for unique constraint fields
        if (uniqueConstraintFields.has(key)) {
          const snakeKey = this.camelToSnake(key);
          data[snakeKey] = null;
          return;
        }
        
        // Allow empty strings for text fields (will be stored as empty string or converted to null by DB)
      }
      
      const snakeKey = this.camelToSnake(key);
      data[snakeKey] = value;
    });

    return data;
  }

  /**
   * Map database result to Person entity
   */
  private mapPerson(data: any): Person {
    const person = new Person();

    Object.keys(data).forEach((key) => {
      const camelKey = this.snakeToCamel(key);
      (person as any)[camelKey] = data[key];
    });

    return person;
  }

  /**
   * Map multiple database results to Person entities
   */
  private mapPersons(data: any[]): Person[] {
    return data.map((item) => this.mapPerson(item));
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }
}
