import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [AuthModule, MessagesModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
