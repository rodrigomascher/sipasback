export class CreateFamilyCompositionDto {
  idFamilyComposition: number;
  idPerson: number;
  idRelationshipDegree?: number;
  responsible?: number;
  createdBy?: string;
}

export class UpdateFamilyCompositionDto {
  idRelationshipDegree?: number;
  responsible?: number;
  updatedBy?: string;
}

export class FamilyCompositionDto {
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
