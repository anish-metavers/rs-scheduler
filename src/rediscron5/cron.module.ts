import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron5Service } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Cron5Service],
})
export class Cron5Module {}
