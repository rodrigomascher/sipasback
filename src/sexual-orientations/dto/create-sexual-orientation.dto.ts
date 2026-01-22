import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSexualOrientationDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
