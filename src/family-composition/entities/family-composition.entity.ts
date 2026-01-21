// This file is kept for reference but TypeORM entities are not used in this project.
// The project uses Supabase for database operations instead.
// All database operations go through SupabaseService which uses plain SQL queries.

export class FamilyComposition {
  idFamilyComposition: number;
  idPerson: number;
  person?: any;
  idRelationshipDegree: number;
  responsible: number;
  registrationDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
