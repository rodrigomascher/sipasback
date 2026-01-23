import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateUserUnitDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  unitId: number;
}
