import { Command, Handler, IA } from '@discord-nestjs/core';
import { Injectable, UseFilters } from '@nestjs/common';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { CommandInteraction, Message, TextChannel } from 'discord.js';
import { DocService } from '../../doc/services';

@Command({
  name: 'create',
  description: 'Create a new document',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class CreateCommand {
  constructor(private readonly docService: DocService) {}

  @Handler()
  async onCreate(@IA() interaction: CommandInteraction): Promise<void> {
    const userId = interaction.user.id;

    await interaction.reply({
      content: 'Please enter the title of the document:',
      ephemeral: true,
    });

    const filter = (response: Message) => response.author.id === userId;

    const channel = interaction.channel as TextChannel;

    if (!channel) {
      await interaction.followUp({
        content: 'An error occurred: Unable to access the channel.',
        ephemeral: true,
      });
      return;
    }

    try {
      const collected = await channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
        errors: ['time'],
      });

      const response = collected.first();
      const title = response?.content;

      if (!title) {
        await interaction.followUp({
          content: 'No title was provided.',
          ephemeral: true,
        });
        await response?.delete();
        return;
      }

      await this.docService.create({
        ownerId: userId,
        title,
        content: '',
      });

      await interaction.followUp({
        content: `Document "${title}" created successfully.`,
        ephemeral: true,
      });

      await response.delete();
    } catch (error) {
      await interaction.followUp({
        content:
          'You did not provide a title in time (30 seconds). Please try again.',
        ephemeral: true,
      });
    }
  }
}
