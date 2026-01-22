import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudOperation } from '../common/decorators/api-crud.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('roles')
@Controller('roles')
export class RolesController extends BaseController<
  any,
  CreateRoleDto,
  UpdateRoleDto
> {
  constructor(rolesService: RolesService) {
    super(rolesService);
  }

  @Get('search/technician')
  @ApiCrudOperation('Find roles by technician flag')
  async findByTechnician(@Query('isTechnician') isTechnician: string) {
    return this.service.findByTechnician(isTechnician === 'true');
  }
}
