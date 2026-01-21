import { Module } from '@nestjs/common';
import { FamilyCompositionService } from './family-composition.service';
import { FamilyCompositionController } from './family-composition.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [FamilyCompositionService],
  controllers: [FamilyCompositionController],
  exports: [FamilyCompositionService],
})
export class FamilyCompositionModule {}
