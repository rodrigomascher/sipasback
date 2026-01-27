import { Module } from '@nestjs/common';
import { IncomeTypesService } from './income-types.service';
import { IncomeTypesController } from './income-types.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [IncomeTypesController],
  providers: [IncomeTypesService],
  exports: [IncomeTypesService],
})
export class IncomeTypesModule {}
