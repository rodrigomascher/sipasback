import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudOperation } from '../common/decorators/api-crud.decorator';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController extends BaseController<
  any,
  CreateDepartmentDto,
  UpdateDepartmentDto
> {
  constructor(departmentsService: DepartmentsService) {
    super(departmentsService);
  }
}
