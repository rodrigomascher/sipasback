import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({
    example: 'Headquarters',
    description: 'Name of the organizational unit',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Main',
    description: 'Type of unit (Main, Branch, Regional, etc)',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  type: string;

  @ApiProperty({
    example: true,
    description: 'Whether this is an armored unit',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isArmored?: boolean;

  @ApiProperty({
    example: 'São Paulo',
    description: 'City where the unit is located',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    example: 'SP',
    description: 'State abbreviation (2 characters)',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  state: string;
}

export class UpdateUnitDto {
  @ApiProperty({
    example: 'Headquarters',
    description: 'Name of the organizational unit',
    minLength: 3,
    maxLength: 255,
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Main',
    description: 'Type of unit',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsOptional()
  type?: string;

  @ApiProperty({
    example: true,
    description: 'Whether this is an armored unit',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isArmored?: boolean;

  @ApiProperty({
    example: 'São Paulo',
    description: 'City where the unit is located',
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  city?: string;

  @ApiProperty({
    example: 'SP',
    description: 'State abbreviation',
    minLength: 2,
    maxLength: 2,
    required: false,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @IsOptional()
  state?: string;
}

export class UnitDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Headquarters' })
  name: string;

  @ApiProperty({ example: 'Main' })
  type: string;

  @ApiProperty({ example: true })
  isArmored: boolean;

  @ApiProperty({ example: 'São Paulo' })
  city: string;

  @ApiProperty({ example: 'SP' })
  state: string;

  @ApiProperty({
    example: 1,
    description: 'ID of user who created this record',
    nullable: true,
  })
  createdBy: number | null;

  @ApiProperty({
    example: 1,
    description: 'ID of user who last updated this record',
    nullable: true,
  })
  updatedBy: number | null;

  @ApiProperty({ example: '2026-01-21T11:21:47.168493+00:00' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-21T11:21:47.168493+00:00' })
  updatedAt: string;
}
