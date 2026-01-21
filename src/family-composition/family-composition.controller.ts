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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { FamilyCompositionService } from './family-composition.service';
import { CreateFamilyCompositionDto, UpdateFamilyCompositionDto, FamilyCompositionDto } from './dto/family-composition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

@ApiTags('family-composition')
@Controller('family-composition')
export class FamilyCompositionController {
  constructor(private readonly service: FamilyCompositionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create family composition' })
  @ApiResponse({
    status: 201,
    description: 'Family composition created',
    type: FamilyCompositionDto,
  })
  create(@Body() dto: CreateFamilyCompositionDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List family compositions with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'id_family_composition' })
  @ApiQuery({ name: 'sortDirection', required: false, type: String, example: 'asc' })
  @ApiResponse({
    status: 200,
    description: 'Paginated family compositions list',
  })
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ) {
    const paginationQuery = new PaginationQueryDto({
      page: page || 1,
      pageSize: pageSize || 10,
      sortBy: sortBy || 'id_family_composition',
      sortDirection: sortDirection || 'asc',
    });
    return this.service.findAll(paginationQuery);
  }

  @Get('family/:idFamilyComposition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all members of a family' })
  @ApiResponse({
    status: 200,
    description: 'Family members',
    type: [FamilyCompositionDto],
  })
  findByFamily(@Param('idFamilyComposition') idFamilyComposition: string) {
    return this.service.findByFamily(+idFamilyComposition);
  }

  @Get(':idFamilyComposition/:idPerson')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get family composition by ID' })
  @ApiResponse({
    status: 200,
    description: 'Family composition data',
    type: FamilyCompositionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Family composition not found',
  })
  findOne(
    @Param('idFamilyComposition') idFamilyComposition: string,
    @Param('idPerson') idPerson: string,
  ) {
    return this.service.findOne(+idFamilyComposition, +idPerson);
  }

  @Patch(':idFamilyComposition/:idPerson')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update family composition' })
  @ApiResponse({
    status: 200,
    description: 'Family composition updated',
    type: FamilyCompositionDto,
  })
  update(
    @Param('idFamilyComposition') idFamilyComposition: string,
    @Param('idPerson') idPerson: string,
    @Body() dto: UpdateFamilyCompositionDto,
  ) {
    return this.service.update(+idFamilyComposition, +idPerson, dto);
  }

  @Delete(':idFamilyComposition/:idPerson')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete family composition' })
  @ApiResponse({
    status: 200,
    description: 'Family composition deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Family composition not found',
  })
  remove(
    @Param('idFamilyComposition') idFamilyComposition: string,
    @Param('idPerson') idPerson: string,
  ) {
    return this.service.remove(+idFamilyComposition, +idPerson);
  }
}
