import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { Gender } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class GendersService extends BaseService<
  Gender,
  CreateGenderDto,
  UpdateGenderDto
> {
  protected tableName = 'gender';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: Gender): any {
    return toCamelCase(data);
  }

  protected transformForDb(dto: CreateGenderDto | UpdateGenderDto): any {
    return toSnakeCase(dto);
  }
}
