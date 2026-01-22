import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SupabaseModule } from '../database/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { UserUnitsModule } from '../user-units/user-units.module';

@Module({
  imports: [SupabaseModule, AuthModule, UserUnitsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
