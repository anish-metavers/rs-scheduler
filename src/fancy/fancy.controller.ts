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
import { ActiveMatchDto, CreateFancyDto } from './dto/create-fancy.dto';
import { UpdateFancyDto } from './dto/update-fancy.dto';

@Controller('/fancy')
export class FancyController {
  constructor(private readonly fancyService: FancyService) {}

  //Active match apis sportid wise
  @Get('/active_match')
  activeMatchApis(@Body() activeMatchDto: ActiveMatchDto) {
    return this.fancyService.activeMatchApis(activeMatchDto);
  }

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
