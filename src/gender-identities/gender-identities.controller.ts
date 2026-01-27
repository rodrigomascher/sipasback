import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenderIdentitiesService } from './gender-identities.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';
import { BaseController } from '../common/base/base.controller';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaginationQueryBuilder } from '../common/utils/pagination.builder';

@ApiTags('gender-identities')
@Controller('api/gender-identities')
export class GenderIdentitiesController extends BaseController<
  any,
  CreateGenderIdentityDto,
  UpdateGenderIdentityDto
> {
  constructor(genderIdentitiesService: GenderIdentitiesService) {
    super(genderIdentitiesService);
  }

  @Get()
  @Public()
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
    return this.service.findAll(paginationQuery);
  }

  @Post()
  async create(@Body() dto: CreateGenderIdentityDto, @GetUser() user: any): Promise<any> {
    return this.service.create(dto, user?.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGenderIdentityDto,
    @GetUser() user: any,
  ): Promise<any> {
    return this.service.update(parseInt(id, 10), dto, user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(parseInt(id, 10));
  }
}
