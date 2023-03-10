import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Sportid2CronService } from './cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot()
    ],
    providers: [Sportid2CronService]
})
export class Sportid2CronModule {}