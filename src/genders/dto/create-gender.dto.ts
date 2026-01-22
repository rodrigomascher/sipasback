import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateGenderDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
