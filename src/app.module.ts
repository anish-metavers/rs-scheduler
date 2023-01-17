import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { Cron1Module } from './cron1/cron.module';
import { Cron2Module } from './cron2/cron.module';
import { Cron3Module } from './cron3/cron.module';
import { Cron4Module } from './cron4/cron.module';
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
    Cron1Module,
    Cron2Module,
    Cron3Module,
    Cron4Module,
    ConfigModule.forRoot(),
    FancyModule,
  ],
})
export class AppModule {}
