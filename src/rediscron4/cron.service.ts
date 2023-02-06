import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class Cron4Service {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private readonly logger = new Logger(Cron4Service.name);

  // @Cron('*/3 * * * * *')
  async handleCron() {
    const find_eventid = await global.DB.T_event.findAll({
      where: { is_redis_updated: 1 },
    });
    for (let item of find_eventid) {
      const keyName = `t_event:${item.eventid}`;
      if (item.isactive == 0) {
        await this.cacheManager.del(keyName);
      } else {
        await this.cacheManager.set(keyName, item.toJSON());
      }
      // item.update({ is_redis_updated: 0 });
    }
  }
}
