import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron1Service } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Cron1Service],
})
export class Cron1Module {}
