import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateIncomeTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  description: string;
}
