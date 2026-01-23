import { IsNumber, IsOptional } from 'class-validator';

export class UpdateUserUnitDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsOptional()
  unitId?: number;
}
