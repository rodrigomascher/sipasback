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
 * DTO for creating a new employee
 */
export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee number', example: '12345' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  employeeId: string;

  @ApiProperty({ description: 'Full name', example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: 'Unit ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  unitId: number;

  @ApiProperty({ description: 'Department ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiPropertyOptional({ description: 'Role ID', example: 1 })
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiPropertyOptional({ description: 'Is technician', example: true })
  @IsBoolean()
  @IsOptional()
  isTechnician?: boolean;
}

/**
 * DTO for updating an employee
 */
export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'Employee number', example: '12345' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Full name', example: 'John Smith' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 1 })
  @IsNumber()
  @IsOptional()
  unitId?: number;

  @ApiPropertyOptional({ description: 'Department ID', example: 1 })
  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ description: 'Role ID', example: 1 })
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiPropertyOptional({ description: 'Is technician', example: true })
  @IsBoolean()
  @IsOptional()
  isTechnician?: boolean;
}

/**
 * DTO for employee response
 */
export class EmployeeDto {
  @ApiProperty({ description: 'Employee ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Employee number', example: '12345' })
  employeeId: string;

  @ApiProperty({ description: 'Full name', example: 'John Smith' })
  fullName: string;

  @ApiProperty({ description: 'Unit ID', example: 1 })
  unitId: number;

  @ApiProperty({ description: 'Department ID', example: 1 })
  departmentId: number;

  @ApiPropertyOptional({ description: 'Role ID', example: 1, nullable: true })
  roleId: number | null;

  @ApiProperty({ description: 'Is technician', example: true })
  isTechnician: boolean;

  @ApiPropertyOptional({ description: 'User ID who created this record', example: 1, nullable: true })
  createdBy: number | null;

  @ApiPropertyOptional({ description: 'User ID who last modified this record', example: 1, nullable: true })
  updatedBy: number | null;

  @ApiProperty({ description: 'Created timestamp', example: '2026-01-21T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: 'Updated timestamp', example: '2026-01-21T10:00:00Z' })
  updatedAt: string;
}
