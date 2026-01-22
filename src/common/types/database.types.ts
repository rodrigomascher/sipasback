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
  name: string;
  created_by: number;
  updated_by: number | null;
}

export interface GenderIdentity extends BaseEntity {
  name: string;
  created_by: number;
  updated_by: number | null;
}

export interface SexualOrientation extends BaseEntity {
  name: string;
  created_by: number;
  updated_by: number | null;
}

export interface Department extends BaseEntity {
  name: string;
  description: string | null;
  parent_id: number | null;
  created_by: number;
  updated_by: number | null;
}

export interface Employee extends BaseEntity {
  person_id: number;
  department_id: number;
  start_date: string;
  end_date: string | null;
  position: string;
  created_by: number;
  updated_by: number | null;
}

export interface Role extends BaseEntity {
  name: string;
  description: string | null;
  created_by: number;
  updated_by: number | null;
}

export interface Unit extends BaseEntity {
  name: string;
  created_by: number;
  updated_by: number | null;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  password_hash: string;
  is_active: boolean;
  last_login?: string | null;
  employee_id?: number | null;
  created_by: number;
  updated_by: number | null;
}

export interface RelationshipDegree extends BaseEntity {
  name: string;
  created_by: number;
  updated_by: number | null;
}

export interface FamilyComposition extends BaseEntity {
  person_id: number;
  family_member_person_id: number;
  relationship_degree_id: number;
  created_by: number;
  updated_by: number | null;
}

export interface Person extends BaseEntity {
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender_id: number | null;
  gender_identity_id: number | null;
  sexual_orientation_id: number | null;
  cpf: string | null;
  created_by: number;
  updated_by: number | null;
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
