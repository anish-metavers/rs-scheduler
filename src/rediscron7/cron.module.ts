import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron7Service } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Cron7Service],
})
export class Cron7Module {}
