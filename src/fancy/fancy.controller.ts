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

@Controller('/fancy')
export class FancyController {
  constructor(private readonly fancyService: FancyService) {}

  // @Post()
  // create(@Body() createFancyDto: CreateFancyDto) {
  //   return this.fancyService.create(createFancyDto);
  // }

  @Get('/:event_id')
  async findByEventid(@Param('event_id') event_id: string) {
    const getFancyByEventid = await this.fancyService.findByEventid(event_id);
    return getFancyByEventid;
  }

  @Get('/:event_id/:market_id')
  async findByMarketid(@Param() params: any) {
    const getFancyByMarket = await this.fancyService.findByMarketid(params);
    return getFancyByMarket;
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFancyDto: UpdateFancyDto) {
  //   return this.fancyService.update(+id, updateFancyDto);
  // }

  @Delete('remove/:event_id')
  async deleteByMarketid(@Param('event_id') event_id: string) {
    return await this.fancyService.deleteByEventid(event_id);
  }
  @Delete('remove/:event_id/:market_id')
  async deleteByEventid(@Param() params: any) {
    const deleteByEventid = await this.fancyService.deleteByMarketid(params);
    return deleteByEventid;
  }
}
