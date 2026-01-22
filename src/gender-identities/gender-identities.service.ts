import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { GenderIdentity } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class GenderIdentitiesService extends BaseService<
  GenderIdentity,
  CreateGenderIdentityDto,
  UpdateGenderIdentityDto
> {
  protected tableName = 'gender_identity';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: GenderIdentity): any {
    return toCamelCase(data);
  }

  protected transformForDb(
    dto: CreateGenderIdentityDto | UpdateGenderIdentityDto,
  ): any {
    return toSnakeCase(dto);
  }
}
