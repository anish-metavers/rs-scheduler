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

  async findByEventid(event_id: string) {
    const Data_Object = {
      Odds: [],
      Bookmaker: [],
      Fancy: [],
      Fancy2: [],
      Fancy3: [],
      Khado: [],
      Ball: [],
      Meter: [],
      OddEven: [],
    };
    const queryKeys: string[] = [];
    const keys: any = await this.cacheManager.get(`${event_id}`);
    for (const market_id in keys) {
      queryKeys.push(`${event_id}::${market_id}`);
    }
    const fetchedData: any = await this.cacheManager.store.mget(...queryKeys);
    // console.log(fetchedData.length);
    // console.log(Object.keys(keys).length);
    const keysArr = Object.keys(keys);
    for (let i = 0; i < keysArr.length; i++) {
      if (
        keys[keysArr[i]] == 'Match Odds' ||
        keys[keysArr[i]] == 'Completed Match' ||
        keys[keysArr[i]] == 'Tied Match'
      ) {
        Data_Object.Odds.push(fetchedData[i]);
      } else if (
        keys[keysArr[i]] == 'Bookmaker 0%Comm' ||
        keys[keysArr[i]] == 'TOSS'
      ) {
        Data_Object.Bookmaker = [...Data_Object.Bookmaker, ...fetchedData[i]];
      } else if (keys[keysArr[i]] == 'F2') {
        Data_Object.Fancy2 = [...Data_Object.Fancy2, ...fetchedData[i]];
      } else if (keys[keysArr[i]] == 'F3') {
        Data_Object.Fancy3 = [...Data_Object.Fancy3, ...fetchedData[i]];
      } else if (keys[keysArr[i]] == 'OE') {
        Data_Object.OddEven = [...Data_Object.OddEven, ...fetchedData[i]];
      }
    }
    return Data_Object;
  }

  async findByMarketid(params: any) {
    const { event_id, market_id } = params;

    const Data_Object = {
      Odds: [],
      Bookmaker: [],
      Fancy: [],
      Fancy2: [],
      Fancy3: [],
      Khado: [],
      Ball: [],
      Meter: [],
      OddEven: [],
    };
    const keys: any = await this.cacheManager.get(`${event_id}`);
    const data = await this.cacheManager.get(`${event_id}::${market_id}`);
    return data;
  }

  // update(id: number, updateFancyDto: UpdateFancyDto) {
  //   return `This action updates a #${id} fancy`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} fancy`;
  // }
}
