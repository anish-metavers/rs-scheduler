import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { Op, QueryTypes } from 'sequelize';
import * as moment from 'moment';
import { Console } from 'console';

@Injectable()
export class CronNewService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private readonly logger = new Logger(CronNewService.name);

  isRunning = false;
  marketIdUrl = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';
  joinDataToRedis = {};
  dataToInsertInRedis = [];
  timer = 60;
  joinData;
  joinDataFancy;
  @Cron('*/1 * * * * *')
  async handleCron() {
    if (!this.isRunning) {
      this.logger.debug('Redis New Cron Running');
      this.isRunning = true;
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
      this.joinDataToRedis = {};
      if (this.timer == 60) {
        // console.log(' MySql Query time', new Date());
        this.timer = 0;
        let query = `
        select TE.id as t_event_id, TM.id as t_market_id ,
        TE.eventid,TM.marketid,TM.max_bet_rate,TM.min_bet_rate,TM.betdelay,TM.minbet,TM.maxbet,TM.marketname,TM.startdate from t_event AS TE
        inner join t_market AS TM
        ON TE.eventid=TM.eventid
        where TE.isactive = 1 and TE.sportid = 4 and TM.isactive = 1`;

        let queryFancy = `select TE.id as t_event_id, TM.id as t_matchfancy_id , TE.eventid,
         TM.fancyid,TM.oddstype,TM.minbet,TM.maxbet,TM.betdelay from t_event AS TE inner join t_matchfancy AS TM ON TE.eventid=TM.eventid
         where TE.isactive = 1 and TE.sportid = 4 and TM.isactive = 1`;
        console.time('Query time');
        [this.joinData, this.joinDataFancy] = await Promise.all([
          global.DB.sequelize.query(query, {
            type: QueryTypes.SELECT,
          }),
          global.DB.sequelize.query(queryFancy, {
            type: QueryTypes.SELECT,
          }),
        ]);
        console.timeEnd('Query time');
      }

      this.joinData.map((item) => {
        this.joinDataToRedis[item.eventid] = {
          ...this.joinDataToRedis[item.eventid],
          [item.marketid]: item.marketname,
        };
      });

      this.joinDataFancy.map((item) => {
        this.joinDataToRedis[item.eventid] = {
          ...this.joinDataToRedis[item.eventid],
          [item.fancyid]: item.oddstype,
        };
      });
      // console.log(this.joinDataToRedis);
      const data: any = [];

      for (const eventId in this.joinDataToRedis) {
        data.push(eventId);
        data.push(this.joinDataToRedis[eventId]);
      }
      await this.cacheManager.store.mset.apply(null, [...data, {}]);

      console.time('Total Time');

      // await this.matchOddFunc({ joinData, Data_Object });
      // await this.bookMakerFunc({ joinData, Data_Object });
      // await this.fancy2Func({ joinData: joinDataFancy, Data_Object });
      // await this.fancy3Func({ joinData: joinDataFancy, Data_Object });
      // await this.oddEvenFunc({ joinData: joinDataFancy, Data_Object });

      await Promise.all([
        this.matchOddFunc({ joinData: this.joinData, Data_Object }),
        this.bookMakerFunc({ joinData: this.joinData, Data_Object }),
        this.fancy2Func({ joinData: this.joinDataFancy, Data_Object }),
        this.fancy3Func({ joinData: this.joinDataFancy, Data_Object }),
        this.oddEvenFunc({ joinData: this.joinDataFancy, Data_Object }),
      ]);
      // console.log(this.dataToInsertInRedis.length);
      await this.cacheManager.store.mset.apply(null, [
        ...this.dataToInsertInRedis,
        {},
      ]);
      this.timer += 1;
      this.dataToInsertInRedis = [];

      console.timeEnd('Total Time');
      this.isRunning = false;
    }
  }

  matchOddFunc = async function ({ joinData, Data_Object }) {
    try {
      let matchOddDataAll = joinData.filter(
        (item) =>
          item.marketname == 'Match Odds' ||
          item.marketname == 'Completed Match' ||
          item.marketname == 'Tied Match',
      );
      const matchOddsDataObj = { 0: [] };

      const matchOddsApis = [];
      let selectionQueryIds = [];
      // const redisDataPromise = [];
      // const redisPushPromise = [];
      let i = 0;
      for (let itemJoinData of matchOddDataAll) {
        if (matchOddsDataObj[i].length >= 20) {
          i++;
          matchOddsDataObj[i] = [];
        }
        matchOddsDataObj[i].push(itemJoinData);
      }

      for (let key in matchOddsDataObj) {
        let matchOddData = matchOddsDataObj[key];
        let matchOddIds = matchOddData.map((item) => item.marketid).join(',');
        if (matchOddIds) {
          matchOddsApis.push(axios.get(this.marketIdUrl + matchOddIds));
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

          selectionQueryIds = [
            ...selectionQueryIds,
            ...item.odds.map((item) => item.selectionId),
          ];
        }
      }

      const [allSelectionData] = await Promise.all([
        global.DB.T_selectionid.findAll({
          where: {
            selectionid: {
              [Op.in]: selectionQueryIds,
            },
          },
        }),
        // ...redisDataPromise,
      ]);

      for (let apiRes of matchOddsApiRes) {
        let data = apiRes.data.data;
        for (let item of data.items) {
          if (!item) continue;

          const data = matchOddDataAll.filter(
            (i) => i.marketid == item.market_id,
          );

          const runners = [];

          // console.log(item.odds);

          for (let oddItem of item.odds) {
            const selection = allSelectionData.filter(
              (item) => item.selectionid == oddItem.selectionId,
            );
            if (selection && selection.length > 0) {
              runners.push({
                name: selection[0].runner_name,
                selectionId: oddItem.selectionId.toString(),
                ex: {
                  availableToBack: [
                    {
                      price: (!oddItem.backPrice1||oddItem.backPrice1=='-')
                        ? 0.0
                        : Number(oddItem.backPrice1),
                      size: !oddItem.backSize1
                        ? 0.0
                        : parseFloat(
                            String(oddItem.backSize1).replace(/,/g, ''),
                          ),
                    },
                    {
                      price: (!oddItem.backPrice2||oddItem.backPrice2=='-')
                        ? 0.0
                        : Number(oddItem.backPrice2),
                      size: !oddItem.backSize2
                        ? 0.0
                        : parseFloat(
                            String(oddItem.backSize2).replace(/,/g, ''),
                          ),
                    },
                    {
                      price: (!oddItem.backPrice3||oddItem.backPrice3=='-')
                        ? 0.0
                        : Number(oddItem.backPrice3),
                      size: !oddItem.backSize3
                        ? 0.0
                        : parseFloat(
                            String(oddItem.backSize3).replace(/,/g, ''),
                          ),
                    },
                  ],
                  availableToLay: [
                    {
                      price: (!oddItem.layPrice1||oddItem.layPrice1=='-')
                        ? 0.0
                        : Number(oddItem.layPrice1),
                      size: !oddItem.laySize1
                        ? 0.0
                        : parseFloat(
                            String(oddItem.laySize1).replace(/,/g, ''),
                          ),
                    },
                    {
                      price: (!oddItem.layPrice2||oddItem.layPrice2=='-')
                        ? 0.0
                        : Number(oddItem.layPrice2),
                      size: !oddItem.laySize2
                        ? 0.0
                        : parseFloat(
                            String(oddItem.laySize2).replace(/,/g, ''),
                          ),
                    },
                    {
                      price: (!oddItem.layPrice3||oddItem.layPrice3=='-')
                        ? 0.0
                        : Number(oddItem.layPrice3),
                      size: !oddItem.laySize3
                        ? 0.0
                        : parseFloat(
                            String(oddItem.laySize3).replace(/,/g, ''),
                          ),
                    },
                  ],
                },
              });
            }
          }
          var currentTime = new Date();
          var currentOffset = currentTime.getTimezoneOffset();
          var ISTOffset = 330; // IST offset UTC +5:30
          var ISTTime = new Date(
            currentTime.getTime() + (ISTOffset + currentOffset) * 60000,
          );
          let dateTime = moment(ISTTime).format('YYYY-MM-DD HH:mm:ss');

          const OddsObj = {
            runners,
            marketId: item.market_id,
            isMarketDataDelayed: false,
            status: item.status,
            inplay: item.inplay,
            // lastMatchTime: new Date(Number(item.lastUpdatedTime * 1000)),
            Name: data[0].marketname,
            eventTime: data[0].startdate,
            lastMatchTime: dateTime,
            maxBetRate: data[0].max_bet_rate,
            minBetRate: data[0].min_bet_rate,
            betDelay: data[0].betdelay,
            maxBet: data[0].maxbet,
            minBet: data[0].minbet,
          };

          const key = `${data[0].eventid}::${data[0].marketid}`;
          const value = OddsObj;

          this.dataToInsertInRedis.push(key);
          this.dataToInsertInRedis.push(value);
        }
      }
      // await Promise.all(redisPushPromise);
    } catch (error) {
      console.log('Match Odds :', error);
    }
  };

  bookMakerFunc = async function ({ joinData, Data_Object }) {
    try {
      const bookMakersApis = [];

      // const redisDataPromise = [];
      // const redisPushPromise = [];
      let i = 0;

      let bookMakersDataAll = joinData.filter(
        (item) =>
          item.marketname == 'Bookmaker' ||
          item.marketname == 'Bookmaker 0%Comm' ||
          item.marketname == 'TOSS',
      );
      const bookMakersDataObj = { 0: [] };
      for (let itemJoinData of bookMakersDataAll) {
        if (bookMakersDataObj[i].length >= 20) {
          i++;
          bookMakersDataObj[i] = [];
        }
        bookMakersDataObj[i].push(itemJoinData);
      }

      for (let key in bookMakersDataObj) {
        let bookMakerData = bookMakersDataObj[key];
        let bookMakerIds = bookMakerData.map((item) => item.marketid).join(',');

        if (bookMakerIds) {
          bookMakersApis.push(axios.get(this.marketIdUrl + bookMakerIds));
        }
      }

      const bookMakerApiRes = await Promise.all(bookMakersApis);
      // const redisDataRes = await Promise.all(redisDataPromise);
      for (let apiRes of bookMakerApiRes) {
        let data = apiRes.data.data;
        for (let item of data.items) {
          if (!item) continue;

          const data = bookMakersDataAll.filter(
            (i) => i.marketid == item.market_id,
          );

          const Bookmaker = [];
          if (item?.runners) {
            for (let runnerItem of item.runners) {
              // console.log(runnerItem.runner);
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
                maxBetRate: data[0].max_bet_rate,
                minBetRate: data[0].min_bet_rate,
                betDelay: data[0].betdelay,
                maxBet: data[0].maxbet,
                minBet: data[0].minbet,
              });
            }

            const key = `${data[0].eventid}::${data[0].marketid}`;
            const value = Bookmaker;

            this.dataToInsertInRedis.push(key);
            this.dataToInsertInRedis.push(value);
          }
        }
      }
    } catch (error) {
      console.log('Bookmaker :', error);
    }
  };

  fancy2Func = async function ({ joinData, Data_Object }) {
    try {
      const fancy2Apis = [];

      let i = 0;

      let fancy2DataAll = joinData.filter((item) => item.oddstype == 'F2');
      const fancy2DataObj = { 0: [] };
      for (let itemJoinData of fancy2DataAll) {
        if (fancy2DataObj[i].length >= 20) {
          i++;
          fancy2DataObj[i] = [];
        }
        fancy2DataObj[i].push(itemJoinData);
      }

      for (let key in fancy2DataObj) {
        let fancy2Data = fancy2DataObj[key];
        let fancy2Ids = fancy2Data.map((item) => item.fancyid).join(',');

        if (fancy2Ids) {
          // console.log('FANCY2 URL:', this.marketIdUrl + fancy2Ids, new Date());
          fancy2Apis.push(axios.get(this.marketIdUrl + fancy2Ids));
        }
      }

      const fancy2ApiRes = await Promise.all(fancy2Apis);

      for (let apiRes of fancy2ApiRes) {
        let data = apiRes.data.data;
        if (data)
          for (let item of data.items) {
            // console.log(item)
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
              maxBet: data[0].maxbet,
              minBet: data[0].minbet,
              betDelay: data[0].betdelay,
            });
            const key = `${data[0].eventid}::${data[0].fancyid}`;
            const value = Fancy2;

            this.dataToInsertInRedis.push(key);
            this.dataToInsertInRedis.push(value);
          }
      }
    } catch (error) {
      console.log('Fancy2 :', error);
    }

    // let fancy2DataAll = joinData.filter((item) => item.oddstype == 'F2');

    // const fancy2DataObj = { 0: [] };
    // let i = 0;
    // for (let itemJoinData of fancy2DataAll) {
    //   if (fancy2DataObj[i].length >= 50) {
    //     i++;
    //     fancy2DataObj[i] = [];
    //   }
    //   fancy2DataObj[i].push(itemJoinData);
    // }

    // for (let key in fancy2DataObj) {
    //   let fancy2Data = fancy2DataObj[key];
    //   let fancy2Ids = fancy2Data.map((item) => item.fancyid).join(',');
    //   if (fancy2Ids) {
    //     fancy2Apis.push(axios.get(this.marketIdUrl + fancy2Ids));
    //   }
    // }
    // const fancy2ApiRes = await Promise.all(fancy2Apis);

    // for (let apiRes of fancy2ApiRes) {
    //   let data = apiRes.data.data;
    //   for (let item of data.items) {
    //     if (!item) continue;
    //     const data = fancy2DataAll.filter((i) => i.fancyid == item.market_id);

    //     const redisGetFunc = async () => {
    //       const value = await this.cacheManager.get(
    //         `eventId:${data[0].eventid}`,
    //       );
    //       return {
    //         value,
    //         key: `eventId:${data[0].eventid}`,
    //       };
    //     };
    //     redisDataPromise.push(redisGetFunc());
    //   }
    // }
    // const redisDataRes = await Promise.all(redisDataPromise);

    // for (let apiRes of fancy2ApiRes) {
    //   let data = apiRes.data.data;
    //   for (let item of data.items) {
    //     if (!item) continue;
    //     const data = fancy2DataAll.filter((i) => i.fancyid == item.market_id);
    //     const Fancy2 = [];
    //     Fancy2.push({
    //       mid: '',
    //       t: '',
    //       sid: item.market_id,
    //       nation: item.title.toUpperCase(),
    //       b1: item.yes.toString(),
    //       bs1: item.yes_rate.toString(),
    //       l1: item.no.toString(),
    //       ls1: item.no_rate.toString(),
    //       gstatus: item.suspended
    //         ? 'SUSPENDED'
    //         : item.ballRunning
    //         ? 'BALL RUNNING'
    //         : !item.suspended && !item.ballRunning
    //         ? ''
    //         : '0',
    //     });
    //     const eventData: any = redisDataRes.filter(
    //       (i) => i.key == `eventId:${data[0].eventid}`,
    //     )[0].value;

    //     if (eventData) {
    //       let prev = eventData.Fancy2.filter(
    //         (element) => element.sid != item.market_id,
    //       );
    //       eventData.Fancy2 = [...prev, ...Fancy2];
    //       redisPushPromise.push(
    //         this.cacheManager.set(`eventId:${data[0].eventid}`, eventData),
    //       );
    //     } else {
    //       Data_Object.Fancy2 = Fancy2;
    //       redisPushPromise.push(
    //         this.cacheManager.set(`eventId:${data[0].eventid}`, Data_Object),
    //       );
    //     }
    //     Data_Object = {
    //       Odds: [],
    //       Bookmaker: [],
    //       Fancy: [],
    //       Fancy2: [],
    //       Fancy3: [],
    //       Khado: [],
    //       Ball: [],
    //       Meter: [],
    //       OddEven: [],
    //     };
    //   }
    // }
    // await Promise.all(redisPushPromise);
    // console.timeEnd('fancy2Func time');
  };
  fancy3Func = async function ({ joinData, Data_Object }) {
    try {
      const fancy3Apis = [];
      let i = 0;

      let fancy3DataAll = joinData.filter((item) => item.oddstype == 'F3');
      const fancy3DataObj = { 0: [] };
      for (let itemJoinData of fancy3DataAll) {
        if (fancy3DataObj[i].length >= 20) {
          i++;
          fancy3DataObj[i] = [];
        }
        fancy3DataObj[i].push(itemJoinData);
      }

      for (let key in fancy3DataObj) {
        let fancy3Data = fancy3DataObj[key];
        let fancy3Ids = fancy3Data.map((item) => item.fancyid).join(',');

        if (fancy3Ids) {
          // console.log('FANCY3 URL : ', this.marketIdUrl + fancy3Ids, new Date());
          fancy3Apis.push(axios.get(this.marketIdUrl + fancy3Ids));
        }
      }
      const fancy3ApiRes = await Promise.all(fancy3Apis);

      for (let apiRes of fancy3ApiRes) {
        let data = apiRes.data.data;
        for (let item of data.items) {
          if (!item) continue;

          const data = fancy3DataAll.filter((i) => i.fancyid == item.market_id);
          const Fancy3 = [];
          Fancy3.push({
            mid: '',
            t: '',
            sid: item.market_id,
            nation: item.title.toUpperCase(),
            b1: item.back,
            bs1: item.yes_rate,
            l1: item.lay,
            ls1: item.no_rate,
            gstatus: item.suspended
              ? 'SUSPENDED'
              : item.ballRunning
              ? 'BALL RUNNING'
              : !item.suspended && !item.ballRunning
              ? ''
              : '0',
            maxBet: data[0].maxbet,
            minBet: data[0].minbet,
            betDelay: data[0].betdelay,
          });
          const key = `${data[0].eventid}::${data[0].fancyid}`;
          const value = Fancy3;

          this.dataToInsertInRedis.push(key);
          this.dataToInsertInRedis.push(value);
        }
      }
    } catch (error) {
      console.log('Fancy3 :', error);
    }
  };
  oddEvenFunc = async function ({ joinData, Data_Object }) {
    try {
      const oddEvenApis = [];

      let oddEvenDataAll = joinData.filter((item) => item.oddstype == 'OE');

      const oddEvenDataObj = { 0: [] };
      let i = 0;
      for (let itemJoinData of oddEvenDataAll) {
        if (oddEvenDataObj[i].length >= 20) {
          i++;
          oddEvenDataObj[i] = [];
        }
        oddEvenDataObj[i].push(itemJoinData);
      }

      for (let key in oddEvenDataObj) {
        let oddEvenData = oddEvenDataObj[key];
        let oddEvenIds = oddEvenData.map((item) => item.fancyid).join(',');
        if (oddEvenIds) {
          // console.log('OE URL: ', this.marketIdUrl + oddEvenIds, new Date());
          oddEvenApis.push(axios.get(this.marketIdUrl + oddEvenIds));
        }
      }
      const oddEvenApiRes = await Promise.all(oddEvenApis);

      for (let apiRes of oddEvenApiRes) {
        let data = apiRes.data.data;
        for (let item of data.items) {
          // console.log(item)
          if (!item) continue;

          const data = oddEvenDataAll.filter(
            (i) => i.fancyid == item.market_id,
          );
          const OddEven = [];
          OddEven.push({
            mid: '',
            t: '',
            sid: item.market_id,
            nation: item.title.toUpperCase(),
            b1: item.back,
            bs1: item.yes_rate,
            l1: item.lay,
            ls1: item.no_rate,
            gstatus: item.suspended
              ? 'SUSPENDED'
              : item.ballRunning
              ? 'BALL RUNNING'
              : !item.suspended && !item.ballRunning
              ? ''
              : '0',
            maxBet: data[0].maxbet,
            minBet: data[0].minbet,
            betDelay: data[0].betdelay,
          });
          const key = `${data[0].eventid}::${data[0].fancyid}`;
          const value = OddEven;

          this.dataToInsertInRedis.push(key);
          this.dataToInsertInRedis.push(value);
        }
      }
    } catch (error) {
      console.log('OE :', error);
    }
  };
}
