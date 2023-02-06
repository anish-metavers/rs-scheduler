import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { QueryTypes } from 'sequelize';

@Injectable()
export class Cron3Service {
  private readonly logger = new Logger(Cron3Service.name);

  isRunning = false;
  @Cron('*/1 * * * *')
  async handleCron() {
    if (!this.isRunning) {
      this.isRunning = true;
      try {
        this.logger.debug('Called when the current second is 45');
        let response1: any, data1: any, series: any;
        const url3 = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';

        let query = `
        select TE.id as t_event_id, TM.id as t_matchfancy_id , TE.eventid ,TM.fancyid,TM.oddstype from t_event AS TE 
        inner join t_matchfancy AS TM
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
        for (let key of Object.keys(dataObj)) {
          let apiData = dataObj[key];
          //console.log('Key: ' + item, 'Length:', dataObj[item].length);
          // console.log(apiData);

          let ids = apiData.map((item) => item.fancyid).join(',');
          // console.log('------------------------------------------------------');
          // console.log(ids);
          // console.log('------------------------------------------------------');

          if (ids) {
            try {
              response1 = await axios.get(url3 + ids);
              data1 = response1.data;
            } catch (error) {
              console.log(error);
              data1 = error.response1.data;
              this.isRunning = false;
            }
            try {
              series = data1.data;
              //console.log('===========================================', series);
              for (let item of series.items) {
                if (!item) continue;
                // console.log('===========================', item.market_id);
                const data = apiData.filter((i) => i.fancyid == item.market_id);

                if (item.game_over == 1) {
                  const fancyid = await global.DB.T_rsfancy_result.findOne({
                    where: { fancyid: item.market_id },
                  });
                  if (!fancyid) {
                    const t_rsfancy_results =
                      await global.DB.T_rsfancy_result.create({
                        fancyid: item.market_id,
                        matchid: item.event_id,
                        result: item.win_result,
                        // result:
                        // data[0].oddstype == 'F3' || data[0].oddstype == 'OE'
                        //   ? item.win_result
                        //   : 'awaiting',
                      });
                  }
                }
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      } catch (error) {
        console.log(error);
        this.isRunning = false;
      }
    }
  }
}
