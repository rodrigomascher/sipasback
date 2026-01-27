import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaritalStatusesService } from './marital-statuses.service';
import { CreateMaritalStatusDto } from './dto/create-marital-status.dto';
import { UpdateMaritalStatusDto } from './dto/update-marital-status.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('marital-statuses')
@Controller('api/marital-statuses')
export class MaritalStatusesController extends BaseController<
  any,
  CreateMaritalStatusDto,
  UpdateMaritalStatusDto
> {
  constructor(maritalStatusesService: MaritalStatusesService) {
    super(maritalStatusesService);
  }
}
