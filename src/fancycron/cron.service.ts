import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { Op, QueryTypes } from 'sequelize';
import * as moment from 'moment';

@Injectable()
export class FancyCronService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private readonly logger = new Logger(FancyCronService.name);

  IsRunning = false;
  // @Cron('*/1 * * * * *')
  async handleCron() {
    if (!this.IsRunning) {
      console.time('Total Time');
      const url3 = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';
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
      let query = `
      select TE.id as t_event_id, TM.id as t_market_id ,
      TE.eventid,TM.marketid,TM.marketname,TM.startdate from t_event AS TE
      inner join t_market AS TM
      ON TE.eventid=TM.eventid
      where TE.isactive = 1 and TE.sportid = 4 and TM.isactive = 1`;
      const joinData = await global.DB.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
      // const bookMakerFunc = async ({ joinData, i, Data_Object }) => {
      //   console.time('Bookmaker redis store time');
      //   let bookMakersDataAll = joinData.filter(
      //     (item) => item.marketname == 'Bookmaker' || item.marketname == 'TOSS',
      //   );
      //   const bookMakersDataObj = { 0: [] };
      //   i = 0;
      //   for (let itemJoinData of bookMakersDataAll) {
      //     if (bookMakersDataObj[i].length >= 5) {
      //       i++;
      //       bookMakersDataObj[i] = [];
      //     }
      //     bookMakersDataObj[i].push(itemJoinData);
      //   }
      //   const bookMakersApis = [];
      //   for (let key in bookMakersDataObj) {
      //     let bookMakerData = bookMakersDataObj[key];
      //     let bookMakerIds = bookMakerData
      //       .map((item) => item.marketid)
      //       .join(',');

      //     if (bookMakerIds) {
      //       bookMakersApis.push(axios.get(url3 + bookMakerIds));
      //     }
      //   }
      //   console.time('BookMaker API Call:');
      //   const bookMakerApiRes = await Promise.all(bookMakersApis);
      //   console.timeEnd('BookMaker API Call:');
      //   for (let apiRes of bookMakerApiRes) {
      //     let data = apiRes.data.data;
      //     for (let item of data.items) {
      //       if (!item) continue;

      //       const data = bookMakersDataAll.filter(
      //         (i) => i.marketid == item.market_id,
      //       );
      //       const Bookmaker = [];
      //       for (let runnerItem of item.runners) {
      //         const selection = await global.DB.T_selectionid.findOne({
      //           where: { selectionid: runnerItem.secId },
      //         });
      //         if (selection) {
      //           Bookmaker.push({
      //             mid: item.market_id,
      //             t: item.title,
      //             sid: runnerItem.secId.toString(),
      //             nation: runnerItem.runner,
      //             b1: runnerItem.back.toString(),
      //             bs1: runnerItem.backSize,
      //             l1: runnerItem.lay.toString(),
      //             ls1: runnerItem.laySize,
      //             gstatus: runnerItem.suspended
      //               ? 'SUSPENDED'
      //               : runnerItem.ballRunning
      //               ? 'BALL RUNNING'
      //               : !runnerItem.suspended && !runnerItem.ballRunning
      //               ? ''
      //               : '0',
      //           });
      //         } else {
      //           // console.log('No Selection', data);
      //         }
      //       }

      //       const eventData: any = await this.cacheManager.get(
      //         `eventId:${data[0].eventid}`,
      //       );
      //       if (eventData) {
      //         let prev = eventData.Bookmaker.filter(
      //           (element) => element.mid != item.market_id,
      //         );
      //         eventData.Bookmaker = [...prev, ...Bookmaker];
      //         await this.cacheManager.set(
      //           `eventId:${data[0].eventid}`,
      //           eventData,
      //         );
      //       } else {
      //         Data_Object.Bookmaker = Bookmaker;
      //         await this.cacheManager.set(
      //           `eventId:${data[0].eventid}`,
      //           Data_Object,
      //         );
      //       }
      //       Data_Object = {
      //         Odds: [],
      //         Bookmaker: [],
      //         Fancy: [],
      //         Fancy2: [],
      //         Fancy3: [],
      //         Khado: [],
      //         Ball: [],
      //         Meter: [],
      //         OddEven: [],
      //       };
      //     }
      //   }
      //   console.timeEnd('Bookmaker redis store time');
      // };
      // const matchOddFunc = async ({
      //   matchOddsDataObj,
      //   url3,
      //   matchOddDataAll,
      // }) => {
      //   // MATCH ODDS --- STARTS
      //   console.time('Match Odds redis store time ');
      //   const matchOddsApis = [];
      //   for (let key in matchOddsDataObj) {
      //     let matchOddData = matchOddsDataObj[key];
      //     let matchOddIds = matchOddData.map((item) => item.marketid).join(',');
      //     if (matchOddIds) {
      //       matchOddsApis.push(axios.get(url3 + matchOddIds));
      //     }
      //   }
      //   console.time('Match Odds API Call:');
      //   const matchOddsApiRes = await Promise.all(matchOddsApis);
      //   console.timeEnd('Match Odds API Call:');
      //   for (let apiRes of matchOddsApiRes) {
      //     let data = apiRes.data.data;
      //     for (let item of data.items) {
      //       if (!item) continue;
      //       const data = matchOddDataAll.filter(
      //         (i) => i.marketid == item.market_id,
      //       );
      //       const runners = [];
      //       // console.time('Selection Cron start Time');
      //       const allSelectionData = await global.DB.T_selectionid.findAll({
      //         where: {
      //           selectionid: {
      //             [Op.in]: item.odds.map((item) => item.selectionId),
      //           },
      //         },
      //       });
      //       // console.timeEnd('Selection Cron end Time');
      //       for (let oddItem of item.odds) {
      //         const selection = allSelectionData.filter(
      //           (item) => item.selectionid === oddItem.selectionId,
      //         );

      //         if (selection && selection.length > 0) {
      //           runners.push({
      //             name: selection[0].runner_name,
      //             selectionId: oddItem.selectionId.toString(),
      //             ex: {
      //               availableToBack: [
      //                 {
      //                   price: Number(oddItem.backPrice1),
      //                   size: parseFloat(
      //                     String(oddItem.backSize1).replace(/,/g, ''),
      //                   ),
      //                 },
      //                 {
      //                   price: Number(oddItem.backPrice2),
      //                   size: parseFloat(
      //                     String(oddItem.backSize2).replace(/,/g, ''),
      //                   ),
      //                 },
      //                 {
      //                   price: Number(oddItem.backPrice3),
      //                   size: parseFloat(
      //                     String(oddItem.backSize3).replace(/,/g, ''),
      //                   ),
      //                 },
      //               ],
      //               availableToLay: [
      //                 {
      //                   price: Number(oddItem.layPrice1),
      //                   size: parseFloat(
      //                     String(oddItem.laySize1).replace(/,/g, ''),
      //                   ),
      //                 },
      //                 {
      //                   price: Number(oddItem.layPrice2),
      //                   size: parseFloat(
      //                     String(oddItem.laySize2).replace(/,/g, ''),
      //                   ),
      //                 },
      //                 {
      //                   price: Number(oddItem.layPrice3),
      //                   size: parseFloat(
      //                     String(oddItem.laySize3).replace(/,/g, ''),
      //                   ),
      //                 },
      //               ],
      //             },
      //           });
      //         }
      //       }
      //       var currentTime = new Date();

      //       var currentOffset = currentTime.getTimezoneOffset();

      //       var ISTOffset = 330; // IST offset UTC +5:30

      //       var ISTTime = new Date(
      //         currentTime.getTime() + (ISTOffset + currentOffset) * 60000,
      //       );

      //       let dateTime = moment(ISTTime).format('YYYY-MM-DD HH:mm:ss');
      //       // ISTTime now represents the time in IST coordinates

      //       const Odds = [
      //         {
      //           runners,
      //           marketId: item.market_id,
      //           isMarketDataDelayed: false,
      //           status: item.status,
      //           inplay: item.inplay,
      //           lastMatchTime: new Date(Number(item.lastUpdatedTime * 1000)),
      //           Name: data[0].marketname,
      //           eventTime: data[0].startdate,
      //           lastMatchTime1: dateTime,
      //         },
      //       ];
      //       const eventData: any = await this.cacheManager.get(
      //         `eventId:${data[0].eventid}`,
      //       );
      //       if (eventData) {
      //         let prev = eventData.Odds.filter(
      //           (element) => element.marketId != item.market_id,
      //         );
      //         eventData.Odds = [...prev, ...Odds];
      //         await this.cacheManager.set(
      //           `eventId:${data[0].eventid}`,
      //           eventData,
      //         );
      //       } else {
      //         Data_Object.Odds = Odds;
      //         await this.cacheManager.set(
      //           `eventId:${data[0].eventid}`,
      //           Data_Object,
      //         );
      //       }
      //       Data_Object = {
      //         Odds: [],
      //         Bookmaker: [],
      //         Fancy: [],
      //         Fancy2: [],
      //         Fancy3: [],
      //         Khado: [],
      //         Ball: [],
      //         Meter: [],
      //         OddEven: [],
      //       };
      //     }
      //   }
      //   console.timeEnd('Match Odds redis store time ');
      //   // MATCH ODDS --- ENDS
      // };

      console.time('total time');
      console.time('Market query time');
      this.IsRunning = true;
      try {
        this.logger.debug('Start Cron');
        console.timeEnd('Market query time');

        let matchOddDataAll = joinData.filter(
          (item) =>
            item.marketname == 'Match Odds' ||
            item.marketname == 'Completed Match' ||
            item.marketname == 'Tied Match',
        );
        const matchOddsDataObj = { 0: [] };
        let i = 0;
        for (let itemJoinData of matchOddDataAll) {
          if (matchOddsDataObj[i].length >= 20) {
            i++;
            matchOddsDataObj[i] = [];
          }
          matchOddsDataObj[i].push(itemJoinData);
        }
        // // MATCH ODDS --- STARTS
        console.time('Match Odds redis store time ');
        const matchOddsApis = [];
        for (let key in matchOddsDataObj) {
          let matchOddData = matchOddsDataObj[key];
          let matchOddIds = matchOddData.map((item) => item.marketid).join(',');
          if (matchOddIds) {
            matchOddsApis.push(axios.get(url3 + matchOddIds));
          }
        }
        console.time('Match Odds API Call:');
        const matchOddsApiRes = await Promise.all(matchOddsApis);
        console.timeEnd('Match Odds API Call:');
        for (let apiRes of matchOddsApiRes) {
          let data = apiRes.data.data;
          for (let item of data.items) {
            if (!item) continue;

            const data = matchOddDataAll.filter(
              (i) => i.marketid == item.market_id,
            );

            const runners = [];
            console.time('Selection Cron start Time');
            const allSelectionData = await global.DB.T_selectionid.findAll({
              where: {
                selectionid: {
                  [Op.in]: item.odds.map((item) => item.selectionId),
                },
              },
            });
            console.timeEnd('Selection Cron start Time');
            for (let oddItem of item.odds) {
              const selection = allSelectionData.filter(
                (item) => item.selectionid === oddItem.selectionId,
              );

              if (selection && selection.length > 0) {
                runners.push({
                  name: selection[0].runner_name,
                  selectionId: oddItem.selectionId.toString(),
                  ex: {
                    availableToBack: [
                      {
                        price: Number(oddItem.backPrice1),
                        size: parseFloat(
                          String(oddItem.backSize1).replace(/,/g, ''),
                        ),
                      },
                      {
                        price: Number(oddItem.backPrice2),
                        size: parseFloat(
                          String(oddItem.backSize2).replace(/,/g, ''),
                        ),
                      },
                      {
                        price: Number(oddItem.backPrice3),
                        size: parseFloat(
                          String(oddItem.backSize3).replace(/,/g, ''),
                        ),
                      },
                    ],
                    availableToLay: [
                      {
                        price: Number(oddItem.layPrice1),
                        size: parseFloat(
                          String(oddItem.laySize1).replace(/,/g, ''),
                        ),
                      },
                      {
                        price: Number(oddItem.layPrice2),
                        size: parseFloat(
                          String(oddItem.laySize2).replace(/,/g, ''),
                        ),
                      },
                      {
                        price: Number(oddItem.layPrice3),
                        size: parseFloat(
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

            const Odds = [
              {
                runners,
                marketId: item.market_id,
                isMarketDataDelayed: false,
                status: item.status,
                inplay: item.inplay,
                lastMatchTime: new Date(Number(item.lastUpdatedTime * 1000)),
                Name: data[0].marketname,
                eventTime: data[0].startdate,
                lastMatchTime1: dateTime,
              },
            ];
            const eventData: any = await this.cacheManager.get(
              `eventId:${data[0].eventid}`,
            );
            if (eventData) {
              let prev = eventData.Odds.filter(
                (element) => element.marketId != item.market_id,
              );
              eventData.Odds = [...prev, ...Odds];
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
        console.timeEnd('Match Odds redis store time ');
        // // MATCH ODDS --- ENDS

        // BOOKMAKER --- STARTS
        console.time('Bookmaker redis store time');
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
        console.time('BookMaker API Call:');
        const bookMakerApiRes = await Promise.all(bookMakersApis);
        console.timeEnd('BookMaker API Call:');
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
                // console.log('No Selection', data);
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
        console.timeEnd('Bookmaker redis store time');
        // BOOKMAKER --- ENDS
      } catch (error) {
        console.log(error);
        this.IsRunning = false;
      }
      try {
        console.time('Matchfancy query time');
        const url3 = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';

        let query = `select TE.id as t_event_id, TM.id as t_matchfancy_id , TE.eventid,
         TM.fancyid,TM.oddstype from t_event AS TE inner join t_matchfancy AS TM ON TE.eventid=TM.eventid
	       where TE.isactive = 1 and TE.sportid = 4 and TM.isactive = 1`;

        const joinData = await global.DB.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });
        console.timeEnd('Matchfancy query time');
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
        console.time('Fancy2 API Call:');
        const fancy2ApiRes = await Promise.all(fancy2Apis);
        console.timeEnd('Fancy2 API Call:');
        console.time('Fancy2 redis store time');
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
        console.timeEnd('Fancy2 redis store time');
        // FANCY2 --- END

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
        console.time('fancy3 api call ');
        for (let key in fancy3DataObj) {
          let fancy3Data = fancy3DataObj[key];

          let fancy3Ids = fancy3Data.map((item) => item.fancyid).join(',');
          if (fancy3Ids) {
            fancy3Apis.push(axios.get(url3 + fancy3Ids));
          }
        }
        console.timeEnd('fancy3 api call ');
        console.time('fancy3 redis store time');
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
          }
        }
        console.timeEnd('fancy3 redis store time');
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
        console.time('OE api call');
        for (let key in oddEvenDataObj) {
          let oddEvenData = oddEvenDataObj[key];

          let oddEvenIds = oddEvenData.map((item) => item.fancyid).join(',');

          if (oddEvenIds) {
            oddEvenApis.push(axios.get(url3 + oddEvenIds));
          }
        }
        console.timeEnd('OE api call');
        console.time('OE redis store time');
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
        console.timeEnd('OE redis store time');
      } catch (error) {
        console.log(error);
        this.IsRunning = false;
      }
      this.logger.debug('End Cron');
      
      console.timeEnd('total time');
      
      console.timeEnd('Total Time');
      this.IsRunning = false;
    }
  }
}
