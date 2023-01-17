import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { QueryTypes } from 'sequelize';

@Injectable()
export class Cron4Service {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private readonly logger = new Logger(Cron4Service.name);

  @Cron('*/1 * * * * *')
  async handleCron() {
    try {
      this.logger.debug('Called when the current second is 45');
      let response1: any, data1: any, series: any;
      const url3 = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';

      let query = `
	    select TE.id as t_event_id, TM.id as t_market_id , 
      TE.eventid ,TM.marketid,TM.marketname from t_event AS TE 
	    inner join t_market AS TM
	    ON TE.eventid=TM.eventid
	    where TE.isactive = 1 and TE.sportid = 4 
	    and TM.isactive = 1;
	      `;

      const joinData = await global.DB.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const dataObj = { 0: [] };
      let i = 0;
      for (let itemJoinData of joinData) {
        if (dataObj[i].length >= 50) {
          i++;
          dataObj[i] = [];
        }
        dataObj[i].push(itemJoinData);
      }

      // console.log('joinData');

      for (let key of Object.keys(dataObj)) {
        let apiData = dataObj[key];
        //console.log('Key: ' + item, 'Length:', dataObj[item].length);
        //console.log(apiData);
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
        // console.log(apiData);
        let matchOddData = apiData.filter(
          (item) => item.marketname == 'Match Odds',
        );
        let matchOddIds = matchOddData.map((item) => item.marketid).join(',');

        if (matchOddIds) {
          try {
            response1 = await axios.get(url3 + matchOddIds);
          } catch (error) {
            console.log(error);
            continue;
          }
          let data = response1.data.data;
          // console.log(data);

          for (let item of data.items) {
            // console.log(matchOddData);
            // console.log(item);
            if (!item) continue;

            const data = matchOddData.filter(
              (i) => i.marketid == item.market_id,
            );
            // console.log(data);

            console.log('------------------------------');

            const runners = [];
            for (let oddItem of item.odds) {
              const selection = await global.DB.T_selectionid.findOne({
                where: { selectionid: oddItem.selectionId },
              });
              // Number("12132").toPrecision(2)
              if (selection) {
                // if (data[0].eventid == 31903522) console.log(oddItem);
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
            if (data[0].eventid == 31903522) {
              console.log(JSON.stringify(Odds));
            }

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
      }
      // for (let joinDataItem of joinData) {
      //   let Data_Object = {
      //     Odds: [],
      //     Bookmaker: [],
      //     Fancy: [],
      //     Fancy2: [],
      //     Fancy3: [],
      //     Khado: [],
      //     Ball: [],
      //     Meter: [],
      //     OddEven: [],
      //   };
      //   if (joinDataItem.marketname === 'Match Odds') {
      //     // continue;
      //     try {
      //       response1 = await axios.get(url3 + joinDataItem.marketid);
      //     } catch (error) {
      //       console.log(error);
      //       continue;
      //     }

      //     let data = response1.data.data;

      //     for (let item of data.items) {
      //       const runners = [];

      //       console.log('------------------------------');

      //       for (let oddItem of item.odds) {
      //         const selection = await global.DB.T_selectionid.findOne({
      //           where: { selectionid: oddItem.selectionId },
      //         });
      //         if (selection) {
      //           runners.push({
      //             name: selection.runner_name,
      //             selectionId: oddItem.selectionId.toString(),
      //             ex: {
      //               availableToBack: [
      //                 {
      //                   price: Number(oddItem.backPrice1),
      //                   size: Number(oddItem.backSize1),
      //                 },
      //                 {
      //                   price: Number(oddItem.backPrice2),
      //                   size: Number(oddItem.backSize2),
      //                 },
      //                 {
      //                   price: Number(oddItem.backPrice3),
      //                   size: Number(oddItem.backSize3),
      //                 },
      //               ],
      //               availableToLay: [
      //                 {
      //                   price: Number(oddItem.layPrice1),
      //                   size: Number(oddItem.laySize1),
      //                 },
      //                 {
      //                   price: Number(oddItem.layPrice2),
      //                   size: Number(oddItem.laySize2),
      //                 },
      //                 {
      //                   price: Number(oddItem.layPrice3),
      //                   size: Number(oddItem.laySize3),
      //                 },
      //               ],
      //             },
      //           });
      //         }
      //       }

      //       const Odds = [
      //         {
      //           runners,
      //           marketId: item.market_id,
      //           isMarketDataDelayed: false,
      //           status: item.status,
      //           inplay: item.inplay,
      //           lastMatchTime: new Date(Number(item.lastUpdatedTime * 1000)),
      //         },
      //       ];
      //       console.log(joinDataItem.eventid);

      //       const eventData: any = await this.cacheManager.get(
      //         `eventId:${joinDataItem.eventid}`,
      //       );
      //       if (eventData) {
      //         eventData.Odds = Odds;
      //       } else {
      //         Data_Object.Odds = Odds;
      //         await this.cacheManager.set(
      //           `eventId:${joinDataItem.eventid}`,
      //           Data_Object,
      //         );
      //       }
      //     }
      //   }
      //   // console.log(JSON.stringify(Data_Object));
      // }
    } catch (error) {
      console.log(error);
    }
  }
}
