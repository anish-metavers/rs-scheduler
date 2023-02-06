import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MarketService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MarketService],
})
export class MarketModule {}
