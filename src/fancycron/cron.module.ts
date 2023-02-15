import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FancyCronService } from './cron.service';
import { CronNewService } from './cronNew.service';
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronNewService],
})
export class FancyCronModule {}
