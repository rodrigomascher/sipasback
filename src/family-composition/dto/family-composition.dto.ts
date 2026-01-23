import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFamilyCompositionDto {
  @ApiProperty({
    description: 'Family composition ID',
    example: 1,
  })
  @IsNotEmpty({ message: 'idFamilyComposition is required' })
  @IsNumber({}, { message: 'idFamilyComposition must be a number' })
  idFamilyComposition: number;

  @ApiProperty({
    description: 'Person ID',
    example: 1,
  })
  @IsNotEmpty({ message: 'idPerson is required' })
  @IsNumber({}, { message: 'idPerson must be a number' })
  idPerson: number;

  @ApiPropertyOptional({
    description: 'Relationship degree ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'idRelationshipDegree must be a number' })
  idRelationshipDegree?: number;

  @ApiPropertyOptional({
    description: 'Responsible person',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Responsible must be a number' })
  responsible?: number;

  @ApiPropertyOptional({
    description: 'User who created this record',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString({ message: 'CreatedBy must be a string' })
  createdBy?: string;
}

export class UpdateFamilyCompositionDto {
  @ApiPropertyOptional({
    description: 'Relationship degree ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'idRelationshipDegree must be a number' })
  idRelationshipDegree?: number;

  @ApiPropertyOptional({
    description: 'Responsible person',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Responsible must be a number' })
  responsible?: number;

  @ApiPropertyOptional({
    description: 'User who updated this record',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString({ message: 'UpdatedBy must be a string' })
  updatedBy?: string;
}

export class FamilyCompositionDto {
  @ApiProperty({ description: 'Family composition ID', example: 1 })
  idFamilyComposition: number;

  @ApiProperty({ description: 'Person ID', example: 1 })
  idPerson: number;

  @ApiPropertyOptional({ description: 'Person object' })
  person?: any;

  @ApiProperty({ description: 'Relationship degree ID', example: 1 })
  idRelationshipDegree: number;

  @ApiProperty({ description: 'Responsible person', example: 1 })
  responsible: number;

  @ApiProperty({ description: 'Registration date' })
  registrationDate: Date;

  @ApiProperty({ description: 'Created by user', example: 'user@example.com' })
  createdBy: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated by user', example: 'user@example.com' })
  updatedBy: string;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
