import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserSession } from '../auth/auth.service';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List employees with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'name' })
  @ApiQuery({ name: 'sortDirection', required: false, type: String, example: 'asc' })
  @ApiQuery({ name: 'search', required: false, type: String, example: '' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of employees',
    type: [EmployeeDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
    @Query('search') search?: string,
  ) {
    const paginationQuery = new PaginationQueryDto({
      page: page || 1,
      pageSize: pageSize || 10,
      sortBy: sortBy || 'id',
      sortDirection: sortDirection || 'asc',
      search,
    });
    return this.employeesService.findAll(paginationQuery);
  }

  @Get('search/unit/:unitId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find employees by unit ID' })
  @ApiResponse({
    status: 200,
    description: 'Employees found',
    type: [EmployeeDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUnitId(@Param('unitId') unitId: string) {
    return this.employeesService.findByUnitId(Number(unitId));
  }

  @Get('search/department/:departmentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find employees by department ID' })
  @ApiResponse({
    status: 200,
    description: 'Employees found',
    type: [EmployeeDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByDepartmentId(@Param('departmentId') departmentId: string) {
    return this.employeesService.findByDepartmentId(Number(departmentId));
  }

  @Get('search/role/:roleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find employees by role ID' })
  @ApiResponse({
    status: 200,
    description: 'Employees found',
    type: [EmployeeDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByRoleId(@Param('roleId') roleId: string) {
    return this.employeesService.findByRoleId(Number(roleId));
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Count total employees' })
  @ApiResponse({
    status: 200,
    description: 'Total count of employees',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async count() {
    const count = await this.employeesService.count();
    return { count };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee details',
    type: EmployeeDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: EmployeeDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @GetUser() user: UserSession,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(createEmployeeDto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: EmployeeDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async update(
    @GetUser() user: UserSession,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(Number(id), updateEmployeeDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({
    status: 204,
    description: 'Employee deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async remove(@Param('id') id: string) {
    await this.employeesService.remove(Number(id));
  }
}
