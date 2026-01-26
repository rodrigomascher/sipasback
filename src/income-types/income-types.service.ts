import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateIncomeTypeDto } from './dto/create-income-type.dto';
import { UpdateIncomeTypeDto } from './dto/update-income-type.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { IncomeType } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class IncomeTypesService extends BaseService<
  IncomeType,
  CreateIncomeTypeDto,
  UpdateIncomeTypeDto
> {
  protected tableName = 'income_type';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: IncomeType): any {
    return toCamelCase(data);
  }

  protected transformForDb(dto: CreateIncomeTypeDto | UpdateIncomeTypeDto): any {
    return toSnakeCase(dto);
  }
}
