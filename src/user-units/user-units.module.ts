import { Module } from '@nestjs/common';
import { UserUnitsService } from './user-units.service';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [UserUnitsService],
  exports: [UserUnitsService],
})
export class UserUnitsModule {}
