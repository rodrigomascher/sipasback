import { PartialType } from '@nestjs/mapped-types';
import { CreateGenderIdentityDto } from './create-gender-identity.dto';

export class UpdateGenderIdentityDto extends PartialType(
  CreateGenderIdentityDto,
) {}
