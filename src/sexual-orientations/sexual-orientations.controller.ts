import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { SexualOrientationsService } from './sexual-orientations.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';

@Controller('api/sexual-orientations')
export class SexualOrientationsController {
  constructor(private readonly sexualOrientationsService: SexualOrientationsService) {}

  @Post()
  create(@Body() createSexualOrientationDto: CreateSexualOrientationDto) {
    return this.sexualOrientationsService.create(createSexualOrientationDto);
  }

  @Get()
  findAll() {
    return this.sexualOrientationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sexualOrientationsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSexualOrientationDto: UpdateSexualOrientationDto) {
    return this.sexualOrientationsService.update(+id, updateSexualOrientationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sexualOrientationsService.remove(+id);
  }
}
