import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GendersService } from './genders.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('genders')
@Controller('api/genders')
export class GendersController extends BaseController<
  any,
  CreateGenderDto,
  UpdateGenderDto
> {
  constructor(gendersService: GendersService) {
    super(gendersService);
  }
}
