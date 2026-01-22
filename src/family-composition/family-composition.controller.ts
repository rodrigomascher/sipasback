import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudOperation } from '../common/decorators/api-crud.decorator';
import { FamilyCompositionService } from './family-composition.service';
import {
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto,
} from './dto/family-composition.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('family-composition')
@Controller('family-composition')
export class FamilyCompositionController extends BaseController<
  any,
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto
> {
  constructor(familyCompositionService: FamilyCompositionService) {
    super(familyCompositionService);
  }

  @Get('family/:idFamilyComposition')
  @ApiCrudOperation('Get all members of a family')
  findByFamily(@Param('idFamilyComposition') idFamilyComposition: string) {
    return this.service.findByFamily(+idFamilyComposition);
  }
}
