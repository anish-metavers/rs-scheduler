import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivematchService } from './activematch.service';
import { CreateActivematchDto } from './dto/create-activematch.dto';
import { UpdateActivematchDto } from './dto/update-activematch.dto';

@Controller('active_match')
export class ActivematchController {
  constructor(private readonly activematchService: ActivematchService) {}

  @Get('/:sportid')
  async sportid4Apis(@Param('sportid') sportid: any) {
    const sportId4 = await this.activematchService.sportid4Apis(
      sportid
    );
    return sportId4
  }

  @Delete('/remove/:sportid/:matchid')
  async deleteByMatchid(@Param() params: any) {
    return await this.activematchService.deleteByMatchid(params);
  }

  // @Get()
  // findAll() {
  //   return this.activematchService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.activematchService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateActivematchDto: UpdateActivematchDto) {
  //   return this.activematchService.update(+id, updateActivematchDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.activematchService.remove(+id);
  // }
}
