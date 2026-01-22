import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SexualOrientationsService } from './sexual-orientations.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('sexual-orientations')
@Controller('api/sexual-orientations')
export class SexualOrientationsController extends BaseController<
  any,
  CreateSexualOrientationDto,
  UpdateSexualOrientationDto
> {
  protected service: SexualOrientationsService;

  constructor(sexualOrientationsService: SexualOrientationsService) {
    super();
    this.service = sexualOrientationsService;
  }
}
