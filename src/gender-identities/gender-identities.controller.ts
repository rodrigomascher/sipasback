import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { GenderIdentitiesService } from './gender-identities.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';

@Controller('api/gender-identities')
export class GenderIdentitiesController {
  constructor(private readonly genderIdentitiesService: GenderIdentitiesService) {}

  @Post()
  create(@Body() createGenderIdentityDto: CreateGenderIdentityDto) {
    return this.genderIdentitiesService.create(createGenderIdentityDto);
  }

  @Get()
  findAll() {
    return this.genderIdentitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.genderIdentitiesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGenderIdentityDto: UpdateGenderIdentityDto) {
    return this.genderIdentitiesService.update(+id, updateGenderIdentityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genderIdentitiesService.remove(+id);
  }
}
