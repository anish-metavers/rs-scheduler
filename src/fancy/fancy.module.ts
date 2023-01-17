import { CacheModule, Module } from '@nestjs/common';
import { FancyService } from './fancy.service';
import { FancyController } from './fancy.controller';
import { redisStore } from 'cache-manager-redis-store';
import type { ClientOpts } from 'redis';

@Module({
  controllers: [FancyController],
  providers: [FancyService],
})
export class FancyModule {}
