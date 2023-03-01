import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueryTypes } from 'sequelize';
import { Cache } from 'cache-manager';

@Injectable()
export class MarketService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(MarketService.name);

  // @Cron('*/3 * * * * *')
  async handleCron() {
    this.logger.debug('Market cron  3');

    //--------- MARKET TABLE AND SELECTION TABLE ----------
    let query = `select TS.id as s_id, TM.id as m_id ,
    TM.marketid,TM.marketname, TM.eventid, TM.isactive,
    TM.min_bet_rate, TM.max_bet_rate,TM.betdelay,TM.minbet,TM.maxbet,TM.display_message from t_selectionid AS TS
    inner join t_market AS TM ON TM.marketid=TS.marketid`;
    const joinData = await global.DB.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    for (let item of joinData) {
      const keyName = `marketId:${item.marketid}`;
      if (item.isactive == 0) {
        await this.cacheManager.del(keyName);
      } else {
        await this.cacheManager.set(keyName, item);
      }
      
      // ----------------- MATCHFANCY TABLE -----------------
      let query = `select id AS f_id,minbet,maxbet,betdelay,fancyid,name,oddstype,isactive from t_matchfancy`;
      const find_fancy = await global.DB.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
      for (let item of find_fancy) {
        const keyName = `fancyId:${item.fancyid}`;
        if (item.isactive == 0) {
          await this.cacheManager.del(keyName);
        } else {
          await this.cacheManager.set(keyName, item);
        }
      }
    }
  }
}
