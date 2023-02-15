import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DataProviderService } from './data_provider.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [DataProviderService],
})
export class DataProviderModule {}
