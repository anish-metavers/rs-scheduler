import {
  CACHE_MANAGER,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateActivematchDto } from './dto/create-activematch.dto';
import { UpdateActivematchDto } from './dto/update-activematch.dto';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';

@Injectable()
export class ActivematchService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async sportid4Apis(sportid: any) {
    const sportIds = ['1', '2', '4'];
    if (!sportIds.includes(sportid))
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

  async deleteByMatchid(params: any) {
    const { sportid, matchid } = params;
    const sportIds = ['1', '2', '4'];
    if (!sportIds.includes(sportid))
      return {
        message: 'Invalid sportid',
      };
    const checkEvent = await global.DB.T_event.findOne({
      where: { eventid: matchid, sportid },
    });

    if (!checkEvent)
      throw new HttpException({ message: 'No Event Found!' }, 400);
    if (checkEvent.isactive)
      throw new HttpException({ message: 'Status is Active!' }, 400);

    const allMatchIds: any = await this.cacheManager.get(`sportId:${sportid}`);
    const ans = await this.cacheManager.get(`sportId:${sportid}::${matchid}`);

    await this.cacheManager.del(`sportId:${sportid}::${matchid}`);

    if (allMatchIds.includes(Number(matchid))) {
      const index = allMatchIds.indexOf(matchid);

      if (index !== -1) {
        allMatchIds.splice(index, 1);
        await this.cacheManager.set(`sportId:${sportid}`, allMatchIds);
      }
    }
    return {
      message: 'Matchid Deleted',
    };
  }

  // findAll() {
  //   return `This action returns all activematch`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} activematch`;
  // }

  // update(id: number, updateActivematchDto: UpdateActivematchDto) {
  //   return `This action updates a #${id} activematch`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} activematch`;
  // }
}
