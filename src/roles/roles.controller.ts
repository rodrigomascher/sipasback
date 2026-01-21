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
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserSession } from '../auth/auth.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of roles',
    type: [RoleDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get('search/technician')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find roles by technician flag' })
  @ApiResponse({
    status: 200,
    description: 'Roles found',
    type: [RoleDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByTechnician(@Query('isTechnician') isTechnician: string) {
    return this.rolesService.findByTechnician(isTechnician === 'true');
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Count total roles' })
  @ApiResponse({
    status: 200,
    description: 'Total count of roles',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async count() {
    const count = await this.rolesService.count();
    return { count };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Role details',
    type: RoleDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @GetUser() user: UserSession,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.create(createRoleDto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async update(
    @GetUser() user: UserSession,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(Number(id), updateRoleDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({
    status: 204,
    description: 'Role deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(Number(id));
  }
}
