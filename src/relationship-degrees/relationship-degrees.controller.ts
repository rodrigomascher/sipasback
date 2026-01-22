import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RelationshipDegreesService } from './relationship-degrees.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('relationship-degrees')
@Controller('relationship-degrees')
export class RelationshipDegreesController extends BaseController<
  any,
  CreateRelationshipDegreeDto,
  UpdateRelationshipDegreeDto
> {
  protected service: RelationshipDegreesService;

  constructor(relationshipDegreesService: RelationshipDegreesService) {
    super();
    this.service = relationshipDegreesService;
  }
}
