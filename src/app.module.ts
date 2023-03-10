import { CacheModule, Module } from '@nestjs/common';
import type { ClientOpts } from 'redis';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';
import { FancyModule } from './fancy/fancy.module';
import { FancyCronModule } from './fancycron/cron.module';
import { Sportid4CronModule } from './sportid4cron/cron.module';
import { MarketModule } from './marketcron/cron.module';
import { Cron1Module } from './mysqlcron1/cron.module';
import { Cron2Module } from './mysqlcron2/cron.module';
import { Cron3Module } from './mysqlcron3/cron.module';
import { DataProviderModule } from './data_provider_cron/data_provider.module';
import { Sportid1CronModule } from './sportid1cron/cron.module';
import { Sportid2CronModule } from './sportid2cron/cron.module';
import { ActivematchModule } from './activematch/activematch.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      username: process.env.REDIS_USER,
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      ttl: process.env.REDIS_TTL,
      isGlobal: true,
    }),
    // MarketModule,
    FancyModule,
    FancyCronModule,
    Sportid4CronModule,
    Sportid1CronModule,
    Sportid2CronModule,
    ActivematchModule
    // Cron1Module,
    // Cron2Module,
    // Cron3Module,
    // DataProviderModule,
  ],
})
export class AppModule {}
