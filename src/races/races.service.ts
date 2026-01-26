import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { Race } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class RacesService extends BaseService<
  Race,
  CreateRaceDto,
  UpdateRaceDto
> {
  protected tableName = 'race';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: Race): any {
    return toCamelCase(data);
  }

  protected transformForDb(dto: CreateRaceDto | UpdateRaceDto): any {
    return toSnakeCase(dto);
  }
}
