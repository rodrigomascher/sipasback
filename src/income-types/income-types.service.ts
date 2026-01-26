import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { IncomeType } from './entities/income-type.entity';

@Injectable()
export class IncomeTypesService extends BaseService<IncomeType> {
  constructor() {
    super('income_type');
  }
}
