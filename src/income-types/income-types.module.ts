import { Module } from '@nestjs/common';
import { IncomeTypesService } from './income-types.service';
import { IncomeTypesController } from './income-types.controller';

@Module({
  controllers: [IncomeTypesController],
  providers: [IncomeTypesService],
  exports: [IncomeTypesService],
})
export class IncomeTypesModule {}
