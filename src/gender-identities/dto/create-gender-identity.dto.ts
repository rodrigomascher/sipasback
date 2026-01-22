import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateGenderIdentityDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
