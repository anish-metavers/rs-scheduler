import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class Cron1Service {
  private readonly logger = new Logger(Cron1Service.name);

  @Cron('*/1 * * * *')
  async handleCron() {
    //this.logger.debug('Called when the current second is 45');
    let response1: any, response2: any, data1: any, data2: any, series: any;
    const url1 = 'http://23.106.234.25:8081/sessionApi/eventList/4';
    const url2 = 'http://23.106.234.25:8081/sessionApi/virtualEventOdds/';
    //const res = await axios.get(url1);
    //console.log(res.data.marketId);
    try {
      response1 = await axios.get(url1);
      data1 = response1.data;
    } catch (error) {
      data1 = error.response.data;
    }
    // console.log(data);

    try {
      series = data1.data;

      //console.table(series);
      for (let item of series) {
        //console.table(item.event);

        let sportId = item.sportId;

        for (let event of item.event) {
          const find_eventid = await global.DB.T_event.findOne({
            where: { eventid: event.eventId },
          });
          if (find_eventid) {
            //this.logger.error('Event id all ready exist');
          } else if (
            !event.oddsData ||
            Object.keys(event.oddsData).length == 0
          ) {
            //this.logger.error('Odds data is not available');
          } else {
            const event_table = await global.DB.T_event.create({
              seriesid: event.compId,
              sportid: sportId,
              eventid: event.eventId,
              eventname: event.name,
              matchstartdate: new Date(Number(event.time)),
              open_date: new Date(Number(event.time)),
            });
          }
          const find_seriesid = await global.DB.T_series.findOne({
            where: { seriesid: event.compId },
          });
          if (find_seriesid) {
            // this.logger.error('Series id all ready exist');
          } else if (
            !event.oddsData ||
            Object.keys(event.oddsData).length == 0
          ) {
            // this.logger.error('Odds data is not available');
          } else {
            const series_table = await global.DB.T_series.create({
              seriesid: event.compId,
              seriesname: event.league,
            });
          }

          try {
            response2 = await axios.get(url2 + event.eventId);
          } catch (error) {
            data2 = error.response.data;
            //console.log(error);
          }
          data2 = response2.data.data;
          // console.table(data2.otherMarket);

          // OTHER MARKET
          for (let item of data2.otherMarket) {
            for (let otherMarket of item.runners) {
              const find_selectionid = await global.DB.T_selectionid.findOne({
                where: {
                  selectionid: otherMarket.secId,
                  marketid: item.marketId,
                },
              });
              if (find_selectionid) {
               // this.logger.error('Selection id all ready exist');
                continue;
              }
              await global.DB.T_selectionid.create({
                marketid: item.marketId,
                runner_name: otherMarket.runnerName,
                selectionid: otherMarket.secId,
              });
            }
            let marketID = item.marketId;
            const find_marketid = await global.DB.T_market.findOne({
              where: { marketid: item.marketId },
            });
            if (find_marketid) {
              //this.logger.error('Market id all ready exist');
              // continue;
            } else {
              const market_table = await global.DB.T_market.create({
                inplay: event.oddsData.inplay,
                marketid: item.marketId,
                marketname:
                  item.marketName == 'Bookmaker 0%Comm'
                    ? 'Bookmaker'
                    : item.marketName,
                matchname: data2.title,
                seriesid: event.compId,
                eventid: event.eventId,
                sportid: sportId,
                opendate: new Date(Number(event.time) * 1000),
                startdate: new Date(Number(event.time) * 1000),
              });
            }
          }

          // BOOK MAKER

          // console.table(data2.bookMaker);
          for (let item of data2.bookMaker) {
            for (let bookMaker of item.runners) {
              const find_selectionid = await global.DB.T_selectionid.findOne({
                where: {
                  selectionid: bookMaker.secId,
                  marketid: item.market_id,
                },
              });
              if (find_selectionid) {
               // this.logger.error('Selection id all ready exist');
              } else {
                await global.DB.T_selectionid.create({
                  marketid: item.market_id,
                  runner_name: bookMaker.runner,
                  selectionid: bookMaker.secId,
                });
              }
            }
            let marketID = item.market_id;
            if (!marketID) {
              // console.log('Market id is not available');
              // continue;
            }
            const find_marketid = await global.DB.T_market.findOne({
              where: { marketid: marketID },
            });
            if (find_marketid) {
              // this.logger.error('Market id all ready exist');
              // continue;
            } else {
              const market_table = await global.DB.T_market.create({
                inplay: event.oddsData.inplay,
                marketid: item.market_id,
                marketname:
                  item.marketName == 'Bookmaker 0%Comm'
                    ? 'Bookmaker'
                    : item.marketName,
                matchname: data2.title,
                seriesid: event.compId,
                eventid: event.eventId,
                sportid: sportId,
                opendate: new Date(Number(event.time) * 1000),
                startdate: new Date(Number(event.time) * 1000),
              });
            }
          }
        }
      }
    } catch (error) {
      //console.log(error);
    }
  }
}
