import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ActiveMatchService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ActiveMatchService],
})
export class ActiveMatchModule {}
