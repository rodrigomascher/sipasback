import { Controller, Get, Query } from '@nestjs/common';
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
}
