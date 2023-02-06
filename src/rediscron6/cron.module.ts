import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron6Service } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Cron6Service],
})
export class Cron6Module {}