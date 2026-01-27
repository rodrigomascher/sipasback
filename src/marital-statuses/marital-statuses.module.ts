import { Module } from '@nestjs/common';
import { MaritalStatusesService } from './marital-statuses.service';
import { MaritalStatusesController } from './marital-statuses.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MaritalStatusesController],
  providers: [MaritalStatusesService],
  exports: [MaritalStatusesService],
})
export class MaritalStatusesModule {}
