import { Module } from '@nestjs/common';
import { SexualOrientationsService } from './sexual-orientations.service';
import { SexualOrientationsController } from './sexual-orientations.controller';
import { SupabaseModule } from '../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SexualOrientationsController],
  providers: [SexualOrientationsService],
  exports: [SexualOrientationsService],
})
export class SexualOrientationsModule {}
