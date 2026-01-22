import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';

@Controller('api/persons')
export class PersonsController {
  constructor(private personsService: PersonsService) {}

  /**
   * Get all persons (with optional search)
   * GET /api/persons?search=name
   */
  @Get()
  async findAll(@Query('search') search?: string): Promise<Person[]> {
    return this.personsService.findAll(search);
  }

  /**
   * Search persons by name, cpf, or nis
   * GET /api/persons/search?q=termo
   */
  @Get('search')
  async search(@Query('q') searchTerm: string): Promise<Person[]> {
    return this.personsService.search(searchTerm);
  }

  /**
   * Get person by ID
   * GET /api/persons/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Person> {
    return this.personsService.findOne(parseInt(id, 10));
  }

  /**
   * Create a new person
   * POST /api/persons
   */
  @Post()
  async create(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
    return this.personsService.create(createPersonDto);
  }

  /**
   * Update a person
   * PUT /api/persons/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<Person> {
    return this.personsService.update(parseInt(id, 10), updatePersonDto);
  }

  /**
   * Delete a person
   * DELETE /api/persons/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.personsService.remove(parseInt(id, 10));
    return { success: true };
  }
}
