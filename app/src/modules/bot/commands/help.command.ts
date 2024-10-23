import { Command, Handler } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  CommandInteraction,
  EmbedBuilder,
  Colors,
  ApplicationCommand,
} from 'discord.js';

@Command({
  name: 'help',
  description: 'Displays a list of available commands',
})
@Injectable()
export class HelpCommand {
  @Handler()
  async onHelp(interaction: CommandInteraction): Promise<void> {
    const commands = interaction.client.application.commands.cache;

    const globalCommands = commands.filter((cmd) => !cmd.guildId);
    const guildCommands = commands.filter(
      (cmd) => cmd.guildId === interaction.guildId
    );

    const combinedCommands = new Map<string, ApplicationCommand>(
      [...globalCommands.values(), ...guildCommands.values()].map((cmd) => [
        cmd.id,
        cmd,
      ])
    );

    const embed = new EmbedBuilder()
      .setTitle('Available Commands')
      .setColor(Colors.Blue)
      .setTimestamp();

    combinedCommands.forEach((command) => {
      embed.addFields({
        name: `/${command.name}`,
        value: `${command.description || 'No description'}`,
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
