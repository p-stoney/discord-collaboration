import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { BotModule } from './modules/bot/bot.module';
import { DocModule } from './modules/doc/doc.module';
import { EventModule } from './modules/event/event.module';
import { UserModule } from './modules/user/user.module';
import { validate, authConfig, botConfig, databaseConfig } from './config';
import mongooseAutoPopulate from 'mongoose-autopopulate';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ConfigModule.forRoot({
      validate,
      envFilePath: '.env',
      isGlobal: true,
      load: [authConfig, databaseConfig, botConfig],
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.plugin(mongooseAutoPopulate);
          return connection;
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    AuthModule,
    BotModule,
    DocModule,
    EventModule,
    UserModule,
  ],
})
export class AppModule {}
