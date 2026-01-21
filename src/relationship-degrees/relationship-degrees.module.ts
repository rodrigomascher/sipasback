import { Module } from '@nestjs/common';
import { RelationshipDegreesService } from './relationship-degrees.service';
import { RelationshipDegreesController } from './relationship-degrees.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [RelationshipDegreesController],
  providers: [RelationshipDegreesService],
  exports: [RelationshipDegreesService],
})
export class RelationshipDegreesModule {}
