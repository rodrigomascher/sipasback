import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentDto } from './dto/department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserSession } from '../auth/auth.service';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({
    status: 200,
    description: 'List of departments',
    type: [DepartmentDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Get('search/unit/:unitId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find departments by unit ID' })
  @ApiResponse({
    status: 200,
    description: 'Departments found',
    type: [DepartmentDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUnitId(@Param('unitId') unitId: string) {
    return this.departmentsService.findByUnitId(Number(unitId));
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Count total departments' })
  @ApiResponse({
    status: 200,
    description: 'Total count of departments',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async count() {
    const count = await this.departmentsService.count();
    return { count };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({
    status: 200,
    description: 'Department details',
    type: DepartmentDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: DepartmentDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @GetUser() user: UserSession,
    @Body() createDepartmentDto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(createDepartmentDto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: DepartmentDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async update(
    @GetUser() user: UserSession,
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(Number(id), updateDepartmentDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({
    status: 204,
    description: 'Department deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async remove(@Param('id') id: string) {
    await this.departmentsService.remove(Number(id));
  }
}
