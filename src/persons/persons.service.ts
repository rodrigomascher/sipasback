import { Injectable, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class PersonsService extends BaseService<
  Person,
  CreatePersonDto,
  UpdatePersonDto
> {
  protected tableName = 'person';
  protected columns =
    'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: any): any {
    return toCamelCase(data);
  }

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
   * Override create to add CPF validation
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
   * Override update to add CPF uniqueness validation
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
   * Search persons by name, cpf, or nis
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
}
