import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutoDeleteService } from './cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot()
    ],
    providers:[AutoDeleteService]
})
export class AutoDeleteModule {}