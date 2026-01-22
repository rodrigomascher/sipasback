import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { BaseController } from '../common/base/base.controller';

@ApiTags('users')
@Controller('users')
export class UsersController extends BaseController<
  any,
  CreateUserDto,
  UpdateUserDto
> {
  protected service: UsersService;

  constructor(usersService: UsersService) {
    super();
    this.service = usersService;
  }
}
