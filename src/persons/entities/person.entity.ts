export class Person {
  // System & Control
  id: number;
  createdBy: number;
  updatedBy?: number;
  createdUnitId?: number;
  updatedUnitId?: number;
  referredUnitId?: number;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;

  // Basic Personal Data
  firstName: string;
  lastName: string;
  fullName?: string;
  nickname?: string;
  birthDate: Date;
  sex?: number; // 1=M, 2=F
  genderId?: number;
  genderIdentityId?: number;
  sexualOrientation?: string;
  raceId?: number;
  ethnicityId?: number;
  communityId?: number;
  maritalStatusId?: number;
  nationality?: number;
  originCountryId?: number;
  arrivalDateBrazil?: Date;

  // Filial Data (Parents) - can link to another person
  motherPersonId?: number;
  fatherPersonId?: number;
  motherRg?: string;
  fatherRg?: string;
  motherResidenceOrder?: number;
  fatherResidenceOrder?: number;

  // General Documentation
  cpf?: string; // Unique
  nis?: number;
  nisn?: string;
  susNumber?: number;
  rg?: string;
  rgIssuanceDate?: Date;
  rgStateAbbr?: string;
  rgIssuingOrgId?: number;
  rgComplementary?: string;
  photoId?: number;

  // Civil Registry Certificate
  certStandardNew?: number;
  certTermNumber?: string;
  certBook?: string;
  certPage?: string;
  certIssuanceDate?: Date;
  certStateAbbr?: string;
  certRegistry?: string;
  certYear?: string;
  certIssuingOrg?: string;
  birthCity?: string;
  birthSubdistrict?: string;

  // Electoral, Professional & Military Documents
  voterIdNumber?: string;
  voterIdZone?: string;
  voterIdSection?: string;
  voterIdIssuanceDate?: Date;
  profCardNumber?: string;
  profCardSeries?: string;
  profCardIssuanceDate?: Date;
  profCardState?: string;
  militaryRegistration?: string;
  militaryIssuanceDate?: Date;
  militaryReserveNumber?: string;

  // Income
  incomeTypeId?: number;
  monthlyIncome?: number;
  annualIncome?: number;

  // Education
  educationLevelId?: number;
  schoolName?: string;
  completionYear?: number;
  currentlyStudying?: number; // 1=yes, 0=no

  // Death Data (if applicable)
  deceased?: number; // 1=yes, 0=no
  deathCertIssuanceDate?: Date;
  deathCity?: string;
  cemetery?: string;
}
