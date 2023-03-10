import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Sportid1CronService } from './cron.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [Sportid1CronService]
})
export class Sportid1CronModule {}
