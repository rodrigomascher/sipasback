/**
 * Extended Persons Service with pagination for related entities
 * Extends PersonsService with methods for paginated queries of related data
 */

export interface PersonRelatedEntities {
  familyComposition?: any[];
  units?: any[];
}

export interface PersonWithRelated {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  birthDate?: Date;
  cpf?: string;
  [key: string]: any;
  related?: PersonRelatedEntities;
}

export interface PaginatedPersonRelated {
  person: PersonWithRelated;
  familyComposition?: {
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
