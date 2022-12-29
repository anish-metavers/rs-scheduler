import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Cron1Module } from './cron1/cron.module';
import { Cron2Module } from './cron2/cron.module';
import { Cron3Module } from './cron3/cron.module';

@Module({
  imports: [Cron1Module, Cron2Module, Cron3Module, ConfigModule.forRoot()],
})
export class AppModule {}
