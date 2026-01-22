import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudOperation } from '../common/decorators/api-crud.decorator';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('units')
@Controller('units')
export class UnitsController extends BaseController<
  any,
  CreateUnitDto,
  UpdateUnitDto
> {
  constructor(unitsService: UnitsService) {
    super(unitsService);
  }

  @Get('search/city/:city')
  @ApiCrudOperation('Find units by city')
  async findByCity(@Param('city') city: string) {
    return this.service.findByCity(city);
  }

  @Get('search/state/:state')
  @ApiCrudOperation('Find units by state')
  async findByState(@Param('state') state: string) {
    return this.service.findByState(state.toUpperCase());
  }

  @Get('count')
  @ApiCrudOperation('Count total units')
  async count() {
    const count = await this.service.count();
    return { count };
  }
}
