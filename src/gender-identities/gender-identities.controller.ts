import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenderIdentitiesService } from './gender-identities.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

@ApiTags('gender-identities')
@Controller('api/gender-identities')
export class GenderIdentitiesController {
  constructor(private readonly genderIdentitiesService: GenderIdentitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  create(@Body() createGenderIdentityDto: CreateGenderIdentityDto) {
    return this.genderIdentitiesService.create(createGenderIdentityDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List gender identities with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'description' })
  @ApiQuery({ name: 'sortDirection', required: false, type: String, example: 'asc' })
  @ApiQuery({ name: 'search', required: false, type: String, example: '' })
  @ApiResponse({ status: 200, description: 'Paginated gender identities list' })
  findAll(
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
    return this.genderIdentitiesService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.genderIdentitiesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGenderIdentityDto: UpdateGenderIdentityDto) {
    return this.genderIdentitiesService.update(+id, updateGenderIdentityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genderIdentitiesService.remove(+id);
  }
}
