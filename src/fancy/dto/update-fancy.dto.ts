import { PartialType } from '@nestjs/mapped-types';
import { CreateFancyDto } from './create-fancy.dto';

export class UpdateFancyDto extends PartialType(CreateFancyDto) {}
