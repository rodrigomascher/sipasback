import { Controller, Post, Put, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto, ChangePasswordDto } from './users.service';
import { BaseController } from '../common/base/base.controller';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaginationQueryBuilder } from '../common/utils/pagination.builder';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController extends BaseController<
  any,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private usersService: UsersService) {
    super(usersService);
  }

  @Get()
  @ApiOperation({ summary: 'List all users with pagination', description: 'Retrieve a paginated list of all users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortDirection', required: false, enum: ['asc', 'desc'], description: 'Sort direction' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for email/name' })
  @ApiResponse({ status: 200, description: 'List of users returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page?: string | number,
    @Query('pageSize') pageSize?: string | number,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
    @Query('search') search?: string,
  ): Promise<any> {
    const paginationQuery = PaginationQueryBuilder.fromQuery({
      page,
      pageSize,
      sortBy,
      sortDirection,
      search,
    });
    return this.usersService.findAllWithUnits(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user', description: 'Retrieve a user by ID with all associated units' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.usersService.findOneWithUnits(parseInt(id, 10));
  }

  async findById(id: number): Promise<any> {
    return this.usersService.findOneWithUnits(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user', description: 'Create a new user with associated units' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateUserDto, @GetUser() user: any): Promise<any> {
    return this.usersService.createWithUnits(dto, user?.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user', description: 'Update an existing user and their units' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @GetUser() user: any,
  ): Promise<any> {
    return this.usersService.updateWithUnits(parseInt(id, 10), dto, user?.userId);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<any> {
    return this.usersService.updateWithUnits(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(id: number): Promise<void> {
    await this.usersService.delete(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(id: number): Promise<any> {
    return this.usersService.deactivateUser(id);
  }

  @Post(':id/change-password')
  @ApiOperation({ summary: 'Change user password', description: 'Change the password for a specific user' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(parseInt(id, 10), dto);
    return { message: 'Password changed successfully' };
  }
}
