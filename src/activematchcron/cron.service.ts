import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ActiveMatchService {
  private readonly logger = new Logger(ActiveMatchService.name);

  // @Cron('*/1 * * * * *')
  handleCron() {
      this.logger.debug('Active match cron running..');
      try {
        
      } catch (error) {
        console.log(error);
      }
  }
}