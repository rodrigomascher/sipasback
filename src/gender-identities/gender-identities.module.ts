import { Module } from '@nestjs/common';
import { GenderIdentitiesService } from './gender-identities.service';
import { GenderIdentitiesController } from './gender-identities.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [GenderIdentitiesController],
  providers: [GenderIdentitiesService],
  exports: [GenderIdentitiesService],
})
export class GenderIdentitiesModule {}
