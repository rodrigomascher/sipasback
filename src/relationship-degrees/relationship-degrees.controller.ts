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
import { RelationshipDegreesService } from './relationship-degrees.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  @ApiOperation({ summary: 'List all relationship degrees' })
  @ApiResponse({ status: 200, description: 'Relationship degrees list' })
  findAll() {
    return this.service.findAll();
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
