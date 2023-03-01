import { CacheModule, Module } from '@nestjs/common';
import type { ClientOpts } from 'redis';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';
import { FancyModule } from './fancy/fancy.module';
import { FancyCronModule } from './fancycron/cron.module';
import { ActiveMatchModule } from './activematchcron/cron.module';
import { MarketModule } from './marketcron/cron.module';
import { Cron1Module } from './mysqlcron1/cron.module';
import { Cron2Module } from './mysqlcron2/cron.module';
import { Cron3Module } from './mysqlcron3/cron.module';
import { DataProviderModule } from './data_provider_cron/data_provider.module';

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
    // ActiveMatchModule,
    // Cron1Module,
    // Cron2Module,
    // Cron3Module,
    // DataProviderModule,
  ],
})
export class AppModule {}
