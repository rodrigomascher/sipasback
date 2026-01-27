import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateMaritalStatusDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  description: string;
}
