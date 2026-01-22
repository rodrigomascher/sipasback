import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';
import { toCamelCase, toSnakeCase } from '../common/utils/transform.utils';
import { RelationshipDegree } from '../common/types/database.types';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class RelationshipDegreesService extends BaseService<
  RelationshipDegree,
  CreateRelationshipDegreeDto,
  UpdateRelationshipDegreeDto
> {
  protected tableName = 'relationship_degree';
  protected columns =
    'id, description, active, created_by, updated_by, created_at, updated_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: RelationshipDegree): any {
    return toCamelCase(data);
  }

  protected transformForDb(
    dto: CreateRelationshipDegreeDto | UpdateRelationshipDegreeDto,
  ): any {
    return toSnakeCase(dto);
  }
}
