import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '../prisma/src/db.module';
import { SampleWorkerModule } from './workers/sample.worker.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      store: 'memory',
      ttl: 50000,
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    SampleWorkerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
