import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class Cron2Service {
  private readonly logger = new Logger(Cron2Service.name);

  @Cron('*/1 * * * *')
  async handleCron() {
    let response1: any, response2: any, data1: any, data2: any, series: any;
    const url1 = 'http://23.106.234.25:8081/sessionApi/eventList/4';
    const url2 = 'http://23.106.234.25:8081/sessionApi/virtualEventOdds/';

    try {
      response1 = await axios.get(url1);
      data1 = response1.data;
    } catch (error) {
      console.log(error);

      data1 = error.response.data;
    }
    try {
      series = data1.data;
      for (let item of series) {
        for (let event of item.event) {
          //console.log(event.eventId);
          try {
            response2 = await axios.get(url2 + event.eventId);
          } catch (error) {
            console.log(error);
            data2 = error.response.data;
          }
          data2 = response2.data.data;

          //Fancy2Market
          for (let item of data2.fancy2Market) {
            const find_matchfancy = await global.DB.T_matchfancy.findOne({
              where: { runnerid: item.marketId, eventid: item.eventId },
            });
            if (find_matchfancy) {
              //console.log('Already marketid or eventid exist');
              continue;
            }
            const matchfancy_table = await global.DB.T_matchfancy.create({
              eventid: item.eventId,
              fancyid: item.marketId,
              matchname: data2.title,
              name: item.title,
              runnerid: item.marketId,
              oddstype: 'F2',
            });
          }

          //Fancy3Market
          for (let item of data2.fancy3Market) {
            const find_matchfancy = await global.DB.T_matchfancy.findOne({
              where: { runnerid: item.marketId, eventid: item.eventId },
            });
            if (find_matchfancy) {
              //console.log('Already marketid or eventid exist');
              continue;
            }
            const matchfancy_table = await global.DB.T_matchfancy.create({
              eventid: item.eventId,
              fancyid: item.marketId,
              matchname: data2.title,
              name: item.title,
              runnerid: item.marketId,
              oddstype: 'F3',
            });
          }

          //oddEvenMarket
          for (let item of data2.oddEvenMarket) {
            const find_matchfancy = await global.DB.T_matchfancy.findOne({
              where: { runnerid: item.marketId, eventid: item.eventId },
            });
            if (find_matchfancy) {
              //console.log('Already marketid or eventid exist');
              continue;
            }
            const matchfancy_table = await global.DB.T_matchfancy.create({
              eventid: item.eventId,
              fancyid: item.marketId,
              matchname: data2.title,
              name: item.title,
              runnerid: item.marketId,
              oddstype: 'OE',
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
