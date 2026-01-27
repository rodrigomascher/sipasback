import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserUnitsModule } from './user-units/user-units.module';
import { UnitsModule } from './units/units.module';
import { DepartmentsModule } from './departments/departments.module';
import { RolesModule } from './roles/roles.module';
import { EmployeesModule } from './employees/employees.module';
import { PersonsModule } from './persons/persons.module';
import { GendersModule } from './genders/genders.module';
import { GenderIdentitiesModule } from './gender-identities/gender-identities.module';
import { SexualOrientationsModule } from './sexual-orientations/sexual-orientations.module';
import { RelationshipDegreesModule } from './relationship-degrees/relationship-degrees.module';
import { FamilyCompositionModule } from './family-composition/family-composition.module';
import { RacesModule } from './races/races.module';
import { EthnicitiesModule } from './ethnicities/ethnicities.module';
import { IncomeTypesModule } from './income-types/income-types.module';
import { MaritalStatusesModule } from './marital-statuses/marital-statuses.module';
import { ExampleModule } from './example/example.module';
import { LoggerModule } from './common/logger/logger.module';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UsersModule,
    UserUnitsModule,
    UnitsModule,
    DepartmentsModule,
    RolesModule,
    EmployeesModule,
    PersonsModule,
    GendersModule,
    GenderIdentitiesModule,
    SexualOrientationsModule,
    RelationshipDegreesModule,
    FamilyCompositionModule,
    RacesModule,
    EthnicitiesModule,
    IncomeTypesModule,
    MaritalStatusesModule,
    ExampleModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthGuard],
})
export class AppModule {}
