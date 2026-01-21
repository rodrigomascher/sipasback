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
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, UnitDto } from './dto/unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserSession } from '../auth/auth.service';

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all organizational units' })
  @ApiResponse({
    status: 200,
    description: 'List of units',
    type: [UnitDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll() {
    return this.unitsService.findAll();
  }

  @Get('search/city/:city')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find units by city' })
  @ApiResponse({
    status: 200,
    description: 'Units found in city',
    type: [UnitDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByCity(@Param('city') city: string) {
    return this.unitsService.findByCity(city);
  }

  @Get('search/state/:state')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find units by state' })
  @ApiResponse({
    status: 200,
    description: 'Units found in state',
    type: [UnitDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByState(@Param('state') state: string) {
    return this.unitsService.findByState(state.toUpperCase());
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Count total units' })
  @ApiResponse({
    status: 200,
    description: 'Total count of units',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async count() {
    const count = await this.unitsService.count();
    return { count };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiResponse({
    status: 200,
    description: 'Unit details',
    type: UnitDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit not found',
  })
  async findOne(@Param('id') id: string) {
    return this.unitsService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new organizational unit' })
  @ApiResponse({
    status: 201,
    description: 'Unit created successfully',
    type: UnitDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @GetUser() user: UserSession,
    @Body() createUnitDto: CreateUnitDto,
  ) {
    return this.unitsService.create(createUnitDto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organizational unit' })
  @ApiResponse({
    status: 200,
    description: 'Unit updated successfully',
    type: UnitDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit not found',
  })
  async update(
    @GetUser() user: UserSession,
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(Number(id), updateUnitDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete organizational unit' })
  @ApiResponse({
    status: 204,
    description: 'Unit deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Unit not found',
  })
  async remove(@Param('id') id: string) {
    await this.unitsService.remove(Number(id));
  }
}
