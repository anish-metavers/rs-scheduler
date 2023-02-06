import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FancyCronService } from './cron.service';
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [FancyCronService],
})
export class FancyCronModule {}
