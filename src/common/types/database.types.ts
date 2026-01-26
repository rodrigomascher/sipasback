/**
 * Database entity types for Supabase tables
 * These are used to properly type database responses
 */

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface Gender extends BaseEntity {
  description: string;
  active?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface GenderIdentity extends BaseEntity {
  description: string;
  active?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface SexualOrientation extends BaseEntity {
  description: string;
  active?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface Race extends BaseEntity {
  description: string;
  active?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface Ethnicity extends BaseEntity {
  description: string;
  active?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface IncomeType extends BaseEntity {
  description: string;
  active?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface Department extends BaseEntity {
  description: string;
  unit_id: number;
  created_by: number | null;
  updated_by: number | null;
}

export interface Employee extends BaseEntity {
  employee_id?: string;
  full_name: string;
  unit_id: number;
  department_id: number;
  role_id?: number | null;
  is_technician?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface Role extends BaseEntity {
  name: string;
  description: string | null;
  is_technician?: boolean;
  created_by: number | null;
  updated_by: number | null;
}

export interface Unit extends BaseEntity {
  name: string;
  type?: string;
  is_armored?: boolean;
  city?: string;
  state?: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  password_hash: string;
  unit_id: number;
  department_id: number;
  role_id?: number | null;
  employee_id?: number | null;
  api_key?: string | null;
  is_active: boolean;
  last_login?: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface RelationshipDegree extends BaseEntity {
  name: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface FamilyComposition extends BaseEntity {
  person_id: number;
  family_member_person_id: number;
  relationship_degree_id: number;
  created_by: number | null;
  updated_by: number | null;
}

export interface Person extends BaseEntity {
  // System & Unit References
  created_unit_id?: number | null;
  updated_unit_id?: number | null;
  referred_unit_id?: number | null;
  notes?: string | null;

  // Basic Personal Data
  first_name: string;
  last_name: string;
  full_name?: string | null;
  social_name?: string | null;
  birth_date?: string | null;
  sex?: number | null;
  gender_id?: number | null;
  gender_identity_id?: number | null;
  sexual_orientation?: string | null;
  race_id?: number | null;
  ethnicity_id?: number | null;
  community_id?: number | null;
  marital_status_id?: number | null;
  nationality?: number | null;
  origin_country_id?: number | null;
  arrival_date_brazil?: string | null;

  // Family Links
  mother_person_id?: number | null;
  father_person_id?: number | null;
  mother_rg?: string | null;
  father_rg?: string | null;
  mother_residence_order?: number | null;
  father_residence_order?: number | null;

  // Documentation
  cpf?: string | null;
  nis?: number | null;
  nisn?: string | null;
  sus_number?: number | null;
  rg?: string | null;
  rg_issuance_date?: string | null;
  rg_state_abbr?: string | null;
  rg_issuing_org_id?: number | null;
  rg_complementary?: string | null;
  photo_id?: number | null;

  // Civil Registry Certificate
  cert_standard_new?: number | null;
  cert_term_number?: string | null;
  cert_book?: string | null;
  cert_page?: string | null;
  cert_issuance_date?: string | null;
  cert_state_abbr?: string | null;
  cert_registry?: string | null;
  cert_year?: string | null;
  cert_issuing_org?: string | null;
  birth_city?: string | null;
  birth_subdistrict?: string | null;

  // Electoral, Professional & Military Documents
  voter_id_number?: string | null;
  voter_id_zone?: string | null;
  voter_id_section?: string | null;
  voter_id_issuance_date?: string | null;
  prof_card_number?: string | null;
  prof_card_series?: string | null;
  prof_card_issuance_date?: string | null;
  prof_card_state?: string | null;
  military_registration?: string | null;
  military_issuance_date?: string | null;
  military_reserve_number?: string | null;

  // Income
  income_type_id?: number | null;
  monthly_income?: number | null;
  annual_income?: number | null;

  // Education
  education_level_id?: number | null;
  school_name?: string | null;
  completion_year?: number | null;
  currently_studying?: number | null;

  // Death Data
  deceased?: number | null;
  death_cert_issuance_date?: string | null;
  death_city?: string | null;
  cemetery?: string | null;
}

export interface Vehicle extends BaseEntity {
  name: string;
  type: string;
  is_armored: boolean;
  city: string;
  state: string;
  created_by: number;
  updated_by: number | null;
}
