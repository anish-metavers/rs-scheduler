import { Module } from '@nestjs/common';
import { ActivematchService } from './activematch.service';
import { ActivematchController } from './activematch.controller';

@Module({
  controllers: [ActivematchController],
  providers: [ActivematchService]
})
export class ActivematchModule {}
