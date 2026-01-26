import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateEthnicityDto } from './dto/create-ethnicity.dto';
import { UpdateEthnicityDto } from './dto/update-ethnicity.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { Ethnicity } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class EthnicitiesService extends BaseService<
  Ethnicity,
  CreateEthnicityDto,
  UpdateEthnicityDto
> {
  protected tableName = 'ethnicity';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: Ethnicity): any {
    return toCamelCase(data);
  }

  protected transformForDb(dto: CreateEthnicityDto | UpdateEthnicityDto): any {
    return toSnakeCase(dto);
  }
}
