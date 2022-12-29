import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron2Service } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Cron2Service],
})
export class Cron2Module {}
