import { Module } from '@nestjs/common';
import { SeedService } from './services/seed.service';
import { SeedController } from './controllers/seed.controller';
import { SupabaseService } from '../database/supabase.service';
import { LoggerService } from './logger/logger.service';

@Module({
  providers: [SeedService, SupabaseService, LoggerService],
  controllers: [SeedController],
  exports: [SeedService, SupabaseService, LoggerService],
})
export class CommonModule {}
