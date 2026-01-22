import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectUnitDto {
  @ApiProperty({
    example: 1,
    description: 'ID da unidade a ser selecionada',
  })
  @IsNumber()
  @Min(1)
  unitId: number;
}
