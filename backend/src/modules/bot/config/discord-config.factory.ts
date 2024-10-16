import { ConfigService } from '@nestjs/config';
import { DiscordModuleOption } from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';

export const discordConfigFactory = (
  configService: ConfigService
): DiscordModuleOption => {
  const token = configService.getOrThrow<string>('DISCORD_BOT_TOKEN');

  return {
    token,
    discordClientOptions: {
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
      ],
    },
  };
};
