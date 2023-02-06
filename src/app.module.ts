import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketModule } from './marketcron/cron.module';
import { redisStore } from 'cache-manager-redis-store';
import { Cron1Module } from './mysqlcron1/cron.module';
import { Cron2Module } from './mysqlcron2/cron.module';
import { Cron3Module } from './mysqlcron3/cron.module';
import { Cron4Module } from './rediscron4/cron.module';
import { Cron5Module } from './rediscron5/cron.module';
import { Cron6Module } from './rediscron6/cron.module';
import { Cron7Module } from './rediscron7/cron.module';
import { FancyCronModule } from './fancycron/cron.module';
import { FancyModule } from './fancy/fancy.module';
import type { ClientOpts } from 'redis';

@Module({
  imports: [
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 600000,
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    MarketModule,
    FancyModule,
    FancyCronModule,
    Cron1Module,
    Cron2Module,
    Cron3Module,
    Cron4Module,
    Cron5Module,
    Cron6Module,
    Cron7Module,
  ],
})
export class AppModule {}
