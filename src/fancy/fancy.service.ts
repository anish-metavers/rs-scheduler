import {
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';

@Injectable()
export class FancyService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  //FIND APIS BY EVENT ID
  async findByEventid(event_id: string) {
    try {
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

      if (!keys) {
        return Data_Object;
      } else {
        for (const market_id in keys) {
          queryKeys.push(`${event_id}::${market_id}`);
        }

        const fetchedData: any = await this.cacheManager.store.mget(
          ...queryKeys,
        );
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
            Data_Object.Bookmaker = [
              ...Data_Object.Bookmaker,
              ...fetchedData[i],
            ];
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
    } catch (error) {
      console.log(error);
    }
  }

  //FIND APIS BY MARKET ID
  async findByMarketid(params: any) {
    if (params.event_id) {
    }
    const { event_id, market_id } = params;
    const data = await this.cacheManager.get(`${event_id}::${market_id}`);
    if (data) {
      return [data];
    } else {
      return [];
    }
  }

  //DELETE APIS BY EVENT ID
  async deleteByEventid(event_id: string) {
    const allMarkets = await this.cacheManager.get(`${event_id}`);

    if (allMarkets) {
      const allMarketIds = Object.keys(allMarkets);

      this.cacheManager.del(`${event_id}`);
      for (let market_id of allMarketIds) {
        this.cacheManager.del(`${event_id}::${market_id}`);
      }
    }
    return {
      message: 'Event Deleted',
    };
  }

  //DELETE APIS BY MARKET ID
  async deleteByMarketid(params: any) {
    const { event_id, market_id } = params;

    const allMarkets = await this.cacheManager.get(`${event_id}`);
    if (allMarkets) {
      delete allMarkets[market_id];
      await this.cacheManager.set(`${event_id}`, allMarkets);
      await this.cacheManager.del(`${event_id}::${market_id}`);
    }
    return {
      message: 'Market Deleted',
    };
  }
}
