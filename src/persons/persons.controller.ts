import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudOperation } from '../common/decorators/api-crud.decorator';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import { BaseController } from '../common/base/base.controller';

@ApiTags('persons')
@Controller('api/persons')
export class PersonsController extends BaseController<
  any,
  CreatePersonDto,
  UpdatePersonDto
> {
  constructor(personsService: PersonsService) {
    super(personsService);
  }

  @Get('search')
  @ApiCrudOperation('Search persons by name, cpf, or nis')
  async search(@Query('q') searchTerm: string): Promise<Person[]> {
    return this.service.search(searchTerm);
  }

  @Get(':id/family-members')
  @ApiCrudOperation('Get paginated family members for a person')
  async getPersonFamilyMembers(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ): Promise<any> {
    return this.service.getPersonFamilyMembersPaginated(id, {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortBy: sortBy || 'id',
      sortDirection: sortDirection || 'asc',
    });
  }

  @Get(':id/with-family')
  @ApiCrudOperation('Get person with paginated family members')
  async getPersonWithFamily(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ): Promise<any> {
    return this.service.getPersonWithFamilyMembersPaginated(id, {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortBy: sortBy || 'id',
      sortDirection: sortDirection || 'asc',
    });
  }
}
