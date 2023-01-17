import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FancyService } from './fancy.service';
import { CreateFancyDto } from './dto/create-fancy.dto';
import { UpdateFancyDto } from './dto/update-fancy.dto';

@Controller('fancy')
export class FancyController {
  constructor(private readonly fancyService: FancyService) {}

  // @Post()
  // create(@Body() createFancyDto: CreateFancyDto) {
  //   return this.fancyService.create(createFancyDto);
  // }

  @Get(':event_id')
  async findAll(@Param('event_id') event_id: string) {
    const getFancy = await this.fancyService.findAll(event_id);
    return getFancy;
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.fancyService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFancyDto: UpdateFancyDto) {
  //   return this.fancyService.update(+id, updateFancyDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.fancyService.remove(+id);
  // }
}
