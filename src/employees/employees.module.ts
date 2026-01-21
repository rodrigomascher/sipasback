import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [EmployeesService],
  exports: [EmployeesService],
  controllers: [EmployeesController],
})
export class EmployeesModule {}
