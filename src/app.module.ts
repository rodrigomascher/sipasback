import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExampleModule } from './example/example.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [AuthModule, UsersModule, ExampleModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
