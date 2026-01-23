import { IsNotEmpty, IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRelationshipDegreeDto {
  @ApiProperty({
    description: 'Relationship degree description',
    example: 'Pai/Mãe',
    minLength: 2,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(2, { message: 'Description must be at least 2 characters' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description: string;

  @ApiPropertyOptional({
    description: 'Whether the relationship degree is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean = true;

  @ApiPropertyOptional({
    description: 'User who created this record',
    example: 1,
  })
  @IsOptional()
  @IsString({ message: 'CreatedBy must be a string' })
  createdBy?: string;
}
