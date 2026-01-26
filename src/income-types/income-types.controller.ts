import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { IncomeTypesService } from './income-types.service';
import { IncomeType } from './entities/income-type.entity';
import { CreateIncomeTypeDto } from './dto/create-income-type.dto';
import { UpdateIncomeTypeDto } from './dto/update-income-type.dto';
import { BaseController } from '../common/base.controller';

@Controller('api/income-types')
export class IncomeTypesController extends BaseController<IncomeType> {
  constructor(private readonly incomeTypesService: IncomeTypesService) {
    super(incomeTypesService);
  }
}
