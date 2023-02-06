import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class Cron7Service {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(Cron7Service.name);

  // @Cron('*/3 * * * * *')
  async handleCron() {
    this.logger.debug('Called when the current second is 45');
    const find_matchfancy = await global.DB.T_matchfancy.findAll({
      where: { is_redis_updated: 1 },
    });
    for (let item of find_matchfancy) {
      const keyName = `t_matchfancy:${item.fancyid}`;
      if (item.isactive == 0) {
        await this.cacheManager.del(keyName);
      } else {
        await this.cacheManager.set(keyName, item.toJSON());
      }
      // item.update({ is_redis_updated: 0 });
    }
  }
}
