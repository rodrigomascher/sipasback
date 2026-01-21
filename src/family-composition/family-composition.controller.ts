import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FamilyCompositionService } from './family-composition.service';
import { CreateFamilyCompositionDto, UpdateFamilyCompositionDto, FamilyCompositionDto } from './dto/family-composition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  @ApiOperation({ summary: 'List all family compositions' })
  @ApiResponse({
    status: 200,
    description: 'Family compositions list',
    type: [FamilyCompositionDto],
  })
  findAll() {
    return this.service.findAll();
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
