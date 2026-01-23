import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudOperation } from '../common/decorators/api-crud.decorator';
import { FamilyCompositionService } from './family-composition.service';
import {
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto,
} from './dto/family-composition.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('family-composition')
@Controller('family-composition')
export class FamilyCompositionController extends BaseController<
  any,
  CreateFamilyCompositionDto,
  UpdateFamilyCompositionDto
> {
  constructor(familyCompositionService: FamilyCompositionService) {
    super(familyCompositionService);
  }

  @Get('family/:idFamilyComposition')
  @ApiCrudOperation('Get all members of a family')
  findByFamily(@Param('idFamilyComposition') idFamilyComposition: string) {
    return this.service.findByFamily(+idFamilyComposition);
  }

  @Get('person/:idPerson/paginated')
  @ApiCrudOperation('Get paginated family members for a person')
  async getFamilyMembersPaginated(
    @Param('idPerson', ParseIntPipe) idPerson: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ): Promise<any> {
    return this.service.getFamilyMembersPaginated(idPerson, {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortBy: sortBy || 'id',
      sortDirection: sortDirection || 'asc',
    });
  }

  @Get('family/:idFamily/paginated')
  @ApiCrudOperation('Get paginated members of a family')
  async getFamilyPaginated(
    @Param('idFamily', ParseIntPipe) idFamily: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ): Promise<any> {
    return this.service.getFamilyPaginated(idFamily, {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortBy: sortBy || 'id',
      sortDirection: sortDirection || 'asc',
    });
  }
}
