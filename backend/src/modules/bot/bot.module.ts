import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordModule } from '@discord-nestjs/core';
import { discordConfigFactory } from './config/discord-config.factory';
import { CommandsModule } from './command.module';
import { BotGateway } from './bot.gateway';
import { botConfig } from '../../config';

@Module({
  imports: [
    ConfigModule.forFeature(botConfig),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: discordConfigFactory,
    }),
    CommandsModule,
  ],
  providers: [BotGateway],
})
export class BotModule {}
