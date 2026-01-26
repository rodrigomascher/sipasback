import { Module } from '@nestjs/common';
import { EthnicitiesService } from './ethnicities.service';
import { EthnicitiesController } from './ethnicities.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [EthnicitiesController],
  providers: [EthnicitiesService],
  exports: [EthnicitiesService],
})
export class EthnicitiesModule {}
