import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsGateway } from './metrics.gateway';

@Module({
  controllers: [MetricsController],
  providers: [MetricsGateway]
})
export class MetricsModule {}
