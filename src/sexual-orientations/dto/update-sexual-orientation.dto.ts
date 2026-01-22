import { PartialType } from '@nestjs/mapped-types';
import { CreateSexualOrientationDto } from './create-sexual-orientation.dto';

export class UpdateSexualOrientationDto extends PartialType(
  CreateSexualOrientationDto,
) {}
