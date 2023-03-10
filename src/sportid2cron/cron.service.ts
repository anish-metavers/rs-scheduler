import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueryTypes } from 'sequelize';
import { Cache } from 'cache-manager';
import axios from 'axios';
import * as _ from 'lodash';

@Injectable()
export class Sportid2CronService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(Sportid2CronService.name);

  @Cron('*/1 * * * * *')
  async handleCron() {
    this.logger.debug('Active match cron started with sportid 2');
    const marketApisUrl = 'http://3.108.233.31:3005/v1/odds/';
    try {
      let query = `
      select TM.eventid, TM.isactive, TM.marketid, TM.marketname, 
      TM.matchname, TM.startdate, TM.sportid 
      from t_event as TE
      left join t_market as TM
      on TE.eventid = TM.eventid
      where
      TE.isactive = 1 AND
      (TM.marketname='Match Odds'
      OR TM.marketname='Bookmaker 0%Comm') 
      and TM.sportid = 4 and TM.isactive = 1
      group by TM.eventid, TM.marketid
      `;
      const joinData = await global.DB.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
      // console.log(joinData);
      const grouped_data = _.groupBy(joinData, 'eventid');
      //   console.log(grouped_data)

      let marketIds = [];
      // let market_name, match_name, event_id, startdate;

      for (let eid in grouped_data) {
        const matchOddData = grouped_data[eid].find(
          (i) => i.marketname == 'Match Odds',
        );
        if (matchOddData) {
          marketIds.push(matchOddData.marketid);
        } else {
          const bookmakerData = grouped_data[eid].find(
            (i) => i.marketname == 'Bookmaker 0%Comm',
          );
          if (bookmakerData) {
            marketIds.push(bookmakerData.marketid);
          }
        }
      }
      const url = marketApisUrl + marketIds;
      // console.log(url);
      let response = await axios.get(url);
      let apiData = response.data.data;

      const dataToInsertInRedis = [];

      for (const item of apiData.items) {
        if (item) {
          const marketid = item.market_id;

          const data = joinData.find((item) => item.marketid === marketid);

          const { eventid, marketname, matchname, startdate } = data;

          // console.log('marketname: ', marketname);

          if (marketname) {
            const dataObj: any = {
              matchName: matchname,
              matchId: eventid,
              openDate: startdate,
            };

            if (marketname === 'Match Odds') {
              dataObj.inPlay = item.inplay;
              if (item.odds.length == 2 || item.odds.length == 3) {
                dataObj.team1Back =
                  !item.odds[0].backPrice1 || item.odds[0].backPrice1 == '-'
                    ? 0.0
                    : Number(item.odds[0].backPrice1);
                dataObj.team1Lay =
                  !item.odds[0].layPrice1 || item.odds[0].layPrice1 == '-'
                    ? 0.0
                    : Number(item.odds[0].layPrice1);

                dataObj.team2Back =
                  !item.odds[1].backPrice1 || item.odds[1].backPrice1 == '-'
                    ? 0.0
                    : Number(item.odds[1].backPrice1);
                dataObj.team2Lay =
                  !item.odds[1].layPrice1 || item.odds[1].layPrice1 == '-'
                    ? 0.0
                    : Number(item.odds[1].layPrice1);

                dataObj.drawBack = 0.0;
                dataObj.drawLay = 0.0;
                dataObj.bm = true;
              }

              if (item.odds.length == 3) {
                dataObj.drawBack =
                  !item.odds[2].backPrice1 || item.odds[2].backPrice1 == '-'
                    ? 0.0
                    : Number(item.odds[2].backPrice1);
                dataObj.drawLay =
                  !item.odds[2].layPrice1 || item.odds[2].layPrice1 == '-'
                    ? 0.0
                    : Number(item.odds[2].layPrice1);
                dataObj.bm = true;
              }
            } else if (marketname === 'Bookmaker 0%Comm') {
              if (item.runners.length == 2 || item.runners.length == 3) {
                dataObj.team1Back =
                  !item.runners[0].backPrice1 ||
                  item.runners[0].backPrice1 == '-'
                    ? 0.0
                    : Number(item.runners[0].backPrice1);
                dataObj.team1Lay =
                  !item.runners[0].layPrice1 || item.runners[0].layPrice1 == '-'
                    ? 0.0
                    : Number(item.runners[0].layPrice1);

                dataObj.team2Back =
                  !item.runners[1].backPrice1 ||
                  item.runners[1].backPrice1 == '-'
                    ? 0.0
                    : Number(item.runners[1].backPrice1);
                dataObj.team2Lay =
                  !item.runners[1].layPrice1 || item.runners[1].layPrice1 == '-'
                    ? 0.0
                    : Number(item.runners[1].layPrice1);

                dataObj.drawBack = 0.0;
                dataObj.drawLay = 0.0;
                dataObj.bm = true;
              }

              if (item.runners.length == 3) {
                dataObj.drawBack =
                  !item.runners[2].backPrice1 ||
                  item.runners[2].backPrice1 == '-'
                    ? 0.0
                    : Number(item.runners[2].backPrice1);
                dataObj.drawLay =
                  !item.runners[2].layPrice1 || item.runners[2].layPrice1 == '-'
                    ? 0.0
                    : Number(item.runners[2].layPrice1);
                dataObj.bm = true;
              }
            }

            dataToInsertInRedis.push(dataObj);
            // console.log('Data Obj: ', dataObj);
          }
        }
      }
      const key = `{sportid: dataToInsertInRedis}`;

      // console.log('dataToInsertInRedis: ', dataToInsertInRedis);

      const sportId = 2;

      const eventIds = dataToInsertInRedis.map((i) => i.matchId);

      await this.cacheManager.set(`sportId:${sportId}`, eventIds);

      const data = [];
      dataToInsertInRedis.forEach((i) => {
        const key = i.matchId;
        data.push(`sportId:${sportId}::${key}`);
        data.push(i);
      });

      // console.log(data);
        
      await this.cacheManager.store.mset.apply(null, [...data, {}]);
    } catch (error) {
      console.log(error);
    }
  }
}
