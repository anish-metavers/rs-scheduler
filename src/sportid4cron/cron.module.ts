import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Sportid4CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Sportid4CronService],
})
export class Sportid4CronModule {}
