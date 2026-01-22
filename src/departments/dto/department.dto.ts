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
  @ApiProperty({ description: 'Department description', example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  description: string;
}

/**
 * DTO for updating a department
 */
export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Department description',
    example: 'Engineering',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  description?: string;
}

/**
 * DTO for department response
 */
export class DepartmentDto {
  @ApiProperty({ description: 'Department ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Department description', example: 'Engineering' })
  description: string;

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
