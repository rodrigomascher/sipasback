import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new department
 */
export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Unit ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  unitId: number;
}

/**
 * DTO for updating a department
 */
export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Department name',
    example: 'Engineering',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 1 })
  @IsNumber()
  @IsOptional()
  unitId?: number;
}

/**
 * DTO for department response
 */
export class DepartmentDto {
  @ApiProperty({ description: 'Department ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Department name', example: 'Engineering' })
  name: string;

  @ApiProperty({ description: 'Unit ID', example: 1 })
  unitId: number;

  @ApiPropertyOptional({
    description: 'User ID who created this record',
    example: 1,
    nullable: true,
  })
  createdBy: number | null;

  @ApiPropertyOptional({
    description: 'User ID who last modified this record',
    example: 1,
    nullable: true,
  })
  updatedBy: number | null;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2026-01-21T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Updated timestamp',
    example: '2026-01-21T10:00:00Z',
  })
  updatedAt: string;
}
