import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

@Controller('api/persons')
export class PersonsController {
  constructor(private personsService: PersonsService) {}

  /**
   * Get all persons (with pagination and sorting)
   * GET /api/persons?page=1&pageSize=10&sortBy=fullName&sortDirection=asc
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: string,
  ) {
    const paginationQuery = new PaginationQueryDto({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortBy,
      sortDirection: sortDirection as 'asc' | 'desc' | undefined,
    });
    return this.personsService.findAll(paginationQuery);
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
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPersonDto: CreatePersonDto,
    @Request() req: any,
  ): Promise<Person> {
    const userId = req.user.userId; // Extract user ID from JWT token
    return this.personsService.create(createPersonDto, userId);
  }

  /**
   * Update a person
   * PUT /api/persons/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
    @Request() req: any,
  ): Promise<Person> {
    const userId = req.user.userId; // Extract user ID from JWT token
    return this.personsService.update(parseInt(id, 10), updatePersonDto, userId);
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
