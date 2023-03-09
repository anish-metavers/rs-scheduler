import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { QueryTypes } from 'sequelize';
const _ = require('lodash');
@Injectable()
export class ActiveMatchService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(ActiveMatchService.name);

  @Cron('*/1 * * * *')
  async handleCron() {
    this.logger.debug('Active match cron running..');
    const marketApisUrl = 'http://3.108.233.31:3005/v1/odds/';
    try {
      // const Data_Object = {};
      let query = `
      select eventid, isactive, marketid, marketname, 
      matchname, startdate, sportid 
      from t_market
      where
      (marketname='Match Odds'
      OR marketname='Bookmaker 0%Comm') 
      and sportid = 4 and isactive = 1
      group by eventid, marketid
      `;
      const joinData = await global.DB.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const grouped_data = _.groupBy(joinData, 'eventid');
      // console.log(grouped_data)

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

      const sportId = 4;

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
      // for (let apiRes in data1) {
      //   for (let item of data1[apiRes]) {
      //     // console.log(item);
      //     for (let itemId of item.odds) {
      //       // console.log(itemId)
      //       if (market_name == 'Match Odds') {
      // const tempObj = {
      //   status: item.status,
      //   message: null,
      //   date: [
      //     {
      //       matchName: match_name,
      //       matchId: event_id,
      //       openDate: startdate,
      //       inPlay: item.inplay,
      //       team1Back:
      //         !itemId.backPrice1 || itemId.backPrice1 == '-'
      //           ? 0.0
      //           : Number(itemId.backPrice1),
      //       team1Lay:
      //         !itemId.layPrice1 || itemId.layPrice1 == '-'
      //           ? 0.0
      //           : Number(itemId.layPrice1),
      //       team2Back:
      //         !itemId.backPrice1 || itemId.backPrice1 == '-'
      //           ? 0.0
      //           : Number(itemId.backPrice1),
      //       team2Lay:
      //         !itemId.layPrice1 || itemId.layPrice1 == '-'
      //           ? 0.0
      //           : Number(itemId.layPrice1),
      //       // drawBack: ,
      //       // drawLay: ,
      //       bm: true,
      //     },
      //   ],
      // };
      //         // console.log(tempObj);
      //       }
      //     }
      //   }
      // }
    } catch (error) {
      console.log(error);
    }
  }
}
