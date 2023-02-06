import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron3Service } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Cron3Service],
})
export class Cron3Module {}
