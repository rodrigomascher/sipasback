import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRelationshipDegreeDto {
  @ApiPropertyOptional({
    description: 'Relationship degree description',
    example: 'Pai/Mãe',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(2, { message: 'Description must be at least 2 characters' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the relationship degree is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;

  @ApiPropertyOptional({
    description: 'User who updated this record',
    example: 1,
  })
  @IsOptional()
  @IsString({ message: 'UpdatedBy must be a string' })
  updatedBy?: string;
}
