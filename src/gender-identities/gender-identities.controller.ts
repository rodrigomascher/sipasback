import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenderIdentitiesService } from './gender-identities.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('gender-identities')
@Controller('api/gender-identities')
export class GenderIdentitiesController extends BaseController<
  any,
  CreateGenderIdentityDto,
  UpdateGenderIdentityDto
> {
  constructor(genderIdentitiesService: GenderIdentitiesService) {
    super(genderIdentitiesService);
  }
}
