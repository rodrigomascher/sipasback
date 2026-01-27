import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateMaritalStatusDto } from './dto/create-marital-status.dto';
import { UpdateMaritalStatusDto } from './dto/update-marital-status.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { MaritalStatus } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class MaritalStatusesService extends BaseService<
  MaritalStatus,
  CreateMaritalStatusDto,
  UpdateMaritalStatusDto
> {
  protected tableName = 'marital_status';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: MaritalStatus): any {
    return toCamelCase(data);
  }

  protected transformForDb(dto: CreateMaritalStatusDto | UpdateMaritalStatusDto): any {
    return toSnakeCase(dto);
  }
}
