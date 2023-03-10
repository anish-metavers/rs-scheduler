import { PartialType } from '@nestjs/mapped-types';
import { CreateActivematchDto } from './create-activematch.dto';

export class UpdateActivematchDto extends PartialType(CreateActivematchDto) {}
