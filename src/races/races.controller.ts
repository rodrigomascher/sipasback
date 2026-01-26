import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RacesService } from './races.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('races')
@Controller('api/races')
export class RacesController extends BaseController<
  any,
  CreateRaceDto,
  UpdateRaceDto
> {
  constructor(racesService: RacesService) {
    super(racesService);
  }
}
