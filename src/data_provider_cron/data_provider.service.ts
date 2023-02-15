import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class DataProviderService {
  private readonly logger = new Logger(DataProviderService.name);

  @Cron('*/1 * * * * *')
  async handleCron() {
    console.time('total time');
    try {
      this.logger.debug('Called when the current second is 1');
      let data;
      const url1 = 'http://23.106.234.25:8083/data-provider/cricket';
      // const url2 = 'http://23.106.234.25:8081/sessionApi/rsOddsApi2/';
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
      console.time('Api call time');
      let response = await axios.get(url1);
      console.timeEnd('Api call time');
      data = response.data;
      for (let event of data.gameList[0].eventList) {
        let matchOdd = event.marketList?.match_odd?.marketId;
        let completedMatch = event.marketList?.completed_match?.marketId;
        let tiedMatch = event.marketList?.tied_match?.marketId;
        let bookmaker = event.marketList?.bookmaker?.marketId;
        let fancy = event.marketList?.fancy?.marketId;
        let oddEven = event.marketList?.oddEven?.marketId;

        // EXTRAS
        // let session = event.marketList.session.marketId;
        // let otherMarket = event.marketList.other_market.marketId;
        // let khado = event.marketList.khado.marketId;
        // let ballByBall = event.marketList.ballbyball.marketId;
        // let winner = event.marketList.winner.marketId;
        // let virtualCricket = event.marketList.virtual_cricket.marketId;
        // let meter = event.marketList.meter.marketId;
        // let score = event.marketList.score.marketId;
        if (matchOdd) {
          console.log(matchOdd);
        }
        if (completedMatch) {
          console.log(completedMatch);
        }
        if (tiedMatch) {
          console.log(tiedMatch);
        }
        for (bookmaker of event.marketList.bookmaker) {
          if (bookmaker) {
            console.log(bookmaker.marketId);
          }
        }
        if (fancy) {
          console.log(fancy);
        }
        // for (oddEven of event.marketList.oddEven) {
        //   if (oddEven) {
        //     console.log(oddEven.marketId);
        //   }
        // }
      }
    } catch (error) {
      console.log(error);
    }
    console.timeEnd('total time');
  }
}
