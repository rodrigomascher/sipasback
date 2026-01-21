import { IsOptional, IsString, IsNotEmpty, IsDateString, IsNumber, Matches, MinLength } from 'class-validator';

export class CreatePersonDto {
  // Required fields
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  lastName: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;

  @IsNotEmpty()
  @IsNumber()
  createdBy: number;

  // Basic Personal Data - Optional
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsNumber()
  sex?: number;

  @IsOptional()
  @IsNumber()
  genderId?: number;

  @IsOptional()
  @IsNumber()
  genderIdentityId?: number;

  @IsOptional()
  @IsString()
  sexualOrientation?: string;

  @IsOptional()
  @IsNumber()
  raceId?: number;

  @IsOptional()
  @IsNumber()
  ethnicityId?: number;

  @IsOptional()
  @IsNumber()
  communityId?: number;

  @IsOptional()
  @IsNumber()
  maritalStatusId?: number;

  @IsOptional()
  @IsNumber()
  nationality?: number;

  @IsOptional()
  @IsNumber()
  originCountryId?: number;

  @IsOptional()
  @IsDateString()
  arrivalDateBrazil?: Date;

  // Filial - Can link to another person
  @IsOptional()
  @IsNumber()
  motherPersonId?: number;

  @IsOptional()
  @IsNumber()
  fatherPersonId?: number;

  @IsOptional()
  @IsString()
  motherRg?: string;

  @IsOptional()
  @IsString()
  fatherRg?: string;

  @IsOptional()
  @IsNumber()
  motherResidenceOrder?: number;

  @IsOptional()
  @IsNumber()
  fatherResidenceOrder?: number;

  // Documentation
  @IsOptional()
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF must be in format: 999.999.999-99' })
  cpf?: string;

  @IsOptional()
  @IsNumber()
  nis?: number;

  @IsOptional()
  @IsString()
  nisn?: string;

  @IsOptional()
  @IsNumber()
  susNumber?: number;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsDateString()
  rgIssuanceDate?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'State abbreviation must be 2 uppercase letters' })
  rgStateAbbr?: string;

  @IsOptional()
  @IsNumber()
  rgIssuingOrgId?: number;

  @IsOptional()
  @IsString()
  rgComplementary?: string;

  // Civil Registry Certificate
  @IsOptional()
  @IsNumber()
  certStandardNew?: number;

  @IsOptional()
  @IsString()
  certTermNumber?: string;

  @IsOptional()
  @IsString()
  certBook?: string;

  @IsOptional()
  @IsString()
  certPage?: string;

  @IsOptional()
  @IsDateString()
  certIssuanceDate?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  certStateAbbr?: string;

  @IsOptional()
  @IsString()
  certRegistry?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Cert year must be 4 digits' })
  certYear?: string;

  @IsOptional()
  @IsString()
  certIssuingOrg?: string;

  @IsOptional()
  @IsString()
  birthCity?: string;

  @IsOptional()
  @IsString()
  birthSubdistrict?: string;

  // Electoral, Professional & Military Documents
  @IsOptional()
  @IsString()
  voterIdNumber?: string;

  @IsOptional()
  @IsString()
  voterIdZone?: string;

  @IsOptional()
  @IsString()
  voterIdSection?: string;

  @IsOptional()
  @IsDateString()
  voterIdIssuanceDate?: Date;

  @IsOptional()
  @IsString()
  profCardNumber?: string;

  @IsOptional()
  @IsString()
  profCardSeries?: string;

  @IsOptional()
  @IsDateString()
  profCardIssuanceDate?: Date;

  @IsOptional()
  @IsString()
  profCardState?: string;

  @IsOptional()
  @IsString()
  militaryRegistration?: string;

  @IsOptional()
  @IsDateString()
  militaryIssuanceDate?: Date;

  @IsOptional()
  @IsString()
  militaryReserveNumber?: string;

  // Income (Tab 6)
  @IsOptional()
  @IsNumber()
  incomeTypeId?: number;

  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @IsOptional()
  @IsNumber()
  annualIncome?: number;

  // Education (Tab 7)
  @IsOptional()
  @IsNumber()
  educationLevelId?: number;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsNumber()
  completionYear?: number;

  @IsOptional()
  @IsNumber()
  currentlyStudying?: number;

  // Death Data
  @IsOptional()
  @IsNumber()
  deceased?: number;

  @IsOptional()
  @IsDateString()
  deathCertIssuanceDate?: Date;

  @IsOptional()
  @IsString()
  deathCity?: string;

  @IsOptional()
  @IsString()
  cemetery?: string;

  // System
  @IsOptional()
  @IsNumber()
  createdUnitId?: number;

  @IsOptional()
  @IsNumber()
  referredUnitId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
