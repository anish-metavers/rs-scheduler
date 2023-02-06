import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron4Service } from './cron.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [Cron4Service]
})
export class Cron4Module {}