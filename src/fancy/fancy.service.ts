import {
  CACHE_MANAGER,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
// import { ActiveMatchDto, CreateFancyDto } from './dto/create-fancy.dto';
// import { UpdateFancyDto } from './dto/update-fancy.dto';

@Injectable()
export class FancyService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async activeMatchApis(sportid: any) {
    if (sportid != '4')
      return {
        message: 'Invalid sportid',
      };
    const data: any = await this.cacheManager.get(`sportId:${sportid}`);

    const keys = data.map((item) => `sportId:${sportid}::${item}`);
    let resData = await this.cacheManager.store.mget(...keys);
    resData = _.orderBy(resData, ['openDate'], ['asc']);
    return {
      status: true,
      message: null,
      data: resData,
    };
  }

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

  async deleteByMatchid(params: any) {
    const { sportid, matchid } = params;

    const checkStatus = await global.DB.T_market.findOne({
      where: { eventid: matchid, isactive: 0 },
    });

    if (!checkStatus)
      throw new HttpException({ message: 'Status is Active!' }, 400);

    const allMatchIds: any = await this.cacheManager.get(`sportId:${sportid}`);
    // return { allMatchIds, inc: allMatchIds.includes() };
    const ans = await this.cacheManager.get(`sportId:${sportid}::${matchid}`);

    await this.cacheManager.del(`sportId:${sportid}::${matchid}`);

    if (allMatchIds.includes(Number(matchid))) {
      const index = allMatchIds.indexOf(matchid);

      if (index !== -1) {
        allMatchIds.splice(index, 1);
        await this.cacheManager.set(`sportId:${sportid}`, allMatchIds);
      }
    }

    // if (delMatchid) {
    //   delete delMatchid[matchId];
    //   await this.cacheManager.del(`${sportid}::${matchId}`);
    // }
    return {
      message: 'Matchid Deleted',
    };
  }

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
