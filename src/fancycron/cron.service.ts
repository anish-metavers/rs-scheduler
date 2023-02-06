import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { QueryTypes } from 'sequelize';

@Injectable()
export class FancyCronService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private readonly logger = new Logger(FancyCronService.name);

  IsRunning = false;
  @Cron('*/1 * * * * *')
  async handleCron() {
    if (!this.IsRunning) {
      this.IsRunning = true;
      try {
        this.logger.debug('Start Cron');
        const url3 = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';
        let query =`
      select TE.id as t_event_id, TM.id as t_market_id ,
      TE.eventid,TM.marketid,TM.marketname from t_event AS TE
      inner join t_market AS TM
      ON TE.eventid=TM.eventid
      where TE.isactive = 1 and TE.sportid = 4 and TM.isactive = 1`;
        const joinData = await global.DB.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });
        // console.log(joinData);
        let Data_Object = {
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
        let matchOddDataAll = joinData.filter(
          (item) => item.marketname == 'Match Odds',
        );
        const matchOddsDataObj = { 0: [] };
        let i = 0;
        for (let itemJoinData of matchOddDataAll) {
          if (matchOddsDataObj[i].length >= 5) {
            i++;
            matchOddsDataObj[i] = [];
          }
          matchOddsDataObj[i].push(itemJoinData);
        }
        // MATCH ODDS --- STARTS
        const matchOddsApis = [];
        for (let key in matchOddsDataObj) {
          let matchOddData = matchOddsDataObj[key];
          let matchOddIds = matchOddData.map((item) => item.marketid).join(',');
          if (matchOddIds) {
            matchOddsApis.push(axios.get(url3 + matchOddIds));
          }
        }
        const matchOddsApiRes = await Promise.all(matchOddsApis);
        for (let apiRes of matchOddsApiRes) {
          let data = apiRes.data.data;
          for (let item of data.items) {
            if (!item) continue;
            const data = matchOddDataAll.filter(
              (i) => i.marketid == item.market_id,
            );
            const runners = [];
            for (let oddItem of item.odds) {
              const selection = await global.DB.T_selectionid.findOne({
                where: { selectionid: oddItem.selectionId },
              });
              if (selection) {
                runners.push({
                  name: selection.runner_name,
                  selectionId: oddItem.selectionId.toString(),
                  ex: {
                    availableToBack: [
                      {
                        price: Number(oddItem.backPrice1),
                        size: parseFloat(oddItem.backSize1.replace(/,/g, '')),
                      },
                      {
                        price: Number(oddItem.backPrice2),
                        size: parseFloat(oddItem.backSize2.replace(/,/g, '')),
                      },
                      {
                        price: Number(oddItem.backPrice3),
                        size: parseFloat(oddItem.backSize3.replace(/,/g, '')),
                      },
                    ],
                    availableToLay: [
                      {
                        price: Number(oddItem.layPrice1),
                        size: parseFloat(oddItem.laySize1.replace(/,/g, '')),
                      },
                      {
                        price: Number(oddItem.layPrice2),
                        size: parseFloat(oddItem.laySize2.replace(/,/g, '')),
                      },
                      {
                        price: Number(oddItem.layPrice3),
                        size: parseFloat(oddItem.laySize3.replace(/,/g, '')),
                      },
                    ],
                  },
                });
              }
            }
            const Odds = [
              {
                runners,
                marketId: item.market_id,
                isMarketDataDelayed: false,
                status: item.status,
                inplay: item.inplay,
                lastMatchTime: new Date(Number(item.lastUpdatedTime * 1000)),
              },
            ];
            // if (data[0].eventid == 31903522) {
            //   console.log(JSON.stringify(Odds));
            // }

            const eventData: any = await this.cacheManager.get(
              `eventId:${data[0].eventid}`,
            );
            if (eventData) {
              eventData.Odds = Odds;
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                eventData,
              );
            } else {
              Data_Object.Odds = Odds;
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                Data_Object,
              );
            }
            Data_Object = {
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
          }
        }
        // MATCH ODDS --- ENDS

        // BOOKMAKER --- STARTS
        let bookMakersDataAll = joinData.filter(
          (item) => item.marketname == 'Bookmaker' || item.marketname == 'TOSS',
        );
        const bookMakersDataObj = { 0: [] };
        i = 0;
        for (let itemJoinData of bookMakersDataAll) {
          if (bookMakersDataObj[i].length >= 5) {
            i++;
            bookMakersDataObj[i] = [];
          }
          bookMakersDataObj[i].push(itemJoinData);
        }
        const bookMakersApis = [];
        for (let key in bookMakersDataObj) {
          let bookMakerData = bookMakersDataObj[key];
          let bookMakerIds = bookMakerData
            .map((item) => item.marketid)
            .join(',');

          if (bookMakerIds) {
            bookMakersApis.push(axios.get(url3 + bookMakerIds));
          }
        }
        const bookMakerApiRes = await Promise.all(bookMakersApis);
        for (let apiRes of bookMakerApiRes) {
          let data = apiRes.data.data;
          for (let item of data.items) {
            if (!item) continue;

            const data = bookMakersDataAll.filter(
              (i) => i.marketid == item.market_id,
            );
            const Bookmaker = [];
            for (let runnerItem of item.runners) {
              const selection = await global.DB.T_selectionid.findOne({
                where: { selectionid: runnerItem.secId },
              });
              if (selection) {
                Bookmaker.push({
                  mid: item.market_id,
                  t: item.title,
                  sid: runnerItem.secId.toString(),
                  nation: runnerItem.runner,
                  b1: runnerItem.back.toString(),
                  bs1: runnerItem.backSize,
                  l1: runnerItem.lay.toString(),
                  ls1: runnerItem.laySize,
                  gstatus: runnerItem.suspended
                    ? 'SUSPENDED'
                    : runnerItem.ballRunning
                    ? 'BALL RUNNING'
                    : !runnerItem.suspended && !runnerItem.ballRunning
                    ? ''
                    : '0',
                });
              } else {
                console.log('No Selection', data);
              }
            }

            const eventData: any = await this.cacheManager.get(
              `eventId:${data[0].eventid}`,
            );
            if (eventData) {
              let prev = eventData.Bookmaker.filter(
                (element) => element.mid != item.market_id,
              );
              eventData.Bookmaker = [...prev, ...Bookmaker];
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                eventData,
              );
            } else {
              Data_Object.Bookmaker = Bookmaker;
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                Data_Object,
              );
            }
            Data_Object = {
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
          }
        }
        // BOOKMAKER --- ENDS
      } catch (error) {
        console.log(error);
        this.IsRunning = false;
      }
      try {
        const url3 = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';

        let query = `select TE.id as t_event_id, TM.id as t_matchfancy_id , TE.eventid,
         TM.fancyid,TM.oddstype,TE.is_redis_updated,TM.is_redis_updated
         from t_event AS TE inner join t_matchfancy AS TM ON TE.eventid=TM.eventid
	       where TE.isactive = 1 and TE.sportid = 4 and TM.isactive = 1`;

        const joinData = await global.DB.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        // console.log(joinData);

        //FANCY2 START
        let Data_Object = {
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

        let fancy2DataAll = joinData.filter((item) => item.oddstype == 'F2');

        // console.log(fancy2DataAll)

        const fancy2DataObj = { 0: [] };
        let i = 0;
        for (let itemJoinData of fancy2DataAll) {
          if (fancy2DataObj[i].length >= 22) {
            i++;
            fancy2DataObj[i] = [];
          }
          fancy2DataObj[i].push(itemJoinData);
        }
        // FANCY2 START
        const fancy2Apis = [];
        for (let key in fancy2DataObj) {
          let fancy2Data = fancy2DataObj[key];
          let fancy2Ids = fancy2Data.map((item) => item.fancyid).join(',');
          if (fancy2Ids) {
            fancy2Apis.push(axios.get(url3 + fancy2Ids));
          }
        }
        const fancy2ApiRes = await Promise.all(fancy2Apis);
        for (let apiRes of fancy2ApiRes) {
          let data = apiRes.data.data;
          for (let item of data.items) {
            if (!item) continue;
            const data = fancy2DataAll.filter(
              (i) => i.fancyid == item.market_id,
            );
            const Fancy2 = [];
            Fancy2.push({
              mid: '',
              t: '',
              sid: item.market_id,
              nation: item.title.toUpperCase(),
              b1: item.yes.toString(),
              bs1: item.yes_rate.toString(),
              l1: item.no.toString(),
              ls1: item.no_rate.toString(),
              gstatus: item.suspended
                ? 'SUSPENDED'
                : item.ballRunning
                ? 'BALL RUNNING'
                : !item.suspended && !item.ballRunning
                ? ''
                : '0',
            });
            const eventData: any = await this.cacheManager.get(
              `eventId:${data[0].eventid}`,
            );
            if (eventData) {
              let prev = eventData.Fancy2.filter(
                (element) => element.sid != item.market_id,
              );
              eventData.Fancy2 = [...prev, ...Fancy2];
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                eventData,
              );
            } else {
              Data_Object.Fancy2 = Fancy2;
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                Data_Object,
              );
            }
            Data_Object = {
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
          }
        }
        // FANCY2 --- END

        // FANCY3 --- START
        // let Data_Object = {
        //   Odds: [],
        //   Bookmaker: [],
        //   Fancy: [],
        //   Fancy2: [],
        //   Fancy3: [],
        //   Khado: [],
        //   Ball: [],
        //   Meter: [],
        //   OddEven: [],
        // };

        let fancy3DataAll = joinData.filter((item) => item.oddstype == 'F3');
        const fancy3DataObj = { 0: [] };
        let j = 0;
        for (let itemJoinData of fancy3DataAll) {
          if (fancy3DataObj[j].length >= 22) {
            j++;
            fancy3DataObj[j] = [];
          }
          fancy3DataObj[j].push(itemJoinData);
        }

        const fancy3Apis = [];
        for (let key in fancy3DataObj) {
          let fancy3Data = fancy3DataObj[key];

          let fancy3Ids = fancy3Data.map((item) => item.fancyid).join(',');

          if (fancy3Ids) {
            fancy3Apis.push(axios.get(url3 + fancy3Ids));
          }
        }
        const fancy3ApiRes = await Promise.all(fancy3Apis);
        for (let apiRes of fancy3ApiRes) {
          let data = apiRes.data.data;
          for (let item of data.items) {
            if (!item) continue;

            const data = fancy3DataAll.filter(
              (j) => j.fancyid == item.market_id,
            );
            const Fancy3 = [];
            Fancy3.push({
              mid: '',
              t: '',
              sid: item.market_id,
              nation: item.title.toUpperCase(),
              b1: item.back.toString(),
              bs1: item.yes_rate.toString(),
              l1: item.lay.toString(),
              ls1: item.no_rate.toString(),
              gstatus: item.suspended
                ? 'SUSPENDED'
                : item.ballRunning
                ? 'BALL RUNNING'
                : !item.suspended && !item.ballRunning
                ? ''
                : '0',
            });
            const eventData: any = await this.cacheManager.get(
              `eventId:${data[0].eventid}`,
            );
            if (eventData) {
              let prev = eventData.Fancy3.filter(
                (element) => element.sid != item.market_id,
              );
              eventData.Fancy3 = [...prev, ...Fancy3];
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                eventData,
              );
            } else {
              Data_Object.Fancy3 = Fancy3;
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                Data_Object,
              );
            }
            // Data_Object = {
            //   Odds: [],
            //   Bookmaker: [],
            //   Fancy: [],
            //   Fancy2: [],
            //   Fancy3: [],
            //   Khado: [],
            //   Ball: [],
            //   Meter: [],
            //   OddEven: [],
            // };
          }
        }
        // FANCY3 --- END

        // ODD EVEN --- START
        let oddEvenDataAll = joinData.filter((item) => item.oddstype == 'OE');

        const oddEvenDataObj = { 0: [] };
        let k = 0;
        for (let itemJoinData of oddEvenDataAll) {
          if (oddEvenDataObj[k].length >= 22) {
            k++;
            oddEvenDataObj[k] = [];
          }
          oddEvenDataObj[k].push(itemJoinData);
        }

        const oddEvenApis = [];
        for (let key in oddEvenDataObj) {
          let oddEvenData = oddEvenDataObj[key];

          let oddEvenIds = oddEvenData.map((item) => item.fancyid).join(',');

          if (oddEvenIds) {
            oddEvenApis.push(axios.get(url3 + oddEvenIds));
          }
        }
        const oddEvenApiRes = await Promise.all(oddEvenApis);
        for (let apiRes of oddEvenApiRes) {
          let data = apiRes.data.data;
          for (let item of data.items) {
            if (!item) continue;

            const data = oddEvenDataAll.filter(
              (k) => k.fancyid == item.market_id,
            );
            const OddEven = [];
            OddEven.push({
              mid: '',
              t: '',
              sid: item.market_id,
              nation: item.title.toUpperCase(),
              b1: item.odd.toString(),
              bs1: item.yes_rate.toString(),
              l1: item.even.toString(),
              ls1: item.no_rate.toString(),
              gstatus: item.suspended
                ? 'SUSPENDED'
                : item.ballRunning
                ? 'BALL RUNNING'
                : !item.suspended && !item.ballRunning
                ? ''
                : '0',
            });
            const eventData: any = await this.cacheManager.get(
              `eventId:${data[0].eventid}`,
            );
            if (eventData) {
              let prev = eventData.OddEven.filter(
                (element) => element.sid != item.market_id,
              );
              eventData.OddEven = [...prev, ...OddEven];
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                eventData,
              );
            } else {
              Data_Object.OddEven = OddEven;
              await this.cacheManager.set(
                `eventId:${data[0].eventid}`,
                Data_Object,
              );
            }
            // ODD EVEN --- END
          }
        }
      } catch (error) {
        console.log(error);
        this.IsRunning = false;
      }
      this.IsRunning = false;
      this.logger.debug('End Cron');
    }
  }
}
