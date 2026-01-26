import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IncomeTypesService } from './income-types.service';
import { CreateIncomeTypeDto } from './dto/create-income-type.dto';
import { UpdateIncomeTypeDto } from './dto/update-income-type.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('income-types')
@Controller('api/income-types')
export class IncomeTypesController extends BaseController<
  any,
  CreateIncomeTypeDto,
  UpdateIncomeTypeDto
> {
  constructor(incomeTypesService: IncomeTypesService) {
    super(incomeTypesService);
  }
}
