import { Command, Handler } from '@discord-nestjs/core';
import { Injectable, UseFilters } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { CommandExceptionFilter } from '../filters/command-exception.filter';

@Command({
  name: 'register',
  description: 'Register your account with the application',
})
@UseFilters(CommandExceptionFilter)
@Injectable()
export class RegisterCommand {
  constructor(private readonly configService: ConfigService) {}

  @Handler()
  async onRegister(interaction: CommandInteraction): Promise<void> {
    const discordId = interaction.user.id;
    const state = `${discordId}:${randomBytes(16).toString('hex')}`;

    const baseUrl = this.configService.get<string>('auth.appBaseUrl');

    const registrationUrl = `${baseUrl}/auth/discord/start?state=${state}`;

    await interaction.reply({
      content: `Please click the link below to register your account:\n${registrationUrl}`,
      ephemeral: true,
    });
  }
}
