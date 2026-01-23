import { Controller, Post, Put, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto, ChangePasswordDto } from './users.service';
import { BaseController } from '../common/base/base.controller';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaginationQueryBuilder } from '../common/utils/pagination.builder';

@ApiTags('users')
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
  async findOne(@Param('id') id: string): Promise<any> {
    return this.usersService.findOneWithUnits(parseInt(id, 10));
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @GetUser() user: any): Promise<any> {
    return this.usersService.createWithUnits(dto, user?.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @GetUser() user: any,
  ): Promise<any> {
    return this.usersService.updateWithUnits(parseInt(id, 10), dto, user?.userId);
  }

  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(parseInt(id, 10), dto);
    return { message: 'Password changed successfully' };
  }
}
