import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { SexualOrientation } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class SexualOrientationsService extends BaseService<
  SexualOrientation,
  CreateSexualOrientationDto,
  UpdateSexualOrientationDto
> {
  protected tableName = 'sexual_orientation';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: SexualOrientation): any {
    return toCamelCase(data);
  }

  protected transformForDb(
    dto: CreateSexualOrientationDto | UpdateSexualOrientationDto,
  ): any {
    return toSnakeCase(dto);
  }
}
