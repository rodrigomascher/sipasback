import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UnitsModule } from './units/units.module';
import { DepartmentsModule } from './departments/departments.module';
import { RolesModule } from './roles/roles.module';
import { EmployeesModule } from './employees/employees.module';
import { PersonsModule } from './persons/persons.module';
import { ExampleModule } from './example/example.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    UnitsModule,
    DepartmentsModule,
    RolesModule,
    EmployeesModule,
    PersonsModule,
    ExampleModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
