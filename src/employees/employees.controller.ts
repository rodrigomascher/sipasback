import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudOperation } from '../common/decorators/api-crud.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController extends BaseController<
  any,
  CreateEmployeeDto,
  UpdateEmployeeDto
> {
  constructor(employeesService: EmployeesService) {
    super(employeesService);
  }

  @Get('search/unit/:unitId')
  @ApiCrudOperation('Find employees by unit ID')
  async findByUnitId(@Param('unitId') unitId: string) {
    return this.service.findByUnitId(Number(unitId));
  }

  @Get('search/department/:departmentId')
  @ApiCrudOperation('Find employees by department ID')
  async findByDepartmentId(@Param('departmentId') departmentId: string) {
    return this.service.findByDepartmentId(Number(departmentId));
  }

  @Get('search/role/:roleId')
  @ApiCrudOperation('Find employees by role ID')
  async findByRoleId(@Param('roleId') roleId: string) {
    return this.service.findByRoleId(Number(roleId));
  }
}
