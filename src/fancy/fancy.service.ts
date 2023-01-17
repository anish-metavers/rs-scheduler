import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CreateFancyDto } from './dto/create-fancy.dto';
import { UpdateFancyDto } from './dto/update-fancy.dto';

@Injectable()
export class FancyService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  // create(createFancyDto: CreateFancyDto) {
  //   return 'This action adds a new fancy';
  // }

  async findAll(event_id: string) {
    const result = await this.cacheManager.get(`eventId:${event_id}`);
    if (!result) return [];
    return result;
    // const allEvent = await global.DB.T_event.findAll({
    //   attributes: ['eventid'],
    // });
    // const allEventid = allEvent.map((item) => item.eventid);
    // for (let item of allEvent) {
    //   console.log(item.eventid);
    // }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} fancy`;
  // }

  // update(id: number, updateFancyDto: UpdateFancyDto) {
  //   return `This action updates a #${id} fancy`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} fancy`;
  // }
}
