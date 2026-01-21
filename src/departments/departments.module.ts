import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
