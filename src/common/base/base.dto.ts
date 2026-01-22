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
 * BaseCreateDto - Base DTO for create operations with common validations
 */
export class BaseCreateDto {
  @ApiProperty({
    description: 'User ID who created the item',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;
}

/**
 * BaseUpdateDto - Base DTO for update operations
 */
export class BaseUpdateDto {
  @ApiPropertyOptional({
    description: 'User ID who updated the item',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}

/**
 * BaseAuditableDto - DTO with common auditable fields
 */
export class BaseAuditableDto {
  @ApiPropertyOptional({
    description: 'Whether the item is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'User ID who created the item',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  createdBy?: number;

  @ApiPropertyOptional({
    description: 'User ID who last updated the item',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  updatedBy?: number;

  @ApiPropertyOptional({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  updatedAt?: Date;
}

/**
 * BaseNamedCreateDto - Base DTO for entities with name field
 */
export class BaseNamedCreateDto extends BaseCreateDto {
  @ApiProperty({
    description: 'Item name',
    example: 'Example Name',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;
}

/**
 * BaseNamedUpdateDto - Base DTO for updating entities with name
 */
export class BaseNamedUpdateDto extends BaseUpdateDto {
  @ApiPropertyOptional({
    description: 'Item name',
    example: 'Example Name',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;
}

/**
 * BaseDescribedCreateDto - Base DTO for entities with description
 */
export class BaseDescribedCreateDto extends BaseCreateDto {
  @ApiProperty({
    description: 'Item description',
    example: 'Example description',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  description: string;
}

/**
 * BaseDescribedUpdateDto - Base DTO for updating entities with description
 */
export class BaseDescribedUpdateDto extends BaseUpdateDto {
  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Example description',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(500)
  description?: string;
}
