import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class Cron6Service {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(Cron6Service.name);

  // @Cron('*/3 * * * * *')
  async handleCron() {
    this.logger.debug('Called when the current second is 45');
    const find_selection = await global.DB.T_selectionid.findAll({
      where: { is_redis_updated: 1 },
    });
    for (let item of find_selection) {
      const market = await global.DB.T_market.findOne({
        where: { marketid: item.marketid },
      });
      const keyName = `t_selection:${item.marketid}`;
      if (market.isactive == 0) {
        await this.cacheManager.del(keyName);
      } else {
        await this.cacheManager.set(keyName, item.toJSON());
      }
      // item.update({ is_redis_updated: 0 });
    }
  }
}
