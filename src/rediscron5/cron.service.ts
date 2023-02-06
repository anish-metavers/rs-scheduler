import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class Cron5Service {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(Cron5Service.name);

  // @Cron('*/3 * * * * *')
  async handleCron() {
    this.logger.debug('Called when the current second is 45');
    const find_market = await global.DB.T_market.findAll({
      where: { is_redis_updated: 1 },
    });
    for (let item of find_market) {
      const keyName = `t_market:${item.marketid}`;
      if (item.isactive == 0) {
        await this.cacheManager.del(keyName);
      } else {
        await this.cacheManager.set(keyName, item.toJSON());
      }
      // item.update({ is_redis_updated: 0 });
    }
  }
}
