import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EthnicitiesService } from './ethnicities.service';
import { CreateEthnicityDto } from './dto/create-ethnicity.dto';
import { UpdateEthnicityDto } from './dto/update-ethnicity.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('ethnicities')
@Controller('api/ethnicities')
export class EthnicitiesController extends BaseController<
  any,
  CreateEthnicityDto,
  UpdateEthnicityDto
> {
  constructor(ethnicitiesService: EthnicitiesService) {
    super(ethnicitiesService);
  }
}
