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
import { ExampleModule } from './example/example.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
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
    ExampleModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
