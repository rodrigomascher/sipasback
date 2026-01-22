import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { RelationshipDegreesService } from './relationship-degrees.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

@ApiTags('relationship-degrees')
@Controller('relationship-degrees')
export class RelationshipDegreesController {
  constructor(private readonly service: RelationshipDegreesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create relationship degree' })
  @ApiResponse({ status: 201, description: 'Relationship degree created' })
  create(@Body() createRelationshipDegreeDto: CreateRelationshipDegreeDto) {
    return this.service.create(createRelationshipDegreeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List relationship degrees with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'description',
  })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    type: String,
    example: 'asc',
  })
  @ApiQuery({ name: 'search', required: false, type: String, example: '' })
  @ApiResponse({
    status: 200,
    description: 'Paginated relationship degrees list',
  })
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
    return this.service.findAll(paginationQuery);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get relationship degree by ID' })
  @ApiResponse({ status: 200, description: 'Relationship degree data' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update relationship degree' })
  @ApiResponse({ status: 200, description: 'Relationship degree updated' })
  update(
    @Param('id') id: string,
    @Body() updateRelationshipDegreeDto: UpdateRelationshipDegreeDto,
  ) {
    return this.service.update(+id, updateRelationshipDegreeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete relationship degree' })
  @ApiResponse({ status: 200, description: 'Relationship degree deleted' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
