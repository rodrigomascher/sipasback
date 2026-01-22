import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SexualOrientationsService } from './sexual-orientations.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

@ApiTags('sexual-orientations')
@Controller('api/sexual-orientations')
export class SexualOrientationsController {
  constructor(private readonly sexualOrientationsService: SexualOrientationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  create(@Body() createSexualOrientationDto: CreateSexualOrientationDto) {
    return this.sexualOrientationsService.create(createSexualOrientationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List sexual orientations with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'description' })
  @ApiQuery({ name: 'sortDirection', required: false, type: String, example: 'asc' })
  @ApiQuery({ name: 'search', required: false, type: String, example: '' })
  @ApiResponse({ status: 200, description: 'Paginated sexual orientations list' })
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
    return this.sexualOrientationsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sexualOrientationsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSexualOrientationDto: UpdateSexualOrientationDto) {
    return this.sexualOrientationsService.update(+id, updateSexualOrientationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sexualOrientationsService.remove(+id);
  }
}
