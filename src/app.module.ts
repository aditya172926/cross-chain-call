import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, {
    provide: 'POLLING_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        }
      })
    }
  },
  {
    provide: 'DATABASE_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3003,
        }
      })
    }
  }
],
})
export class AppModule {}
