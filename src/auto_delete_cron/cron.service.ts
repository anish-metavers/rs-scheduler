import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { Op } from 'sequelize';

@Injectable()
export class AutoDeleteService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(AutoDeleteService.name);

  @Cron('*/1 * * * *')
  async handleCron() {
    this.logger.debug('Auto delete cron');

    const sportIds = ['1', '2', '4'];
    for (const sportid of sportIds) {
      const allMatchIds: any = await this.cacheManager.get(
        `sportId:${sportid}`,
      );
      //   console.log(`sportId:${sportid}`);
      //   console.log(allMatchIds);

      const inActiveEvents = await global.DB.T_event.findAll({
        where: { eventid: { [Op.in]: allMatchIds }, sportid, isactive: 0 },
      });

      for (let event of inActiveEvents) {
        console.log('Deleted SportId: ' + sportid);
        console.log('Deleted EventId: ' + event.eventid);

        await this.cacheManager.del(`sportId:${sportid}::${event.eventid}`);
        const allMatchIds: any = await this.cacheManager.get(
          `sportId:${sportid}`,
        );
        if (allMatchIds.includes(Number(event.eventid))) {
          const index = allMatchIds.indexOf(event.eventid);
          if (index !== -1) {
            allMatchIds.splice(index, 1);
            await this.cacheManager.set(`sportId:${sportid}`, allMatchIds);
          }
        }
      }
    }
  }
}
