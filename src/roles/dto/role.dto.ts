import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new role
 */
export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'Engineer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Technical engineer role',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is technician role', example: true })
  @IsBoolean()
  @IsOptional()
  isTechnician?: boolean;
}

/**
 * DTO for updating a role
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'Role name', example: 'Engineer' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Technical engineer role',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is technician role', example: true })
  @IsBoolean()
  @IsOptional()
  isTechnician?: boolean;
}

/**
 * DTO for role response
 */
export class RoleDto {
  @ApiProperty({ description: 'Role ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Role name', example: 'Engineer' })
  name: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Technical engineer role',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'Is technician role', example: true })
  isTechnician: boolean;

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
