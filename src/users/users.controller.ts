import { Controller, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { BaseController } from '../common/base/base.controller';
import { GetUser } from '../common/decorators/get-user.decorator';

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
}
